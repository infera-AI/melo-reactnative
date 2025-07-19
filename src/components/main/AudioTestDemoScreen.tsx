/**
 * 音频测试Demo界面
 * 提供WebSocket音频流测试功能，支持用户上传音频文件
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
  Modal,
  ActivityIndicator,
} from 'react-native';
import DocumentPicker from '@react-native-documents/picker';
import realTimeTranslationService from '../../services/realTimeTranslationService';
import type { RealTimeTranslationConfig, RealTimeTranslationResponse } from '../../api/services/translateService';
import audioRecordingService from '../../services/audioRecordingService';
import type { AudioConfig } from '../../services/audioRecordingService';

interface AudioTestDemoScreenProps {
  onBack?: () => void;
}

interface AudioFileInfo {
  name: string;
  size: number;
  type: string;
  uri: string;
}

interface TestResult {
  id: string;
  timestamp: number;
  status: 'success' | 'error' | 'timeout';
  message: string;
  duration?: number;
  fileSize?: number;
}

const AudioTestDemoScreen: React.FC<AudioTestDemoScreenProps> = ({
  onBack,
}) => {
  const [selectedFile, setSelectedFile] = useState<AudioFileInfo | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  const [progress, setProgress] = useState(0);
  const [showResultsModal, setShowResultsModal] = useState(false);

  // 动画相关
  const progressAnimation = useRef(new Animated.Value(0)).current;
  const testButtonScale = useRef(new Animated.Value(1)).current;

  // 音频配置
  const audioConfig: AudioConfig = {
    sampleRate: 16000,
    channels: 1,
    bitsPerSample: 16,
    format: 'opus',
  };

  // 支持的文件格式
  const supportedFormats = ['mp3', 'wav', 'm4a', 'aac', 'ogg'];

  // 选择音频文件
  const handleSelectAudioFile = async () => {
    try {
      const result = await DocumentPicker.pick({
        type: [DocumentPicker.types.audio],
        copyTo: 'cachesDirectory',
      });

      if (result && result.length > 0) {
        const file = result[0];
        const fileExtension = file.name?.split('.').pop()?.toLowerCase();
        
        if (!fileExtension || !supportedFormats.includes(fileExtension)) {
          Alert.alert('格式不支持', `请选择支持的音频格式: ${supportedFormats.join(', ')}`);
          return;
        }

        setSelectedFile({
          name: file.name || '未知文件',
          size: file.size || 0,
          type: fileExtension,
          uri: file.fileCopyUri || file.uri || '',
        });

        console.log('✅ 选择音频文件:', file.name, '大小:', file.size, '字节');
      }
    } catch (error) {
      if (!DocumentPicker.isCancel(error)) {
        console.error('❌ 选择文件失败:', error);
        Alert.alert('选择失败', '无法选择音频文件，请重试');
      }
    }
  };

  // 初始化WebSocket连接
  const initializeConnection = async (): Promise<boolean> => {
    try {
      setConnectionStatus('connecting');
      
      // 获取用户token
      const tokenStorage = require('../../utils/tokenStorage').default;
      const actionToken = await tokenStorage.getActionToken();
      
      if (!actionToken) {
        throw new Error('未找到有效的认证token，请先登录');
      }

      // 配置实时翻译
      const realTimeConfig: RealTimeTranslationConfig = {
        source_language: 'zh',
        target_language: 'en',
        format: selectedFile?.type || 'mp3',
        sample_rate: audioConfig.sampleRate,
      };

      // 初始化连接
      const conversationId = await realTimeTranslationService.initialize(
        realTimeConfig,
        actionToken,
        'AudioTestDemo',
        {
          onOpen: () => {
            console.log('✅ WebSocket连接已建立');
            setConnectionStatus('connected');
          },
          onMessage: (response: RealTimeTranslationResponse) => {
            console.log('📥 收到翻译响应:', response);
          },
          onError: (error: string) => {
            console.error('❌ WebSocket错误:', error);
            setConnectionStatus('error');
          },
          onClose: () => {
            console.log('🔌 WebSocket连接已关闭');
            setConnectionStatus('disconnected');
          },
        }
      );

      console.log('✅ 连接初始化成功，会话ID:', conversationId);
      return true;
    } catch (error: any) {
      console.error('❌ 连接初始化失败:', error);
      setConnectionStatus('error');
      Alert.alert('连接失败', error.message);
      return false;
    }
  };

  // 发送音频文件
  const sendAudioFile = async (): Promise<boolean> => {
    if (!selectedFile) {
      Alert.alert('错误', '请先选择音频文件');
      return false;
    }

    try {
      // 读取文件
      const RNFS = require('react-native-fs');
      const audioData = await RNFS.readFile(selectedFile.uri, 'base64');
      const audioBuffer = Buffer.from(audioData, 'base64');
      
      console.log('📁 读取音频文件成功，大小:', audioBuffer.length, '字节');

      // 分块发送
      const CHUNK_SIZE = 4096;
      const numChunks = Math.ceil(audioBuffer.length / CHUNK_SIZE);
      let sentChunks = 0;

      for (let i = 0; i < numChunks; i++) {
        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, audioBuffer.length);
        const chunk = audioBuffer.slice(start, end);
        
        // 发送音频数据
        realTimeTranslationService.sendAudioData(chunk);
        
        sentChunks++;
        const newProgress = (sentChunks / numChunks) * 100;
        setProgress(newProgress);
        
        // 更新进度条动画
        Animated.timing(progressAnimation, {
          toValue: newProgress / 100,
          duration: 100,
          useNativeDriver: false,
        }).start();
        
        // 等待一小段时间避免过载
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // 发送结束标记
      realTimeTranslationService.sendFinish();
      console.log('✅ 音频文件发送完成');
      
      return true;
    } catch (error: any) {
      console.error('❌ 发送音频文件失败:', error);
      Alert.alert('发送失败', error.message);
      return false;
    }
  };

  // 执行测试
  const handleRunTest = async () => {
    if (!selectedFile) {
      Alert.alert('请选择文件', '请先选择一个音频文件进行测试');
      return;
    }

    setIsTesting(true);
    setProgress(0);
    progressAnimation.setValue(0);

    const testStartTime = Date.now();
    const testId = `test_${Date.now()}`;

    try {
      console.log('🚀 开始音频测试...');
      
      // 初始化连接
      const connectionSuccess = await initializeConnection();
      if (!connectionSuccess) {
        throw new Error('连接初始化失败');
      }

      // 等待连接稳定
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 发送音频文件
      const sendSuccess = await sendAudioFile();
      if (!sendSuccess) {
        throw new Error('音频文件发送失败');
      }

      // 等待处理完成
      await new Promise(resolve => setTimeout(resolve, 2000));

      const testDuration = Date.now() - testStartTime;
      
      // 记录成功结果
      const successResult: TestResult = {
        id: testId,
        timestamp: Date.now(),
        status: 'success',
        message: '测试成功完成',
        duration: testDuration,
        fileSize: selectedFile.size,
      };

      setTestResults(prev => [successResult, ...prev]);
      console.log('✅ 测试成功完成，耗时:', testDuration, 'ms');

    } catch (error: any) {
      const testDuration = Date.now() - testStartTime;
      
      // 记录错误结果
      const errorResult: TestResult = {
        id: testId,
        timestamp: Date.now(),
        status: 'error',
        message: error.message || '测试失败',
        duration: testDuration,
        fileSize: selectedFile.size,
      };

      setTestResults(prev => [errorResult, ...prev]);
      console.error('❌ 测试失败:', error);
    } finally {
      setIsTesting(false);
      setProgress(0);
      progressAnimation.setValue(0);
    }
  };

  // 清除测试结果
  const handleClearResults = () => {
    setTestResults([]);
  };

  // 格式化文件大小
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // 格式化时间
  const formatDuration = (ms: number): string => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // 渲染测试结果
  const renderTestResult = (result: TestResult) => (
    <View key={result.id} style={[
      styles.resultItem,
      result.status === 'success' ? styles.resultSuccess : styles.resultError
    ]}>
      <View style={styles.resultHeader}>
        <Text style={styles.resultStatus}>
          {result.status === 'success' ? '✅' : '❌'} {result.status === 'success' ? '成功' : '失败'}
        </Text>
        <Text style={styles.resultTime}>
          {new Date(result.timestamp).toLocaleTimeString()}
        </Text>
      </View>
      <Text style={styles.resultMessage}>{result.message}</Text>
      <View style={styles.resultDetails}>
        {result.duration && (
          <Text style={styles.resultDetail}>耗时: {formatDuration(result.duration)}</Text>
        )}
        {result.fileSize && (
          <Text style={styles.resultDetail}>文件: {formatFileSize(result.fileSize)}</Text>
        )}
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* 顶部导航 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backIcon}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>音频测试Demo</Text>
        <TouchableOpacity 
          style={styles.resultsButton}
          onPress={() => setShowResultsModal(true)}
        >
          <Text style={styles.resultsButtonText}>结果</Text>
        </TouchableOpacity>
      </View>

      {/* 主要内容 */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 连接状态 */}
        <View style={styles.statusSection}>
          <Text style={styles.sectionTitle}>连接状态</Text>
          <View style={styles.statusContainer}>
            <View style={[
              styles.statusDot,
              connectionStatus === 'connected' && styles.statusDotConnected,
              connectionStatus === 'connecting' && styles.statusDotConnecting,
              connectionStatus === 'error' && styles.statusDotError,
            ]} />
            <Text style={styles.statusText}>
              {connectionStatus === 'connected' && '已连接'}
              {connectionStatus === 'connecting' && '连接中...'}
              {connectionStatus === 'disconnected' && '未连接'}
              {connectionStatus === 'error' && '连接错误'}
            </Text>
          </View>
        </View>

        {/* 文件选择 */}
        <View style={styles.fileSection}>
          <Text style={styles.sectionTitle}>音频文件</Text>
          {selectedFile ? (
            <View style={styles.selectedFile}>
              <Text style={styles.fileName}>{selectedFile.name}</Text>
              <Text style={styles.fileInfo}>
                {formatFileSize(selectedFile.size)} • {selectedFile.type.toUpperCase()}
              </Text>
              <TouchableOpacity 
                style={styles.changeFileButton}
                onPress={handleSelectAudioFile}
              >
                <Text style={styles.changeFileButtonText}>更换文件</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.selectFileButton}
              onPress={handleSelectAudioFile}
            >
              <Text style={styles.selectFileButtonText}>选择音频文件</Text>
              <Text style={styles.selectFileButtonSubtext}>
                支持 {supportedFormats.join(', ').toUpperCase()} 格式
              </Text>
            </TouchableOpacity>
          )}
        </View>

        {/* 测试进度 */}
        {isTesting && (
          <View style={styles.progressSection}>
            <Text style={styles.sectionTitle}>测试进度</Text>
            <View style={styles.progressContainer}>
              <Animated.View 
                style={[
                  styles.progressBar,
                  { width: progressAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: ['0%', '100%'],
                  })}
                ]} 
              />
            </View>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        )}

        {/* 操作按钮 */}
        <View style={styles.actionSection}>
          <TouchableOpacity 
            style={[
              styles.testButton,
              (!selectedFile || isTesting) && styles.testButtonDisabled
            ]}
            onPress={handleRunTest}
            disabled={!selectedFile || isTesting}
          >
            {isTesting ? (
              <ActivityIndicator color="#ffffff" size="small" />
            ) : (
              <Text style={styles.testButtonText}>开始测试</Text>
            )}
          </TouchableOpacity>
        </View>

        {/* 使用说明 */}
        <View style={styles.helpSection}>
          <Text style={styles.sectionTitle}>使用说明</Text>
          <Text style={styles.helpText}>
            1. 选择要测试的音频文件{'\n'}
            2. 点击"开始测试"按钮{'\n'}
            3. 系统将自动连接WebSocket并发送音频{'\n'}
            4. 查看测试结果和连接状态
          </Text>
        </View>
      </ScrollView>

      {/* 测试结果模态框 */}
      <Modal
        visible={showResultsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowResultsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>测试结果</Text>
              <TouchableOpacity 
                onPress={() => setShowResultsModal(false)}
                style={styles.modalCloseButton}
              >
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalBody}>
              {testResults.length === 0 ? (
                <Text style={styles.noResultsText}>暂无测试结果</Text>
              ) : (
                testResults.map(renderTestResult)
              )}
            </ScrollView>
            
            {testResults.length > 0 && (
              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.clearButton}
                  onPress={handleClearResults}
                >
                  <Text style={styles.clearButtonText}>清除结果</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  backButton: {
    padding: 8,
  },
  backIcon: {
    fontSize: 24,
    color: '#374151',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  resultsButton: {
    padding: 8,
  },
  resultsButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statusSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 12,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
  },
  statusDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#94a3b8',
    marginRight: 12,
  },
  statusDotConnected: {
    backgroundColor: '#10b981',
  },
  statusDotConnecting: {
    backgroundColor: '#f59e0b',
  },
  statusDotError: {
    backgroundColor: '#ef4444',
  },
  statusText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  fileSection: {
    marginBottom: 24,
  },
  selectFileButton: {
    borderWidth: 2,
    borderColor: '#d1d5db',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  selectFileButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 4,
  },
  selectFileButtonSubtext: {
    fontSize: 14,
    color: '#6b7280',
  },
  selectedFile: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 16,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#111827',
    marginBottom: 4,
  },
  fileInfo: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  changeFileButton: {
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#3b82f6',
    borderRadius: 8,
  },
  changeFileButtonText: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '500',
  },
  progressSection: {
    marginBottom: 24,
  },
  progressContainer: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#3b82f6',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  actionSection: {
    marginBottom: 24,
  },
  testButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  testButtonDisabled: {
    backgroundColor: '#9ca3af',
  },
  testButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  helpSection: {
    marginBottom: 24,
  },
  helpText: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalCloseIcon: {
    fontSize: 20,
    color: '#6b7280',
  },
  modalBody: {
    padding: 20,
  },
  noResultsText: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  resultItem: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  resultSuccess: {
    backgroundColor: '#f0fdf4',
    borderLeftWidth: 4,
    borderLeftColor: '#10b981',
  },
  resultError: {
    backgroundColor: '#fef2f2',
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  resultStatus: {
    fontSize: 16,
    fontWeight: '500',
  },
  resultTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  resultMessage: {
    fontSize: 14,
    color: '#374151',
    marginBottom: 8,
  },
  resultDetails: {
    flexDirection: 'row',
    gap: 16,
  },
  resultDetail: {
    fontSize: 12,
    color: '#6b7280',
  },
  modalFooter: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  clearButton: {
    backgroundColor: '#ef4444',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  clearButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '500',
  },
});

export default AudioTestDemoScreen; 