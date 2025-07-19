/**
 * 音色预览与确认页面
 * 页面4.4：允许用户预览生成好的音色，并在不同语言下进行试听，然后确认或选择重新录制
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
} from 'react-native';


interface VoiceprintPreviewScreenProps {
  onBack: () => void;
  onRetry: () => void;
  onConfirm: () => void;
}

// 支持的语言列表
const SUPPORTED_LANGUAGES = [
  { code: 'zh', label: '中文', sampleText: '"你好，世界。""很高兴能用我的声音与你交流。"' },
  { code: 'en', label: 'English', sampleText: '"Hello, world." "Nice to communicate with you using my voice."' },
  { code: 'ja', label: '日本語', sampleText: '"こんにちは、世界。""私の声であなたと話せて嬉しいです。"' },
  { code: 'de', label: 'Deutsch', sampleText: '"Hallo, Welt." "Schön, mit meiner Stimme mit dir zu sprechen."' },
  { code: 'fr', label: 'Français', sampleText: '"Bonjour, le monde." "Ravi de communiquer avec vous avec ma voix."' },
  { code: 'es', label: 'Español', sampleText: '"Hola, mundo." "Encantado de comunicarme contigo con mi voz."' },
];

const VoiceprintPreviewScreen: React.FC<VoiceprintPreviewScreenProps> = ({
  onBack,
  onRetry,
  onConfirm,
}) => {

  
  // 状态管理
  const [selectedLanguage, setSelectedLanguage] = useState('zh');
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingLanguage, setPlayingLanguage] = useState<string | null>(null);
  
  // 关闭动画
  const translateY = useRef(new Animated.Value(0)).current;

  // 获取当前选中语言的文本
  const getCurrentSampleText = () => {
    const currentLang = SUPPORTED_LANGUAGES.find(lang => lang.code === selectedLanguage);
    return currentLang?.sampleText || SUPPORTED_LANGUAGES[0].sampleText;
  };

  // 模拟音频播放
  const playVoiceSample = async (languageCode: string) => {
    if (isPlaying) return;
    
    setIsPlaying(true);
    setPlayingLanguage(languageCode);
    setSelectedLanguage(languageCode);
    
    // 模拟播放时间（实际项目中应该播放真实音频）
    setTimeout(() => {
      setIsPlaying(false);
      setPlayingLanguage(null);
    }, 3000); // 模拟3秒播放时间
  };

  // 关闭面板动画
  const closePanel = () => {
    Animated.timing(translateY, {
      toValue: 600,
      duration: 300,
      useNativeDriver: false,
    }).start(() => {
      onRetry(); // 关闭面板，行为同重新录制
    });
  };

  // 重新录制确认
  const handleRetry = () => {
    Alert.alert(
      '确认重新录制',
      '您确定要重新录制声纹吗？当前的音色将被删除。',
      [
        { text: '取消', style: 'cancel' },
        { 
          text: '确定重新录制', 
          style: 'destructive',
          onPress: onRetry
        }
      ]
    );
  };

  // 确认音色
  const handleConfirm = () => {
    Alert.alert(
      '确认音色',
      '您的专属音色已准备就绪！确认后将保存音色模型并开始使用。',
      [
        { text: '再想想', style: 'cancel' },
        { 
          text: '确认使用', 
          onPress: onConfirm
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <Animated.View 
        style={[
          styles.content,
          {
            transform: [{ translateY: translateY }],
          },
        ]}
      >
        {/* 拖拽指示条 - 点击关闭 */}
        <TouchableOpacity onPress={closePanel} style={styles.dragIndicatorContainer}>
          <View style={styles.dragIndicator} />
        </TouchableOpacity>
          
          {/* 顶部导航栏 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backButtonText}>←</Text>
            </TouchableOpacity>
            
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>预览您的专属音色</Text>
            </View>
            
            <View style={styles.progressContainer}>
              <Text style={styles.progressText}>3/3</Text>
            </View>
          </View>

          <ScrollView style={styles.scrollContent} showsVerticalScrollIndicator={false}>
            {/* 试听文本显示区域 */}
            <View style={styles.textSection}>
              <View style={styles.textCard}>
                <View style={styles.textHeader}>
                  <Text style={styles.textLabel}>试听文本</Text>
                  {isPlaying && playingLanguage === selectedLanguage && (
                    <View style={styles.playingIndicator}>
                      <View style={styles.playingDot} />
                      <Text style={styles.playingText}>播放中...</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.sampleText}>
                  {getCurrentSampleText()}
                </Text>
              </View>
            </View>

            {/* 试听语言选择器 */}
            <View style={styles.languageSection}>
              <Text style={styles.languageSectionTitle}>选择语言试听</Text>
              <Text style={styles.languageSectionSubtitle}>点击不同语言试听</Text>
              
              <View style={styles.languageGrid}>
                {SUPPORTED_LANGUAGES.map((language) => (
                  <TouchableOpacity
                    key={language.code}
                    style={[
                      styles.languageButton,
                      selectedLanguage === language.code && styles.selectedLanguageButton,
                      isPlaying && playingLanguage === language.code && styles.playingLanguageButton,
                    ]}
                    onPress={() => playVoiceSample(language.code)}
                    disabled={isPlaying}
                  >
                    {isPlaying && playingLanguage === language.code && (
                      <View style={styles.languagePlayingIndicator} />
                    )}
                    <Text style={[
                      styles.languageButtonText,
                      selectedLanguage === language.code && styles.selectedLanguageButtonText,
                    ]}>
                      {language.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 音色质量提示 */}
            <View style={styles.qualitySection}>
              <Text style={styles.qualityTitle}>🎵 音色质量评估</Text>
              <View style={styles.qualityIndicator}>
                <View style={styles.qualityBar}>
                  <View style={[styles.qualityFill, { width: '85%' }]} />
                </View>
                <Text style={styles.qualityText}>优秀 (85%)</Text>
              </View>
              <Text style={styles.qualityDescription}>
                您的音色清晰度和自然度都很好，可以很好地应用于翻译场景。
              </Text>
            </View>
          </ScrollView>

          {/* 底部操作按钮 */}
          <View style={styles.bottomContainer}>
            <TouchableOpacity
              style={styles.retryButton}
              onPress={handleRetry}
              disabled={isPlaying}
            >
              <Text style={styles.retryButtonText}>重新录制</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.confirmButton,
                isPlaying && styles.disabledButton
              ]}
              onPress={handleConfirm}
              disabled={isPlaying}
            >
              <Text style={styles.confirmButtonText}>确认音色</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    minHeight: '80%',
  },
  dragIndicatorContainer: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    backgroundColor: '#e0e0e0',
    borderRadius: 2,
    marginTop: 4,
    marginBottom: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#333333',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
  },
  progressContainer: {
    width: 40,
    alignItems: 'center',
  },
  progressText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  scrollContent: {
    flex: 1,
  },
  textSection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  textCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
  },
  textHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  textLabel: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
  },
  playingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  playingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10b981',
    marginRight: 6,
  },
  playingText: {
    fontSize: 12,
    color: '#10b981',
    fontWeight: '500',
  },
  sampleText: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
  },
  languageSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  languageSectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 8,
  },
  languageSectionSubtitle: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
  },
  languageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  languageButton: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#ffffff',
    minWidth: 80,
    alignItems: 'center',
    position: 'relative',
  },
  selectedLanguageButton: {
    borderColor: '#3b82f6',
    backgroundColor: '#3b82f6',
  },
  playingLanguageButton: {
    borderColor: '#10b981',
    backgroundColor: '#10b981',
  },
  languagePlayingIndicator: {
    position: 'absolute',
    top: -2,
    right: -2,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
  },
  languageButtonText: {
    fontSize: 14,
    color: '#333333',
    fontWeight: '500',
  },
  selectedLanguageButtonText: {
    color: '#ffffff',
  },
  qualitySection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  qualityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333333',
    marginBottom: 16,
  },
  qualityIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  qualityBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 4,
    marginRight: 12,
    overflow: 'hidden',
  },
  qualityFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  qualityText: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
    minWidth: 60,
  },
  qualityDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  bottomContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingBottom: 30,
    gap: 16,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  retryButton: {
    flex: 1,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 12,
    backgroundColor: '#ffffff',
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  confirmButton: {
    flex: 1,
    paddingVertical: 16,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    alignItems: 'center',
  },
  confirmButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
});

export default VoiceprintPreviewScreen; 