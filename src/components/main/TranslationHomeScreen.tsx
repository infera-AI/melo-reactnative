/**
 * 翻译主界面（新版枢纽页）
 * T1.1.0：作为Lingo应用的核心功能枢纽，提供快速进入各类翻译模式和翻译工具的入口
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
  TextInput,
  Dimensions,
  Alert,
} from 'react-native';

interface TranslationHomeScreenProps {
  onNavigateToMode?: (mode: string) => void;
  onNavigateToTool?: (tool: string) => void;
  onNavigateToAssistant?: () => void;
  onTabSwitch?: (tab: string) => void;
  onNavigateToMusic?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 60) / 2; // 2列布局，考虑间距

const TranslationHomeScreen: React.FC<TranslationHomeScreenProps> = ({
  onNavigateToMode,
  onNavigateToTool,
  onNavigateToAssistant,
  onTabSwitch,
  onNavigateToMusic,
}) => {
  const [activeTab, setActiveTab] = useState('translation');
  const [fromLanguage, setFromLanguage] = useState('中文');
  const [toLanguage, setToLanguage] = useState('英文');
  const [inputText, setInputText] = useState('');
  const [showFromLanguageSelector, setShowFromLanguageSelector] = useState(false);
  const [showToLanguageSelector, setShowToLanguageSelector] = useState(false);

  // 处理模式卡片点击
  const handleModePress = (mode: string) => {
    console.log(`进入${mode}模式`);
    if (onNavigateToMode) {
      onNavigateToMode(mode);
    } else {
      Alert.alert('功能提示', `即将进入${mode}模式`);
    }
  };

  // 处理翻译工具点击
  const handleToolPress = (tool: string) => {
    console.log(`打开${tool}工具`);
    if (onNavigateToTool) {
      onNavigateToTool(tool);
    } else {
      Alert.alert('功能提示', `即将打开${tool}功能`);
    }
  };

  // 处理助手功能点击
  const handleAssistantPress = () => {
    console.log('打开Lingo助手');
    if (onNavigateToAssistant) {
      onNavigateToAssistant();
    } else {
      Alert.alert('功能提示', '即将打开Lingo助手');
    }
  };

  // 处理Tab切换
  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'music' && onNavigateToMusic) {
      onNavigateToMusic();
    } else if (onTabSwitch) {
      onTabSwitch(tab);
    }
  };

  // 语言选择数据
  const languages = ['中文', '英文', '日语', '韩语', '法语', '德语', '西班牙语', '俄语'];

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

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* 顶部区域 */}
        <View style={styles.topSection}>
          {/* 设备状态 */}
          <View style={styles.deviceStatus}>
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

          {/* Lingo助手模块 */}
          <View style={styles.assistantModule}>
            <TouchableOpacity 
              style={styles.assistantLeft}
              onPress={handleAssistantPress}
              activeOpacity={0.7}
            >
              <View style={styles.assistantIconPlaceholder}>
                <Text style={styles.assistantIconText}>🤖</Text>
                <Text style={styles.assistantIconLabel}>Lingo助手</Text>
              </View>
              <View style={styles.assistantTags}>
                <View style={styles.assistantTag}>
                  <Text style={styles.assistantTagText}>支持多语种AI对话</Text>
                </View>
                <View style={styles.assistantTag}>
                  <Text style={styles.assistantTagText}>口语练习</Text>
                </View>
                <View style={styles.assistantTag}>
                  <Text style={styles.assistantTagText}>知识问答</Text>
                </View>
              </View>
            </TouchableOpacity>
            <View style={styles.assistantActions}>
              <TouchableOpacity 
                style={styles.assistantActionButton}
                onPress={handleAssistantPress}
              >
                <Text style={styles.assistantActionIcon}>💬</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.assistantActionButton}
                onPress={handleAssistantPress}
              >
                <Text style={styles.assistantActionIcon}>📞</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* 会话翻译区域 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>会话翻译</Text>
          <View style={styles.conversationGrid}>
            <TouchableOpacity 
              style={styles.modeCard}
              onPress={() => handleModePress('外放模式')}
            >
              <Text style={styles.modeCardTitle}>外放模式</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modeCard}
              onPress={() => handleModePress('耳机模式')}
            >
              <Text style={styles.modeCardTitle}>耳机模式</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modeCard}
              onPress={() => handleModePress('单向聆听')}
            >
              <Text style={styles.modeCardTitle}>单向聆听</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.modeCard}
              onPress={() => handleModePress('线上对话')}
            >
              <Text style={styles.modeCardTitle}>线上对话</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 翻译工具区域 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>翻译工具</Text>
          <View style={styles.toolsContainer}>
            <TouchableOpacity 
              style={styles.toolButton}
              onPress={() => handleToolPress('文档翻译')}
            >
              <View style={styles.toolIcon}>
                <Text style={styles.toolIconText}>📄+</Text>
              </View>
              <Text style={styles.toolText}>文档翻译</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.toolButton}
              onPress={() => handleToolPress('录音翻译')}
            >
              <View style={styles.toolIcon}>
                <Text style={styles.toolIconText}>🎤</Text>
              </View>
              <Text style={styles.toolText}>录音翻译</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.toolButton}
              onPress={() => handleToolPress('图像翻译')}
            >
              <View style={styles.toolIcon}>
                <Text style={styles.toolIconText}>📷</Text>
              </View>
              <Text style={styles.toolText}>图像翻译</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 文本输入区域 */}
        <View style={styles.section}>
          <View style={styles.languageSelectors}>
            <TouchableOpacity 
              style={styles.languageSelector}
              onPress={() => setShowFromLanguageSelector(true)}
            >
              <Text style={styles.languageSelectorText}>{fromLanguage}</Text>
              <Text style={styles.languageSelectorArrow}>▼</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.languageSwitch}>
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
          
          <View style={styles.textInputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="输入您想要翻译的内容"
              placeholderTextColor="#999999"
              multiline
              value={inputText}
              onChangeText={setInputText}
            />
          </View>
        </View>
      </ScrollView>

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
            activeTab === 'music' && styles.navTabActive
          ]}
          onPress={() => handleTabPress('music')}
        >
          <Text style={[
            styles.navTabIcon,
            activeTab === 'music' && styles.navTabIconActive
          ]}>
            🎵
          </Text>
          <Text style={[
            styles.navTabText,
            activeTab === 'music' && styles.navTabTextActive
          ]}>
            音乐
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
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flex: 1,
  },
  topSection: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  deviceStatus: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
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
  assistantModule: {
    flexDirection: 'row',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  assistantLeft: {
    flex: 1,
  },
  assistantIconPlaceholder: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 80,
    minHeight: 60,
  },
  assistantIconText: {
    color: '#ffffff',
    fontSize: 20,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 4,
  },
  assistantIconLabel: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '500',
    textAlign: 'center',
  },
  assistantTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  assistantTag: {
    backgroundColor: '#e0f2fe',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  assistantTagText: {
    fontSize: 10,
    color: '#0369a1',
    fontWeight: '500',
  },
  assistantActions: {
    flexDirection: 'row',
    gap: 12,
  },
  assistantActionButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  assistantActionIcon: {
    fontSize: 20,
  },
  section: {
    backgroundColor: '#ffffff',
    marginTop: 12,
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  conversationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  modeCard: {
    width: CARD_WIDTH,
    height: 80,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modeCardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#475569',
  },
  toolsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  toolButton: {
    alignItems: 'center',
  },
  toolIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  toolIconText: {
    fontSize: 24,
  },
  toolText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  languageSelectors: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  languageSelector: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  languageSelectorText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
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
    fontSize: 18,
    color: '#3b82f6',
  },
  textInputContainer: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 120,
  },
  textInput: {
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    textAlignVertical: 'top',
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
});

export default TranslationHomeScreen; 