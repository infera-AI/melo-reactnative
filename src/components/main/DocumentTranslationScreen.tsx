/**
 * 文档翻译
 * T1.1.5：允许用户上传文档，并获取完整的翻译结果
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
import { WebView } from 'react-native-webview';
import { pick, types } from '@react-native-documents/picker';
import translateService from '../../api/services/translateService';
import type { TranslateDocumentRequest } from '../../api/services/translateService';
import realTimeTranslationService from '../../services/realTimeTranslationService';

interface DocumentTranslationScreenProps {
  onBack?: () => void;
  onTabSwitch?: (tab: string) => void;
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

type UploadStatus = 'empty' | 'failed' | 'success' | 'translating' | 'completed' | 'error';
type ViewMode = 'original' | 'translated';

interface FileInfo {
  name: string;
  type: string;
  size: number;
  icon: string;
  uri?: string;
  blob?: Blob;
}

interface TranslationResult {
  taskId: string;
  originalContent?: string;
  translatedContent?: string;
  downloadUrl?: string;
  pageCount?: string;
  requestId?: string;
  status?: string;
  errorMessage?: string;
}

const DocumentTranslationScreen: React.FC<DocumentTranslationScreenProps> = ({
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
  const [isTranslating, setIsTranslating] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('original');
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [translationResult, setTranslationResult] = useState<TranslationResult | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');

  // 动画相关
  const loadingAnimation = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;

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

  // 支持的语言列表
  const languages = [
    '中文', '英文', '日语', '韩语', 
    '法语', '德语', '西班牙语', '俄语'
  ];

  // 翻译状态轮询
  const statusPollingRef = useRef<NodeJS.Timeout | null>(null);

  // 清理轮询
  useEffect(() => {
    return () => {
      if (statusPollingRef.current) {
        clearInterval(statusPollingRef.current);
      }
      // 页面卸载时断开 WebSocket 连接
      realTimeTranslationService.close();
    };
  }, []);

  // 开始进度条动画
  const startProgressAnimation = () => {
    // 重置进度
    progressAnimation.setValue(0);
    
    // 创建循环动画，模拟翻译进度
    const animateProgress = () => {
      Animated.timing(progressAnimation, {
        toValue: 0.9, // 最多到90%，等待实际完成
        duration: 30000, // 30秒循环
        useNativeDriver: false,
      }).start(() => {
        if (isTranslating) {
          // 如果还在翻译中，重新开始动画
          progressAnimation.setValue(0);
          animateProgress();
        }
      });
    };
    
    animateProgress();
  };

  // 停止进度条动画
  const stopProgressAnimation = () => {
    Animated.timing(progressAnimation, {
      toValue: 1, // 完成到100%
      duration: 500,
      useNativeDriver: false,
    }).start();
  };

  // 轮询翻译状态
  const startStatusPolling = async (taskId: string) => {
    if (statusPollingRef.current) {
      clearInterval(statusPollingRef.current);
    }

    console.log('🔄 [DocumentTranslationScreen] 开始轮询翻译任务状态:', taskId);
    
    // 开始进度条动画
    startProgressAnimation();

    statusPollingRef.current = setInterval(async () => {
      try {
        console.log('🔍 [DocumentTranslationScreen] 轮询翻译任务状态:', taskId);
        
        // 使用getTranslationTask接口获取详细任务信息
        const response = await translateService.getTranslationTask(taskId);
        
        console.log('🔍 [DocumentTranslationScreen] 翻译任务状态响应:', JSON.stringify(response, null, 2));
        
        if (response.code !== 200) {
          console.error('❌ [DocumentTranslationScreen] 轮询失败，响应码:', response.code);
          throw new Error(response.message || '轮询翻译状态失败');
        }
        
        const taskData = response.data;
        const status = taskData.status;
        
        console.log('📊 [DocumentTranslationScreen] 任务状态:', status);
        console.log('📊 [DocumentTranslationScreen] 页面数:', taskData.page_count);
        console.log('📊 [DocumentTranslationScreen] 请求ID:', taskData.request_id);
        console.log('📊 [DocumentTranslationScreen] 翻译文件URL:', taskData.translate_file_url);
        
        // 更新翻译结果
        setTranslationResult(prev => ({
          ...prev!,
          taskId: taskData.task_id,
          pageCount: taskData.page_count,
          requestId: taskData.request_id,
          status: taskData.status,
          downloadUrl: taskData.translate_file_url,
          errorMessage: taskData.translate_error_message,
        }));
        
        // 检查翻译完成状态
        if (status === 'translated') {
          console.log('✅ [DocumentTranslationScreen] 翻译任务完成，状态为translated');
          setIsTranslating(false);
          setUploadStatus('completed');
          
          // 停止进度条动画
          stopProgressAnimation();
          
          // 获取翻译文件URL
          const translateFileUrl = taskData.translate_file_url;
          console.log('📥 [DocumentTranslationScreen] 翻译文件URL:', translateFileUrl);
          
          // 更新翻译结果
          setTranslationResult(prev => ({
            ...prev!,
            originalContent: '翻译已完成，请查看译文',
            translatedContent: '翻译内容已生成，请下载查看完整结果',
            downloadUrl: translateFileUrl,
            pageCount: taskData.page_count,
            requestId: taskData.request_id,
            status: taskData.status,
          }));
          
          // 停止轮询
          if (statusPollingRef.current) {
            clearInterval(statusPollingRef.current);
            statusPollingRef.current = null;
            console.log('🛑 [DocumentTranslationScreen] 轮询已停止（翻译完成）');
          }
          
          // 显示成功消息
          Alert.alert('翻译完成', '文档翻译已完成，可以查看和下载结果');
          return;
        }
        
        // 检查翻译失败状态
        if (status === 'failed') {
          console.error('❌ [DocumentTranslationScreen] 翻译任务失败');
          setIsTranslating(false);
          setUploadStatus('error');
          
          // 停止进度条动画
          stopProgressAnimation();
          
          const errorMessage = taskData.translate_error_message || '翻译失败';
          setErrorMessage(errorMessage);
          
          // 停止轮询
          if (statusPollingRef.current) {
            clearInterval(statusPollingRef.current);
            statusPollingRef.current = null;
            console.log('🛑 [DocumentTranslationScreen] 轮询已停止（翻译失败）');
          }
          
          Alert.alert('翻译失败', errorMessage);
          return;
        }
        
        console.log('⏳ [DocumentTranslationScreen] 翻译进行中，状态:', status);
        
      } catch (error: any) {
        console.error('❌ [DocumentTranslationScreen] 轮询翻译状态失败:', error);
        
        // 停止进度条动画
        stopProgressAnimation();
        
        setIsTranslating(false);
        setUploadStatus('error');
        setErrorMessage(error.message || '轮询翻译状态失败');
        
        // 停止轮询
        if (statusPollingRef.current) {
          clearInterval(statusPollingRef.current);
          statusPollingRef.current = null;
          console.log('🛑 [DocumentTranslationScreen] 轮询已停止（发生错误）');
        }
        
        Alert.alert('翻译失败', error.message || '轮询翻译状态失败');
      }
    }, 3000); // 每3秒轮询一次
  };

  // 翻译加载动画
  useEffect(() => {
    if (uploadStatus === 'translating' || isTranslating) {
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
  }, [uploadStatus, isTranslating, loadingAnimation]);

  // 真实文件选择
  const selectDocument = async (): Promise<FileInfo | null> => {

  };



  // 处理文件上传
  const handleFileUpload = async () => {
    try {
      setIsUploading(true);
      setErrorMessage('');
      
      // 选择真实文档
      const selectedFile = await selectDocument();
      
      if (!selectedFile) {
        setIsUploading(false);
        return;
      }

      console.log('📄 选择文件:', selectedFile);

      setFileInfo({uri: selectedFile.uri, name: selectedFile.name, type: selectedFile.type, size: selectedFile.size, icon: selectedFile.icon,});
      setUploadStatus('success');
      
      // 显示成功消息
      Alert.alert('上传成功', `已选择文件：${selectedFile.name}\n大小：${formatFileSize(selectedFile.size || 0)}`);
    } catch (error: any) {
      console.error('文件上传失败:', error);
      setUploadStatus('failed');
      setErrorMessage(error.message || '文件上传失败');
    } finally {
      setIsUploading(false);
    }
  };

  // 开始翻译
  const handleStartTranslation = async () => {
    if (!fileInfo) {
      Alert.alert('错误', '请先选择文件');
      return;
    }

    try {
      console.log('🚀 [DocumentTranslationScreen] 开始翻译文档...');
      console.log('📄 [DocumentTranslationScreen] 文件信息:', fileInfo);
      
      setIsTranslating(true);
      setUploadStatus('translating');
      setErrorMessage('');

      const sourceLanguage = languageMap[fromLanguage];
      const targetLanguage = languageMap[toLanguage];

      console.log('🌐 [DocumentTranslationScreen] 源语言:', sourceLanguage);
      console.log('🌐 [DocumentTranslationScreen] 目标语言:', targetLanguage);

      if (!sourceLanguage || !targetLanguage) {
        throw new Error('不支持的语言类型');
      }

      if (!fileInfo?.uri) {
        throw new Error('文件URI不可用');
      }

      const request: TranslateDocumentRequest = {
        source_language: sourceLanguage,
        target_language: targetLanguage,
        file: {
          uri: fileInfo.uri,
          name: fileInfo.name,
          type: fileInfo.type,
        },
      };

      console.log('📤 [DocumentTranslationScreen] 发送翻译请求:', JSON.stringify(request, null, 2));

      const response = await translateService.translateDocument(request);
      
      console.log('📥 [DocumentTranslationScreen] 翻译响应:', JSON.stringify(response, null, 2));
      
      if (response.code === 200 && response.data.task_id) {
        console.log('✅ [DocumentTranslationScreen] 翻译任务创建成功，任务ID:', response.data.task_id);
        
        setTranslationResult({
          taskId: response.data.task_id,
          status: response.data.status,
          requestId: response.data.request_id,
        });
        
        
        // 开始轮询状态
        startStatusPolling(response.data.task_id);
      } else {
        console.error('❌ [DocumentTranslationScreen] 翻译任务创建失败:', response);
        throw new Error(response.message || '翻译任务创建失败');
      }
    } catch (error: any) {
      console.error('❌ [DocumentTranslationScreen] 翻译失败:', error);
      setUploadStatus('error');
      setErrorMessage(error.message || '翻译失败');
      
      // 显示错误详情
      Alert.alert('翻译失败', error.message || '翻译失败，请重试');
    }
  };

  // 重新上传
  const handleReupload = () => {
    setUploadStatus('empty');
    setFileInfo(null);
    setIsTranslating(false);
    setTranslationResult(null);
    setErrorMessage('');
    
    if (statusPollingRef.current) {
      clearInterval(statusPollingRef.current);
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

  // 处理下载
  const handleDownload = async (format: string) => {
    if (!translationResult?.taskId) {
      Alert.alert('错误', '没有可下载的翻译结果');
      return;
    }

    try {
      setShowDownloadModal(false);
      
      if (translationResult.downloadUrl) {
        // 如果有直接的下载URL，使用它
        console.log('📥 使用直接下载URL:', translationResult.downloadUrl);
        Alert.alert(
          '下载准备完成', 
          `${format}格式的翻译文档已准备完成\n\n下载链接: ${translationResult.downloadUrl}`,
          [{ text: '确定', style: 'default' }]
        );
      } else {
        // 否则调用下载API
        console.log('📥 调用下载API:', translationResult.taskId);
        await translateService.downloadTranslationResult(translationResult.taskId);
        
        Alert.alert(
          '下载成功', 
          `${format}格式的翻译文档已准备完成\n\n在实际环境中，文件将保存到您的设备`,
          [{ text: '确定', style: 'default' }]
        );
      }
    } catch (error: any) {
      console.error('下载失败:', error);
      Alert.alert('下载失败', error.message || '下载翻译结果失败');
    }
  };

  // 获取文件图标
  const getFileIcon = (fileType: string) => {
    const iconMap: { [key: string]: string } = {
      'doc': '📝', 'docx': '📝',
      'pdf': '📄',
      'xls': '📊', 'xlsx': '📊',
      'ppt': '📑', 'pptx': '📑',
    };
    return iconMap[fileType] || '📄';
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
              <Text style={styles.downloadOptionText}>Word 文档</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.downloadOption}
              onPress={() => handleDownload('PDF')}
            >
              <Text style={styles.downloadOptionIcon}>📄</Text>
              <Text style={styles.downloadOptionText}>PDF 文档</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  // 渲染内容区域
  const renderContentArea = () => {
    switch (uploadStatus) {
      case 'empty':
        return (
          <View style={styles.uploadArea}>
            <Text style={styles.uploadIcon}>📁</Text>
            <Text style={styles.uploadText}>
              支持 doc/pdf/xls/ppt 等格式
            </Text>
            <Text style={styles.uploadSubtext}>
              （100M以内）
            </Text>
            <TouchableOpacity 
              style={[styles.uploadButton, isUploading && styles.uploadButtonDisabled]}
              onPress={handleFileUpload}
              disabled={isUploading}
            >
              <Text style={styles.uploadButtonText}>
                {isUploading ? '选择中...' : '上传文档'}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.noticeContainer}>
              <Text style={styles.noticeText}>
                📄 选择文档开始翻译
              </Text>
            </View>
          </View>
        );

      case 'failed':
        return (
          <View style={styles.fileInfoArea}>
            <Text style={styles.fileIcon}>
              {fileInfo ? getFileIcon(fileInfo.type) : '📄'}
            </Text>
            <Text style={styles.fileName}>{fileInfo?.name}</Text>
            <Text style={styles.fileSize}>
              {fileInfo ? formatFileSize(fileInfo.size) : ''}
            </Text>
            <Text style={styles.statusTextFailed}>上传失败</Text>
            {errorMessage && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}
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
            <Text style={styles.fileIcon}>
              {fileInfo ? getFileIcon(fileInfo.type) : '📄'}
            </Text>
            <Text style={styles.fileName}>{fileInfo?.name}</Text>
            <Text style={styles.fileSize}>
              {fileInfo ? formatFileSize(fileInfo.size) : ''}
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
            <Text style={styles.fileIcon}>
              {fileInfo ? getFileIcon(fileInfo.type) : '📄'}
            </Text>
            <Text style={styles.fileName}>{fileInfo?.name}</Text>
            <Text style={styles.fileSize}>
              {fileInfo ? formatFileSize(fileInfo.size) : ''}
            </Text>
            {/* 任务详情信息 */}
            {translationResult && (
              <View style={styles.taskInfoContainer}>
                <Text style={styles.taskInfoText}>
                  任务ID: {translationResult.taskId}
                </Text>
                {translationResult.pageCount && (
                  <Text style={styles.taskInfoText}>
                    页面数: {translationResult.pageCount}
                  </Text>
                )}
                {translationResult.status && (
                  <Text style={styles.taskInfoText}>
                    状态: {translationResult.status}
                  </Text>
                )}
              </View>
            )}
            {/* 横向进度条动画 */}
            <View style={styles.progressBarRow}>
              <View style={styles.progressBarBackground}>
                <Animated.View
                  style={[
                    styles.progressBarFill,
                    {
                      width: progressAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0%', '100%'],
                      }),
                    },
                  ]}
                />
              </View>
              <Animated.Text style={styles.progressPercentText}>
                {progressAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%'],
                })}
              </Animated.Text>
            </View>
            <Text style={styles.translatingText}>翻译进行中...</Text>
          </View>
        );

      case 'error':
        return (
          <View style={styles.fileInfoArea}>
            <Text style={styles.fileIcon}>❌</Text>
            <Text style={styles.fileName}>{fileInfo?.name || '翻译失败'}</Text>
            <Text style={styles.statusTextFailed}>翻译失败</Text>
            {errorMessage && (
              <Text style={styles.errorText}>{errorMessage}</Text>
            )}
            <TouchableOpacity 
              style={styles.reuploadButton}
              onPress={handleReupload}
            >
              <Text style={styles.reuploadButtonText}>重新开始</Text>
            </TouchableOpacity>
          </View>
        );

      case 'completed':
        // 判断是否为idocv预览链接
        const isIdocvPreview = !!(translationResult && translationResult.downloadUrl && translationResult.downloadUrl.startsWith('https://api.idocv.com/view/url?url='));
        
        // 检查是否为阿里云 OSS 链接
        const isOssUrl = !!(translationResult && translationResult.downloadUrl && 
                           (translationResult.downloadUrl.includes('oss-cn-hangzhou.aliyuncs.com') || 
                            translationResult.downloadUrl.includes('aliyuncs.com') ||
                            translationResult.downloadUrl.includes('translate-file-data')));
        
        return (
          <View style={styles.documentPreviewArea}>
            <View style={styles.documentHeader}>
              <Text style={styles.documentTitle}>{fileInfo?.name}</Text>
              <Text style={styles.documentSubtitle}>翻译完成</Text>
            </View>
            {/* 任务信息 */}
            {translationResult && (
              <View style={styles.taskInfoContainer}>
                <Text style={styles.taskInfoText}>
                  任务ID: {translationResult.taskId}
                </Text>
                {translationResult.requestId && (
                  <Text style={styles.taskInfoText}>
                    请求ID: {translationResult.requestId}
                  </Text>
                )}
                {translationResult.pageCount && (
                  <Text style={styles.taskInfoText}>
                    页面数: {translationResult.pageCount}
                  </Text>
                )}
                {translationResult.downloadUrl && (
                  <Text style={styles.taskInfoText}>
                    下载链接: {translationResult.downloadUrl}
                  </Text>
                )}
              </View>
            )}
            
            {/* 阿里云 OSS 文档预览 */}
            {isOssUrl && translationResult?.downloadUrl ? (
              handleOssDocumentPreview(translationResult.downloadUrl)
            ) : isIdocvPreview && translationResult ? (
              <View style={{ flex: 1, height: 400, borderRadius: 8, overflow: 'hidden', marginBottom: 16 }}>
                <WebView
                  source={{ uri: translationResult.downloadUrl! }}
                  style={{ flex: 1, borderRadius: 8 }}
                  startInLoadingState
                  renderLoading={() => <Text style={{ textAlign: 'center', marginTop: 20 }}>加载中...</Text>}
                />
              </View>
            ) : (
              <ScrollView style={styles.documentContent}>
                <Text style={styles.documentText}>
                  {viewMode === 'original' 
                    ? (translationResult?.originalContent || '原文内容') 
                    : (translationResult?.translatedContent || '翻译内容已生成，请下载查看完整结果')
                  }
                </Text>
              </ScrollView>
            )}
            
            <View style={styles.documentControls}>
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
              <TouchableOpacity 
                style={styles.downloadIconButton}
                onPress={() => setShowDownloadModal(true)}
              >
                <Text style={styles.downloadIcon}>⬇️</Text>
              </TouchableOpacity>
            </View>
            {/* 操作按钮 */}
            <View style={styles.completedActions}>
              <TouchableOpacity 
                style={styles.reuploadButton}
                onPress={handleReupload}
              >
                <Text style={styles.reuploadButtonText}>重新翻译</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.translateButton}
                onPress={() => setShowDownloadModal(true)}
              >
                <Text style={styles.translateButtonText}>下载结果</Text>
              </TouchableOpacity>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  // 处理阿里云 OSS 文档链接展示
  const handleOssDocumentPreview = (url: string) => {
    console.log('📄 [DocumentTranslationScreen] 处理阿里云 OSS 文档预览:', url);
    
    // 检查是否为阿里云 OSS 链接
    const isOssUrl = url.includes('oss-cn-hangzhou.aliyuncs.com') || 
                    url.includes('aliyuncs.com') ||
                    url.includes('translate-file-data');
    
    if (isOssUrl) {
      console.log('✅ [DocumentTranslationScreen] 检测到阿里云 OSS 链接，使用第三方预览服务');
      
      // 检查文件扩展名
      const isDocx = url.toLowerCase().includes('.docx') || url.toLowerCase().includes('.doc');
      const isPdf = url.toLowerCase().includes('.pdf');
      
      let previewUrl = url;
      
      // 如果是 Word 文档，使用第三方预览服务
      if (isDocx) {
        // 使用 Microsoft Office Online 预览
        previewUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(url)}`;
        console.log('📄 [DocumentTranslationScreen] 使用 Office Online 预览 Word 文档:', previewUrl);
      } else if (isPdf) {
        // PDF 可以直接在 WebView 中显示
        console.log('📄 [DocumentTranslationScreen] 直接预览 PDF 文档');
      } else {
        // 其他格式尝试使用 Google Docs Viewer
        previewUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
        console.log('📄 [DocumentTranslationScreen] 使用 Google Docs Viewer 预览文档:', previewUrl);
      }
      
      return (
        <View style={styles.ossDocumentPreview}>
          <View style={styles.ossDocumentHeader}>
            <Text style={styles.ossDocumentTitle}>文档预览</Text>
            <Text style={styles.ossDocumentSubtitle}>
              {isDocx ? 'Word 文档 (Office Online 预览)' : 
               isPdf ? 'PDF 文档' : '文档预览'}
            </Text>
          </View>
          <View style={styles.ossWebViewContainer}>
            <WebView
              source={{ uri: previewUrl }}
              style={styles.ossWebView}
              startInLoadingState={true}
              renderLoading={() => (
                <View style={styles.ossLoadingContainer}>
                  <Text style={styles.ossLoadingText}>正在加载文档...</Text>
                  <Text style={styles.ossLoadingSubtext}>
                    {isDocx ? '使用 Office Online 预览服务' : '加载中...'}
                  </Text>
                </View>
              )}
              onError={(syntheticEvent: any) => {
                const { nativeEvent } = syntheticEvent;
                console.error('❌ [DocumentTranslationScreen] WebView 加载失败:', nativeEvent);
                Alert.alert(
                  '加载失败', 
                  '文档预览加载失败，可能是网络问题或文档格式不支持。\n\n请尝试下载文档后使用本地应用打开。',
                  [
                    { text: '下载文档', onPress: () => handleOssDownload(url) },
                    { text: '取消', style: 'cancel' }
                  ]
                );
              }}
              onLoadEnd={() => {
                console.log('✅ [DocumentTranslationScreen] 文档加载完成');
              }}
              // 允许混合内容（HTTP/HTTPS）
              mixedContentMode="compatibility"
              // 允许第三方 Cookie
              thirdPartyCookiesEnabled={true}
              // 允许 JavaScript
              javaScriptEnabled={true}
              // 允许 DOM 存储
              domStorageEnabled={true}
            />
          </View>
          <View style={styles.ossDocumentActions}>
            <TouchableOpacity 
              style={styles.ossDownloadButton}
              onPress={() => handleOssDownload(url)}
            >
              <Text style={styles.ossDownloadButtonText}>下载文档</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.ossShareButton}
              onPress={() => handleOssShare(url)}
            >
              <Text style={styles.ossShareButtonText}>分享</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={styles.ossOpenButton}
              onPress={() => handleOssOpenInBrowser(url)}
            >
              <Text style={styles.ossOpenButtonText}>浏览器打开</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }
    
    return null;
  };

  // 在浏览器中打开文档
  const handleOssOpenInBrowser = (url: string) => {
    console.log('🌐 [DocumentTranslationScreen] 在浏览器中打开文档:', url);
    
    // 这里可以集成 react-native-linking 来打开外部浏览器
    Alert.alert(
      '在浏览器中打开',
      `文档链接：\n\n${url}\n\n请复制链接到浏览器中打开`,
      [
        { text: '复制链接', onPress: () => {
          console.log('📋 [DocumentTranslationScreen] 复制链接到剪贴板');
          // 这里可以集成剪贴板功能
        }},
        { text: '取消', style: 'cancel' }
      ]
    );
  };

  // 处理阿里云 OSS 文档下载
  const handleOssDownload = async (url: string) => {
    try {
      console.log('📥 [DocumentTranslationScreen] 开始下载阿里云 OSS 文档:', url);
      
      // 这里可以集成 react-native-fs 或其他下载库
      // 目前先显示下载链接
      Alert.alert(
        '下载文档',
        `文档下载链接已准备完成\n\n${url}\n\n请复制链接到浏览器下载`,
        [
          { text: '复制链接', onPress: () => {
            // 这里可以集成剪贴板功能
            console.log('📋 [DocumentTranslationScreen] 复制下载链接到剪贴板');
          }},
          { text: '取消', style: 'cancel' }
        ]
      );
    } catch (error: any) {
      console.error('❌ [DocumentTranslationScreen] 下载失败:', error);
      Alert.alert('下载失败', error.message || '下载文档失败');
    }
  };

  // 处理阿里云 OSS 文档分享
  const handleOssShare = (url: string) => {
    console.log('📤 [DocumentTranslationScreen] 分享阿里云 OSS 文档:', url);
    
    // 这里可以集成分享功能
    Alert.alert(
      '分享文档',
      `文档分享链接：\n\n${url}`,
      [
        { text: '复制链接', onPress: () => {
          console.log('📋 [DocumentTranslationScreen] 复制分享链接到剪贴板');
        }},
        { text: '取消', style: 'cancel' }
      ]
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

        {/* 模式显示 */}
        <View style={styles.modeDisplay}>
          <Text style={styles.modeText}>文档翻译</Text>
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
  uploadIcon: {
    fontSize: 80,
    marginBottom: 20,
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
  uploadButtonDisabled: {
    opacity: 0.7,
  },
  fileInfoArea: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  fileIcon: {
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
  translatingText: {
    fontSize: 18,
    color: '#3b82f6',
    fontWeight: '600',
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    gap: 8,
  },
  loadingDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3b82f6',
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
  documentPreviewArea: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  documentHeader: {
    marginBottom: 16,
  },
  documentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  documentSubtitle: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  documentContent: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  documentText: {
    fontSize: 14,
    color: '#1e293b',
    lineHeight: 22,
  },
  documentControls: {
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
  pageIndicator: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
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
  errorText: {
    fontSize: 14,
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  noticeContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#e0f2fe',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#cce5ff',
  },
  noticeText: {
    fontSize: 14,
    color: '#007bff',
    textAlign: 'center',
  },
  learnMoreText: {
    fontSize: 14,
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
  taskInfoContainer: {
    marginBottom: 16,
    paddingHorizontal: 10,
    paddingVertical: 8,
    backgroundColor: '#f1f5f9',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  taskInfoText: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 4,
  },
  completedActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    gap: 12,
  },
  ossDocumentPreview: {
    flex: 1,
    width: '100%',
    paddingHorizontal: 16,
    paddingVertical: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  ossDocumentHeader: {
    marginBottom: 16,
  },
  ossDocumentTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    textAlign: 'center',
  },
  ossDocumentSubtitle: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 4,
  },
  ossWebViewContainer: {
    flex: 1,
    borderRadius: 8,
    overflow: 'hidden',
  },
  ossWebView: {
    flex: 1,
  },
  ossLoadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  ossLoadingText: {
    fontSize: 16,
    color: '#64748b',
  },
  ossLoadingSubtext: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 8,
  },
  ossDocumentActions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  ossDownloadButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  ossDownloadButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  ossShareButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  ossShareButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  ossOpenButton: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  ossOpenButtonText: {
    color: '#64748b',
    fontSize: 16,
    fontWeight: '600',
  },
  progressContainer: {
    alignItems: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
  progressBarContainer: {
    width: '100%',
    marginBottom: 20,
    alignItems: 'center',
  },
  progressBarBackground: {
    width: '100%',
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563eb',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#64748b',
    fontWeight: '500',
  },
  translationStatusContainer: {
    width: '100%',
    marginTop: 20,
  },
  statusStep: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  statusStepIcon: {
    fontSize: 20,
    marginRight: 12,
    width: 24,
    textAlign: 'center',
  },
  statusStepText: {
    fontSize: 14,
    color: '#1e293b',
    fontWeight: '500',
    flex: 1,
  },
  statusStepCheck: {
    fontSize: 16,
    color: '#10b981',
    fontWeight: 'bold',
  },
  statusStepLoading: {
    marginLeft: 'auto',
  },
  statusStepPending: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: 'bold',
  },
  progressBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 32,
    marginBottom: 16,
  },
  progressBarBackground: {
    flex: 1,
    height: 12,
    backgroundColor: '#e2e8f0',
    borderRadius: 6,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#2563eb', // 纯蓝色
    borderRadius: 6,
  },
  progressPercentText: {
    marginLeft: 12,
    fontSize: 16,
    color: '#2563eb',
    fontWeight: 'bold',
    width: 60,
    textAlign: 'left',
  },
});

export default DocumentTranslationScreen; 