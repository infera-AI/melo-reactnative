/**
 * 耳机模式翻译页面
 * T1.1.1：提供耳机翻译模式，支持用户通过耳机进行私密或双向对话翻译
 */
import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Alert,
  Animated,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import DocumentPicker from '@react-native-documents/picker';
import realTimeTranslationService from '../../services/realTimeTranslationService';
import type { RealTimeTranslationConfig, RealTimeTranslationResponse } from '../../api/services/translateService';
import translateService from '../../api/services/translateService';
import audioRecordingService from '../../services/audioRecordingService';
import type { AudioConfig } from '../../services/audioRecordingService';
// 移除旧的录音库导入，使用新的录音库

interface HeadphoneTranslationScreenProps {
  contactName?: string; // 从通讯录选择的联系人名称
  onBack?: () => void;
  onTabSwitch?: (tab: string) => void;
  onRemoveContact?: () => void;
}

interface ConversationMessage {
  id: string;
  isUser: boolean;
  originalText: string;
  translatedText: string;
  timestamp: number;
  audioData?: ArrayBuffer;
}

// 音频文件信息接口
interface AudioFileInfo {
  name: string;
  size: number;
  type: string;
  uri: string;
}

// 语言映射
const languageMap: { [key: string]: string } = {
  '中文': 'zh',
  '英文': 'en',
  '日语': 'ja',
  '韩语': 'ko',
  '法语': 'fr',
  '德语': 'de',
  '西班牙语': 'es',
  '俄语': 'ru',
};

// 支持的音频格式
const supportedAudioFormats = ['mp3', 'wav', 'm4a', 'aac', 'ogg'];

const HeadphoneTranslationScreen: React.FC<HeadphoneTranslationScreenProps> = ({
  contactName,
  onBack,
  onTabSwitch,
  onRemoveContact,
}) => {
  const [activeTab, setActiveTab] = useState('translation');
  const [fromLanguage, setFromLanguage] = useState('中文');
  const [toLanguage, setToLanguage] = useState('日语');
  const [showFromLanguageSelector, setShowFromLanguageSelector] = useState(false);
  const [showToLanguageSelector, setShowToLanguageSelector] = useState(false);
  const [isOriginalPlaybackEnabled, setIsOriginalPlaybackEnabled] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isRecording, setIsRecording] = useState(false);
  const [_isWebSocketConnected, _setIsWebSocketConnected] = useState(false);
  const [_isInitializing, _setIsInitializing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected' | 'error'>('connecting');
  const [keyboardInputModalVisible, setKeyboardInputModalVisible] = useState(false);
  const [keyboardInputText, setKeyboardInputText] = useState('');
  const [conversations, setConversations] = useState<ConversationMessage[]>([]);
  const [selectedAudioFile, setSelectedAudioFile] = useState<AudioFileInfo | null>(null);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);

  // 音频配置 - 优化为实时传输
  const audioConfig: AudioConfig = {
    sampleRate: 16000,
    channels: 1, // 单声道
    bitsPerSample: 16,
    format: 'opus', // 使用Opus编码，更适合实时传输
  };

  // 动画相关
  const recordButtonScale = useRef(new Animated.Value(1)).current;
  const recordButtonOpacity = useRef(new Animated.Value(1)).current;

  // 初始化实时翻译
  const initializeRealTimeTranslation = React.useCallback(async () => {
    console.log('🚀 [HeadphoneTranslationScreen] 开始初始化实时翻译...');
    console.log('🚀 [HeadphoneTranslationScreen] 源语言:', fromLanguage);
    console.log('🚀 [HeadphoneTranslationScreen] 目标语言:', toLanguage);
    console.log('🚀 [HeadphoneTranslationScreen] 联系人:', contactName || '无');
    
    try {
      _setIsInitializing(true);
      setConnectionStatus('connecting');
      console.log('🔄 [HeadphoneTranslationScreen] 设置初始化状态为true');
      
      // 检查是否有现有连接
      const connectionInfo = realTimeTranslationService.getConnectionInfo();
      console.log('🔍 [HeadphoneTranslationScreen] 现有连接信息:', connectionInfo);
      
      if (realTimeTranslationService.hasActiveConnection()) {
        console.log('🔗 [HeadphoneTranslationScreen] 检测到现有活跃连接，复用连接');
        _setIsWebSocketConnected(true);
        _setIsInitializing(false);
        console.log('✅ [HeadphoneTranslationScreen] 复用现有连接成功');
        return;
      }
      
      // 请求麦克风权限
      console.log('🔐 [HeadphoneTranslationScreen] 请求麦克风权限...');
      const hasPermission = await audioRecordingService.requestPermission();
      if (!hasPermission) {
        console.error('❌ [HeadphoneTranslationScreen] 麦克风权限被拒绝');
        Alert.alert('权限错误', '需要麦克风权限才能使用实时翻译功能');
        return;
      }
      console.log('✅ [HeadphoneTranslationScreen] 麦克风权限获取成功');

      // 获取用户token
      console.log('🔑 [HeadphoneTranslationScreen] 获取用户token...');
      const tokenStorage = require('../../utils/tokenStorage').default;
      const actionToken = await tokenStorage.getActionToken();
      if (!actionToken) {
        console.error('❌ [HeadphoneTranslationScreen] 未获取到Action Token');
        Alert.alert('认证错误', '请先登录获取访问令牌');
        return;
      }
      const token = actionToken; // 直接使用token，不添加Bearer前缀
      console.log('✅ [HeadphoneTranslationScreen] Token获取成功，长度:', actionToken.length);

      // 实时翻译配置
      const realTimeConfig: RealTimeTranslationConfig = {
        format: 'wav',
        sample_rate: 16000,
        source_language: languageMap[fromLanguage] || 'zh',
        target_language: languageMap[toLanguage] || 'ja',
      };
      console.log('⚙️ [HeadphoneTranslationScreen] 实时翻译配置:', JSON.stringify(realTimeConfig, null, 2));

      // 初始化WebSocket连接
      console.log('🔗 [HeadphoneTranslationScreen] 初始化WebSocket连接...');
      const conversationId = await realTimeTranslationService.initialize(
        realTimeConfig,
        token,
        contactName,
        {
          onOpen: () => {
            console.log('✅ [HeadphoneTranslationScreen] WebSocket连接已建立');
            _setIsWebSocketConnected(true);
            _setIsInitializing(false);
            setConnectionStatus('connected');
            console.log('✅ [HeadphoneTranslationScreen] 状态更新完成');
          },
          onMessage: (response: RealTimeTranslationResponse) => {
            console.log('📥 [HeadphoneTranslationScreen] 收到翻译响应');
            handleTranslationResponse(response);
          },
          onError: (error: string) => {
            // 检查是否是服务器主动关闭（在发送结束标记后）
            const timeSinceFinish = Date.now() - (realTimeTranslationService as any).lastFinishTime;
            if (timeSinceFinish < 5000) { // 5秒内发送过结束标记
              console.log('ℹ️ [HeadphoneTranslationScreen] 检测到服务器主动关闭，忽略错误');
              console.log('ℹ️ [HeadphoneTranslationScreen] 距离发送结束标记时间:', timeSinceFinish, 'ms');
              return; // 完全忽略这个错误
            }
            
            console.error('❌ [HeadphoneTranslationScreen] WebSocket错误:', error);
            _setIsWebSocketConnected(false);
            _setIsInitializing(false);
            setConnectionStatus('error');
            
            // 如果是网络连接错误，显示更友好的提示
            if (error.includes('连接失败') || error.includes('网络') || error.includes('重连')) {
              Alert.alert(
                '网络连接问题', 
                '检测到网络连接不稳定，正在尝试重新连接。请检查网络设置或稍后重试。',
                [{ text: '确定', style: 'default' }]
              );
            } else {
              Alert.alert('连接错误', error);
            }
          },
          onClose: () => {
            console.log('🔌 [HeadphoneTranslationScreen] WebSocket连接已关闭');
            _setIsWebSocketConnected(false);
            setConnectionStatus('disconnected');
          },
        }
      );

      console.log('✅ [HeadphoneTranslationScreen] 实时翻译初始化成功，会话ID:', conversationId);
    } catch (error: any) {
      console.error('❌ [HeadphoneTranslationScreen] 初始化实时翻译失败:', error);
      _setIsInitializing(false);
      Alert.alert('初始化失败', error.message);
    }
  }, [contactName, fromLanguage, toLanguage]);

  // 初始化实时翻译服务
  React.useEffect(() => {
    if (fromLanguage && toLanguage) {
      initializeRealTimeTranslation();
    }
    
    // 清理函数 - 只停止录音，不关闭WebSocket连接
    return () => {
      console.log('🔙 [HeadphoneTranslationScreen] 组件卸载，执行清理');
      // 先重置状态，避免回调函数触发错误提示
      _setIsWebSocketConnected(false);
      _setIsInitializing(false);
      setIsRecording(false);
      
      // 只停止录音，保持WebSocket连接
      if (audioRecordingService.isRecordingAudio()) {
        console.log('🛑 [HeadphoneTranslationScreen] 组件卸载时停止录音');
        audioRecordingService.stopRecording();
      }
      
      console.log('🔗 [HeadphoneTranslationScreen] 保持WebSocket连接，不主动关闭');
    };
  }, [fromLanguage, toLanguage, initializeRealTimeTranslation]);

  // 组件卸载时的清理
  React.useEffect(() => {
    return () => {
      console.log('🔙 [HeadphoneTranslationScreen] 组件完全卸载，执行最终清理');
      // 先重置状态，避免回调函数触发错误提示
      _setIsWebSocketConnected(false);
      _setIsInitializing(false);
      setIsRecording(false);
      
      // 只停止录音，保持WebSocket连接
      if (audioRecordingService.isRecordingAudio()) {
        console.log('🛑 [HeadphoneTranslationScreen] 组件卸载时停止录音');
        audioRecordingService.stopRecording();
      }
      
      console.log('🔗 [HeadphoneTranslationScreen] 保持WebSocket连接，不主动关闭');
    };
  }, []);

  // 处理翻译响应
  const handleTranslationResponse = (response: RealTimeTranslationResponse) => {
    console.log('📝 [HeadphoneTranslationScreen] 处理翻译响应...');
    console.log('📝 [HeadphoneTranslationScreen] 响应状态:', response.status);
    console.log('📝 [HeadphoneTranslationScreen] 会话ID:', response.conversation_id);
    
    if (response.status === 'completed' && response.original_text && response.translated_text) {
      console.log('✅ [HeadphoneTranslationScreen] 翻译完成');
      console.log('📝 [HeadphoneTranslationScreen] 原文:', response.original_text);
      console.log('📝 [HeadphoneTranslationScreen] 译文:', response.translated_text);
      console.log('🎵 [HeadphoneTranslationScreen] 是否有音频数据:', !!response.audio_data);
      
      const newMessage: ConversationMessage = {
        id: Date.now().toString(),
        isUser: false,
        originalText: response.original_text,
        translatedText: response.translated_text,
        timestamp: Date.now(),
        audioData: response.audio_data,
      };
      
      console.log('💬 [HeadphoneTranslationScreen] 创建新消息:', newMessage.id);
      setConversations(prev => [...prev, newMessage]);
      console.log('✅ [HeadphoneTranslationScreen] 消息已添加到对话列表');
      
      // 播放翻译音频
      if (response.audio_data) {
        console.log('🎵 [HeadphoneTranslationScreen] 开始播放翻译音频');
        audioRecordingService.playAudio(response.audio_data);
      } else {
        console.log('⚠️ [HeadphoneTranslationScreen] 翻译响应中没有音频数据');
      }
    } else if (response.status === 'error') {
      console.error('❌ [HeadphoneTranslationScreen] 翻译错误:', response.error_message);
      Alert.alert('翻译错误', response.error_message || '翻译失败');
    } else {
      console.log('⏳ [HeadphoneTranslationScreen] 翻译处理中...');
    }
  };

  // 语言选择数据
  const languages = ['中文', '英文', '日语', '韩语', '法语', '德语', '西班牙语', '俄语'];

  // 处理Tab切换
  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    if (onTabSwitch) {
      onTabSwitch(tab);
    }
  };

  // 处理语言切换
  const handleLanguageSwitch = () => {
    const temp = fromLanguage;
    setFromLanguage(toLanguage);
    setToLanguage(temp);
  };

  // 处理字体大小调整
  const handleFontSizeChange = (increase: boolean) => {
    setFontSize(prev => {
      const newSize = increase ? Math.min(prev + 2, 24) : Math.max(prev - 2, 12);
      return newSize;
    });
  };

  // 处理缩放级别调整
  const handleZoomChange = (increase: boolean) => {
    setZoomLevel(prev => {
      const newZoom = increase ? Math.min(prev + 0.1, 1.5) : Math.max(prev - 0.1, 0.8);
      return Math.round(newZoom * 10) / 10;
    });
  };

  // 处理语音录音
  const handleVoiceRecordStart = async () => {
    console.log('🎤 [HeadphoneTranslationScreen] 开始语音录音...');

    // 检查WebSocket连接状态
    const connectionInfo = realTimeTranslationService.getConnectionInfo();
    if (!connectionInfo.isConnected || connectionInfo.wsReadyState !== 1) {
      console.log('🔄 [HeadphoneTranslationScreen] WebSocket未连接，尝试重新连接...');
      
      try {
        // 显示连接中状态
        setConnectionStatus('connecting');
        
        // 重新初始化连接
        await initializeRealTimeTranslation();
        
        // 等待连接建立
        await new Promise((resolve, reject) => {
          const checkConnection = () => {
            const currentConnectionInfo = realTimeTranslationService.getConnectionInfo();
            if (currentConnectionInfo.isConnected && currentConnectionInfo.wsReadyState === 1) {
              console.log('✅ [HeadphoneTranslationScreen] 重新连接成功');
              resolve(true);
            } else {
              setTimeout(checkConnection, 100);
            }
          };
          checkConnection();
          
          // 设置超时
          setTimeout(() => {
            reject(new Error('连接超时'));
          }, 10000);
        });
        
        console.log('✅ [HeadphoneTranslationScreen] 连接已就绪，可以开始录音');
      } catch (error) {
        console.error('❌ [HeadphoneTranslationScreen] 重新连接失败:', error);
        Alert.alert(
          '连接失败',
          '无法建立网络连接，请检查网络设置后重试。',
          [{ text: '确定', style: 'default' }]
        );
        return;
      }
    }

    try {
      setIsRecording(true);
      console.log('✅ [HeadphoneTranslationScreen] 录音状态已设置为true');
      
      // 录音按钮动画
      console.log('🎬 [HeadphoneTranslationScreen] 开始录音按钮动画');
      Animated.parallel([
        Animated.timing(recordButtonScale, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(recordButtonOpacity, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // 开始录制音频
      console.log('🎤 [HeadphoneTranslationScreen] 调用audioRecordingService.startRecording');
      await audioRecordingService.startRecording(audioConfig, {
        onData: (audioData: ArrayBuffer) => {
          console.log('🎵 [HeadphoneTranslationScreen] 收到音频数据');
          console.log('🎵 [HeadphoneTranslationScreen] 音频数据大小:', audioData.byteLength, 'bytes');
          console.log('🎵 [HeadphoneTranslationScreen] 录音状态:', audioRecordingService.isRecordingAudio());
          
          // 检查录音状态
          if (!audioRecordingService.isRecordingAudio()) {
            console.warn('⚠️ [HeadphoneTranslationScreen] 已停止录音, 不再发送音频数据');
            return;
          }
          
          // 检查WebSocket连接状态
          const connectionInfo = realTimeTranslationService.getConnectionInfo();
          if (!connectionInfo.isConnected || connectionInfo.wsReadyState !== 1) {
            console.warn('⚠️ [HeadphoneTranslationScreen] WebSocket未连接, 不再发送音频数据');
            console.warn('⚠️ [HeadphoneTranslationScreen] 连接状态:', connectionInfo);
            
            // 如果WebSocket断开，停止录音并提示用户
            if (audioRecordingService.isRecordingAudio()) {
              console.log('🛑 [HeadphoneTranslationScreen] WebSocket断开，停止录音');
              audioRecordingService.stopRecording();
              setIsRecording(false);
              
              // 显示友好的提示
              Alert.alert(
                '连接中断',
                '网络连接已断开，录音已停止。正在尝试重新连接...',
                [{ text: '确定', style: 'default' }]
              );
            }
            return;
          }
          
          try {
            console.log('📤 [HeadphoneTranslationScreen] 发送音频数据到WebSocket');
            realTimeTranslationService.sendAudioData(audioData);
          } catch (error) {
            console.error('❌ [HeadphoneTranslationScreen] 发送音频数据失败:', error);
            
            // 发送失败时，停止录音
            if (audioRecordingService.isRecordingAudio()) {
              console.log('🛑 [HeadphoneTranslationScreen] 发送失败，停止录音');
              audioRecordingService.stopRecording();
              setIsRecording(false);
              
              // 显示错误提示
              Alert.alert(
                '发送失败',
                '音频数据发送失败，录音已停止。请检查网络连接后重试。',
                [{ text: '确定', style: 'default' }]
              );
            }
          }
        },
        onError: (error: string) => {
          console.error('❌ [HeadphoneTranslationScreen] 录制错误:', error);
          setIsRecording(false);
          Alert.alert('录制错误', error);
        },
        onStart: () => {
          console.log('✅ [HeadphoneTranslationScreen] 录音服务开始');
        },
        onStop: () => {
          console.log('🛑 [HeadphoneTranslationScreen] 录音服务停止');
        },
      });

      console.log('✅ [HeadphoneTranslationScreen] 录音启动成功');

    } catch (error: any) {
      console.error('❌ [HeadphoneTranslationScreen] 开始录制失败:', error);
      Alert.alert('录制失败', error.message);
      setIsRecording(false);
    }
  };

  const handleVoiceRecordEnd = async () => {
    console.log('🛑 [HeadphoneTranslationScreen] 停止语音录音...');
    console.log('🛑 [HeadphoneTranslationScreen] 当前录音状态:', audioRecordingService.isRecordingAudio());
    
    // 先停止录音，等待录音完全停止后再发送结束标记
    try {
      
      // 停止录音并等待完成
      console.log('🛑 [HeadphoneTranslationScreen] 调用audioRecordingService.stopRecording');
      audioRecordingService.stopRecording();
      
      // 等待一小段时间确保所有音频数据回调都完成
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // 检查WebSocket连接状态
      const connectionInfo = realTimeTranslationService.getConnectionInfo();
      console.log('🔍 [HeadphoneTranslationScreen] 录音停止后连接状态:', connectionInfo);
      
      if (connectionInfo.isConnected && connectionInfo.wsReadyState === WebSocket.OPEN) {
        console.log('🏁 [HeadphoneTranslationScreen] 发送结束标记');
        realTimeTranslationService.sendFinish();
        console.log('✅ [HeadphoneTranslationScreen] 结束标记发送成功');
      } else {
        console.warn('⚠️ [HeadphoneTranslationScreen] WebSocket连接不可用，跳过发送结束标记');
        console.warn('⚠️ [HeadphoneTranslationScreen] 连接状态:', connectionInfo);
      }
      
      // 最后更新UI状态
      setIsRecording(false);
      console.log('✅ [HeadphoneTranslationScreen] 录音状态已设置为false');
      
      // 不再主动关闭WebSocket连接，保持连接状态
      console.log('🔗 [HeadphoneTranslationScreen] 保持WebSocket连接活跃状态');
      
    } catch (error) {
      console.error('❌ [HeadphoneTranslationScreen] 停止录音过程中发生错误:', error);
      setIsRecording(false);
      Alert.alert('录音停止失败', '停止录音时发生错误，但录音已停止');
    }
    
    console.log('✅ [HeadphoneTranslationScreen] 录音停止流程完成');
  };

  // 处理播放语音
  const handlePlayAudio = async (messageId: string, isOriginal: boolean) => {
    try {
      const message = conversations.find(msg => msg.id === messageId);
      if (!message) {
        console.error('未找到消息:', messageId);
        return;
      }

      if (isOriginal) {
        // 播放原文音频（这里需要根据实际情况实现）
        console.log(`播放原文音频: ${messageId}`);
        Alert.alert('播放音频', `正在播放原文音频`);
      } else {
        // 播放译文音频
        if (message.audioData) {
          console.log(`播放译文音频: ${messageId}`);
          await audioRecordingService.playAudio(message.audioData);
        } else {
          console.log('该消息没有音频数据');
          Alert.alert('提示', '该消息没有音频数据');
        }
      }
    } catch (error: any) {
      console.error('播放音频失败:', error);
      Alert.alert('播放失败', error.message);
    }
  };

  // 处理键盘输入
  const handleKeyboardInput = () => {
    setKeyboardInputModalVisible(true);
  };

  const handleSendKeyboardInput = async () => {
    const text = keyboardInputText.trim();
    if (!text) return;

    // 自动翻译
    let translated = '';
    try {
      // Assuming translateService is available globally or imported elsewhere
      // For now, using a placeholder or assuming it's imported
      // In a real app, this would be a service call to your backend
      // For demonstration, we'll simulate a translation
      console.log(`Simulating translation for keyboard input: "${text}"`);
      // In a real app, you would call a translation API here
      // Example: const res = await translateService.translateText({ ... });
      // For now, just simulate a successful translation
      const res = await translateService.translateText({
        format_type: 'text',
        source_language: 'zh', // 可根据fromLanguage动态设置
        source_text: text,
        target_language: 'en', // 可根据toLanguage动态设置
      });
      translated = res.translated_text || '';
    } catch (e) {
      translated = '';
    }

    const newMessage: ConversationMessage = {
      id: Date.now().toString(),
      isUser: true,
      originalText: text,
      translatedText: translated,
      timestamp: Date.now(),
    };
    setConversations(prev => [...prev, newMessage]);
    setKeyboardInputText('');
    setKeyboardInputModalVisible(false);
  };

  // 处理移除联系人
  const handleRemoveContact = () => {
    if (onRemoveContact) {
      onRemoveContact();
    }
  };



  // 选择音频文件 - 参考文档翻译的实现
  const selectAudioFile = async (): Promise<AudioFileInfo | null> => {
    try {
      console.log('📁 [HeadphoneTranslationScreen] 开始选择音频文件...');
      
      const results = await DocumentPicker.pick({
        type: [DocumentPicker.types.audio],
        allowMultiSelection: false,
      });

      if (results.length > 0) {
        const selectedFile = results[0];
        
        // 检查文件大小限制（100MB）
        const maxSize = 100 * 1024 * 1024;
        if (selectedFile.size && selectedFile.size > maxSize) {
          Alert.alert('文件过大', '文件大小不能超过100MB，请选择较小的文件');
          return null;
        }

        const fileExtension = selectedFile.name?.split('.').pop()?.toLowerCase();
        if (!fileExtension || !supportedAudioFormats.includes(fileExtension)) {
          Alert.alert('格式不支持', `请选择支持的音频格式: ${supportedAudioFormats.join(', ')}`);
          return null;
        }

        const audioFileInfo: AudioFileInfo = {
          name: selectedFile.name || '未知文件',
          size: selectedFile.size || 0,
          type: fileExtension,
          uri: selectedFile.uri,
        };

        console.log('✅ [HeadphoneTranslationScreen] 选择音频文件:', audioFileInfo.name, '大小:', audioFileInfo.size, '字节');
        return audioFileInfo;
      }
      
      return null;
    } catch (error: any) {
      if (error.code === 'DOCUMENT_PICKER_CANCELED') {
        // 用户取消选择，不显示错误
        console.log('ℹ️ [HeadphoneTranslationScreen] 用户取消文件选择');
        return null;
      }
      
      console.error('❌ [HeadphoneTranslationScreen] 选择文件失败:', error);
      Alert.alert('选择文件失败', error.message || '无法选择文件，请重试');
      return null;
    }
  };

  // 处理音频文件选择
  const handleSelectAudioFile = async () => {
    try {
      const selectedFile = await selectAudioFile();
      
      if (!selectedFile) {
        return;
      }

      console.log('📁 [HeadphoneTranslationScreen] 设置选中的音频文件:', selectedFile);
      setSelectedAudioFile(selectedFile);
      
      // 显示成功消息
      Alert.alert('上传成功', `已选择文件：${selectedFile.name}\n大小：${formatFileSize(selectedFile.size)}`);
    } catch (error: any) {
      console.error('❌ [HeadphoneTranslationScreen] 音频文件选择失败:', error);
      Alert.alert('选择失败', error.message || '音频文件选择失败');
    }
  };

  // 发送音频文件
  const handleSendAudioFile = async () => {
    if (!selectedAudioFile) {
      Alert.alert('错误', '请先选择音频文件');
      return;
    }

    // 检查WebSocket连接状态
    const connectionInfo = realTimeTranslationService.getConnectionInfo();
    console.log('🔍 [HeadphoneTranslationScreen] 当前连接状态:', {
      isConnected: connectionInfo.isConnected,
      wsReadyState: connectionInfo.wsReadyState,
      wsReadyStateText: connectionInfo.wsReadyState === 0 ? 'CONNECTING' : 
                        connectionInfo.wsReadyState === 1 ? 'OPEN' : 
                        connectionInfo.wsReadyState === 2 ? 'CLOSING' : 
                        connectionInfo.wsReadyState === 3 ? 'CLOSED' : 'UNKNOWN',
      conversationId: connectionInfo.conversationId,
      hasConnection: connectionInfo.hasConnection
    });
    
    if (!connectionInfo.isConnected || connectionInfo.wsReadyState !== 1) {
      console.log('🔄 [HeadphoneTranslationScreen] WebSocket未连接，开始重连流程...');
      console.log('🔄 [HeadphoneTranslationScreen] 重连原因:', {
        notConnected: !connectionInfo.isConnected,
        notReady: connectionInfo.wsReadyState !== 1,
        readyState: connectionInfo.wsReadyState
      });
      
      try {
        console.log('🔄 [HeadphoneTranslationScreen] 设置连接状态为connecting');
        setConnectionStatus('connecting');
        
        console.log('🔄 [HeadphoneTranslationScreen] 调用initializeRealTimeTranslation开始重连...');
        await initializeRealTimeTranslation();
        console.log('🔄 [HeadphoneTranslationScreen] initializeRealTimeTranslation调用完成');
        
        // 等待连接建立
        console.log('🔄 [HeadphoneTranslationScreen] 开始等待连接建立...');
        await new Promise((resolve, reject) => {
          let checkCount = 0;
          const maxChecks = 100; // 最多检查100次，每次100ms，总共10秒
          
          const checkConnection = () => {
            checkCount++;
            const currentConnectionInfo = realTimeTranslationService.getConnectionInfo();
            
            console.log(`🔄 [HeadphoneTranslationScreen] 第${checkCount}次检查连接状态:`, {
              isConnected: currentConnectionInfo.isConnected,
              wsReadyState: currentConnectionInfo.wsReadyState,
              wsReadyStateText: currentConnectionInfo.wsReadyState === 0 ? 'CONNECTING' : 
                               currentConnectionInfo.wsReadyState === 1 ? 'OPEN' : 
                               currentConnectionInfo.wsReadyState === 2 ? 'CLOSING' : 
                               currentConnectionInfo.wsReadyState === 3 ? 'CLOSED' : 'UNKNOWN',
              conversationId: currentConnectionInfo.conversationId,
              hasConnection: currentConnectionInfo.hasConnection
            });
            
            if (currentConnectionInfo.isConnected && currentConnectionInfo.wsReadyState === 1) {
              console.log('✅ [HeadphoneTranslationScreen] 重新连接成功！');
              console.log('✅ [HeadphoneTranslationScreen] 连接详情:', {
                conversationId: currentConnectionInfo.conversationId,
                readyState: currentConnectionInfo.wsReadyState,
                hasConnection: currentConnectionInfo.hasConnection
              });
              resolve(true);
            } else if (checkCount >= maxChecks) {
              console.error('❌ [HeadphoneTranslationScreen] 连接检查超时，已达到最大检查次数:', maxChecks);
              reject(new Error('连接超时'));
            } else {
              console.log(`🔄 [HeadphoneTranslationScreen] 连接未就绪，${100}ms后重试...`);
              setTimeout(checkConnection, 100);
            }
          };
          
          checkConnection();
          
          // 设置总体超时
          setTimeout(() => {
            console.error('❌ [HeadphoneTranslationScreen] 重连总体超时，10秒后仍未连接');
            reject(new Error('连接超时'));
          }, 10000);
        });
        
        console.log('✅ [HeadphoneTranslationScreen] 重连流程完成，连接已就绪');
      } catch (error) {
        console.error('❌ [HeadphoneTranslationScreen] 重新连接失败:', error);
        console.error('❌ [HeadphoneTranslationScreen] 重连失败详情:', {
          message: (error as any).message,
          stack: (error as any).stack,
          connectionInfo: realTimeTranslationService.getConnectionInfo()
        });
        Alert.alert('连接失败', '无法建立网络连接，请检查网络设置后重试');
        return;
      }
    } else {
      console.log('✅ [HeadphoneTranslationScreen] WebSocket连接正常，无需重连');
    }

    try {
      setIsUploadingAudio(true);
      console.log('📤 [HeadphoneTranslationScreen] 开始发送音频文件...');
      console.log('📁 [HeadphoneTranslationScreen] 音频文件路径:', selectedAudioFile.uri);
      
      // 读取文件 - 参考Node.js代码的方式
      const RNFS = require('react-native-fs');
      console.log('📁 [HeadphoneTranslationScreen] 开始读取文件:', selectedAudioFile.uri);
      
      const audioData = await RNFS.readFile(selectedAudioFile.uri, 'base64');
      console.log('📁 [HeadphoneTranslationScreen] 文件读取完成，base64长度:', audioData.length);
      
      const audioBuffer = Buffer.from(audioData, 'base64');
      console.log('📁 [HeadphoneTranslationScreen] Buffer转换完成，大小:', audioBuffer.length, '字节');
      console.log('📁 [HeadphoneTranslationScreen] audioBuffer详情:', {
        type: typeof audioBuffer,
        constructor: audioBuffer.constructor.name,
        length: audioBuffer.length,
        byteLength: audioBuffer.byteLength,
        isBuffer: Buffer.isBuffer(audioBuffer),
        hasData: audioBuffer.length > 0,
        firstBytes: audioBuffer.length > 0 ? Array.from(audioBuffer.slice(0, 4)) : []
      });

      // 分块发送 - 参考Node.js代码的递归方式
      const CHUNK_SIZE = 4096;
      const numChunks = Math.ceil(audioBuffer.length / CHUNK_SIZE);
      console.log(`📤 [HeadphoneTranslationScreen] 文件大小: ${audioBuffer.length} bytes, 将分 ${numChunks} 块发送`);
      
      let currentChunk = 0;
      
      /**
       * 发送音频 chunk，chunk 必须为 Buffer 类型，内容和本地文件一致，不能 base64/字符串/JSON
       */
      const sendNextChunk = () => {
        if (currentChunk < numChunks) {
          const start = currentChunk * CHUNK_SIZE;
          const end = Math.min(start + CHUNK_SIZE, audioBuffer.length);
          const chunk = audioBuffer.slice(start, end); // chunk 是 Buffer 类型
          
          console.log(`📤 [HeadphoneTranslationScreen] 发送第 ${currentChunk + 1}/${numChunks} 块，大小: ${chunk.length} bytes`);
          console.log('📤 [HeadphoneTranslationScreen] chunk详情:', {
            type: typeof chunk,
            constructor: chunk.constructor.name,
            length: chunk.length,
            byteLength: chunk.byteLength,
            isBuffer: Buffer.isBuffer(chunk),
            isArrayBuffer: chunk instanceof ArrayBuffer,
            hasData: chunk.length > 0,
            firstBytes: chunk.length > 0 ? Array.from(chunk.slice(0, 4)) : []
          });
          
          // 发送二进制数据，chunk 必须为 Buffer 类型
          realTimeTranslationService.sendAudioData(chunk);
          
          currentChunk++;
          
          // 安排下一块，避免服务器过载
          setTimeout(sendNextChunk, 100);
        } else {
          console.log('✅ [HeadphoneTranslationScreen] 所有音频数据已发送');
          
          // 发送结束信号
          const finishMessage = JSON.stringify({ finish: true });
          console.log('🏁 [HeadphoneTranslationScreen] 发送结束消息:', finishMessage);
          realTimeTranslationService.sendFinish();
          
          // 延迟显示成功消息，确保所有数据都被处理
          setTimeout(() => {
            console.log('✅ [HeadphoneTranslationScreen] 音频文件发送完成');
            Alert.alert('发送成功', '音频文件已发送，正在处理翻译...');
            setIsUploadingAudio(false);
          }, 2000);
        }
      };
      
      // 开始发送块
      sendNextChunk();
      
    } catch (error: any) {
      console.error('❌ [HeadphoneTranslationScreen] 发送音频文件失败:', error);
      console.error('❌ [HeadphoneTranslationScreen] 发送错误详情:', {
        message: error.message,
        code: error.code,
        stack: error.stack
      });
      
      try {
        Alert.alert('发送失败', error.message || '音频文件发送失败');
      } catch (alertError) {
        console.error('❌ [HeadphoneTranslationScreen] 发送失败Alert显示失败:', alertError);
      }
      setIsUploadingAudio(false);
    }
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 重新选择音频文件
  const handleReuploadAudio = async () => {
    try {
      const selectedFile = await selectAudioFile();
      
      if (!selectedFile) {
        return;
      }

      console.log('📁 [HeadphoneTranslationScreen] 重新选择音频文件:', selectedFile);
      setSelectedAudioFile(selectedFile);
      
      // 显示成功消息
      Alert.alert('重新上传成功', `已选择文件：${selectedFile.name}\n大小：${formatFileSize(selectedFile.size)}`);
    } catch (error: any) {
      console.error('❌ [HeadphoneTranslationScreen] 重新选择音频文件失败:', error);
      Alert.alert('选择失败', error.message || '重新选择音频文件失败');
    }
  };

  // 处理退出页面
  /*
  const handleBack = () => {
    console.log('🔙 [HeadphoneTranslationScreen] 用户请求退出页面');
    
    // 先重置状态，避免回调函数触发错误提示
    // setIsWebSocketConnected(false);
    // setIsInitializing(false);
    setIsRecording(false);
    
    // 停止录音（如果正在录音）
    if (audioRecordingService.isRecordingAudio()) {
      console.log('🛑 [HeadphoneTranslationScreen] 停止正在进行的录音');
      audioRecordingService.stopRecording();
    }
    
    // 询问用户是否要关闭WebSocket连接
    Alert.alert(
      '退出确认',
      '是否要关闭实时翻译连接？\n\n选择"保持连接"可以在下次使用时快速恢复。',
      [
        {
          text: '保持连接',
          style: 'default',
          onPress: () => {
            console.log('🔗 [HeadphoneTranslationScreen] 用户选择保持WebSocket连接');
            // 调用父组件的返回函数，但不关闭WebSocket
            if (onBack) {
              onBack();
            }
          }
        },
        {
          text: '关闭连接',
          style: 'destructive',
          onPress: () => {
            console.log('🔌 [HeadphoneTranslationScreen] 用户选择关闭WebSocket连接');
            // 关闭WebSocket连接
            // realTimeTranslationService.close(); // WebSocket关闭相关代码注释掉
            // 调用父组件的返回函数
            if (onBack) {
              onBack();
            }
          }
        },
        {
          text: '取消',
          style: 'cancel'
        }
      ]
    );
  };
  */

  // 调试功能：测试token和连接
  /*
  const handleDebugConnection = async () => {
    try {
      console.log('🔍 === 开始调试连接 ===');
      
      // 1. 检查WebSocket连接状态
      // const connectionInfo = realTimeTranslationService.getConnectionInfo(); // WebSocket连接状态注释掉
      // console.log('🔍 WebSocket连接信息:', connectionInfo);
      
      // 2. 检查token
      const tokenStorage = require('../../utils/tokenStorage').default;
      const actionToken = await tokenStorage.getActionToken();
      console.log('🔍 Action Token:', actionToken ? 'EXISTS' : 'NULL');
      
      if (actionToken) {
        console.log('🔍 Token长度:', actionToken.length);
        console.log('🔍 Token前20字符:', actionToken.substring(0, 20) + '...');
      }
      
      // 3. 检查所有token状态
      await tokenStorage.debugAllTokens();
      
      // 4. 测试WebSocket URL
      const { CURRENT_API_CONFIG } = require('../../api/config');
      const baseUrl = CURRENT_API_CONFIG.BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://');
      const wsUrl = `${baseUrl}/ws/conversations/send_audio_message?token=${encodeURIComponent(`Bearer ${actionToken}`)}&conversation_id=test`;
      console.log('🔍 WebSocket URL:', wsUrl);
      
      // 5. 测试HTTP连接
      try {
        const response = await fetch(`${CURRENT_API_CONFIG.BASE_URL}/conversations/new`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${actionToken}`,
          },
          body: JSON.stringify({
            source_language: 'zh-CN',
            target_language: 'ja-JP',
            contact_name: 'test'
          })
        });
        console.log('🔍 HTTP连接测试:', response.status, response.statusText);
      } catch (httpError: unknown) {
        const httpErrorMessage = httpError instanceof Error ? httpError.message : String(httpError);
        console.error('🔍 HTTP连接失败:', httpErrorMessage);
      }
      
      // 6. 检查连接健康状态
      // const healthCheck = realTimeTranslationService.checkConnectionHealth(); // WebSocket健康检查注释掉
      
      // 7. 显示连接状态摘要
      const statusMessage = `
WebSocket连接: ${'存在'}.\n // WebSocket连接状态注释掉
连接状态: ${'已连接'}.\n // WebSocket连接状态注释掉
WebSocket状态: ${'OPEN'}.\n // WebSocket连接状态注释掉
会话ID: ${'无'}.\n // WebSocket连接状态注释掉
Token: ${actionToken ? '存在' : '不存在'}.
连接健康: ${'正常'}.
${'问题: ' + '无'}.
      `.trim();
      
      // 8. 如果连接不健康，提供重连选项
      if (false) { // WebSocket健康检查注释掉
        Alert.alert(
          '连接状态',
          statusMessage,
          [
            {
              text: '强制重连',
              style: 'default',
              onPress: async () => {
                try {
                  console.log('🔄 [HeadphoneTranslationScreen] 用户选择强制重连');
                  const realTimeConfig: RealTimeTranslationConfig = {
                    format: 'wav',
                    sample_rate: 16000,
                    source_language: languageMap[fromLanguage] || 'zh',
                    target_language: languageMap[toLanguage] || 'ja',
                  };
                  await realTimeTranslationService.forceReconnect(realTimeConfig);
                  Alert.alert('重连成功', 'WebSocket连接已重新建立');
                } catch (error) {
                  console.error('❌ [HeadphoneTranslationScreen] 强制重连失败:', error);
                  Alert.alert('重连失败', '无法重新建立连接，请检查网络');
                }
              }
            },
            {
              text: '确定',
              style: 'cancel'
            }
          ]
        );
      } else {
        Alert.alert('连接状态', statusMessage);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error('🔍 调试失败:', errorMessage);
      Alert.alert('调试失败', errorMessage);
    }
  };
  */

  // 渲染语言选择器
  const renderLanguageSelector = (
    isVisible: boolean,
    onClose: () => void,
    onSelect: (language: string) => void
  ) => {
    if (!isVisible) return null;

    return (
      <View style={styles.languageSelectorOverlay}>
        <View style={styles.languageSelectorContainer}>
          <Text style={styles.languageSelectorTitle}>选择语言</Text>
          {languages.map((language) => (
            <TouchableOpacity
              key={language}
              style={styles.languageOption}
              onPress={() => {
                onSelect(language);
                onClose();
              }}
            >
              <Text style={styles.languageOptionText}>{language}</Text>
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={styles.languageCancelButton} onPress={onClose}>
            <Text style={styles.languageCancelText}>取消</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  // 渲染对话气泡
  const renderConversationBubble = (message: ConversationMessage) => {
    const bubbleStyle = message.isUser ? styles.userBubbleContainer : styles.otherBubbleContainer;
    const bubbleContentStyle = message.isUser ? styles.userBubble : styles.otherBubble;
    
    return (
      <View key={message.id} style={bubbleStyle}>
        <View style={[bubbleContentStyle, { transform: [{ scale: zoomLevel }] }]}>
          <Text style={[styles.originalText, { fontSize: fontSize }]}>
            {message.originalText}
          </Text>
          <Text style={[styles.translatedText, { fontSize: fontSize - 2 }]}>
            {message.translatedText}
          </Text>
          <TouchableOpacity
            style={styles.playButton}
            onPress={() => handlePlayAudio(message.id, true)}
          >
            <Text style={styles.playIcon}>▶️</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* 顶部区域 */}
      <View style={styles.topSection}>
        {/* 设备状态 */}
        <View style={styles.deviceStatus}>
          <TouchableOpacity style={styles.backButton} onPress={onBack}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          
          <View style={styles.statusRight}>
            <View style={styles.batteryContainer}>
              <View style={styles.batteryIcon}>
                <View style={styles.batteryLevel} />
              </View>
              <Text style={styles.batteryText}>85%</Text>
            </View>
            <View style={styles.connectionStatus}>
              <View style={styles.connectionDot} />
              <Text style={styles.connectionText}>已连接</Text>
            </View>
          </View>
        </View>

        {/* 角色名称和模式显示 */}
        <View style={styles.modeSection}>
          {contactName && (
            <View style={styles.contactContainer}>
              <Text style={styles.contactName}>{contactName}</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={handleRemoveContact}
              >
                <Text style={styles.closeIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          )}
          <View style={styles.modeInfo}>
            <Text style={styles.modeText}>耳机模式</Text>
            {_isInitializing && (
              <Text style={styles.statusText}>正在初始化...</Text>
            )}
            {connectionStatus === 'connected' && !_isInitializing && (
              <Text style={styles.statusTextConnected}>已连接</Text>
            )}
            {connectionStatus === 'connecting' && !_isInitializing && (
              <Text style={styles.statusText}>连接中...</Text>
            )}
            {connectionStatus === 'disconnected' && !_isInitializing && (
              <Text style={styles.statusTextDisconnected}>未连接</Text>
            )}
            {connectionStatus === 'error' && !_isInitializing && (
              <Text style={styles.statusTextError}>连接错误</Text>
            )}
            {isRecording && (
              <Text style={styles.statusTextRecording}>录音中...</Text>
            )}
          </View>
        </View>
      </View>

      {/* 翻译内容区 */}
      <View style={styles.contentArea}>
        {/* 音频文件信息显示 */}
        {selectedAudioFile && (
          <View style={styles.audioFileInfo}>
            <View style={styles.audioFileHeader}>
              <Text style={styles.audioFileIcon}>📁</Text>
              <Text style={styles.audioFileName}>{selectedAudioFile.name}</Text>
              <TouchableOpacity 
                style={styles.removeFileButton}
                onPress={() => setSelectedAudioFile(null)}
              >
                <Text style={styles.removeFileIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.audioFileDetails}>
              {formatFileSize(selectedAudioFile.size)} • {selectedAudioFile.type.toUpperCase()}
            </Text>
            {isUploadingAudio && (
              <View style={styles.uploadingIndicator}>
                <Text style={styles.uploadingText}>正在发送...</Text>
              </View>
            )}
            <View style={styles.audioFileActions}>
              <TouchableOpacity 
                style={styles.reuploadButton}
                onPress={handleReuploadAudio}
              >
                <Text style={styles.reuploadButtonText}>重新选择</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        
        {conversations.length === 0 ? (
          // 空状态
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>按住语音按钮说话 松开发送</Text>
            <Text style={styles.emptyStateText}>译文将在耳机中播报</Text>
            <Text style={styles.emptyStateText}>您可以与对方各佩戴一侧耳机</Text>
            {!selectedAudioFile && (
              <Text style={styles.emptyStateText}>或点击📁按钮上传音频文件</Text>
            )}
          </View>
        ) : (
          // 对话状态
          <ScrollView style={styles.conversationArea} showsVerticalScrollIndicator={false}>
            {conversations.map(renderConversationBubble)}
          </ScrollView>
        )}
      </View>

      {/* 底部功能与操作区 */}
      <View style={styles.bottomSection}>
        {/* 上半部分：语言选择与辅助操作 */}
        <View style={styles.controlsSection}>
          {/* 第一行：缩放和语言选择 */}
          <View style={styles.controlsRow}>
            {/* 缩放按钮 */}
            <View style={styles.zoomControls}>
              <TouchableOpacity 
                style={styles.zoomButton}
                onPress={() => handleZoomChange(true)}
              >
                <Text style={styles.zoomIcon}>🔍+</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.zoomButton}
                onPress={() => handleZoomChange(false)}
              >
                <Text style={styles.zoomIcon}>🔍-</Text>
              </TouchableOpacity>
            </View>

            {/* 语言选择器 */}
            <View style={styles.languageControls}>
              <TouchableOpacity 
                style={styles.languageSelector}
                onPress={() => setShowFromLanguageSelector(true)}
              >
                <Text style={styles.languageSelectorText}>{fromLanguage}</Text>
                <Text style={styles.languageSelectorArrow}>▼</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.languageSwitch}
                onPress={handleLanguageSwitch}
              >
                <Text style={styles.languageSwitchIcon}>⇄</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.languageSelector}
                onPress={() => setShowToLanguageSelector(true)}
              >
                <Text style={styles.languageSelectorText}>{toLanguage}</Text>
                <Text style={styles.languageSelectorArrow}>▼</Text>
              </TouchableOpacity>
              
              {/* 调试按钮 */}
              <TouchableOpacity 
                style={[styles.languageSelector, { backgroundColor: '#fef3c7', borderColor: '#f59e0b' }]}
                // onPress={handleDebugConnection} // 调试按钮注释掉
              >
                <Text style={[styles.languageSelectorText, { color: '#92400e' }]}>🔧</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 第二行：辅助功能和输入按钮 */}
          <View style={styles.controlsRow}>
            {/* 原文播报开关 */}
            <TouchableOpacity 
              style={styles.playbackToggle}
              onPress={() => setIsOriginalPlaybackEnabled(!isOriginalPlaybackEnabled)}
            >
              <Text style={[
                styles.playbackIcon, 
                { opacity: isOriginalPlaybackEnabled ? 1 : 0.5 }
              ]}>
                🔊
              </Text>
              <Text style={styles.playbackText}>原文播报</Text>
            </TouchableOpacity>

            {/* 字体大小调整 */}
            <View style={styles.fontControls}>
              <TouchableOpacity 
                style={styles.fontButton}
                onPress={() => handleFontSizeChange(true)}
              >
                <Text style={styles.fontIcon}>A+</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.fontButton}
                onPress={() => handleFontSizeChange(false)}
              >
                <Text style={styles.fontIcon}>A-</Text>
              </TouchableOpacity>
            </View>

            {/* 输入按钮 */}
            <View style={styles.inputButtons}>
              <TouchableOpacity 
                style={styles.inputButton}
                onPress={handleKeyboardInput}
              >
                <Text style={styles.inputIcon}>⌨️</Text>
              </TouchableOpacity>
              
              {/* 音频文件上传按钮 */}
              <TouchableOpacity 
                style={[
                  styles.inputButton,
                  styles.audioFileButton,
                  selectedAudioFile && styles.audioFileButtonSelected,
                  isUploadingAudio && styles.audioFileButtonUploading
                ]}
                onPress={selectedAudioFile ? handleSendAudioFile : handleSelectAudioFile}
                disabled={isUploadingAudio}
              >
                <Text style={styles.inputIcon}>
                  {isUploadingAudio ? '⏳' : selectedAudioFile ? '📤' : '📁'}
                </Text>
              </TouchableOpacity>
              
              <Animated.View
                style={{
                  transform: [{ scale: recordButtonScale }],
                  opacity: recordButtonOpacity,
                }}
              >
                <TouchableOpacity 
                  style={[
                    styles.inputButton, 
                    styles.voiceButton,
                    isRecording && styles.voiceButtonRecording
                  ]}
                  onPressIn={handleVoiceRecordStart}
                  onPressOut={handleVoiceRecordEnd}
                >
                  <Text style={styles.inputIcon}>🎤</Text>
                </TouchableOpacity>
              </Animated.View>
            </View>
          </View>
        </View>

        {/* 下半部分：主导航栏 */}
        <View style={styles.bottomNavigation}>
          <TouchableOpacity 
            style={[
              styles.navTab, 
              activeTab === 'translation' && styles.navTabActive
            ]}
            onPress={() => handleTabPress('translation')}
          >
            <Text style={[
              styles.navTabIcon,
              activeTab === 'translation' && styles.navTabIconActive
            ]}>
              🔄
            </Text>
            <Text style={[
              styles.navTabText,
              activeTab === 'translation' && styles.navTabTextActive
            ]}>
              翻译
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.navTab,
              activeTab === 'contacts' && styles.navTabActive
            ]}
            onPress={() => handleTabPress('contacts')}
          >
            <Text style={[
              styles.navTabIcon,
              activeTab === 'contacts' && styles.navTabIconActive
            ]}>
              📞
            </Text>
            <Text style={[
              styles.navTabText,
              activeTab === 'contacts' && styles.navTabTextActive
            ]}>
              通讯录
            </Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[
              styles.navTab,
              activeTab === 'profile' && styles.navTabActive
            ]}
            onPress={() => handleTabPress('profile')}
          >
            <Text style={[
              styles.navTabIcon,
              activeTab === 'profile' && styles.navTabIconActive
            ]}>
              👤
            </Text>
            <Text style={[
              styles.navTabText,
              activeTab === 'profile' && styles.navTabTextActive
            ]}>
              我的
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 语言选择器弹窗 */}
      {renderLanguageSelector(
        showFromLanguageSelector,
        () => setShowFromLanguageSelector(false),
        setFromLanguage
      )}
      {renderLanguageSelector(
        showToLanguageSelector,
        () => setShowToLanguageSelector(false),
        setToLanguage
      )}

      <Modal
        visible={keyboardInputModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setKeyboardInputModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}
        >
          <View style={{ backgroundColor: '#fff', padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', marginBottom: 8 }}>输入文本</Text>
            <TextInput
              style={{ borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, padding: 12, fontSize: 16, marginBottom: 12 }}
              placeholder="请输入要翻译的内容"
              value={keyboardInputText}
              onChangeText={setKeyboardInputText}
              multiline
              autoFocus
            />
            <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
              <TouchableOpacity onPress={() => setKeyboardInputModalVisible(false)} style={{ padding: 10 }}>
                <Text style={{ color: '#64748b', fontSize: 16 }}>取消</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleSendKeyboardInput} style={{ backgroundColor: '#3b82f6', borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20 }}>
                <Text style={{ color: '#fff', fontSize: 16, fontWeight: 'bold' }}>发送</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  topSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  deviceStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
  },
  backIcon: {
    fontSize: 18,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  statusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  batteryContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryIcon: {
    width: 24,
    height: 12,
    borderWidth: 1,
    borderColor: '#10b981',
    borderRadius: 2,
    marginRight: 6,
    position: 'relative',
  },
  batteryLevel: {
    position: 'absolute',
    left: 1,
    top: 1,
    bottom: 1,
    width: '85%',
    backgroundColor: '#10b981',
    borderRadius: 1,
  },
  batteryText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  connectionText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  modeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  contactName: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    marginRight: 8,
  },
  closeButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  modeText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  modeInfo: {
    alignItems: 'flex-end',
  },
  statusText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
    marginTop: 2,
  },
  statusTextConnected: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
    marginTop: 2,
  },
  statusTextDisconnected: {
    fontSize: 12,
    color: '#ef4444',
    fontWeight: '500',
    marginTop: 2,
  },
  statusTextError: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '500',
    marginTop: 2,
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 8,
  },
  conversationArea: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  userBubbleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16,
  },
  otherBubbleContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 16,
  },
  userBubble: {
    backgroundColor: '#3b82f6',
    borderRadius: 16,
    borderBottomRightRadius: 4,
    padding: 12,
    maxWidth: '75%',
    position: 'relative',
  },
  otherBubble: {
    backgroundColor: '#f1f5f9',
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    padding: 12,
    maxWidth: '75%',
    position: 'relative',
  },
  originalText: {
    color: '#1e293b',
    fontWeight: '500',
    marginBottom: 4,
  },
  translatedText: {
    color: '#64748b',
    fontStyle: 'italic',
  },
  playButton: {
    position: 'absolute',
    right: 8,
    bottom: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 12,
  },
  bottomSection: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  controlsSection: {
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  zoomControls: {
    flexDirection: 'row',
    gap: 8,
  },
  zoomButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoomIcon: {
    fontSize: 16,
  },
  languageControls: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 16,
  },
  languageSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  languageSelectorText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  languageSelectorArrow: {
    fontSize: 10,
    color: '#64748b',
  },
  languageSwitch: {
    marginHorizontal: 8,
    padding: 4,
  },
  languageSwitchIcon: {
    fontSize: 16,
    color: '#3b82f6',
  },
  playbackToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  playbackIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  playbackText: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '500',
  },
  fontControls: {
    flexDirection: 'row',
    gap: 8,
  },
  fontButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fontIcon: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: 'bold',
  },
  inputButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  inputButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceButton: {
    backgroundColor: '#ef4444',
  },
  voiceButtonRecording: {
    backgroundColor: '#dc2626',
  },
  audioFileButton: {
    backgroundColor: '#8b5cf6',
  },
  audioFileButtonSelected: {
    backgroundColor: '#7c3aed',
  },
  audioFileButtonUploading: {
    backgroundColor: '#f59e0b',
  },
  inputIcon: {
    fontSize: 18,
  },
  bottomNavigation: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingBottom: 20,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navTabActive: {
    // 激活状态样式在单独的样式中定义
  },
  navTabIcon: {
    fontSize: 20,
    marginBottom: 4,
    color: '#64748b',
  },
  navTabIconActive: {
    color: '#3b82f6',
  },
  navTabText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  navTabTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  languageSelectorOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  languageSelectorContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 20,
    marginHorizontal: 40,
    maxHeight: 400,
  },
  languageSelectorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 16,
  },
  languageOption: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#1e293b',
    textAlign: 'center',
  },
  languageCancelButton: {
    marginTop: 16,
    paddingVertical: 12,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
  },
  languageCancelText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    fontWeight: '500',
  },
  statusTextRecording: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
  },
  audioFileInfo: {
    backgroundColor: '#f8fafc',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  audioFileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  audioFileIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  audioFileName: {
    flex: 1,
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  removeFileButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#ef4444',
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeFileIcon: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  audioFileDetails: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 24,
  },
  uploadingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginLeft: 24,
  },
  uploadingText: {
    fontSize: 12,
    color: '#f59e0b',
    fontWeight: '500',
  },
  audioFileActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    marginLeft: 24,
  },
  reuploadButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  reuploadButtonText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default HeadphoneTranslationScreen; 