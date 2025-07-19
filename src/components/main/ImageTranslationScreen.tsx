/**
 * 图像翻译
 * T1.1.7：通过摄像头识别并翻译图像中的文字
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
  Image,
} from 'react-native';
import { takePhoto, selectFromGallery, validateImages, formatFileSize, ImageInfo } from '../../services/imageService';
import translateService, { TranslateImageRequest, GetImageTranslationDetailsRequest } from '../../api/services/translateService';

interface ImageTranslationScreenProps {
  onBack?: () => void;
  onTabSwitch?: (tab: string) => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type UploadStatus = 'empty' | 'success' | 'translating' | 'completed';

interface TextRegion {
  id: string;
  text: string;
  translatedText: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

const ImageTranslationScreen: React.FC<ImageTranslationScreenProps> = ({
  onBack,
  onTabSwitch,
}) => {
  const [activeTab, setActiveTab] = useState('translation');
  const [uploadStatus, setUploadStatus] = useState<UploadStatus>('empty');
  const [fromLanguage, setFromLanguage] = useState('中文');
  const [toLanguage, setToLanguage] = useState('英文');
  const [showFromLanguageSelector, setShowFromLanguageSelector] = useState(false);
  const [showToLanguageSelector, setShowToLanguageSelector] = useState(false);
  const [selectedImages, setSelectedImages] = useState<ImageInfo[]>([]);
  const [textRegions, setTextRegions] = useState<TextRegion[]>([]);
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [_currentTaskId, setCurrentTaskId] = useState<string>('');
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  const [translatedText, setTranslatedText] = useState<string>('');

  // 动画相关
  const loadingAnimation = useRef(new Animated.Value(0)).current;
  const fadeAnimation = useRef(new Animated.Value(0)).current;

  // 支持的语言列表
  const languages = [
    '中文', '英语', '日语', '韩语', 
    '法语', '德语', '西班牙语', '俄语'
  ];

  // 翻译动画
  useEffect(() => {
    if (uploadStatus === 'translating') {
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
        loadingLoop.stop();
      };
    }
  }, [uploadStatus, loadingAnimation]);

  // 组件卸载时清理轮询
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // 处理拍照
  const handleTakePhoto = async () => {
  };

  // 处理相册选择
  const handleSelectFromGallery = async () => {
  };

  // 开始翻译
  const handleStartTranslation = async () => {
    setUploadStatus('translating');
    setTextRegions([]);
    
    try {
      const request: TranslateImageRequest = {
        source_language: fromLanguage,
        target_language: toLanguage,
        img_files: selectedImages,
      };
      
      const res = await translateService.translateImage(request);
      console.log('翻译请求结果:', res);
      
      if (res.code === 200 && res.data.task_id) {
        setCurrentTaskId(res.data.task_id);
        // 开始轮询获取翻译结果
        startPollingTranslationResult(res.data.task_id);
      } else {
        throw new Error(res.message || '获取任务ID失败');
      }
    } catch (error) {
      console.error('翻译失败:', error);
      Alert.alert('翻译失败', '图片翻译请求失败，请重试');
      setUploadStatus('success');
    }
  };

  // 开始轮询翻译结果
  const startPollingTranslationResult = (taskId: string) => {
    // 清除之前的轮询
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }

    const interval = setInterval(async () => {
      try {
        const request: GetImageTranslationDetailsRequest = {
          task_id: taskId
        };
        
        const response = await translateService.getImageTranslationDetails(request);
        console.log('轮询翻译结果:', response);
        
        if (response.code === 200 && response.data.status === 'finished') {
          // 翻译完成，停止轮询
          clearInterval(interval);
          setPollingInterval(null);
          
          // 处理翻译结果
          handleTranslationComplete(response.data);
        } else if (response.code === 200 && response.data.status === 'error') {
          // 翻译出错，停止轮询
          clearInterval(interval);
          setPollingInterval(null);
          throw new Error('翻译过程中出现错误');
        }
        // 如果状态是其他值（如 'processing'），继续轮询
      } catch (error) {
        console.error('轮询翻译结果失败:', error);
        clearInterval(interval);
        setPollingInterval(null);
        Alert.alert('翻译失败', '获取翻译结果失败，请重试');
        setUploadStatus('success');
      }
    }, 2000); // 每2秒轮询一次

    setPollingInterval(interval);
  };

  // 处理翻译完成
  const handleTranslationComplete = (data: any) => {
    try {
      if (data.results && Array.isArray(data.results)) {
        // 合并所有result的template_json（解析后）或message为一个大文本
        const mergedText = data.results.map((result: any) => {
          if (result.template_json) {
            try {
              const tpl = JSON.parse(result.template_json);
              // 支持template_json为字符串或对象
              if (typeof tpl === 'string') return tpl;
              if (tpl.translated_text) return tpl.translated_text;
              return JSON.stringify(tpl);
            } catch {
              return result.template_json;
            }
          }
          return result.message || '';
        }).filter(Boolean).join('\n\n');
        setTranslatedText(mergedText);
        setUploadStatus('completed');
        // 淡入动画
        Animated.timing(fadeAnimation, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }).start();
      } else {
        throw new Error('翻译结果格式错误');
      }
    } catch (error) {
      console.error('处理翻译结果失败:', error);
      Alert.alert('翻译失败', '处理翻译结果失败，请重试');
      setUploadStatus('success');
    }
  };

  // 重新上传
  const handleReupload = () => {
    // 清除轮询
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
    
    setUploadStatus('empty');
    setSelectedImages([]);
    setTextRegions([]);
    setCurrentTaskId('');
    fadeAnimation.setValue(0);
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

  // 处理图片点击
  const handleImagePress = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
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

  // 渲染图片预览弹窗
  const renderImageModal = () => (
    <Modal
      visible={showImageModal}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setShowImageModal(false)}
    >
      <View style={styles.imageModalContainer}>
        <TouchableOpacity 
          style={styles.imageModalBackdrop}
          onPress={() => setShowImageModal(false)}
          activeOpacity={1}
        >
          <View style={styles.imageModalContent}>
            <View style={styles.imageModalHeader}>
              <Text style={styles.imageModalTitle}>
                图片 {selectedImageIndex + 1} / {selectedImages.length}
              </Text>
              <TouchableOpacity onPress={() => setShowImageModal(false)}>
                <Text style={styles.imageModalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.imageContainer}>
              <Image 
                source={{ uri: selectedImages[selectedImageIndex]?.uri }}
                style={styles.fullImage}
                resizeMode="contain"
              />
              
              {/* 文字识别区域叠加层 */}
              {uploadStatus === 'completed' && (
                <View style={styles.textOverlay}>
                  {textRegions.map((region) => (
                    <View
                      key={region.id}
                      style={[
                        styles.textRegion,
                        {
                          left: region.boundingBox.x,
                          top: region.boundingBox.y,
                          width: region.boundingBox.width,
                          height: region.boundingBox.height,
                        }
                      ]}
                    >
                      <Text style={styles.recognizedText}>
                        {region.text}
                      </Text>
                      <Text style={styles.translatedTextOverlay}>
                        {region.translatedText}
                      </Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          </View>
        </TouchableOpacity>
      </View>
    </Modal>
  );

  // 渲染图片网格
  const renderImageGrid = () => {
    if (selectedImages.length === 0) return null;

    return (
      <View style={styles.imageGrid}>
        {selectedImages.map((image, index) => (
          <TouchableOpacity
            key={image.id}
            style={styles.imageGridItem}
            onPress={() => handleImagePress(index)}
          >
            <Image 
              source={{ uri: image.uri }}
              style={styles.gridImage}
              resizeMode="cover"
            />
            <View style={styles.imageInfo}>
              <Text style={styles.imageName} numberOfLines={1}>
                {image.name}
              </Text>
              <Text style={styles.imageSize}>
                {formatFileSize(image.size)}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  // 渲染翻译结果
  const renderTranslationResults = () => {
    if (!translatedText) return null;
    return (
      <Animated.View 
        style={[
          styles.translationResults,
          { opacity: fadeAnimation }
        ]}
      >
        <Text style={styles.resultsTitle}>翻译结果</Text>
        <ScrollView style={styles.resultsContainer}>
          <Text style={styles.bigTranslatedText}>{translatedText}</Text>
        </ScrollView>
      </Animated.View>
    );
  };

  // 渲染内容区域
  const renderContentArea = () => {
    switch (uploadStatus) {
      case 'empty':
        return (
          <View style={styles.uploadArea}>
            <Text style={styles.imageIcon}>📷</Text>
            <Text style={styles.uploadTip}>请在光线较好的条件下拍摄照片</Text>
            <Text style={styles.uploadSubtip}>相册上传支持多选，不超过3张</Text>
            
            <View style={styles.uploadButtons}>
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={handleTakePhoto}
              >
                <Text style={styles.uploadButtonIcon}>📸</Text>
                <Text style={styles.uploadButtonText}>拍照</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.uploadButton}
                onPress={handleSelectFromGallery}
              >
                <Text style={styles.uploadButtonIcon}>🖼️</Text>
                <Text style={styles.uploadButtonText}>相册</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      case 'success':
        return (
          <View style={styles.successArea}>
            {renderImageGrid()}
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
          <View style={styles.translatingArea}>
            {renderImageGrid()}
            <Animated.Text 
              style={[
                styles.statusTextTranslating,
                {
                  opacity: loadingAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.4, 1, 0.4],
                  })
                }
              ]}
            >
              翻译中...
            </Animated.Text>
            <Text style={styles.translatingSubtext}>
              正在识别图像中的文字并进行翻译
            </Text>
          </View>
        );

      case 'completed':
        return (
          <View style={styles.completedArea}>
            {renderImageGrid()}
            {renderTranslationResults()}
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
          <Text style={styles.modeText}>图像翻译</Text>
        </View>
      </View>

      {/* 内容区域 */}
      <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
        {renderContentArea()}
      </ScrollView>

      {/* 底部区域 */}
      <View style={styles.bottomSection}>
        {/* 语言选择器 */}
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

      {/* 图片预览弹窗 */}
      {renderImageModal()}
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
  },
  uploadArea: {
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  imageIcon: {
    fontSize: 80,
    marginBottom: 30,
  },
  uploadTip: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    marginBottom: 8,
  },
  uploadSubtip: {
    fontSize: 14,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 40,
  },
  uploadButtons: {
    flexDirection: 'row',
    gap: 20,
  },
  uploadButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    minWidth: 100,
  },
  uploadButtonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  uploadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  successArea: {
    padding: 20,
    alignItems: 'center',
  },
  translatingArea: {
    padding: 20,
    alignItems: 'center',
  },
  completedArea: {
    padding: 20,
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  imageGridItem: {
    width: (SCREEN_WIDTH - 80) / 3,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  gridImage: {
    width: '100%',
    height: 80,
  },
  imageInfo: {
    padding: 8,
  },
  imageName: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '500',
  },
  imageSize: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
  },
  statusTextSuccess: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: '600',
    marginBottom: 20,
  },
  statusTextTranslating: {
    fontSize: 18,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 12,
  },
  translatingSubtext: {
    fontSize: 14,
    color: '#64748b',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
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
  translationResults: {
    marginTop: 20,
  },
  resultsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 16,
    textAlign: 'center',
  },
  resultsContainer: {
    maxHeight: 300,
  },
  resultItem: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  resultHeader: {
    marginBottom: 12,
  },
  resultIndex: {
    fontSize: 14,
    fontWeight: '600',
    color: '#3b82f6',
  },
  textPair: {
    marginBottom: 8,
  },
  originalTextLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 4,
  },
  originalText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 20,
    marginBottom: 8,
  },
  translatedTextLabel: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
    marginBottom: 4,
  },
  translatedText: {
    fontSize: 14,
    color: '#3b82f6',
    lineHeight: 20,
    fontWeight: '500',
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
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
  },
  imageModalBackdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageModalContent: {
    width: SCREEN_WIDTH * 0.95,
    height: SCREEN_HEIGHT * 0.85,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imageModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    backgroundColor: '#ffffff',
  },
  imageModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  imageModalClose: {
    fontSize: 18,
    color: '#64748b',
    fontWeight: 'bold',
  },
  imageContainer: {
    flex: 1,
    position: 'relative',
  },
  fullImage: {
    width: '100%',
    height: '100%',
  },
  textOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  textRegion: {
    position: 'absolute',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 4,
    padding: 4,
    justifyContent: 'center',
  },
  recognizedText: {
    fontSize: 12,
    color: '#1e293b',
    fontWeight: '600',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
    marginBottom: 2,
  },
  translatedTextOverlay: {
    fontSize: 11,
    color: '#3b82f6',
    fontWeight: '500',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
  bigTranslatedText: {
    fontSize: 15,
    color: '#222',
    lineHeight: 22,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
});

export default ImageTranslationScreen; 