/**
 * 聆听模式
 * T1.1.3：提供单向聆听和实时转译功能，用户可在此模式下专注于听取和理解对方的发言
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
} from 'react-native';

interface ListenModeScreenProps {
  onBack?: () => void;
  onTabSwitch?: (tab: string) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const ListenModeScreen: React.FC<ListenModeScreenProps> = ({
  onBack,
  onTabSwitch,
}) => {
  const [activeTab, setActiveTab] = useState('translation');
  const [isListening, setIsListening] = useState(false);
  const [fromLanguage, setFromLanguage] = useState('中文');
  const [toLanguage, setToLanguage] = useState('日语');
  const [showFromLanguageSelector, setShowFromLanguageSelector] = useState(false);
  const [showToLanguageSelector, setShowToLanguageSelector] = useState(false);
  const [voiceBroadcastEnabled, setVoiceBroadcastEnabled] = useState(true);
  const [fontSize, setFontSize] = useState(16);
  const [zoomLevel, setZoomLevel] = useState(1);

  // 动画相关
  const pulseAnimation = useRef(new Animated.Value(1)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  // 支持的语言列表
  const languages = [
    '中文', '英语', '日语', '韩语', 
    '法语', '德语', '西班牙语', '俄语'
  ];

  // 模拟翻译内容（聆听中状态）
  const translationContent = {
    original: "And 17 years later I did go to college. But I naively chose a college that was almost as expensive as Stanford...",
    translated: "在十七岁那年，我真的上了大学。但是我愚蠢的选择了..."
  };

  // 语音按钮脉冲动画
  useEffect(() => {
    if (isListening) {
      // 开始脉冲动画
      const pulseLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.2,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseLoop.start();

      // 翻译内容淡入动画
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      return () => {
        pulseLoop.stop();
      };
    } else {
      // 停止动画并重置
      pulseAnimation.setValue(1);
      Animated.timing(fadeAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isListening]);

  // 处理语音按钮点击
  const handleVoiceButtonPress = () => {
    setIsListening(!isListening);
    if (!isListening) {
      console.log('开始聆听...');
      // 模拟聆听状态切换语言
      setFromLanguage('英语');
      setToLanguage('中文');
    } else {
      console.log('暂停聆听');
    }
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

        {/* 模式显示 */}
        <View style={styles.modeDisplay}>
          <Text style={styles.modeText}>聆听模式</Text>
        </View>
      </View>

      {/* 翻译内容区 */}
      <View style={styles.contentArea}>
        {!isListening ? (
          // 空状态
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateIcon}>👂</Text>
            <Text style={styles.emptyStateTitle}>单击语音按钮开始聆听</Text>
            <Text style={styles.emptyStateSubtitle}>再次单击暂停</Text>
          </View>
        ) : (
          // 聆听中状态
          <Animated.View 
            style={[
              styles.translationContent,
              { 
                opacity: fadeAnimation,
                transform: [{ scale: zoomLevel }]
              }
            ]}
          >
            <ScrollView style={styles.translationScroll} showsVerticalScrollIndicator={false}>
              {/* 原文 */}
              <View style={styles.originalTextContainer}>
                <Text style={styles.textLabel}>原文</Text>
                <Text style={[styles.originalText, { fontSize: fontSize }]}>
                  {translationContent.original}
                </Text>
              </View>
              
              {/* 译文 */}
              <View style={styles.translatedTextContainer}>
                <Text style={styles.textLabel}>译文</Text>
                <Text style={[styles.translatedText, { fontSize: fontSize }]}>
                  {translationContent.translated}
                </Text>
              </View>
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

          {/* 第二行：同声播报、字体调整、语音按钮 */}
          <View style={styles.controlsRow}>
            {/* 同声播报开关 */}
            <TouchableOpacity 
              style={styles.voiceBroadcastContainer}
              onPress={() => setVoiceBroadcastEnabled(!voiceBroadcastEnabled)}
            >
              <Text style={[
                styles.voiceBroadcastIcon,
                voiceBroadcastEnabled ? styles.voiceBroadcastIconActive : styles.voiceBroadcastIconInactive
              ]}>
                🔊
              </Text>
              <Text style={styles.voiceBroadcastText}>同声播报</Text>
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

            {/* 圆形语音按钮 */}
            <Animated.View style={{ transform: [{ scale: pulseAnimation }] }}>
              <TouchableOpacity 
                style={[
                  styles.voiceButton,
                  isListening && styles.voiceButtonActive
                ]}
                onPress={handleVoiceButtonPress}
              >
                <Text style={styles.voiceButtonIcon}>🎤</Text>
                <Text style={styles.voiceButtonText}>
                  {isListening ? '聆听中' : '单击聆听'}
                </Text>
              </TouchableOpacity>
            </Animated.View>
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
  translationContent: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  translationScroll: {
    flex: 1,
  },
  originalTextContainer: {
    marginBottom: 24,
  },
  translatedTextContainer: {
    marginBottom: 16,
  },
  textLabel: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 8,
  },
  originalText: {
    color: '#1e293b',
    lineHeight: 24,
    fontWeight: '400',
  },
  translatedText: {
    color: '#3b82f6',
    lineHeight: 24,
    fontWeight: '500',
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
  voiceBroadcastContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  voiceBroadcastIcon: {
    fontSize: 20,
    marginRight: 6,
  },
  voiceBroadcastIconActive: {
    color: '#3b82f6',
  },
  voiceBroadcastIconInactive: {
    color: '#94a3b8',
  },
  voiceBroadcastText: {
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
  voiceButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e2e8f0',
  },
  voiceButtonActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  voiceButtonIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  voiceButtonText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    textAlign: 'center',
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
});

export default ListenModeScreen; 