/**
 * 实时翻译主界面 - 线上语音/视频翻译模式
 * T1.1.2：在线上语音/视频通话中提供实时翻译，通过内嵌第三方页面实现
 */
import React, { useState, useRef } from 'react';
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
} from 'react-native';

interface OnlineCallTranslationScreenProps {
  onBack?: () => void;
  onTabSwitch?: (tab: string) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const OnlineCallTranslationScreen: React.FC<OnlineCallTranslationScreenProps> = ({
  onBack,
  onTabSwitch,
}) => {
  const [activeTab, setActiveTab] = useState('translation');
  const [currentMode, setCurrentMode] = useState('单向聆听');
  const [showModePanel, setShowModePanel] = useState(false);

  // 动画相关
  const panelTranslateY = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // 交互模式选项
  const interactionModes = [
    {
      id: 'listen_only',
      title: '单向聆听',
      description: '只接收对方的语音并翻译',
      icon: '👂',
    },
    {
      id: 'bidirectional',
      title: '双向对话',
      description: '支持双方语音翻译交流',
      icon: '💬',
    },
    {
      id: 'voice_over',
      title: '语音覆盖',
      description: '译文覆盖在原声之上',
      icon: '🔊',
    },
    {
      id: 'subtitle_mode',
      title: '字幕模式',
      description: '以字幕形式显示翻译',
      icon: '📝',
    },
  ];

  // 处理Tab切换
  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    if (onTabSwitch) {
      onTabSwitch(tab);
    }
  };

  // 显示模式选择面板
  const showModeSelectionPanel = () => {
    setShowModePanel(true);
    
    // 动画显示面板
    Animated.parallel([
      Animated.timing(panelTranslateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0.5,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // 隐藏模式选择面板
  const hideModeSelectionPanel = () => {
    Animated.parallel([
      Animated.timing(panelTranslateY, {
        toValue: SCREEN_HEIGHT,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowModePanel(false);
    });
  };

  // 处理模式选择
  const handleModeSelect = (mode: typeof interactionModes[0]) => {
    setCurrentMode(mode.title);
    hideModeSelectionPanel();
    console.log(`切换到${mode.title}模式`);
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

        {/* 模式切换器 */}
        <View style={styles.modeSwitcher}>
          <Text style={styles.currentModeText}>{currentMode}</Text>
          <TouchableOpacity 
            style={styles.switchButton}
            onPress={showModeSelectionPanel}
          >
            <Text style={styles.switchIcon}>⚙️</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 翻译内容区 */}
      <View style={styles.contentArea}>
        <View style={styles.thirdPartyContainer}>
          <View style={styles.thirdPartyPlaceholder}>
            <Text style={styles.thirdPartyIcon}>📱</Text>
            <Text style={styles.thirdPartyTitle}>第三方页面内嵌</Text>
            <Text style={styles.thirdPartyDescription}>
              此处将内嵌第三方应用的界面
            </Text>
            <Text style={styles.thirdPartyNote}>
              支持微信、钉钉、Zoom等主流通话应用
            </Text>
          </View>
        </View>
      </View>

      {/* 底部主导航栏 */}
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

      {/* 交互模式选择面板 */}
      <Modal
        visible={showModePanel}
        transparent={true}
        animationType="none"
        onRequestClose={hideModeSelectionPanel}
      >
        <View style={styles.modalContainer}>
          {/* 背景遮罩 */}
          <Animated.View 
            style={[
              styles.backdrop,
              { opacity: backdropOpacity }
            ]}
          >
            <TouchableOpacity 
              style={styles.backdropTouchable}
              onPress={hideModeSelectionPanel}
              activeOpacity={1}
            />
          </Animated.View>

          {/* 模式选择面板 */}
          <Animated.View
            style={[
              styles.modePanel,
              {
                transform: [{ translateY: panelTranslateY }]
              }
            ]}
          >
            {/* 面板标题 */}
            <View style={styles.panelHeader}>
              <View style={styles.panelHandle} />
              <Text style={styles.panelTitle}>交互模式选择</Text>
            </View>

            {/* 模式选项列表 */}
            <View style={styles.modeList}>
              {interactionModes.map((mode) => (
                <TouchableOpacity
                  key={mode.id}
                  style={[
                    styles.modeOption,
                    currentMode === mode.title && styles.modeOptionActive
                  ]}
                  onPress={() => handleModeSelect(mode)}
                >
                  <View style={styles.modeOptionLeft}>
                    <Text style={styles.modeOptionIcon}>{mode.icon}</Text>
                    <View style={styles.modeOptionTextContainer}>
                      <Text style={[
                        styles.modeOptionTitle,
                        currentMode === mode.title && styles.modeOptionTitleActive
                      ]}>
                        {mode.title}
                      </Text>
                      <Text style={styles.modeOptionDescription}>
                        {mode.description}
                      </Text>
                    </View>
                  </View>
                  {currentMode === mode.title && (
                    <Text style={styles.modeOptionCheck}>✓</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* 取消按钮 */}
            <TouchableOpacity 
              style={styles.cancelButton}
              onPress={hideModeSelectionPanel}
            >
              <Text style={styles.cancelButtonText}>取消</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
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
  modeSwitcher: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  currentModeText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  switchButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  switchIcon: {
    fontSize: 20,
  },
  contentArea: {
    flex: 1,
    backgroundColor: '#ffffff',
    margin: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  thirdPartyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  thirdPartyPlaceholder: {
    alignItems: 'center',
  },
  thirdPartyIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  thirdPartyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    textAlign: 'center',
  },
  thirdPartyDescription: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  thirdPartyNote: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 20,
    fontStyle: 'italic',
  },
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
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
  backdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000000',
  },
  backdropTouchable: {
    flex: 1,
  },
  modePanel: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 40,
    maxHeight: SCREEN_HEIGHT * 0.7,
  },
  panelHeader: {
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    marginBottom: 20,
  },
  panelHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    marginBottom: 12,
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  modeList: {
    gap: 12,
  },
  modeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  modeOptionActive: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  modeOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  modeOptionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  modeOptionTextContainer: {
    flex: 1,
  },
  modeOptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  modeOptionTitleActive: {
    color: '#3b82f6',
  },
  modeOptionDescription: {
    fontSize: 14,
    color: '#64748b',
    lineHeight: 20,
  },
  modeOptionCheck: {
    fontSize: 18,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  cancelButton: {
    marginTop: 20,
    backgroundColor: '#f1f5f9',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: '600',
  },
});

export default OnlineCallTranslationScreen; 