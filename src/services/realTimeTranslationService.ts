/**
 * 实时翻译WebSocket服务
 */
import type { 
  RealTimeTranslationConfig, 
  RealTimeTranslationResponse
} from '../api/services/translateService';
import translateService from '../api/services/translateService';
import { CURRENT_API_CONFIG } from '../api/config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import tokenStorage from '../utils/tokenStorage';

export interface WebSocketMessage {
  type: 'config' | 'audio' | 'finish' | 'response';
  data: any;
}

export interface RealTimeTranslationCallbacks {
  onMessage?: (response: RealTimeTranslationResponse) => void;
  onError?: (error: string) => void;
  onClose?: () => void;
  onOpen?: () => void;
}

class RealTimeTranslationService {
  private ws: WebSocket | null = null;
  private conversationId: string | null = null;
  private token: string | null = null;
  private callbacks: RealTimeTranslationCallbacks = {};
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 3;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private heartbeatTimeout = 30000; // 30秒心跳间隔
  private connectionTimeout: NodeJS.Timeout | null = null;
  private connectionTimeoutMs = 30000; // 30秒连接超时

  private healthCheckInterval: NodeJS.Timeout | null = null;
  private healthCheckMs = 5000; // 每5秒检查一次连接健康状态
  private lastFinishTime: number = 0; // 记录最后发送结束标记的时间

  /**
   * 初始化WebSocket连接
   */
  async initialize(
    config: RealTimeTranslationConfig,
    token: string,
    contactName?: string,
    callbacks: RealTimeTranslationCallbacks = {}
  ): Promise<string> {
    console.log('🔗 [realTimeTranslationService] 开始初始化WebSocket连接...');
    console.log('🔗 [realTimeTranslationService] 配置:', JSON.stringify(config, null, 2));
    console.log('🔗 [realTimeTranslationService] 联系人:', contactName || '无');
    console.log('🔗 [realTimeTranslationService] Token长度:', token.length);
    
    this.token = token;
    this.callbacks = callbacks;

    // 检查是否已有活跃连接
    const existingConnection = this.getConnectionInfo();
    if (existingConnection.isConnected && existingConnection.wsReadyState === 1) {
      console.log('🔗 [realTimeTranslationService] 检测到现有活跃连接，复用连接');
      console.log('🔗 [realTimeTranslationService] 现有会话ID:', existingConnection.conversationId);
      
      // 确保有有效的会话ID
      if (existingConnection.conversationId) {
        return existingConnection.conversationId;
      } else {
        console.warn('⚠️ [realTimeTranslationService] 现有连接缺少会话ID，将创建新连接');
      }
    }

    try {
      // 创建新会话
      console.log('🔗 [realTimeTranslationService] 正在创建会话...');
      try {
        const conversationResponse = await translateService.createConversation({
          source_language: config.source_language,
          target_language: config.target_language,
          contact_name: contactName,
        });

        if (conversationResponse.data.conversation_id) {
          this.conversationId = conversationResponse.data.conversation_id;
          console.log('✅ [realTimeTranslationService] 会话创建成功, ID:', this.conversationId);
        } else {
          console.error('❌ [realTimeTranslationService] 创建会话失败：未获取到conversation_id');
          throw new Error('创建会话失败：未获取到conversation_id');
        }
      } catch (conversationError: any) {
        console.error('❌ [realTimeTranslationService] 创建会话失败:', conversationError);
        
        // 检查是否是认证错误
        if (conversationError.code === 403 || conversationError.code === 401 || 
            conversationError.message?.includes('403') || conversationError.message?.includes('401') ||
            conversationError.message?.includes('unauthorized')) {
          console.log('🔒 [realTimeTranslationService] 检测到认证错误，触发登录跳转');
          await this.handleAuthenticationError();
        }
        
        throw conversationError;
      }

      // 建立WebSocket连接
      console.log('🔗 [realTimeTranslationService] 正在建立WebSocket连接...');
      await this.connectWebSocket(config);
      console.log('✅ [realTimeTranslationService] WebSocket连接建立成功');

      return this.conversationId!;
          } catch (error: any) {
        // 创建会话失败 403退出登录并清除本地token跳转到登录页面
        if (error.code === 403) {
          console.log('🔒 [realTimeTranslationService] 检测到403错误，触发登录跳转');
          
          try {
            // 清除所有认证相关的存储
            await tokenStorage.removeToken('ACTION_TOKEN');
            await tokenStorage.removeToken('ACCESS_TOKEN');
            await AsyncStorage.removeItem('@lingo_user_info');
            await AsyncStorage.removeItem('@lingo_onboarding_completed');
            
            console.log('✅ [realTimeTranslationService] 认证数据已清除');
            
            // 使用全局登录跳转处理器
            if (global.loginRedirectHandler) {
              console.log('🔒 [realTimeTranslationService] 调用全局登录跳转处理器');
              global.loginRedirectHandler();
            } else {
              console.warn('⚠️ [realTimeTranslationService] 全局登录跳转处理器未设置');
            }
          } catch (clearError) {
            console.error('❌ [realTimeTranslationService] 清除认证数据失败:', clearError);
          }
        }
        console.error('❌ [realTimeTranslationService] 初始化实时翻译失败:', error);
        throw new Error('初始化实时翻译失败: ' + error.message);
      }
  }

  /**
   * 建立WebSocket连接
   */
  private async connectWebSocket(config: RealTimeTranslationConfig): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 使用config文件中的BASE_URL，将http://转换为ws://
        const baseUrl = CURRENT_API_CONFIG.BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://');
        const wsUrl = `${baseUrl}/ws/conversations/send_audio_message?token=${encodeURIComponent(this.token!)}&conversation_id=${this.conversationId}`;
        
        // 详细打印WebSocket连接参数
        console.log('🔗 [realTimeTranslationService] WebSocket连接参数详情:');
        console.log('🔗 [realTimeTranslationService] - 基础URL:', baseUrl);
        console.log('🔗 [realTimeTranslationService] - 完整URL:', wsUrl);
        console.log('🔗 [realTimeTranslationService] - Token长度:', this.token?.length || 0);
        console.log('🔗 [realTimeTranslationService] - Token前20字符:', this.token?.substring(0, 20) + '...');
        console.log('🔗 [realTimeTranslationService] - 会话ID:', this.conversationId);
        console.log('🔗 [realTimeTranslationService] - 编码后的Token:', encodeURIComponent(this.token!));
        
        this.ws = new WebSocket(wsUrl);

        // 设置连接超时
        this.connectionTimeout = setTimeout(() => {
          console.error('⏰ [realTimeTranslationService] WebSocket连接超时');
          if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
            console.log('🔌 [realTimeTranslationService] 超时关闭WebSocket连接');
            this.ws.close();
          }
        }, this.connectionTimeoutMs);

        this.ws.onopen = () => {
          console.log('✅ [realTimeTranslationService] WebSocket连接已建立');
          console.log('🔗 [realTimeTranslationService] 连接成功 - URL:', wsUrl);
          console.log('🔗 [realTimeTranslationService] 连接成功 - 会话ID:', this.conversationId);
          console.log('🔗 [realTimeTranslationService] 连接成功 - Token长度:', this.token?.length || 0);
          this.isConnected = true;
          this.reconnectAttempts = 0;
          
          // 清除连接超时
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          
          // 启动连接健康检查
          this.startHealthCheck();
          
          // 发送配置信息
          console.log('📤 [realTimeTranslationService] 准备发送配置信息...');
          this.sendConfig(config);
          
          // 启动心跳机制
          // this.startHeartbeat(); // 注释掉this.startHeartbeat()、this.stopHeartbeat()、this.heartbeatInterval相关代码，以及心跳包发送
          
          if (this.callbacks.onOpen) {
            console.log('📞 [realTimeTranslationService] 调用onOpen回调');
            this.callbacks.onOpen();
          }
          
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            console.log('📥 [realTimeTranslationService] 收到WebSocket消息');
            console.log('📥 [realTimeTranslationService] 消息类型:', typeof event.data);
            console.log('📥 [realTimeTranslationService] 是否为ArrayBuffer:', event.data instanceof ArrayBuffer);
            
            if (event.data instanceof ArrayBuffer) {
              // 处理二进制音频数据
              console.log('🎵 [realTimeTranslationService] 处理音频数据，大小:', event.data.byteLength, 'bytes');
              this.handleAudioResponse(event.data);
            } else {
              // 处理文本消息
              console.log('📝 [realTimeTranslationService] 处理文本消息:', event.data);
              const message = JSON.parse(event.data);
              this.handleTextResponse(message);
            }
          } catch (error) {
            console.error('❌ [realTimeTranslationService] 处理WebSocket消息失败:', error);
          }
        };

        this.ws.onerror = (error) => {
          // 检查是否是服务器主动关闭（在发送结束标记后）
          const timeSinceFinish = Date.now() - this.lastFinishTime;
          if (timeSinceFinish < 5000) { // 5秒内发送过结束标记
            console.log('ℹ️ [realTimeTranslationService] 检测到服务器主动关闭，忽略错误事件');
            console.log('ℹ️ [realTimeTranslationService] 距离发送结束标记时间:', timeSinceFinish, 'ms');
            return; // 完全忽略这个错误
          }
          
          console.error('❌ [realTimeTranslationService] WebSocket错误事件:', error);
          console.error('❌ [realTimeTranslationService] 错误类型:', typeof error);
          console.error('❌ [realTimeTranslationService] 错误构造函数:', error?.constructor?.name);
          
          // WebSocket错误事件通常不包含详细的错误信息，我们需要通过其他方式判断
          this.isConnected = false;
          
          // 记录错误事件的属性
          if (error && typeof error === 'object') {
            console.error('❌ [realTimeTranslationService] 错误事件属性:', Object.keys(error));
            for (const key in error) {
              if (error.hasOwnProperty(key)) {
                try {
                  console.error(`❌ [realTimeTranslationService] ${key}:`, (error as any)[key]);
                } catch (e) {
                  console.error(`❌ [realTimeTranslationService] ${key}: [无法访问]`);
                }
              }
            }
          }
          
          // WebSocket错误通常表示连接问题，但不一定是认证错误
          // 我们在这里不主动触发认证错误处理，而是让连接关闭事件处理
          console.log('⚠️ [realTimeTranslationService] WebSocket错误，等待连接关闭事件');
          
          // 不在这里调用reject，让onclose事件处理重连逻辑
          if (this.callbacks.onError) {
            console.log('📞 [realTimeTranslationService] 调用onError回调');
            this.callbacks.onError('WebSocket连接错误');
          }
        };

        this.ws.onclose = (event) => {
          console.log('🔌 [realTimeTranslationService] WebSocket连接已关闭');
          console.log('🔌 [realTimeTranslationService] 关闭代码:', event.code);
          console.log('🔌 [realTimeTranslationService] 关闭原因:', event.reason);
          console.log('🔌 [realTimeTranslationService] 是否正常关闭:', (event as any).wasClean);
          console.log('🔌 [realTimeTranslationService] 连接状态:', this.isConnected);
          console.log('🔌 [realTimeTranslationService] 重连次数:', this.reconnectAttempts);
          
          // 分析关闭原因
          const closeCode = event.code;
          const closeReason = event.reason || '无原因';
          const wasClean = (event as any).wasClean;
          
          console.log('🔍 [realTimeTranslationService] 关闭分析:');
          console.log('🔍 [realTimeTranslationService] - 代码:', closeCode, this.getCloseCodeDescription(closeCode || 0));
          console.log('🔍 [realTimeTranslationService] - 原因:', closeReason);
          console.log('🔍 [realTimeTranslationService] - 是否干净关闭:', wasClean);
          
          this.isConnected = false;
          
          // 停止连接健康检查
          this.stopHealthCheck();
          
          // 清除连接超时
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }
          
          // 检查关闭代码，判断是否是认证错误
          // 1008: Policy Violation (策略违规，可能是认证问题)
          // 1002: Protocol Error (协议错误)
          // 1006: Abnormal Closure (异常关闭，通常是网络问题)
          if (event.code === 1008 || event.code === 1002) {
            console.log('🔒 [realTimeTranslationService] 检测到可能的认证相关关闭代码:', event.code);
            console.log('🔒 [realTimeTranslationService] 关闭原因:', event.reason);
            
            // 如果是认证错误，触发登录跳转
            if (event.reason?.includes('403') || event.reason?.includes('401') || 
                event.reason?.includes('unauthorized') || event.reason?.includes('forbidden')) {
              console.log('🔒 [realTimeTranslationService] 确认认证错误，触发登录跳转');
              this.handleAuthenticationError();
              return; // 不进行重连
            }
          } else if (event.code === 1006) {
            console.log('🌐 [realTimeTranslationService] 检测到网络异常关闭 (1006)');
            console.log('🌐 [realTimeTranslationService] 这通常是网络连接问题，将尝试重连');
          }
          
          if (this.callbacks.onClose) {
            console.log('📞 [realTimeTranslationService] 调用onClose回调');
            this.callbacks.onClose();
          }
          
          // 检查是否是服务器主动关闭（在发送结束标记后）
          const timeSinceFinish = Date.now() - (this.lastFinishTime || 0);
          if (timeSinceFinish < 5000) { // 5秒内发送过结束标记
            console.log('ℹ️ [realTimeTranslationService] 检测到服务器主动关闭连接，跳过重连');
            console.log('ℹ️ [realTimeTranslationService] 距离发送结束标记时间:', timeSinceFinish, 'ms');
            return; // 不进行重连
          }
          
          // 尝试重连（只有在非认证错误的情况下）
          console.log('🔄 [realTimeTranslationService] 准备尝试重连...');
          this.attemptReconnect(config);
        };

      } catch (error: any) {
        console.error('❌ [realTimeTranslationService] 创建WebSocket连接失败:', error);
        reject(error);
      }
    });
  }

  /**
   * 发送配置信息
   */
  private sendConfig(config: RealTimeTranslationConfig): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ [realTimeTranslationService] WebSocket未连接，无法发送配置');
      console.error('❌ [realTimeTranslationService] ws状态:', this.ws ? this.ws.readyState : 'null');
      return;
    }

    const configMessage = {
      format: config.format,
      sample_rate: config.sample_rate,
      source_language: config.source_language,
      target_language: config.target_language,
    };

    console.log('📤 [realTimeTranslationService] 发送配置信息:', JSON.stringify(configMessage, null, 2));
    this.ws.send(JSON.stringify(configMessage));
    console.log('✅ [realTimeTranslationService] 配置信息发送成功');
  }

  /**
   * 发送音频数据
   */
  sendAudioData(audioData: ArrayBuffer): void {
    // 详细的连接状态检查
    console.log('🔍 [realTimeTranslationService] 发送前连接状态检查:');
    console.log('🔍 [realTimeTranslationService] - WebSocket实例存在:', !!this.ws);
    console.log('🔍 [realTimeTranslationService] - WebSocket状态:', this.ws?.readyState);
    console.log('🔍 [realTimeTranslationService] - 连接标记:', this.isConnected);
    console.log('🔍 [realTimeTranslationService] - 会话ID:', this.conversationId);
    
    // 检查WebSocket实例和状态
    if (!this.ws) {
      console.error('❌ [realTimeTranslationService] WebSocket实例不存在');
      return;
    }
    
    // 更严格的状态检查
    if (this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ [realTimeTranslationService] WebSocket未连接，无法发送音频数据');
      console.error('❌ [realTimeTranslationService] ws状态:', this.ws.readyState);
      console.error('❌ [realTimeTranslationService] 连接状态:', this.isConnected);
      
      // 如果WebSocket状态异常，尝试重新连接
      if (this.ws.readyState === WebSocket.CLOSED || this.ws.readyState === WebSocket.CLOSING) {
        console.log('🔄 [realTimeTranslationService] WebSocket已关闭，触发重连');
        this.isConnected = false;
        if (this.callbacks.onError) {
          this.callbacks.onError('WebSocket连接已断开');
        }
      }
      return;
    }
    
    // 额外检查：确保连接标记也是true
    if (!this.isConnected) {
      console.error('❌ [realTimeTranslationService] 连接标记为false，但WebSocket状态为OPEN，可能存在状态不一致');
      console.error('❌ [realTimeTranslationService] 尝试重新同步连接状态');
      this.isConnected = true; // 尝试同步状态
    }

    try {
      // 发送前再次验证
      if (this.ws.readyState !== WebSocket.OPEN) {
        console.error('❌ [realTimeTranslationService] 发送前最终检查失败，WebSocket状态:', this.ws.readyState);
        return;
      }
      
      // 直接发送音频数据，参考测试代码的简单方式
      console.log('🎵 [realTimeTranslationService] 发送音频数据，大小:', audioData.byteLength, 'bytes');
      console.log('🎵 [realTimeTranslationService] 发送前WebSocket状态:', this.ws.readyState);
      
      this.ws.send(audioData);
      console.log('🎵 [realTimeTranslationService] audioData详情:', {
        type: typeof audioData,
        constructor: audioData.constructor.name,
        byteLength: audioData.byteLength,
        isArrayBuffer: audioData instanceof ArrayBuffer,
        isView: ArrayBuffer.isView(audioData),
        hasData: audioData.byteLength > 0,
        firstBytes: audioData.byteLength > 0 ? Array.from(new Uint8Array(audioData.slice(0, 4))) : []
      });
      
      // 发送后立即检查状态
      console.log('🎵 [realTimeTranslationService] 发送后WebSocket状态:', this.ws.readyState);
      console.log('✅ [realTimeTranslationService] 音频数据发送成功');
      
      // 记录发送统计
      console.log('📊 [realTimeTranslationService] 音频数据发送统计 - 大小:', audioData.byteLength, 'bytes');
      
    } catch (error) {
      console.error('❌ [realTimeTranslationService] 发送音频数据失败:', error);
      console.error('❌ [realTimeTranslationService] 发送失败时WebSocket状态:', this.ws?.readyState);
      
      // 检查是否是连接相关错误
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        if (errorMessage.includes('connection') || errorMessage.includes('websocket') || 
            errorMessage.includes('closed') || errorMessage.includes('network')) {
          console.error('❌ [realTimeTranslationService] 检测到连接相关错误，标记连接为断开状态');
          this.isConnected = false;
          if (this.callbacks.onError) {
            this.callbacks.onError('WebSocket连接已断开');
          }
        }
      }
    }
  }



  /**
   * 发送结束标记
   */
  async sendFinish(): Promise<void> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('⚠️ [realTimeTranslationService] WebSocket未连接或已关闭，无法发送结束标记');
      console.warn('⚠️ [realTimeTranslationService] ws状态:', this.ws ? this.ws.readyState : 'null');
      return;
    }

    const finishMessage = { finish: true };
    console.log('🏁 [realTimeTranslationService] 发送结束标记:', JSON.stringify(finishMessage, null, 2));
    console.log('🏁 [realTimeTranslationService] ws状态:', this.ws.readyState);
    
    try {
      // 在发送finish前，给服务器一点时间发送最后的响应
      await new Promise(resolve => setTimeout(resolve, 100));

      // 然后发送finish
      this.ws.send(JSON.stringify(finishMessage));
      this.lastFinishTime = Date.now(); // 记录发送结束标记的时间
      console.log('✅ [realTimeTranslationService] 结束标记发送成功');
      console.log('🔗 [realTimeTranslationService] 保持WebSocket连接活跃状态，等待下次使用');
      
      // 添加延迟检查，确保连接保持稳定
      setTimeout(() => {
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
          console.log('✅ [realTimeTranslationService] 发送结束标记后连接状态正常');
        } else {
          console.warn('⚠️ [realTimeTranslationService] 发送结束标记后连接状态异常:', this.ws?.readyState);
          // 如果连接异常，但不主动重连，因为可能是服务器主动关闭
          console.log('ℹ️ [realTimeTranslationService] 服务器可能主动关闭了连接，这是正常行为');
        }
      }, 1000);
      
    } catch (error) {
      console.error('❌ [realTimeTranslationService] 发送结束标记失败:', error);
    }
  }

  /**
   * 处理文本响应
   */
  private handleTextResponse(message: any): void {
    console.log('📝 [realTimeTranslationService] 收到文本响应:', JSON.stringify(message, null, 2));
    
    const response: RealTimeTranslationResponse = {
      conversation_id: this.conversationId!,
      original_text: message.original_text,
      translated_text: message.translated_text,
      status: message.status || 'processing',
      error_message: message.error_message,
    };

    console.log('📝 [realTimeTranslationService] 构建响应对象:', JSON.stringify(response, null, 2));

    if (this.callbacks.onMessage) {
      console.log('📞 [realTimeTranslationService] 调用onMessage回调');
      this.callbacks.onMessage(response);
    } else {
      console.warn('⚠️ [realTimeTranslationService] onMessage回调未定义');
    }
  }

  /**
   * 处理音频响应
   */
  private handleAudioResponse(audioData: ArrayBuffer): void {
    console.log('🎵 [realTimeTranslationService] 收到音频数据，大小:', audioData.byteLength, 'bytes');
    
    const response: RealTimeTranslationResponse = {
      conversation_id: this.conversationId!,
      audio_data: audioData,
      status: 'completed',
    };

    console.log('🎵 [realTimeTranslationService] 构建音频响应对象，会话ID:', response.conversation_id);

    if (this.callbacks.onMessage) {
      console.log('📞 [realTimeTranslationService] 调用onMessage回调（音频）');
      this.callbacks.onMessage(response);
    } else {
      console.warn('⚠️ [realTimeTranslationService] onMessage回调未定义（音频）');
    }
  }

  /**
   * 尝试重连
   */
  private async attemptReconnect(config: RealTimeTranslationConfig): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('❌ [realTimeTranslationService] 达到最大重连次数，停止重连');
      console.error('❌ [realTimeTranslationService] 当前重连次数:', this.reconnectAttempts, '最大次数:', this.maxReconnectAttempts);
      
      // 通知上层组件重连失败
      if (this.callbacks.onError) {
        this.callbacks.onError('连接失败，已达到最大重连次数');
      }
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 10000); // 指数退避，最大10秒
    console.log(`🔄 [realTimeTranslationService] 尝试重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
    console.log(`🔄 [realTimeTranslationService] 延迟时间: ${delay}ms`);
    console.log(`🔄 [realTimeTranslationService] 使用原有会话ID: ${this.conversationId}`);

    // 在重连前先清理现有连接
    if (this.ws) {
      console.log('🧹 [realTimeTranslationService] 清理现有WebSocket连接');
      try {
        this.ws.onopen = null;
        this.ws.onmessage = null;
        this.ws.onerror = null;
        this.ws.onclose = null;
        this.ws.close();
      } catch (error) {
        console.warn('⚠️ [realTimeTranslationService] 清理WebSocket连接时出现警告:', error);
      }
      this.ws = null;
    }
    
    // 清除连接超时
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }

    setTimeout(async () => {
      try {
        console.log(`🔄 [realTimeTranslationService] 开始第${this.reconnectAttempts}次重连...`);
        console.log(`🔄 [realTimeTranslationService] 重连参数 - 会话ID: ${this.conversationId}`);
        
        // 检查网络连接（但不阻止重连）
        const isNetworkAvailable = await this.checkNetworkConnectivity();
        if (!isNetworkAvailable) {
          console.warn('⚠️ [realTimeTranslationService] 网络检查失败，但仍尝试重连');
        }
        
        // 重连时重新获取token，但保持原有会话ID
        console.log('🔄 [realTimeTranslationService] 重新获取认证信息...');
        try {
          const actionToken = await tokenStorage.getToken('ACTION_TOKEN');
          if (!actionToken) {
            throw new Error('无法获取有效的认证token');
          }
          // 直接使用token，不添加Bearer前缀
          this.token = actionToken;
          console.log('✅ [realTimeTranslationService] 重新获取token成功，长度:', actionToken.length);
        } catch (tokenError) {
          console.error('❌ [realTimeTranslationService] 重新获取token失败:', tokenError);
          // 如果是认证问题，触发登录跳转
          this.handleAuthenticationError();
          return;
        }
        
        // 检查是否有有效的会话ID
        if (!this.conversationId) {
          console.error('❌ [realTimeTranslationService] 重连时发现会话ID为空，无法重连');
          if (this.callbacks.onError) {
            this.callbacks.onError('会话ID丢失，请重新开始翻译');
          }
          return;
        }
        
        console.log('🔄 [realTimeTranslationService] 使用原有会话ID进行重连:', this.conversationId);
        console.log('🔄 [realTimeTranslationService] 重连前Token长度:', this.token?.length || 0);
        
        await this.connectWebSocket(config);
        console.log(`✅ [realTimeTranslationService] 第${this.reconnectAttempts}次重连成功`);
        
        // 重连成功后重置重连次数
        this.reconnectAttempts = 0;
        
        // 通知上层组件重连成功
        if (this.callbacks.onOpen) {
          this.callbacks.onOpen();
        }
      } catch (error) {
        console.error(`❌ [realTimeTranslationService] 第${this.reconnectAttempts}次重连失败:`, error);
        
        // 如果是最后一次重连失败，通知上层组件
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
          if (this.callbacks.onError) {
            this.callbacks.onError('重连失败，请检查网络连接');
          }
        } else {
          // 如果不是最后一次，继续尝试重连
          console.log(`🔄 [realTimeTranslationService] 准备第${this.reconnectAttempts + 1}次重连...`);
          this.attemptReconnect(config);
        }
      }
    }, delay);
  }

  /**
   * 处理认证错误
   */
  private async handleAuthenticationError(): Promise<void> {
    console.log('🔒 [realTimeTranslationService] 开始处理认证错误');
    
    try {
      // 清除所有认证相关的存储
      await tokenStorage.removeToken('ACTION_TOKEN');
      await tokenStorage.removeToken('ACCESS_TOKEN');
      await AsyncStorage.removeItem('@lingo_user_info');
      await AsyncStorage.removeItem('@lingo_onboarding_completed');
      
      console.log('✅ [realTimeTranslationService] 认证数据已清除');
      
      // 使用全局登录跳转处理器
      if (global.loginRedirectHandler) {
        console.log('🔒 [realTimeTranslationService] 调用全局登录跳转处理器');
        global.loginRedirectHandler();
      } else {
        console.warn('⚠️ [realTimeTranslationService] 全局登录跳转处理器未设置');
      }
    } catch (error) {
      console.error('❌ [realTimeTranslationService] 处理认证错误失败:', error);
    }
  }

  /**
   * 关闭连接
   */
  close(): void {
    console.log('🔌 [realTimeTranslationService] 主动关闭WebSocket连接');
    console.log('🔌 [realTimeTranslationService] 当前连接状态:', this.isConnected);
    console.log('🔌 [realTimeTranslationService] 会话ID:', this.conversationId);
    
    // 停止心跳机制
    // this.stopHeartbeat(); // 注释掉this.startHeartbeat()、this.stopHeartbeat()、this.heartbeatInterval相关代码，以及心跳包发送
    
    // 清除连接超时
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    // 标记为主动关闭，避免重连
    this.isConnected = false;
    this.reconnectAttempts = this.maxReconnectAttempts; // 阻止重连
    
    if (this.ws) {
      console.log('🔌 [realTimeTranslationService] 移除WebSocket事件监听器');
      // 移除所有事件监听器，避免onclose触发重连
      this.ws.onopen = null;
      this.ws.onmessage = null;
      this.ws.onerror = null;
      this.ws.onclose = null;
      
      // 关闭连接
      console.log('🔌 [realTimeTranslationService] 关闭WebSocket实例');
      this.ws.close();
      this.ws = null;
    } else {
      console.log('⚠️ [realTimeTranslationService] WebSocket实例已为null');
    }
    
    console.log('🧹 [realTimeTranslationService] 发送队列已简化，无需清理');
    
    // 清理回调函数
    console.log('🧹 [realTimeTranslationService] 清理回调函数');
    this.callbacks = {};
    
    // 清理状态
    console.log('🧹 [realTimeTranslationService] 清理状态变量');
    this.conversationId = null;
    this.token = null;
    
    console.log('✅ [realTimeTranslationService] WebSocket连接已完全清理');
  }

  /**
   * 检查连接状态
   */
  isWebSocketConnected(): boolean {
    const connected = this.isConnected && this.ws?.readyState === WebSocket.OPEN;
    console.log('🔍 [realTimeTranslationService] 连接状态检查:', {
      isConnected: this.isConnected,
      wsReadyState: this.ws?.readyState,
      connected: connected
    });
    return connected;
  }

  /**
   * 检查是否有活跃的WebSocket连接
   */
  hasActiveConnection(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  /**
   * 获取连接信息
   */
  getConnectionInfo(): {
    hasConnection: boolean;
    isConnected: boolean;
    wsReadyState: number | null;
    conversationId: string | null;
  } {
    return {
      hasConnection: this.ws !== null,
      isConnected: this.isConnected,
      wsReadyState: this.ws?.readyState || null,
      conversationId: this.conversationId,
    };
  }

  /**
   * 检查连接健康状态
   */
  checkConnectionHealth(): {
    isHealthy: boolean;
    issues: string[];
  } {
    const issues: string[] = [];
    
    if (!this.ws) {
      issues.push('WebSocket实例不存在');
    } else if (this.ws.readyState !== WebSocket.OPEN) {
      issues.push(`WebSocket状态异常: ${this.ws.readyState}`);
    }
    
    if (!this.isConnected) {
      issues.push('连接状态标记为false');
    }
    
    if (!this.conversationId) {
      issues.push('会话ID不存在');
    }
    
    const health = {
      isHealthy: issues.length === 0,
      issues
    };
    
    console.log('🔍 [realTimeTranslationService] 连接健康检查:', health);
    return health;
  }

  /**
   * 启动连接健康检查
   */
  private startHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
    }
    
    this.healthCheckInterval = setInterval(() => {
      const health = this.checkConnectionHealth();
      if (!health.isHealthy) {
        console.warn('⚠️ [realTimeTranslationService] 连接健康检查发现问题:', health.issues);
        
        // 检查是否是服务器主动关闭（在发送结束标记后）
        const timeSinceFinish = Date.now() - this.lastFinishTime;
        if (timeSinceFinish < 5000) {
          console.log('ℹ️ [realTimeTranslationService] 健康检查：检测到服务器主动关闭，跳过重连');
          return;
        }
        
        // 如果连接不健康，尝试重新连接
        if (this.ws && this.ws.readyState !== WebSocket.OPEN) {
          console.log('🔄 [realTimeTranslationService] 检测到连接异常，准备重连');
          this.isConnected = false;
          if (this.callbacks.onError) {
            this.callbacks.onError('连接异常，正在重连');
          }
        }
      } else {
        console.log('✅ [realTimeTranslationService] 连接健康检查正常');
      }
    }, this.healthCheckMs);
    
    console.log('🔍 [realTimeTranslationService] 连接健康检查已启动，间隔:', this.healthCheckMs, 'ms');
  }

  /**
   * 停止连接健康检查
   */
  private stopHealthCheck(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
      console.log('🔍 [realTimeTranslationService] 连接健康检查已停止');
    }
  }



  /**
   * 启动心跳机制
   */
  private startHeartbeat(): void {
    console.log('💓 [realTimeTranslationService] 启动心跳机制');
    
    // 清除现有心跳
    // this.stopHeartbeat(); // 注释掉this.startHeartbeat()、this.stopHeartbeat()、this.heartbeatInterval相关代码，以及心跳包发送
    
    // 设置心跳间隔
    // this.heartbeatInterval = setInterval(() => { // 注释掉this.startHeartbeat()、this.stopHeartbeat()、this.heartbeatInterval相关代码，以及心跳包发送
    //   if (this.ws && this.ws.readyState === WebSocket.OPEN) {
    //     try {
    //       console.log('💓 [realTimeTranslationService] 发送心跳包');
    //       this.ws.send(JSON.stringify({ type: 'heartbeat', timestamp: Date.now() }));
    //     } catch (error) {
    //       console.error('❌ [realTimeTranslationService] 心跳发送失败:', error);
    //       this.stopHeartbeat();
    //     }
    //   } else {
    //     console.log('💓 [realTimeTranslationService] WebSocket未连接，停止心跳');
    //     this.stopHeartbeat();
    //   }
    // }, this.heartbeatTimeout);
  }

  /**
   * 停止心跳机制
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      console.log('💓 [realTimeTranslationService] 停止心跳机制');
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * 强制重新连接
   */
  async forceReconnect(config: RealTimeTranslationConfig): Promise<void> {
    console.log('🔄 [realTimeTranslationService] 强制重新连接...');
    
    // 先关闭现有连接
    if (this.ws) {
      console.log('🔌 [realTimeTranslationService] 关闭现有连接');
      this.ws.close();
      this.ws = null;
    }
    
    // 清除连接超时
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    // 停止心跳
    // this.stopHeartbeat(); // 注释掉this.startHeartbeat()、this.stopHeartbeat()、this.heartbeatInterval相关代码，以及心跳包发送
    
    // 重置状态
    this.isConnected = false;
    this.reconnectAttempts = 0;
    
    // 重新获取token，但保持原有会话ID
    console.log('🔄 [realTimeTranslationService] 重新获取认证信息...');
    try {
      const actionToken = await tokenStorage.getToken('ACTION_TOKEN');
      if (!actionToken) {
        throw new Error('无法获取有效的认证token');
      }
      // 直接使用token，不添加Bearer前缀
      this.token = actionToken;
      console.log('✅ [realTimeTranslationService] 重新获取token成功，长度:', actionToken.length);
      console.log('✅ [realTimeTranslationService] 强制重连Token前20字符:', actionToken.substring(0, 20) + '...');
    } catch (tokenError) {
      console.error('❌ [realTimeTranslationService] 重新获取token失败:', tokenError);
      throw new Error('认证失败，请重新登录');
    }
    
    // 检查是否有有效的会话ID
    if (!this.conversationId) {
      console.error('❌ [realTimeTranslationService] 强制重连时发现会话ID为空，无法重连');
      throw new Error('会话ID丢失，请重新开始翻译');
    }
    
    console.log('🔄 [realTimeTranslationService] 使用原有会话ID进行强制重连:', this.conversationId);
    console.log('🔄 [realTimeTranslationService] 强制重连参数 - 会话ID:', this.conversationId, 'Token长度:', this.token?.length || 0);
    
    // 重新连接
    try {
      await this.connectWebSocket(config);
      console.log('✅ [realTimeTranslationService] 强制重连成功');
    } catch (error) {
      console.error('❌ [realTimeTranslationService] 强制重连失败:', error);
      throw error;
    }
  }

  /**
   * 检查网络连接状态
   */
  private async checkNetworkConnectivity(): Promise<boolean> {
    try {
      // 尝试连接自己的API服务器（更可靠）
      const baseUrl = CURRENT_API_CONFIG.BASE_URL;
      await fetch(`${baseUrl}/health`, { 
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      
      console.log('✅ [realTimeTranslationService] 网络连接检查成功');
      return true;
    } catch (error) {
      console.warn('⚠️ [realTimeTranslationService] 网络连接检查失败:', error);
      
      // 如果API服务器检查失败，尝试备用检查方法
      try {
        // 备用检查：尝试连接一个可靠的CDN
        await fetch('https://cdn.jsdelivr.net/npm/react@18.2.0/package.json', {
          method: 'HEAD',
          mode: 'no-cors',
          cache: 'no-cache'
        });
        console.log('✅ [realTimeTranslationService] 备用网络检查成功');
        return true;
      } catch (backupError) {
        console.warn('⚠️ [realTimeTranslationService] 备用网络检查也失败:', backupError);
        
        // 最后的检查：如果都失败了，但WebSocket能连接，我们认为网络是可用的
        // 因为WebSocket连接本身就需要网络
        console.log('ℹ️ [realTimeTranslationService] 网络检查失败，但WebSocket可能仍然可用');
        return true; // 返回true，让重连继续尝试
      }
    }
  }

  /**
   * 获取会话ID
   */
  getConversationId(): string | null {
    return this.conversationId;
  }

  /**
   * 测试WebSocket连接（发送ping消息）
   */
  async testConnection(): Promise<boolean> {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.error('❌ [realTimeTranslationService] WebSocket未连接，无法测试');
      return false;
    }

    try {
      console.log('🧪 [realTimeTranslationService] 开始连接测试...');
      
      // 发送测试消息
      const testMessage = { type: 'ping', timestamp: Date.now() };
      this.ws.send(JSON.stringify(testMessage));
      
      console.log('✅ [realTimeTranslationService] 测试消息发送成功');
      return true;
    } catch (error) {
      console.error('❌ [realTimeTranslationService] 连接测试失败:', error);
      return false;
    }
  }

  /**
   * 获取WebSocket关闭代码的描述
   */
  private getCloseCodeDescription(code: number): string {
    const descriptions: { [key: number]: string } = {
      1000: '正常关闭',
      1001: '端点离开',
      1002: '协议错误',
      1003: '不支持的数据类型',
      1005: '无状态码',
      1006: '异常关闭',
      1007: '数据类型不一致',
      1008: '策略违规',
      1009: '消息过大',
      1010: '客户端需要扩展',
      1011: '服务器遇到错误',
      1012: '服务器重启',
      1013: '临时错误',
      1014: '网关错误',
      1015: 'TLS握手失败'
    };
    return descriptions[code] || '未知关闭代码';
  }
}

// 创建并导出服务实例
const realTimeTranslationService = new RealTimeTranslationService();
export default realTimeTranslationService; 