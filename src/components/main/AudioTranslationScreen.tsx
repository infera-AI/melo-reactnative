/**
 * 音频翻译
 * T1.1.6：允许用户上传本地音频文件，进行语音识别和翻译
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
  Alert,
} from 'react-native';

interface AudioTranslationScreenProps {
  onBack?: () => void;
  onTabSwitch?: (tab: string) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type UploadStatus = 'empty' | 'failed' | 'success' | 'translating' | 'completed';
type ViewMode = 'original' | 'translated';

interface AudioInfo {
  name: string;
  type: string;
  size: number;
  duration: number; // 音频时长（秒）
}

interface TranscriptSegment {
  speaker: string;
  text: string;
  startTime: number;
  endTime: number;
}

const AudioTranslationScreen: React.FC<AudioTranslationScreenProps> = ({
  onBack,
  onTabSwitch,
}) => {
  const [activeTab, setActiveTab] = useState('translation');
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('empty');
  const [fromLanguage, setFromLanguage] = useState('中文');
  const [toLanguage, setToLanguage] = useState('英文');
  const [showFromLanguageSelector, setShowFromLanguageSelector] = useState(false);
  const [showToLanguageSelector, setShowToLanguageSelector] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [translationProgress, setTranslationProgress] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('original');
  const [audioInfo, setAudioInfo] = useState<AudioInfo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);

  // 动画相关
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const loadingAnimation = useRef(new Animated.Value(0)).current;
  const playingAnimation = useRef(new Animated.Value(0)).current;

  // 支持的语言列表
  const languages = [
    '中文', '英语', '日语', '韩语', 
    '法语', '德语', '西班牙语', '俄语'
  ];

  // 支持的音频格式
  const supportedFormats = ['mp3', 'wav', 'm4a', 'aac', 'ogg'];

  // 模拟音频文件信息
  const sampleAudio: AudioInfo = {
    name: 'SILENCE.m4a',
    type: 'm4a',
    size: 4.2 * 1024 * 1024, // 4.2MB
    duration: 360 // 6分钟
  };

  // 模拟转写内容
  const transcriptData: TranscriptSegment[] = [
    {
      speaker: '说话人1',
      text: '你好，欢迎来到我们的会议。今天我们将讨论项目的进展情况。',
      startTime: 0,
      endTime: 8
    },
    {
      speaker: '说话人2',
      text: '谢谢！我很高兴能参加这次会议。我准备了一些关于技术实现的材料。',
      startTime: 9,
      endTime: 18
    },
    {
      speaker: '说话人1',
      text: '很好，让我们开始吧。首先，请介绍一下当前的开发状态。',
      startTime: 19,
      endTime: 27
    },
    {
      speaker: '说话人2',
      text: '目前我们已经完成了核心功能的开发，正在进行测试和优化。',
      startTime: 28,
      endTime: 36
    }
  ];

  const translatedTranscriptData: TranscriptSegment[] = [
    {
      speaker: 'Speaker 1',
      text: 'Hello, welcome to our meeting. Today we will discuss the progress of the project.',
      startTime: 0,
      endTime: 8
    },
    {
      speaker: 'Speaker 2',
      text: 'Thank you! I\'m glad to attend this meeting. I have prepared some materials about technical implementation.',
      startTime: 9,
      endTime: 18
    },
    {
      speaker: 'Speaker 1',
      text: 'Great, let\'s begin. First, please introduce the current development status.',
      startTime: 19,
      endTime: 27
    },
    {
      speaker: 'Speaker 2',
      text: 'Currently we have completed the development of core functions and are conducting testing and optimization.',
      startTime: 28,
      endTime: 36
    }
  ];

  // 翻译进度动画
  useEffect(() => {
    if (uploadStatus === 'translating') {
      // 模拟翻译进度
      const progressTimer = setInterval(() => {
        setTranslationProgress(prev => {
          const newProgress = prev + Math.random() * 12;
          if (newProgress >= 100) {
            setUploadStatus('completed');
            setTotalDuration(audioInfo?.duration || 360);
            clearInterval(progressTimer);
            return 100;
          }
          return newProgress;
        });
      }, 1000);

      // 加载动画
      const loadingLoop = Animated.loop(
        Animated.timing(loadingAnimation, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        })
      );
      loadingLoop.start();

      return () => {
        clearInterval(progressTimer);
        loadingLoop.stop();
      };
    }
  }, [uploadStatus]);

  // 播放动画
  useEffect(() => {
    if (isPlaying) {
      const playingLoop = Animated.loop(
        Animated.sequence([
          Animated.timing(playingAnimation, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(playingAnimation, {
            toValue: 0.3,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      playingLoop.start();

      // 模拟播放进度
      const playTimer = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalDuration) {
            setIsPlaying(false);
            clearInterval(playTimer);
            return 0;
          }
          return prev + 1;
        });
      }, 1000);

      return () => {
        playingLoop.stop();
        clearInterval(playTimer);
      };
    } else {
      playingAnimation.setValue(1);
    }
  }, [isPlaying, totalDuration]);

  // 进度条动画
  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: translationProgress / 100,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [translationProgress]);

  // 处理音频上传
  const handleAudioUpload = () => {
    console.log('打开音频文件选择器');
    // 模拟音频文件选择和上传过程
    setTimeout(() => {
      const isSuccess = Math.random() > 0.25; // 75% 成功率
      if (isSuccess) {
        setAudioInfo(sampleAudio);
        setUploadStatus('success');
      } else {
        setAudioInfo(sampleAudio);
        setUploadStatus('failed');
      }
    }, 1200);
  };

  // 开始翻译
  const handleStartTranslation = () => {
    setTranslationProgress(0);
    setUploadStatus('translating');
  };

  // 重新上传
  const handleReupload = () => {
    setUploadStatus('empty');
    setAudioInfo(null);
    setTranslationProgress(0);
    setCurrentTime(0);
    setTotalDuration(0);
    setIsPlaying(false);
  };

  // 播放/暂停控制
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // 进度条拖拽
  const handleSeek = (progress: number) => {
    const newTime = Math.floor(totalDuration * progress);
    setCurrentTime(newTime);
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

  // 处理下载
  const handleDownload = (format: string) => {
    console.log(`下载${format}格式文件`);
    setShowDownloadModal(false);
    Alert.alert('下载开始', `正在下载${format}格式的转写文档`);
  };

  // 格式化时间
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

  // 渲染下载格式选择弹窗
  const renderDownloadModal = () => (
    <Modal
      visible={showDownloadModal}
      transparent={true}
      animationType="slide"
      onRequestClose={() => setShowDownloadModal(false)}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalBackdrop}>
          <TouchableOpacity 
            style={styles.modalBackdropTouchable}
            onPress={() => setShowDownloadModal(false)}
            activeOpacity={1}
          />
        </View>
        
        <View style={styles.downloadPanel}>
          <View style={styles.downloadPanelHeader}>
            <Text style={styles.downloadPanelTitle}>选择下载格式</Text>
            <TouchableOpacity onPress={() => setShowDownloadModal(false)}>
              <Text style={styles.downloadPanelClose}>✕</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.downloadOptions}>
            <TouchableOpacity 
              style={styles.downloadOption}
              onPress={() => handleDownload('Word')}
            >
              <Text style={styles.downloadOptionIcon}>📝</Text>
              <Text style={styles.downloadOptionText}>Word 转写文档</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.downloadOption}
              onPress={() => handleDownload('PDF')}
            >
              <Text style={styles.downloadOptionIcon}>📄</Text>
              <Text style={styles.downloadOptionText}>PDF 转写文档</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={styles.downloadOption}
              onPress={() => handleDownload('SRT')}
            >
              <Text style={styles.downloadOptionIcon}>📄</Text>
              <Text style={styles.downloadOptionText}>SRT 字幕文件</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // 渲染转写内容
  const renderTranscriptContent = () => {
    const data = viewMode === 'original' ? transcriptData : translatedTranscriptData;
    
    return (
      <ScrollView style={styles.transcriptContainer}>
        {data.map((segment, index) => (
          <View key={index} style={styles.transcriptSegment}>
            <Text style={styles.speakerLabel}>{segment.speaker}</Text>
            <Text style={styles.transcriptText}>{segment.text}</Text>
            <Text style={styles.timeStamp}>
              {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
            </Text>
          </View>
        ))}
      </ScrollView>
    );
  };

  // 渲染内容区域
  const renderContentArea = () => {
    switch (uploadStatus) {
      case 'empty':
        return (
          <View style={styles.uploadArea}>
            <View style={styles.catMascotContainer}>
              <Text style={styles.catMascot}>😺📻</Text>
              <View style={styles.musicNotes}>
                <Text style={styles.musicNote}>♪</Text>
                <Text style={styles.musicNote}>♫</Text>
                <Text style={styles.musicNote}>♪</Text>
              </View>
            </View>
            <Text style={styles.uploadText}>
              支持 mp3, wav, m4a 等格式
            </Text>
            <Text style={styles.uploadSubtext}>
              （100M以内）
            </Text>
            <TouchableOpacity 
              style={styles.uploadButton}
              onPress={handleAudioUpload}
            >
              <Text style={styles.uploadButtonText}>上传音频</Text>
            </TouchableOpacity>
          </View>
        );

      case 'failed':
        return (
          <View style={styles.fileInfoArea}>
            <Text style={styles.audioIcon}>🎵</Text>
            <Text style={styles.fileName}>{audioInfo?.name}</Text>
            <Text style={styles.fileSize}>
              {audioInfo ? formatFileSize(audioInfo.size) : ''} • {audioInfo ? formatTime(audioInfo.duration) : ''}
            </Text>
            <Text style={styles.statusTextFailed}>上传失败</Text>
            <TouchableOpacity 
              style={styles.reuploadButton}
              onPress={handleReupload}
            >
              <Text style={styles.reuploadButtonText}>重新上传</Text>
            </TouchableOpacity>
          </View>
        );

      case 'success':
        return (
          <View style={styles.fileInfoArea}>
            <Text style={styles.audioIcon}>🎵</Text>
            <Text style={styles.fileName}>{audioInfo?.name}</Text>
            <Text style={styles.fileSize}>
              {audioInfo ? formatFileSize(audioInfo.size) : ''} • {audioInfo ? formatTime(audioInfo.duration) : ''}
            </Text>
            <Text style={styles.statusTextSuccess}>上传成功</Text>
            <View style={styles.actionButtons}>
              <TouchableOpacity 
                style={styles.reuploadButton}
                onPress={handleReupload}
              >
                <Text style={styles.reuploadButtonText}>重新上传</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.translateButton}
                onPress={handleStartTranslation}
              >
                <Text style={styles.translateButtonText}>开始翻译</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'translating':
        return (
          <View style={styles.fileInfoArea}>
            <Animated.Text 
              style={[
                styles.audioIcon,
                {
                  opacity: loadingAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.4, 1, 0.4],
                  })
                }
              ]}
            >
              🎵
            </Animated.Text>
            <Text style={styles.fileName}>{audioInfo?.name}</Text>
            <Text style={styles.fileSize}>
              {audioInfo ? formatFileSize(audioInfo.size) : ''} • {audioInfo ? formatTime(audioInfo.duration) : ''}
            </Text>
            <Text style={styles.progressText}>
              {Math.round(translationProgress)}%
            </Text>
            <View style={styles.progressBarContainer}>
              <Animated.View 
                style={[
                  styles.progressBar,
                  {
                    width: progressAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0%', '100%'],
                    })
                  }
                ]}
              />
            </View>
            <Text style={styles.translatingStatusText}>
              正在进行语音识别和翻译...
            </Text>
            <TouchableOpacity 
              style={styles.translatingButton}
              disabled={true}
            >
              <Animated.Text 
                style={[
                  styles.translatingButtonText,
                  {
                    opacity: loadingAnimation.interpolate({
                      inputRange: [0, 0.5, 1],
                      outputRange: [0.5, 1, 0.5],
                    })
                  }
                ]}
              >
                翻译中...
              </Animated.Text>
            </TouchableOpacity>
          </View>
        );

      case 'completed':
        return (
          <View style={styles.transcriptPreviewArea}>
            <View style={styles.transcriptHeader}>
              <Text style={styles.transcriptTitle}>{audioInfo?.name}</Text>
            </View>
            
            {renderTranscriptContent()}

            <View style={styles.audioControls}>
              <View style={styles.viewModeButtons}>
                <TouchableOpacity 
                  style={[
                    styles.viewModeButton,
                    viewMode === 'original' && styles.viewModeButtonActive
                  ]}
                  onPress={() => setViewMode('original')}
                >
                  <Text style={[
                    styles.viewModeButtonText,
                    viewMode === 'original' && styles.viewModeButtonTextActive
                  ]}>
                    原文
                  </Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={[
                    styles.viewModeButton,
                    viewMode === 'translated' && styles.viewModeButtonActive
                  ]}
                  onPress={() => setViewMode('translated')}
                >
                  <Text style={[
                    styles.viewModeButtonText,
                    viewMode === 'translated' && styles.viewModeButtonTextActive
                  ]}>
                    译文
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.playbackControls}>
                <TouchableOpacity 
                  style={styles.playButton}
                  onPress={handlePlayPause}
                >
                  <Animated.Text 
                    style={[
                      styles.playButtonIcon,
                      {
                        opacity: playingAnimation
                      }
                    ]}
                  >
                    {isPlaying ? '⏸️' : '▶️'}
                  </Animated.Text>
                </TouchableOpacity>
                
                <Text style={styles.timeDisplay}>
                  {formatTime(currentTime)}/{formatTime(totalDuration)}
                </Text>
              </View>

              <TouchableOpacity 
                style={styles.downloadIconButton}
                onPress={() => setShowDownloadModal(true)}
              >
                <Text style={styles.downloadIcon}>⬇️</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
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

        {/* 模式显示 */}
        <View style={styles.modeDisplay}>
          <Text style={styles.modeText}>音频翻译</Text>
        </View>
      </View>

      {/* 内容区域 */}
      <View style={styles.contentArea}>
        {renderContentArea()}
      </View>

      {/* 底部区域 */}
      <View style={styles.bottomSection}>
        {/* 语言选择器 */}
        {uploadStatus !== 'completed' && (
          <View style={styles.languageSection}>
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
        )}

        {/* 主导航栏 */}
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

      {/* 下载格式选择弹窗 */}
      {renderDownloadModal()}
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
  uploadArea: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  catMascotContainer: {
    position: 'relative',
    alignItems: 'center',
    marginBottom: 30,
  },
  catMascot: {
    fontSize: 80,
    textAlign: 'center',
  },
  musicNotes: {
    position: 'absolute',
    top: -10,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'space-around',
    alignItems: 'center',
    flexDirection: 'row',
  },
  musicNote: {
    fontSize: 24,
    color: '#fbbf24',
    position: 'absolute',
  },
  uploadText: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  uploadSubtext: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 30,
  },
  uploadButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  fileInfoArea: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  audioIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  fileName: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  fileSize: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 16,
  },
  statusTextFailed: {
    fontSize: 16,
    color: '#ef4444',
    fontWeight: '600',
    marginBottom: 20,
  },
  statusTextSuccess: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
    marginBottom: 20,
  },
  progressText: {
    fontSize: 24,
    color: '#3b82f6',
    fontWeight: 'bold',
    marginBottom: 16,
  },
  progressBarContainer: {
    width: 200,
    height: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 4,
    marginBottom: 12,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  translatingStatusText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
    textAlign: 'center',
  },
  reuploadButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  reuploadButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  translateButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  translateButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  translatingButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
    opacity: 0.8,
  },
  translatingButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  transcriptPreviewArea: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  transcriptHeader: {
    marginBottom: 16,
  },
  transcriptTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  transcriptContainer: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  transcriptSegment: {
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  speakerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
    marginBottom: 8,
  },
  transcriptText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 22,
    marginBottom: 8,
  },
  timeStamp: {
    fontSize: 12,
    color: '#94a3b8',
    fontFamily: 'monospace',
  },
  audioControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  viewModeButtons: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    padding: 4,
  },
  viewModeButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  viewModeButtonActive: {
    backgroundColor: '#3b82f6',
  },
  viewModeButtonText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  viewModeButtonTextActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  playbackControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButtonIcon: {
    fontSize: 16,
    color: '#ffffff',
  },
  timeDisplay: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
    fontFamily: 'monospace',
  },
  downloadIconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  downloadIcon: {
    fontSize: 20,
  },
  bottomSection: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  languageSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  languageSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    minWidth: 100,
    justifyContent: 'center',
  },
  languageSelectorText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
    marginRight: 6,
  },
  languageSelectorArrow: {
    fontSize: 14,
    color: '#64748b',
  },
  languageSwitch: {
    marginHorizontal: 20,
    padding: 8,
  },
  languageSwitchIcon: {
    fontSize: 20,
    color: '#3b82f6',
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
  downloadPanel: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
  },
  downloadPanelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  downloadPanelTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  downloadPanelClose: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: 'bold',
  },
  downloadOptions: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 12,
  },
  downloadOption: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  downloadOptionIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  downloadOptionText: {
    fontSize: 16,
    color: '#1e293b',
    fontWeight: '500',
  },
});

export default AudioTranslationScreen; 