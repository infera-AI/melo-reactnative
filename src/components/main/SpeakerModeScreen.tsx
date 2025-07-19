/**
 * 外放模式
 * T1.1.4：在外放模式下，通过手机扬声器播报所有译文，方便多方交流
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Animated,
  Modal,
  ScrollView,
  TextInput,
  PanResponder,
} from 'react-native';

interface SpeakerModeScreenProps {
  onBack?: () => void;
  onTabSwitch?: (tab: string) => void;
  contactName?: string; // 可选的联系人名称
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  type: 'user' | 'other';
  original: string;
  translated: string;
  timestamp: number;
}

const SpeakerModeScreen: React.FC<SpeakerModeScreenProps> = ({
  onBack,
  onTabSwitch,
  contactName,
}) => {
  const [activeTab, setActiveTab] = useState('translation');
  const [fromLanguage, setFromLanguage] = useState('中文');
  const [toLanguage, setToLanguage] = useState('日语');
  const [showFromLanguageSelector, setShowFromLanguageSelector] = useState(false);
  const [showToLanguageSelector, setShowToLanguageSelector] = useState(false);
  const [originalPlaybackEnabled, setOriginalPlaybackEnabled] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showKeyboard, setShowKeyboard] = useState(false);
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);

  // 动画相关
  const recordingAnimation = useRef(new Animated.Value(1)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  // 支持的语言列表
  const languages = [
    '中文', '英语', '日语', '韩语', 
    '法语', '德语', '西班牙语', '俄语'
  ];

  // 模拟对话数据（对话中状态）
  const sampleMessages: ChatMessage[] = [
    {
      id: '1',
      type: 'other',
      original: '你好，还有座位吗？',
      translated: 'こんにちは、まだ座席はありますか？',
      timestamp: Date.now() - 120000,
    },
    {
      id: '2',
      type: 'user',
      original: '有的，您是两位吗？',
      translated: 'はい、あなたは二人ですか？',
      timestamp: Date.now() - 60000,
    },
  ];

  // 录音动画
  useEffect(() => {
    if (isRecording) {
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(recordingAnimation, {
            toValue: 1.3,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(recordingAnimation, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      return () => {
        pulseLoop.stop();
      };
    } else {
      recordingAnimation.setValue(1);
    }
  }, [isRecording]);

  // 对话状态淡入动画
  useEffect(() => {
    if (messages.length > 0) {
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    } else {
      fadeAnimation.setValue(0);
    }
  }, [messages]);

  // 语音按钮手势处理
  const voicePanResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => false,
    onPanResponderGrant: () => {
      console.log('开始录音...');
      setIsRecording(true);
    },
    onPanResponderRelease: () => {
      console.log('结束录音，发送翻译');
      setIsRecording(false);
      handleSendVoiceMessage();
    },
    onPanResponderTerminate: () => {
      console.log('录音被中断');
      setIsRecording(false);
    },
  });

  // 处理发送语音消息
  const handleSendVoiceMessage = () => {
    if (messages.length === 0) {
      // 首次发送，加载示例对话
      setMessages(sampleMessages);
    } else {
      // 添加新消息
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        original: '这是新的语音消息',
        translated: 'これは新しい音声メッセージです',
        timestamp: Date.now(),
      };
      setMessages([...messages, newMessage]);
    }
  };

  // 处理发送文本消息
  const handleSendTextMessage = () => {
    if (!inputText.trim()) return;

    if (messages.length === 0) {
      // 首次发送，加载示例对话
      setMessages(sampleMessages);
    } else {
      // 添加新消息
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        type: 'user',
        original: inputText,
        translated: inputText === '你好' ? 'こんにちは' : 'これは翻訳されたテキストです',
        timestamp: Date.now(),
      };
      setMessages([...messages, newMessage]);
    }
    
    setInputText('');
    setShowKeyboard(false);
  };

  // 处理Tab切换
  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    if (onTabSwitch) {
      onTabSwitch(tab);
    }
  };

  // 处理语言选择
  const handleLanguageSelect = (language: string, isFromLanguage: boolean) => {
    if (isFromLanguage) {
      setFromLanguage(language);
      setShowFromLanguageSelector(false);
    } else {
      setToLanguage(language);
      setShowToLanguageSelector(false);
    }
  };

  // 处理语言切换
  const handleLanguageSwitch = () => {
    const tempLang = fromLanguage;
    setFromLanguage(toLanguage);
    setToLanguage(tempLang);
  };

  // 调整字体大小
  const adjustFontSize = (increase: boolean) => {
    setFontSize(prev => {
      const newSize = increase ? prev + 2 : prev - 2;
      return Math.max(12, Math.min(24, newSize));
    });
  };

  // 调整缩放级别
  const adjustZoom = (increase: boolean) => {
    setZoomLevel(prev => {
      const newZoom = increase ? prev + 0.1 : prev - 0.1;
      return Math.max(0.8, Math.min(1.5, newZoom));
    });
  };

  // 播放消息语音
  const playMessageAudio = (messageId: string, isOriginal: boolean) => {
    console.log(`播放消息${messageId}的${isOriginal ? '原文' : '译文'}语音`);
    // 这里实现音频播放逻辑
  };

  // 关闭联系人对话
  const handleCloseContact = () => {
    setMessages([]);
    console.log('退出联系人对话，回到空状态');
  };

  // 渲染语言选择器弹窗
  const renderLanguageSelector = (
    isVisible: boolean,
    onClose: () => void,
    onSelect: (language: string) => void,
    isFromLanguage: boolean
  ) => (
    <Modal
      visible={isVisible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity 
            style={styles.modalBackdropTouchable}
            onPress={onClose}
            activeOpacity={1}
          />
        </View>
        
        <View style={styles.languagePanel}>
          <View style={styles.languagePanelHeader}>
            <Text style={styles.languagePanelTitle}>
              选择{isFromLanguage ? '源' : '目标'}语言
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.languagePanelClose}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.languageList}>
            {languages.map((language) => (
              <TouchableOpacity
                key={language}
                style={[
                  styles.languageOption,
                  (isFromLanguage ? fromLanguage : toLanguage) === language && 
                  styles.languageOptionSelected
                ]}
                onPress={() => onSelect(language)}
              >
                <Text style={[
                  styles.languageOptionText,
                  (isFromLanguage ? fromLanguage : toLanguage) === language && 
                  styles.languageOptionTextSelected
                ]}>
                  {language}
                </Text>
                {(isFromLanguage ? fromLanguage : toLanguage) === language && (
                  <Text style={styles.languageOptionCheck}>✓</Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // 渲染键盘输入弹窗
  const renderKeyboardInput = () => (
    <Modal
      visible={showKeyboard}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowKeyboard(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity 
            style={styles.modalBackdropTouchable}
            onPress={() => setShowKeyboard(false)}
            activeOpacity={1}
          />
        </View>
        
        <View style={styles.keyboardPanel}>
          <View style={styles.keyboardPanelHeader}>
            <Text style={styles.keyboardPanelTitle}>文本输入</Text>
            <TouchableOpacity onPress={() => setShowKeyboard(false)}>
              <Text style={styles.keyboardPanelClose}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.keyboardInputContainer}>
            <TextInput
              style={styles.keyboardInput}
              placeholder="请输入要翻译的文本..."
              placeholderTextColor="#94a3b8"
              multiline
              value={inputText}
              onChangeText={setInputText}
              autoFocus
            />
            <TouchableOpacity 
              style={[
                styles.sendButton,
                !inputText.trim() && styles.sendButtonDisabled
              ]}
              onPress={handleSendTextMessage}
              disabled={!inputText.trim()}
            >
              <Text style={styles.sendButtonText}>发送</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // 渲染对话气泡
  const renderChatBubble = (message: ChatMessage) => (
    <View key={message.id} style={styles.messageContainer}>
      <View style={[
        styles.messageBubble,
        message.type === 'user' ? styles.userBubble : styles.otherBubble
      ]}>
        <View style={styles.messageContent}>
          <Text style={[styles.originalText, { fontSize }]}>
            {message.original}
          </Text>
          <Text style={[styles.translatedText, { fontSize }]}>
            {message.translated}
          </Text>
        </View>
        <TouchableOpacity 
          style={styles.playButton}
          onPress={() => playMessageAudio(message.id, true)}
        >
          <Text style={styles.playButtonIcon}>▶️</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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

        {/* 角色名称（可选）和模式显示 */}
        <View style={styles.titleSection}>
          {contactName ? (
            <View style={styles.contactContainer}>
              <Text style={styles.contactName}>{contactName}</Text>
              <TouchableOpacity 
                style={styles.closeContactButton}
                onPress={handleCloseContact}
              >
                <Text style={styles.closeContactIcon}>✕</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.modeDisplay}>
              <Text style={styles.modeText}>外放模式</Text>
            </View>
          )}
          
          {contactName && (
            <View style={styles.modeDisplay}>
              <Text style={styles.modeText}>外放模式</Text>
            </View>
          )}
        </View>
      </View>

      {/* 翻译内容区 */}
      <View style={styles.contentArea}>
        {messages.length === 0 ? (
          // 空状态
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>📢</Text>
            <Text style={styles.emptyStateTitle}>按住语音按钮说话</Text>
            <Text style={styles.emptyStateSubtitle}>松开发送</Text>
          </View>
        ) : (
          // 对话中状态
          <Animated.View 
            style={[
              styles.chatContent,
              { 
                opacity: fadeAnimation,
                transform: [{ scale: zoomLevel }]
              }
            ]}
          >
            <ScrollView 
              style={styles.chatScroll} 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.chatScrollContent}
            >
              {messages.map(renderChatBubble)}
            </ScrollView>
          </Animated.View>
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
                onPress={() => adjustZoom(true)}
              >
                <Text style={styles.zoomButtonText}>🔍+</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.zoomButton}
                onPress={() => adjustZoom(false)}
              >
                <Text style={styles.zoomButtonText}>🔍-</Text>
              </TouchableOpacity>
            </View>

            {/* 语言选择器 */}
            <View style={styles.languageSelectors}>
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
            </View>
          </View>

          {/* 第二行：原文播报、字体调整、输入按钮 */}
          <View style={styles.controlsRow}>
            {/* 原文播报开关 */}
            <TouchableOpacity 
              style={styles.playbackContainer}
              onPress={() => setOriginalPlaybackEnabled(!originalPlaybackEnabled)}
            >
              <Text style={[
                styles.playbackIcon,
                originalPlaybackEnabled ? styles.playbackIconActive : styles.playbackIconInactive
              ]}>
                🔊
              </Text>
              <Text style={styles.playbackText}>原文播报</Text>
            </TouchableOpacity>

            {/* 字体大小调整 */}
            <View style={styles.fontControls}>
              <TouchableOpacity 
                style={styles.fontButton}
                onPress={() => adjustFontSize(true)}
              >
                <Text style={styles.fontButtonText}>A+</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.fontButton}
                onPress={() => adjustFontSize(false)}
              >
                <Text style={styles.fontButtonText}>A-</Text>
              </TouchableOpacity>
            </View>

            {/* 输入按钮组 */}
            <View style={styles.inputButtons}>
              {/* 键盘输入按钮 */}
              <TouchableOpacity 
                style={styles.inputButton}
                onPress={() => setShowKeyboard(true)}
              >
                <Text style={styles.inputButtonIcon}>⌨️</Text>
              </TouchableOpacity>

              {/* 语音输入按钮 */}
              <Animated.View 
                style={[
                  styles.voiceButtonContainer,
                  { transform: [{ scale: recordingAnimation }] }
                ]}
                {...voicePanResponder.panHandlers}
              >
                <TouchableOpacity 
                  style={[
                    styles.voiceButton,
                    isRecording && styles.voiceButtonActive
                  ]}
                  activeOpacity={0.8}
                >
                  <Text style={styles.voiceButtonIcon}>🎤</Text>
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
        (language) => handleLanguageSelect(language, true),
        true
      )}
      {renderLanguageSelector(
        showToLanguageSelector,
        () => setShowToLanguageSelector(false),
        (language) => handleLanguageSelect(language, false),
        false
      )}

      {/* 键盘输入弹窗 */}
      {renderKeyboardInput()}
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
  titleSection: {
    alignItems: 'center',
  },
  contactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactName: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
    marginRight: 12,
  },
  closeContactButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  closeContactIcon: {
    fontSize: 14,
    color: '#64748b',
  },
  modeDisplay: {
    alignItems: 'center',
  },
  modeText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    margin: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
  },
  chatContent: {
    flex: 1,
    width: '100%',
  },
  chatScroll: {
    flex: 1,
  },
  chatScrollContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  messageBubble: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    maxWidth: '85%',
    backgroundColor: '#f8fafc',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
  },
  otherBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  messageContent: {
    flex: 1,
  },
  originalText: {
    color: '#1e293b',
    lineHeight: 20,
    fontWeight: '500',
    marginBottom: 4,
  },
  translatedText: {
    color: '#64748b',
    lineHeight: 20,
    fontWeight: '400',
  },
  playButton: {
    marginLeft: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  playButtonIcon: {
    fontSize: 14,
  },
  bottomSection: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  controlsSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
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
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  zoomButtonText: {
    fontSize: 14,
  },
  languageSelectors: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 80,
    justifyContent: 'center',
  },
  languageSelectorText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    marginRight: 4,
  },
  languageSelectorArrow: {
    fontSize: 12,
    color: '#64748b',
  },
  languageSwitch: {
    marginHorizontal: 12,
    padding: 8,
  },
  languageSwitchIcon: {
    fontSize: 16,
    color: '#3b82f6',
  },
  playbackContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playbackIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  playbackIconActive: {
    color: '#3b82f6',
  },
  playbackIconInactive: {
    color: '#94a3b8',
  },
  playbackText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  fontControls: {
    flexDirection: 'row',
    gap: 8,
  },
  fontButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  fontButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '600',
  },
  inputButtons: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  inputButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  inputButtonIcon: {
    fontSize: 20,
  },
  voiceButtonContainer: {
    // 包装容器用于动画
  },
  voiceButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  voiceButtonActive: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  voiceButtonIcon: {
    fontSize: 24,
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
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdropTouchable: {
    flex: 1,
  },
  languagePanel: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  languagePanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  languagePanelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  languagePanelClose: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: 'bold',
  },
  languageList: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginVertical: 4,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  languageOptionSelected: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  languageOptionText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
  languageOptionTextSelected: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  languageOptionCheck: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  keyboardPanel: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  keyboardPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  keyboardPanelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  keyboardPanelClose: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: 'bold',
  },
  keyboardInputContainer: {
    padding: 20,
  },
  keyboardInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    minHeight: 120,
    textAlignVertical: 'top',
    backgroundColor: '#f8fafc',
    marginBottom: 16,
  },
  sendButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: '#94a3b8',
  },
  sendButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default SpeakerModeScreen; 