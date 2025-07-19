/**
 * AI音乐主页
 * M1.0：作为AI音乐功能的统一入口，清晰地展示创作路径
 * 根据Figma设计稿高保真还原 - node-id: 383-5697
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  TextInput,
  Image,
  Alert,
} from 'react-native';
import colors from '../../assets/colors';
import { polishLyrics } from '../../api/services/musicService';
import translateService from '../../api/services/translateService';
import { normalize } from '../../utils/normalize';

interface MusicHomeScreenProps {
  onNavigateToMyWorks?: () => void;
  onNavigateToHumming?: () => void;
  onTabSwitch?: (tab: string) => void;
  onNavigateToRecreateMusic?: (text: string) => void;
}

const MusicHomeScreen: React.FC<MusicHomeScreenProps> = ({
  onNavigateToMyWorks,
  onNavigateToHumming,
  onTabSwitch,
  onNavigateToRecreateMusic,
}) => {
  const [activeTab, setActiveTab] = useState('music');
  const [lyricsText, setLyricsText] = useState('');
  const [aiLoading, setAiLoading] = useState(false);

  // 添加语言状态管理
  const [sourceLang, setSourceLang] = useState('英文');
  const [targetLang, setTargetLang] = useState('中文');

  // 添加语言列表和弹窗状态
  const languageOptions = [
    { code: 'zh', name: '中文' },
    { code: 'en', name: '英文' },
    { code: 'ja', name: '日文' },
    { code: 'ko', name: '韩文' },
    { code: 'es', name: '西班牙文' },
    { code: 'fr', name: '法文' },
    { code: 'de', name: '德文' },
    { code: 'it', name: '意大利文' },
    { code: 'ru', name: '俄文' },
    { code: 'th', name: '泰文' },
  ];

  const [showSourceLangPicker, setShowSourceLangPicker] = useState(false);
  const [showTargetLangPicker, setShowTargetLangPicker] = useState(false);

  // 使用已导入的翻译服务实例
  // translateService 已经是实例，无需再次实例化

  // 语言代码映射（根据翻译接口支持的语言代码）
  const languageCodeMap: { [key: string]: string } = {
    '中文': 'zh',
    '英文': 'en', 
    '日文': 'ja',
    '韩文': 'ko',
    '西班牙文': 'es',
    '法文': 'fr',
    '德文': 'de',
    '意大利文': 'it',
    '俄文': 'ru',
    '泰文': 'th',
  };

  // 添加翻译加载状态
  const [translateLoading, setTranslateLoading] = useState(false);

  // 处理我的作品点击
  const handleMyWorksPress = () => {
    if (onNavigateToMyWorks) {
      onNavigateToMyWorks();
    }
  };

  // 处理哼唱作曲点击
  const handleHummingPress = () => {
    console.log('进入哼唱作曲功能');
    if (onNavigateToHumming) {
      onNavigateToHumming();
    }
  };

  // 处理填词作曲点击
  const handleLyricsPress = () => {
    console.log('重置歌曲页面');
    if (onNavigateToRecreateMusic) {
      onNavigateToRecreateMusic(lyricsText);
    }
  };

  // 处理Tab切换
  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    if (onTabSwitch) {
      onTabSwitch(tab);
    }
  };

  // 语言切换函数
  const handleLanguageSwitch = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
  };

  // 语言选择函数
  const handleSourceLangSelect = (lang: { code: string; name: string }) => {
    setSourceLang(lang.name);
    setShowSourceLangPicker(false);
  };

  const handleTargetLangSelect = (lang: { code: string; name: string }) => {
    setTargetLang(lang.name);
    setShowTargetLangPicker(false);
  };

  // 翻译函数实现
  const handleTranslate = async () => {
    if (!lyricsText.trim()) {
      Alert.alert('提示', '请先输入要翻译的歌词');
      return;
    }

    setTranslateLoading(true);
    try {
      const sourceCode = languageCodeMap[sourceLang];
      const targetCode = languageCodeMap[targetLang];
      
      if (!sourceCode || !targetCode) {
        Alert.alert('错误', '不支持的语言类型');
        return;
      }

      const translateParams = {
        source_language: sourceCode,
        target_language: targetCode,
        source_text: lyricsText,
        format_type: 'text'
      };

      const result = await translateService.translateText(translateParams);
      
      if (result.code === 200 && result.data?.data?.Translated) {
        setLyricsText(result.data.data.Translated || '');
        Alert.alert('翻译成功', `已翻译为${targetLang}`);
      } else {
        Alert.alert('翻译失败', result.message || '请重试');
      }
    } catch (error: any) {
      console.error('翻译失败:', error);
      Alert.alert('翻译失败', error.message || '网络错误，请重试');
    } finally {
      setTranslateLoading(false);
    }
  };

  const handleAiWrite = async () => {
    setAiLoading(true);
    try {
      const data = await polishLyrics({ work_lyrics: lyricsText });
      setLyricsText(data?.work_lyrics || ''); 
    } catch (e) {
      setLyricsText('AI润饰失败');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F4F8F8" />
      
      {/* 顶部状态栏 */}
      <View style={styles.topStatusBar}>
        <TouchableOpacity style={styles.backButton}>
           <Image
              source={require('../../assets/images/return_main.png')}
              style={styles.returnIcon}
              resizeMode="contain"
            />
        </TouchableOpacity>
       
        <View style={styles.connectionStatus}>
        <View style={styles.circleContainer}>
          <Image
              source={require('../../assets/images/ear_phone_main.png')}
              style={styles.returnIcon}
              resizeMode="contain"
            />
        </View>
          <Text style={styles.connectionText}>30%</Text>
        </View>
        <View/>
      </View>

      <ScrollView style={styles.scrollContainer} showsVerticalScrollIndicator={false}>
        {/* 创作路径入口 */}
        <View style={styles.section}>
          <View style={styles.cardsContainer}>
            {/* 我的作品卡片 */}
            <TouchableOpacity 
              style={[styles.card, styles.myWorksCard]}
              onPress={handleMyWorksPress}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <Image
                  source={require('../../assets/music/my_work_bg.png')}
                  style={styles.cardTitleBackground}
                  resizeMode="cover"
                />
                <Image
                  source={require('../../assets/music/my_work_bg_icon.png')}
                  style={styles.cardIcon}
                  resizeMode="contain"
                />
                <Text style={styles.cardTitle}>我的作品</Text>
              </View>
            </TouchableOpacity>

            {/* 哼唱作曲卡片 */}
            <TouchableOpacity 
              style={[styles.card, styles.hummingCard]}
              onPress={handleHummingPress}
              activeOpacity={0.8}
            >
              <View style={styles.cardContent}>
                <Image
                  source={require('../../assets/music/humming_bg.png')}
                  style={styles.cardTitleBackground}
                  resizeMode="cover"
                />
                <Image
                  source={require('../../assets/music/humming_bg_icon.png')}
                  style={styles.cardIcon}
                  resizeMode="contain"
                />
                <Text style={styles.cardTitle}>哼唱作品</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        {/* 填词作曲功能区 */}
        <View style={styles.lyricsSection}>
          <Text style={styles.lyricsSectionTitle}>填词作品</Text>
          
          {/* 歌词输入框 */}
          <View style={styles.lyricsInputContainer}>
            <View style={styles.lyricsHeader}>
              <View style={styles.writeLyricsSection}>
                <Image source={require('../../assets/images/write_main.png')} style={styles.pencilIcon} />
                <Text style={styles.lyricsLabel}>写歌词</Text>
              </View>
              <View style={styles.aiEmbellishment}>
                <TouchableOpacity style={styles.aiEmbellishment} onPress={handleAiWrite} disabled={aiLoading}>
                <Image source={require('../../assets/images/ai_icon_main.png')} style={styles.pencilIcon} />
                  {aiLoading ? (
                    <Text style={styles.aiLabel}>生成中...</Text>
                  ) : (
                    <Text style={styles.aiLabel}>AI润饰</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
            
            <View style={styles.lyricsInputBox}>
              <TextInput
                style={styles.lyricsInput}
                placeholder="请输入您脑海里的歌词"
                placeholderTextColor="#949494"
                multiline
                value={lyricsText}
                onChangeText={setLyricsText}
              />
            </View>

            {/* 语言选择与翻译 */}
            <View style={styles.languageSection}>
              <View style={styles.languageSelectors}>
                <TouchableOpacity onPress={() => setShowSourceLangPicker(true)}>
                  <Text style={styles.languageText}>{sourceLang}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.languageSwitch} onPress={handleLanguageSwitch}>
                  <Image source={require('../../assets/images/exchang_icon_main.png')} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setShowTargetLangPicker(true)}>
                  <Text style={styles.languageText}>{targetLang}</Text>
                </TouchableOpacity>
              </View>
              
              <TouchableOpacity style={styles.translateButton} onPress={handleTranslate} disabled={translateLoading}>
                <Text style={styles.translateButtonText}>歌词转译</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* 下一步按钮 */}
          <TouchableOpacity
            style={[styles.nextStepButton, !lyricsText.trim() && { backgroundColor: colors.primary, opacity: 0.6 }]}
            disabled={!lyricsText.trim()}
            onPress={handleLyricsPress}
          >
            <Text style={styles.nextStepButtonText}>下一步</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* 底部导航栏 */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity    
          style={[
            styles.navTab,
            activeTab === 'translation' && styles.navTabActive
          ]}
          onPress={() => handleTabPress('translation')}
        >
          <View style={styles.navTabIconContainer}>
            {activeTab === 'translation' && <View style={styles.navTabActiveDot} />}
            <Image source={require('../../assets/images/transfer_icon_main.png')} style={styles.navTabIcon} />
          </View>
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
            activeTab === 'music' && styles.navTabActive
          ]}
          onPress={() => handleTabPress('music')}
        >
          <View style={styles.navTabIconContainer}>
            <Image source={require('../../assets/images/music_icon_main.png')} style={styles.navTabIcon} />
          </View>
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
          <View style={styles.navTabIconContainer}>
            <Image source={require('../../assets/images/my_icon_main.png')} style={styles.navTabIcon} />
          </View>
          <Text style={[
            styles.navTabText,
            activeTab === 'profile' && styles.navTabTextActive
          ]}>
            我的
          </Text>
        </TouchableOpacity>
      </View>

      {/* 源语言选择弹窗 */}
      {showSourceLangPicker && (
        <View style={styles.languagePickerOverlay}>
          <View style={styles.languagePickerModal}>
            <View style={styles.languagePickerHeader}>
              <Text style={styles.languagePickerTitle}>选择源语言</Text>
              <TouchableOpacity onPress={() => setShowSourceLangPicker(false)}>
                <Text style={styles.languagePickerClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.languagePickerList}>
              {languageOptions.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languagePickerItem,
                    sourceLang === lang.name && styles.languagePickerItemSelected
                  ]}
                  onPress={() => handleSourceLangSelect(lang)}
                >
                  <Text style={[
                    styles.languagePickerItemText,
                    sourceLang === lang.name && styles.languagePickerItemTextSelected
                  ]}>
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* 目标语言选择弹窗 */}
      {showTargetLangPicker && (
        <View style={styles.languagePickerOverlay}>
          <View style={styles.languagePickerModal}>
            <View style={styles.languagePickerHeader}>
              <Text style={styles.languagePickerTitle}>选择目标语言</Text>
              <TouchableOpacity onPress={() => setShowTargetLangPicker(false)}>
                <Text style={styles.languagePickerClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.languagePickerList}>
              {languageOptions.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languagePickerItem,
                    targetLang === lang.name && styles.languagePickerItemSelected
                  ]}
                  onPress={() => handleTargetLangSelect(lang)}
                >
                  <Text style={[
                    styles.languagePickerItemText,
                    targetLang === lang.name && styles.languagePickerItemTextSelected
                  ]}>
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F8F8',
  },
  topStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    marginTop: normalize(20),
    height: normalize(92),
  },
  backButton: {
    width: normalize(23),
    height: normalize(23),
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnIcon: {
    width: normalize(23),
    height: normalize(23),
  },
  backIcon: {
    fontSize: normalize(23),
    color: '#003337',
    fontWeight: '300',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.buttonColor,
    borderRadius: normalize(45),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(7),
    width: normalize(100),
    height: normalize(30),
    borderWidth: 1,
    borderColor: '#23BBC2',
  },
  connectionIcon: {
    width: normalize(6),
    height: normalize(6),
    borderRadius: normalize(3),
    backgroundColor: '#FF5F5F',
    marginRight: normalize(6),
  },
  connectionText: {
    fontSize: normalize(14),
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Inter',
    lineHeight: normalize(17),
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    paddingHorizontal: normalize(18),
    paddingTop: normalize(23),
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: normalize(20),
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: normalize(20),
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    lineHeight: normalize(24),
    textAlign: 'center',
    width: normalize(80),
  },
  cardsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: normalize(1),
  },
  card: {
    width: normalize(165),
    height: normalize(108),
    borderRadius: normalize(6),
    padding: normalize(6),
    position: 'relative',
  },
  myWorksCard: {
    // backgroundColor: '#6AEEF4',
  },
  hummingCard: {
    // backgroundColor: '#6ABDF4',
  },
  cardContent: {
    flex: 1,
    position: 'relative',
    width: '100%',
    height: '100%',
  },
  cardIcon: {
    width: '80%',
    height: '80%',
    marginBottom: normalize(10),
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: normalize(10),
    right: normalize(10),
    zIndex: 2,
  },
  documentIcon: {
    width: normalize(76),
    height: normalize(73),
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    borderRadius: normalize(8),
  },
  micIcon: {
    width: normalize(69.79),
    height: normalize(69.72),
    backgroundColor: 'rgba(255, 255, 255, 0.24)',
    borderRadius: normalize(8),
  },
  cardIconSvg: {
    marginBottom: normalize(10),
  },
  cardIconPng: {
    marginBottom: normalize(10),
  },
  cardTitle: {
    fontSize: normalize(20),
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    lineHeight: normalize(24),
    textAlign: 'left',
    margin: normalize(20),
    zIndex: 1,
  },
  cardTitleBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: '100%',
    height: '100%',
    borderRadius: normalize(6),
  },
  cardBubble1: {
    position: 'absolute',
    top: normalize(11),
    right: normalize(12),
    width: normalize(45),
    height: normalize(43),
    borderRadius: normalize(22.5),
    backgroundColor: '#C7F4FF',
    shadowColor: '#38D3F3',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  cardBubble2: {
    position: 'absolute',
    top: normalize(-3),
    right: normalize(23),
    width: normalize(45),
    height: normalize(45),
    borderRadius: normalize(22.5),
    backgroundColor: '#ACD3FF',
    shadowColor: '#468EF3',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 1,
    shadowRadius: 4,
  },
  lyricsSection: {
    paddingHorizontal: normalize(18),
    paddingTop: normalize(22),
    paddingBottom: normalize(40),
  },
  lyricsSectionTitle: {
    fontSize: normalize(20),
    fontWeight: '800',
    color: '#003337',
    fontFamily: 'Inter',
    lineHeight: normalize(24),
    marginBottom: normalize(18),
  },
  lyricsInputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(6),
    width: normalize(338),
    height: normalize(384),
    padding: normalize(16),
    marginBottom: normalize(40),
  },
  lyricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(12),
  },
  writeLyricsSection: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEDF6',
    borderRadius: normalize(49),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(7),
    width: normalize(74),
    height: normalize(29),
  },
  pencilIcon: {
    width: normalize(12),
    height: normalize(12),
    borderRadius: normalize(2),
    marginRight: normalize(6),
  },
  lyricsLabel: {
    fontSize: normalize(12),
    fontWeight: '400',
    color: '#23BBC2',
    fontFamily: 'Inter',
    lineHeight: normalize(15),
  },
  aiEmbellishment: {
    flexDirection: 'row',
    alignItems: 'center',
    width: normalize(49),
    height: normalize(15),
  },
  aiIcon: {
    width: normalize(9),
    height: normalize(10),
    backgroundColor: '#949494',
    borderRadius: normalize(1),
    marginRight: normalize(4),
  },
  aiLabel: {
    fontSize: normalize(12),
    fontWeight: '400',
    color: '#949494',
    fontFamily: 'Inter',
    lineHeight: normalize(15),
  },
  lyricsInputBox: {
    backgroundColor: 'rgba(243, 243, 243, 0.24)',
    borderRadius: normalize(6),
    width: normalize(305),
    height: normalize(279),
    padding: normalize(16),
    marginBottom: normalize(16),
  },
  lyricsInput: {
    flex: 1,
    fontSize: normalize(12),
    color: '#949494',
    fontFamily: 'Inter',
    lineHeight: normalize(15),
    textAlignVertical: 'top',
  },
  languageSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageSelectors: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  languageText: {
    fontSize: normalize(12),
    fontWeight: '400',
    color: '#949494',
    fontFamily: 'Inter',
    lineHeight: normalize(15),
  },
  languageSwitch: {
    backgroundColor: '#DBEDF6',
    borderRadius: normalize(9),
    width: normalize(32),
    height: normalize(18),
    marginHorizontal: normalize(13),
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  switchArrow1: {
    width: normalize(11.7),
    height: normalize(0.92),
    backgroundColor: '#23BBC2',
    marginRight: normalize(1),
  },
  switchArrow2: {
    width: normalize(11.7),
    height: normalize(6.76),
    backgroundColor: '#23BBC2',
  },
  translateButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#003337',
    borderRadius: normalize(36),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(5),
    height: normalize(24),
    alignItems: 'center',
    justifyContent: 'center',
  },
  translateButtonText: {
    fontSize: normalize(12),
    fontWeight: '400',
    color: '#003337',
    fontFamily: 'Inter',
    lineHeight: normalize(15),
  },
  nextStepButton: {
    backgroundColor: '#003337',
    borderRadius: normalize(36),
    width: normalize(234),
    height: normalize(40),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
  },
  nextStepButtonText: {
    fontSize: normalize(14),
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    lineHeight: normalize(17),
  },
  bottomNavigation: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(52),
    borderWidth: 0.6,
    borderColor: 'transparent',
    borderTopColor: '#23BBC2',
    width: normalize(334),
    height: normalize(68),
    alignSelf: 'center',
    shadowColor: '#E1ECEC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.67,
    shadowRadius: 3.4,
    elevation: 8,
    bottom:normalize(10)
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: normalize(4),
  },
  navTabActive: {
    // 激活状态样式
  },
  navTabIconContainer: {
    width: normalize(24),
    height: normalize(24),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(2),
    position: 'relative',
  },
  navTabIcon: {
    width: normalize(14),
    height: normalize(18),
    borderRadius: normalize(2),
  },
  navTabActiveDot: {
    position: 'absolute',
    top: normalize(-12),
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
    backgroundColor: '#E6E9E9',
  },
  translationIcon: {
    // Translation specific icon styles
  },
  musicIcon: {
    width: normalize(13),
    height: normalize(16),
    // Music specific icon styles
  },
  profileIcon: {
    width: normalize(14),
    height: normalize(13),
    // Profile specific icon styles
  },
  navTabIconActive: {
    backgroundColor: '#003337',
  },
  navTabText: {
    fontSize: normalize(12),
    fontWeight: '400',
    color: '#949494',
    fontFamily: 'Inter',
    lineHeight: normalize(15),
    textAlign: 'center',
  },
  navTabTextActive: {
    fontWeight: '700',
    color: '#003337',
  },
  circleContainer: {
    width: 48,           // 圆的直径，可根据需要调整
    height: 48,
    borderRadius: 24,    // 一半就是圆
    backgroundColor: '#fff', // 可自定义
    margin: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  languagePickerOverlay: {
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
  languagePickerModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(16),
    margin: normalize(20),
    maxHeight: '70%',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  languagePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  languagePickerTitle: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: '#333',
  },
  languagePickerClose: {
    fontSize: normalize(20),
    color: '#999',
    fontWeight: 'bold',
  },
  languagePickerList: {
    maxHeight: normalize(300),
  },
  languagePickerItem: {
    padding: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  languagePickerItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  languagePickerItemText: {
    fontSize: normalize(16),
    color: '#333',
  },
  languagePickerItemTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
});

export default MusicHomeScreen; 