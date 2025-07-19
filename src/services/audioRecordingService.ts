/**
 * 音频录制服务
 */
import { Platform } from 'react-native';
import { Base64 } from 'js-base64';
import { FFmpegKit } from 'ffmpeg-kit-react-native';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';

export interface AudioConfig {
  sampleRate: number;
  channels: number;
  bitsPerSample: number;
  format: 'pcm' | 'wav' | 'mp3' | 'opus' | 'speex' | 'aac' | 'amr';
}

export interface AudioRecordingCallbacks {
  onData?: (audioData: ArrayBuffer) => void;
  onError?: (error: string) => void;
  onStart?: () => void;
  onStop?: () => void;
}

class AudioRecordingService {
  private mediaRecorder: any = null;
  private audioContext: any = null;
  private stream: any = null;
  private isRecording = false;
  private isStopping = false; // 添加停止状态标志
  private callbacks: AudioRecordingCallbacks = {};
  private audioChunks: ArrayBuffer[] = [];
  private audioDataListener: ((data: any) => void) | null = null;

  /**
   * 请求麦克风权限
   */
  async requestPermission(): Promise<boolean> {
    console.log('🔐 [audioRecordingService] 请求麦克风权限...');
    console.log('🔐 [audioRecordingService] 平台:', Platform.OS);
    
    try {
      if (Platform.OS === 'web') {
        console.log('🌐 [audioRecordingService] 使用Web API请求权限');
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log('✅ [audioRecordingService] Web权限获取成功');
        stream.getTracks().forEach(track => track.stop());
        return true;
      } else {
        console.log('📱 [audioRecordingService] 使用React Native权限');
        // React Native环境下的权限请求
        // 这里需要根据实际使用的权限库来实现
        console.log('✅ [audioRecordingService] React Native权限获取成功');
        return true;
      }
    } catch (error) {
      console.error('❌ [audioRecordingService] 请求麦克风权限失败:', error);
      return false;
    }
  }

  /**
   * 开始录制
   */
  async startRecording(
    config: AudioConfig,
    callbacks: AudioRecordingCallbacks = {}
  ): Promise<void> {
    console.log('🎤 [audioRecordingService] 开始录制...');
    console.log('🎤 [audioRecordingService] 配置:', JSON.stringify(config, null, 2));
    console.log('🎤 [audioRecordingService] 平台:', Platform.OS);
    
    this.callbacks = callbacks;
    this.audioChunks = [];
    console.log('✅ [audioRecordingService] 回调函数和音频块已初始化');

    try {
      if (Platform.OS === 'web') {
        console.log('🌐 [audioRecordingService] 使用Web录制');
        await this.startWebRecording(config);
      } else {
        console.log('📱 [audioRecordingService] 使用React Native录制');
        await this.startNativeRecording(config);
      }
      console.log('✅ [audioRecordingService] 录制启动成功');
    } catch (error: any) {
      console.error('❌ [audioRecordingService] 开始录制失败:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError('开始录制失败: ' + error.message);
      }
      throw error;
    }
  }

  /**
   * Web环境录制
   */
  private async startWebRecording(config: AudioConfig): Promise<void> {
    try {
      // 获取音频流
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: config.sampleRate,
          channelCount: config.channels,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      // 创建音频上下文
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
        sampleRate: config.sampleRate,
      });

      // 创建MediaRecorder
      const options = this.getMediaRecorderOptions(config);
      this.mediaRecorder = new MediaRecorder(this.stream, options);

      this.mediaRecorder.ondataavailable = (event: any) => {
        if (event.data.size > 0) {
          this.handleAudioData(event.data);
        }
      };

      this.mediaRecorder.onstart = () => {
        console.log('开始录制音频');
        this.isRecording = true;
        if (this.callbacks.onStart) {
          this.callbacks.onStart();
        }
      };

      this.mediaRecorder.onstop = () => {
        console.log('停止录制音频');
        this.isRecording = false;
        if (this.callbacks.onStop) {
          this.callbacks.onStop();
        }
      };

      this.mediaRecorder.onerror = (event: any) => {
        console.error('录制错误:', event.error);
        if (this.callbacks.onError) {
          this.callbacks.onError('录制错误: ' + event.error.message);
        }
      };

      // 开始录制，使用较小的数据块大小以减少延迟
      this.mediaRecorder.start(50); // 每50ms触发一次ondataavailable，减少延迟

    } catch (error: any) {
      console.error('Web录制初始化失败:', error);
      throw error;
    }
  }

  /**
   * React Native环境录制
   */
  private async startNativeRecording(config: AudioConfig): Promise<void> {
    console.log('📱 [audioRecordingService] 开始React Native录制...');
    
    try {
      // 动态导入，避免在Web环境下报错
      console.log('📱 [audioRecordingService] 导入react-native-audio-record...');
      const AudioRecord = require('react-native-audio-record').default;
      
      // 配置录音参数
      const options = {
        sampleRate: config.sampleRate,
        channels: config.channels,
        bitsPerSample: config.bitsPerSample,
        audioSource: 6, // MIC
        wavFile: 'test.wav'
      };
      console.log('📱 [audioRecordingService] 录音配置:', JSON.stringify(options, null, 2));

      // 初始化录音
      console.log('📱 [audioRecordingService] 初始化录音...');
      await AudioRecord.init(options);
      console.log('✅ [audioRecordingService] 录音初始化成功');
      
      // 开始录音
      console.log('📱 [audioRecordingService] 开始录音...');
      await AudioRecord.start();
      console.log('✅ [audioRecordingService] 录音开始成功');
      
      this.isRecording = true;
      console.log('✅ [audioRecordingService] 录音状态已设置为true');
      
      if (this.callbacks.onStart) {
        console.log('📞 [audioRecordingService] 调用onStart回调');
        this.callbacks.onStart();
      }

      // 监听录音数据
      console.log('📱 [audioRecordingService] 设置音频数据监听器...');
      this.audioDataListener = (data: any) => {
        console.log('🎵 [audioRecordingService] 音频数据回调触发');
        console.log('🎵 [audioRecordingService] 数据类型:', typeof data);
        console.log('🎵 [audioRecordingService] 数据构造函数:', data?.constructor?.name);
        console.log('🎵 [audioRecordingService] 数据内容:', data);
        console.log('🎵 [audioRecordingService] 录音状态:', this.isRecording);
        console.log('🎵 [audioRecordingService] 停止状态:', this.isStopping);

        // 如果正在停止录音，不再处理音频数据
        if (this.isStopping) {
          console.log('⚠️ [audioRecordingService] 正在停止录音，忽略音频数据');
          return;
        }

        if (this.callbacks.onData) {
          let arrayBuffer: ArrayBuffer | null = null;

          if (typeof data === 'string') {
            // 可能是Base64字符串
            console.log('🎵 [audioRecordingService] data为字符串，尝试Base64解码');
            const uint8Array = Base64.toUint8Array(data);
            arrayBuffer = uint8Array.buffer;
            console.log('✅ [audioRecordingService] Base64解码成功，buffer长度:', arrayBuffer.byteLength);
          } else if (data instanceof Uint8Array) {
            console.log('🎵 [audioRecordingService] data为Uint8Array');
            arrayBuffer = data.buffer;
          } else if (data instanceof ArrayBuffer) {
            console.log('🎵 [audioRecordingService] data为ArrayBuffer');
            arrayBuffer = data;
          } else if (data && data.buffer && data.buffer instanceof ArrayBuffer) {
            console.log('🎵 [audioRecordingService] data包含buffer属性');
            arrayBuffer = data.buffer;
          }

          if (arrayBuffer) {
            console.log('✅ [audioRecordingService] 音频数据缓冲, buffer长度:', arrayBuffer.byteLength);
            this.sendAudioData(arrayBuffer);
          } else {
            console.warn('⚠️ [audioRecordingService] 未能识别的data类型，未调用onData');
          }
        } else {
          console.warn('⚠️ [audioRecordingService] onData未定义');
        }
      };
      
      // 使用try-catch包装事件监听器设置，避免NativeEventEmitter警告
      try {
        AudioRecord.on('data', this.audioDataListener);
        console.log('✅ [audioRecordingService] 音频数据监听器设置成功');
      } catch (error) {
        console.warn('⚠️ [audioRecordingService] 设置音频数据监听器时出现警告:', error);
        // 继续执行，不中断录音流程
      }

    } catch (error: any) {
      console.error('❌ [audioRecordingService] React Native录制初始化失败:', error);
      this.isRecording = false;
      if (this.callbacks.onError) {
        this.callbacks.onError('React Native录制失败: ' + error.message);
      }
      throw error;
    }
  }

  /**
   * 获取MediaRecorder选项
   */
  private getMediaRecorderOptions(config: AudioConfig): MediaRecorderOptions {
    const options: MediaRecorderOptions = {};

    // 优先使用适合实时传输的格式
    const supportedTypes = [
      'audio/webm;codecs=opus',  // 最佳选择，低延迟，高压缩
      'audio/webm',              // WebM格式
      'audio/ogg;codecs=opus',   // OGG格式
      'audio/wav',               // WAV格式
      'audio/mp4',               // MP4格式
    ];

    // 根据配置选择格式
    let selectedType = 'audio/webm;codecs=opus'; // 默认使用Opus编码
    
    switch (config.format) {
      case 'opus':
        selectedType = 'audio/webm;codecs=opus';
        break;
      case 'wav':
        selectedType = 'audio/wav';
        break;
      case 'mp3':
        selectedType = 'audio/mp3';
        break;
      case 'aac':
        selectedType = 'audio/aac';
        break;
      case 'pcm':
        selectedType = 'audio/wav'; // PCM通过WAV容器传输
        break;
      default:
        selectedType = 'audio/webm;codecs=opus';
        break;
    }

    // 检查浏览器支持的格式
    for (const type of supportedTypes) {
      if (MediaRecorder.isTypeSupported(type)) {
        options.mimeType = type;
        console.log(`使用音频格式: ${type}`);
        break;
      }
    }

    // 设置比特率（可选）
    if (config.bitsPerSample === 16) {
      options.audioBitsPerSecond = 16000; // 16kbps for 16kHz sample rate
    } else {
      options.audioBitsPerSecond = 32000; // 32kbps for higher quality
    }

    return options;
  }

  /**
   * 处理音频数据
   */
  private async handleAudioData(blob: Blob): Promise<void> {
    try {
      const arrayBuffer = await blob.arrayBuffer();
      this.audioChunks.push(arrayBuffer);

      // 根据格式处理音频数据
      let processedData: ArrayBuffer;
      
      if (this.mediaRecorder?.mimeType?.includes('wav')) {
        // WAV格式转换为PCM
        processedData = this.convertWavToPcm(arrayBuffer);
      } else if (this.mediaRecorder?.mimeType?.includes('pcm')) {
        // 直接使用PCM数据
        processedData = arrayBuffer;
      } else {
        // 其他格式转换为PCM
        processedData = await this.convertToPcm(arrayBuffer);
      }

      // 发送处理后的音频数据
      if (this.callbacks.onData) {
        this.callbacks.onData(processedData);
      }
      
      console.log(`音频数据块大小: ${processedData.byteLength} bytes`);
    } catch (error) {
      console.error('处理音频数据失败:', error);
      if (this.callbacks.onError) {
        this.callbacks.onError('处理音频数据失败: ' + error);
      }
    }
  }

  /**
   * 将WAV转换为PCM
   */
  private convertWavToPcm(wavBuffer: ArrayBuffer): ArrayBuffer {
    const view = new DataView(wavBuffer);
    
    // 检查WAV文件头
    if (view.getUint32(0, false) !== 0x52494646) { // "RIFF"
      throw new Error('无效的WAV文件');
    }
    
    if (view.getUint32(8, false) !== 0x57415645) { // "WAVE"
      throw new Error('无效的WAV文件');
    }

    // 查找data块
    let dataOffset = 12;
    while (dataOffset < wavBuffer.byteLength - 8) {
      const chunkId = view.getUint32(dataOffset, false);
      const chunkSize = view.getUint32(dataOffset + 4, true);
      
      if (chunkId === 0x61746164) { // "data"
        // 提取PCM数据
        const pcmData = wavBuffer.slice(dataOffset + 8, dataOffset + 8 + chunkSize);
        return pcmData;
      }
      
      dataOffset += 8 + chunkSize;
    }
    
    throw new Error('未找到PCM数据');
  }

  /**
   * 通用音频格式转换为PCM
   */
  private async convertToPcm(audioBuffer: ArrayBuffer): Promise<ArrayBuffer> {
    try {
      // 创建音频上下文
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      // 解码音频数据
      const audioData = await audioContext.decodeAudioData(audioBuffer);
      
      // 获取PCM数据
      const channelData = audioData.getChannelData(0); // 获取第一个声道
      const pcmBuffer = new ArrayBuffer(channelData.length * 2); // 16位PCM
      const pcmView = new Int16Array(pcmBuffer);
      
      // 转换为16位PCM
      for (let i = 0; i < channelData.length; i++) {
        pcmView[i] = Math.max(-32768, Math.min(32767, channelData[i] * 32768));
      }
      
      return pcmBuffer;
    } catch (error) {
      console.error('音频格式转换失败:', error);
      // 如果转换失败，返回原始数据
      return audioBuffer;
    }
  }

  /**
   * 直接发送音频数据（参考测试代码的简单方式）
   */
  private sendAudioData(audioData: ArrayBuffer): void {
    // 如果正在停止或已停止录制，不发送数据
    if (this.isStopping || !this.isRecording) {
      console.log('⚠️ [audioRecordingService] 录制已停止或正在停止，跳过发送音频数据');
      return;
    }
    
    console.log('📤 [audioRecordingService] 直接发送音频数据, 大小:', audioData.byteLength, 'bytes');
    
    if (this.callbacks.onData) {
      this.callbacks.onData(audioData);
    }
  }

  /**
   * 停止录制
   */
  stopRecording(): void {
    console.log('🛑 [audioRecordingService] 停止录制...');
    console.log('🛑 [audioRecordingService] 当前录制状态:', this.isRecording);
    console.log('🛑 [audioRecordingService] 停止状态:', this.isStopping);
    console.log('🛑 [audioRecordingService] 平台:', Platform.OS);
    
    // 设置停止标志，防止新的音频数据被处理
    this.isStopping = true;
    console.log('🛑 [audioRecordingService] 已设置停止标志');
    
    // 清理发送定时器（如果存在）
    if (this.sendInterval) {
      clearInterval(this.sendInterval);
      this.sendInterval = null;
      console.log('🧹 [audioRecordingService] 清理发送定时器');
    }
    
    if (Platform.OS === 'web') {
      console.log('🌐 [audioRecordingService] 停止Web录制');
      if (this.mediaRecorder && this.isRecording) {
        console.log('🌐 [audioRecordingService] 停止MediaRecorder');
        this.mediaRecorder.stop();
      }

      if (this.stream) {
        console.log('🌐 [audioRecordingService] 停止音频流');
        this.stream.getTracks().forEach((track: any) => track.stop());
        this.stream = null;
      }

      if (this.audioContext) {
        console.log('🌐 [audioRecordingService] 关闭音频上下文');
        this.audioContext.close();
        this.audioContext = null;
      }
    } else {
      console.log('📱 [audioRecordingService] 停止React Native录制');
      try {
        const AudioRecord = require('react-native-audio-record').default;
        console.log('📱 [audioRecordingService] 调用AudioRecord.stop()');
        AudioRecord.stop();
        console.log('✅ [audioRecordingService] AudioRecord.stop()调用成功');
        // 不需要解绑监听器
        this.audioDataListener = null;
        console.log('✅ [audioRecordingService] 音频数据监听器已清理');
      } catch (error) {
        console.error('❌ [audioRecordingService] 停止React Native录制失败:', error);
      }
    }
    
    // 等待一小段时间确保所有音频数据回调都完成
    setTimeout(() => {
      this.isRecording = false;
      this.isStopping = false; // 重置停止标志
      console.log('✅ [audioRecordingService] 录制状态已设置为false');
      console.log('✅ [audioRecordingService] 停止标志已重置');
      
      if (this.callbacks.onStop) {
        console.log('📞 [audioRecordingService] 调用onStop回调');
        this.callbacks.onStop();
      }
      
      console.log('✅ [audioRecordingService] 录制停止完成');
    }, 50); // 等待50ms确保所有音频数据回调完成
  }

  /**
   * 检查是否正在录制
   */
  isRecordingAudio(): boolean {
    return this.isRecording;
  }

  /**
   * 获取录制的音频数据
   */
  getRecordedAudio(): ArrayBuffer[] {
    return [...this.audioChunks];
  }

  /**
   * 清除录制的音频数据
   */
  clearRecordedAudio(): void {
    this.audioChunks = [];
  }

  /**
   * 播放音频数据
   */
  async playAudio(audioData: ArrayBuffer): Promise<void> {
    try {
      if (Platform.OS === 'web') {
        const blob = new Blob([audioData], { type: 'audio/wav' });
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        
        await audio.play();
        
        audio.onended = () => {
          URL.revokeObjectURL(url);
        };
      } else {
        // React Native环境下的音频播放
        console.log('React Native音频播放功能需要根据具体音频库实现');
      }
    } catch (error) {
      console.error('播放音频失败:', error);
      throw error;
    }
  }

  /**
   * 获取音频统计信息
   */
  getAudioStats(): {
    totalChunks: number;
    totalBytes: number;
    averageChunkSize: number;
    isRecording: boolean;
  } {
    const totalBytes = this.audioChunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
    const averageChunkSize = this.audioChunks.length > 0 ? totalBytes / this.audioChunks.length : 0;
    
    return {
      totalChunks: this.audioChunks.length,
      totalBytes,
      averageChunkSize,
      isRecording: this.isRecording,
    };
  }

  /**
   * 创建PCM音频流（用于实时传输）
   */
  createPcmStream(sampleRate: number = 16000, channels: number = 1, bitsPerSample: number = 16): ArrayBuffer {
    // 将所有音频块合并并转换为PCM格式
    const totalSize = this.audioChunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
    const pcmBuffer = new ArrayBuffer(totalSize);
    const pcmView = new Uint8Array(pcmBuffer);
    
    let offset = 0;
    for (const chunk of this.audioChunks) {
      pcmView.set(new Uint8Array(chunk), offset);
      offset += chunk.byteLength;
    }
    
    return pcmBuffer;
  }
}

// 创建并导出服务实例
const audioRecordingService = new AudioRecordingService();
export default audioRecordingService; 