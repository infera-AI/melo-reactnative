/**
 * 歌词输入页面
 * M1.2：提供一个简洁、高效的界面，供用户输入或粘贴歌词文本
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TextInput,
  ScrollView,
  Alert,
  Image,
} from 'react-native';

interface LyricsInputScreenProps {
  onBack?: () => void;
  onNextStep?: (lyricsData: any) => void;
  onTabSwitch?: (tab: string) => void;
}

type AIState = 'idle' | 'generating' | 'polishing' | 'matching';

const LyricsInputScreen: React.FC<LyricsInputScreenProps> = ({
  onBack,
  onNextStep,
  onTabSwitch,
}) => {
  const [lyricsText, setLyricsText] = useState('');
  const [fromLanguage, setFromLanguage] = useState('中文');
  const [toLanguage, setToLanguage] = useState('英文');
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['R&B', '古典', '古埃及']);
  const [aiState, setAiState] = useState<AIState>('idle');

  // 音乐风格选项
  const musicStyles = [
    'R&B', '古典', '蒸汽波', '说唱', '古埃及', '流行', '摇滚', '爵士', 
    '电子', '民谣', '蓝调', '嘻哈', '乡村', '朋克', '金属'
  ];

  // 处理AI写词
  const handleAIWrite = () => {
    console.log('开始AI写词');
    setAiState('generating');
    
    // 模拟AI生成过程
    setTimeout(() => {
      const generatedLyrics = `在古老的时光里
寻找着你的足迹
月光下的誓言
是否还记得起

岁月如歌般流淌
记忆在风中飘荡
我们的故事
永远珍藏心底`;
      
      setLyricsText(generatedLyrics);
      setAiState('idle');
      Alert.alert('AI写词完成', '歌词已生成，请查看并编辑');
    }, 3000);
  };

  // 处理AI润饰
  const handleAIPolish = () => {
    if (!lyricsText.trim()) {
      Alert.alert('提示', '请先输入歌词内容');
      return;
    }
    
    console.log('开始AI润饰');
    setAiState('polishing');
    
    // 模拟AI润饰过程
    setTimeout(() => {
      const polishedLyrics = lyricsText + '\n\n[AI润饰优化版本]\n' + 
        lyricsText.replace(/。/g, '，').replace(/，$/, '。');
      setLyricsText(polishedLyrics);
      setAiState('idle');
      Alert.alert('AI润饰完成', '歌词已优化');
    }, 2000);
  };

  // 处理AI匹配
  const handleAIMatch = () => {
    console.log('开始AI匹配曲风');
    setAiState('matching');
    
    // 模拟AI匹配过程
    setTimeout(() => {
      const recommendedStyles = ['流行', 'R&B', '电子'];
      setSelectedStyles(recommendedStyles);
      setAiState('idle');
      Alert.alert('AI匹配完成', `推荐曲风：${recommendedStyles.join('、')}`);
    }, 2000);
  };

  // 处理语言切换
  const handleLanguageSwitch = () => {
    const temp = fromLanguage;
    setFromLanguage(toLanguage);
    setToLanguage(temp);
  };

  // 处理歌词转译
  const handleLyricsTranslate = () => {
    if (!lyricsText.trim()) {
      Alert.alert('提示', '请先输入歌词内容');
      return;
    }
    
    console.log('开始歌词转译');
    Alert.alert('转译功能', '歌词转译功能正在开发中');
  };

  // 处理曲风选择
  const handleStyleToggle = (style: string) => {
    setSelectedStyles(prev => {
      if (prev.includes(style)) {
        return prev.filter(s => s !== style);
      } else {
        return [...prev, style];
      }
    });
  };

  // 处理下一步
  const handleNextStep = () => {
    if (!lyricsText.trim()) {
      Alert.alert('提示', '请先输入歌词内容');
      return;
    }
    
    const lyricsData = {
      lyrics: lyricsText,
      fromLanguage,
      toLanguage,
      selectedStyles,
      timestamp: Date.now(),
    };
    
    if (onNextStep) {
      onNextStep(lyricsData);
    }
  };

  // 处理Tab切换
  const handleTabPress = (tab: string) => {
    if (onTabSwitch) {
      onTabSwitch(tab);
    }
  };

  // 渲染AI状态文本
  const renderAIStateText = () => {
    switch (aiState) {
      case 'generating':
        return '灵感生成中...';
      case 'polishing':
        return 'AI润饰中...';
      case 'matching':
        return 'AI匹配中...';
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* 顶部状态栏 */}
      <View style={styles.topStatusBar}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
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
        {/* 歌词输入区域 */}
        <View style={styles.section}>
          <View style={styles.lyricsHeader}>
            <View style={styles.lyricsLabel}>
              <Text style={styles.lyricsIcon}>✏️</Text>
              <Text style={styles.lyricsLabelText}>写点歌词</Text>
            </View>
            <TouchableOpacity 
              style={styles.aiPolishButton}
              onPress={handleAIPolish}
              disabled={aiState !== 'idle'}
            >
              <Text style={styles.aiPolishIcon}>✨</Text>
              <Text style={styles.aiPolishText}>AI润饰</Text>
            </TouchableOpacity>
          </View>

          {/* AI写词按钮 */}
          <TouchableOpacity 
            style={styles.aiWriteButton}
            onPress={handleAIWrite}
            disabled={aiState !== 'idle'}
          >
            <Text style={styles.aiWriteText}>
              {aiState === 'generating' ? '灵感生成中...' : 'AI写词'}
            </Text>
          </TouchableOpacity>

          {/* 歌词输入框 */}
          <View style={styles.lyricsInputContainer}>
            <TextInput
              style={styles.lyricsInput}
              placeholder="在这里输入您的歌词，或者点击上方AI写词按钮自动生成..."
              placeholderTextColor="#999999"
              multiline
              value={lyricsText}
              onChangeText={setLyricsText}
              textAlignVertical="top"
            />
          </View>
        </View>

        {/* 语言选择和转译 */}
        <View style={styles.section}>
          <View style={styles.languageSection}>
            <View style={styles.languageSelectors}>
              <TouchableOpacity style={styles.languageSelector}>
                <Text style={styles.languageText}>{fromLanguage}</Text>
                <Text style={styles.languageArrow}>▼</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.languageSwitch}
                onPress={handleLanguageSwitch}
              >
                <Text style={styles.switchIcon}>⇄</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.languageSelector}>
                <Text style={styles.languageText}>{toLanguage}</Text>
                <Text style={styles.languageArrow}>▼</Text>
              </TouchableOpacity>
            </View>
            
            <TouchableOpacity 
              style={styles.translateButton}
              onPress={handleLyricsTranslate}
            >
              <Text style={styles.translateButtonText}>歌词转译</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 曲风选择 */}
        <View style={styles.section}>
          <View style={styles.styleHeader}>
            <View style={styles.styleLabel}>
              <Text style={styles.styleIcon}>🎵</Text>
              <Text style={styles.styleLabelText}>选择曲风</Text>
            </View>
            <TouchableOpacity 
              style={styles.aiMatchButton}
              onPress={handleAIMatch}
              disabled={aiState !== 'idle'}
            >
              <Text style={styles.aiMatchIcon}>✨</Text>
              <Text style={styles.aiMatchText}>AI匹配</Text>
            </TouchableOpacity>
          </View>

          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.styleScrollView}
          >
            <View style={styles.styleContainer}>
              {musicStyles.map((style) => (
                <TouchableOpacity
                  key={style}
                  style={[
                    styles.styleTag,
                    selectedStyles.includes(style) && styles.styleTagSelected
                  ]}
                  onPress={() => handleStyleToggle(style)}
                >
                  <Text style={[
                    styles.styleTagText,
                    selectedStyles.includes(style) && styles.styleTagTextSelected
                  ]}>
                    {style}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        {/* AI状态提示 */}
        {aiState !== 'idle' && (
          <View style={styles.aiStatusContainer}>
            <Text style={styles.aiStatusText}>{renderAIStateText()}</Text>
          </View>
        )}
      </ScrollView>

      {/* 下一步按钮 */}
      <View style={styles.bottomSection}>
        <TouchableOpacity 
          style={[
            styles.nextStepButton,
            !lyricsText.trim() && styles.nextStepButtonDisabled
          ]}
          onPress={handleNextStep}
          disabled={!lyricsText.trim()}
        >
          <Text style={[
            styles.nextStepButtonText,
            !lyricsText.trim() && styles.nextStepButtonTextDisabled
          ]}>
            下一步
          </Text>
        </TouchableOpacity>
      </View>

      {/* 底部导航栏 */}
      <View style={styles.bottomNavigation}>
        <TouchableOpacity 
          style={styles.navTab}
          onPress={() => handleTabPress('shortplay')}
        >
          <Text style={styles.navTabIcon}>▶️</Text>
          <Text style={styles.navTabText}>短剧</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navTab}
          onPress={() => handleTabPress('translation')}
        >
          <Text style={styles.navTabIcon}>😊</Text>
          <Text style={styles.navTabText}>翻译</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.navTab, styles.navTabActive]}
          onPress={() => handleTabPress('music')}
        >
          <Text style={[styles.navTabIcon, styles.navTabIconActive]}>🎵</Text>
          <Text style={[styles.navTabText, styles.navTabTextActive]}>音乐</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.navTab}
          onPress={() => handleTabPress('profile')}
        >
          <Text style={styles.navTabIcon}>⚫⚫</Text>
          <Text style={styles.navTabText}>我的</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  topStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 20,
    height: 92,
  },
  returnIcon: {
    width: 23,
    height: 23,
  },
  circleContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    margin: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    padding: 8,
  },
  backButtonIcon: {
    fontSize: 20,
    color: '#3b82f6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23BBC2',
    borderRadius: 45,
    paddingHorizontal: 16,
    paddingVertical: 7,
    width: 100,
    height: 30,
    borderWidth: 1,
    borderColor: '#23BBC2',
  },
  connectionIcon: {
    fontSize: 14,
    color: '#ffffff',
    marginRight: 4,
  },
  connectionText: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Inter',
    lineHeight: 17,
  },
  scrollContainer: {
    flex: 1,
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  lyricsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  lyricsLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lyricsIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  lyricsLabelText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
  },
  aiPolishButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  aiPolishIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  aiPolishText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  aiWriteButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 16,
  },
  aiWriteText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  lyricsInputContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minHeight: 200,
  },
  lyricsInput: {
    padding: 16,
    fontSize: 16,
    color: '#1e293b',
    lineHeight: 24,
  },
  languageSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  languageSelectors: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
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
  languageText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
  },
  languageArrow: {
    fontSize: 10,
    color: '#64748b',
  },
  languageSwitch: {
    marginHorizontal: 8,
    padding: 4,
  },
  switchIcon: {
    fontSize: 16,
    color: '#3b82f6',
  },
  translateButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  translateButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  styleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  styleLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  styleIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  styleLabelText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
  },
  aiMatchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  aiMatchIcon: {
    fontSize: 14,
    marginRight: 4,
  },
  aiMatchText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  styleScrollView: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  styleContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  styleTag: {
    backgroundColor: '#f8fafc',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  styleTagSelected: {
    backgroundColor: '#3b82f6',
    borderColor: '#3b82f6',
  },
  styleTagText: {
    fontSize: 14,
    color: '#475569',
    fontWeight: '500',
  },
  styleTagTextSelected: {
    color: '#ffffff',
  },
  aiStatusContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  aiStatusText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  nextStepButton: {
    backgroundColor: '#003337',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextStepButtonDisabled: {
    backgroundColor: '#f1f5f9',
  },
  nextStepButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  nextStepButtonTextDisabled: {
    color: '#9ca3af',
  },
  bottomNavigation: {
    flexDirection: 'row',
    backgroundColor: '#374151',
    paddingVertical: 8,
    paddingBottom: 20,
  },
  navTab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navTabActive: {
    // 激活状态样式
  },
  navTabIcon: {
    fontSize: 20,
    marginBottom: 4,
    color: '#ffffff',
  },
  navTabIconActive: {
    color: '#3b82f6',
  },
  navTabText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
  },
  navTabTextActive: {
    color: '#3b82f6',
    fontWeight: '600',
  },
});

export default LyricsInputScreen; 