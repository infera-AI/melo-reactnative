/**
 * AI声纹采集 - 录制分段进行中页面
 * 页面4.2：引导用户按段落朗读文本以进行声纹采集，并提供录制状态反馈
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { useI18n } from '../../hooks/useI18n';

interface VoiceprintRecordingScreenProps {
  onBack: () => void;
  onComplete: () => void;
  onSkip: () => void;
}

// 预设的录制文本段落
const RECORDING_TEXTS = [
  "Hello, this is my voice. I am recording my personal voice print for AI translation.",
  "The weather today is beautiful. I enjoy walking in the park during sunny afternoons.",
  "Technology has changed our lives in many wonderful ways. AI helps us communicate better.",
];

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const VoiceprintRecordingScreen: React.FC<VoiceprintRecordingScreenProps> = ({
  onBack,
  onComplete,
  onSkip,
}) => {
  const { t } = useI18n();
  
  // 录制状态管理
  const [currentSegment, setCurrentSegment] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [hasCompletedSegment, setHasCompletedSegment] = useState(false);
  const [highlightedWords, setHighlightedWords] = useState<number[]>([]);
  
  // 动画相关
  const waveAnimations = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.5),
    new Animated.Value(0.8),
    new Animated.Value(0.4),
    new Animated.Value(0.6),
    new Animated.Value(0.9),
    new Animated.Value(0.3),
    new Animated.Value(0.7),
  ]).current;
  
  const recordingIndicatorAnim = useRef(new Animated.Value(1)).current;
  
  // 计时器引用
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const highlightTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 页面加载时自动开始录制
  useEffect(() => {
    startRecording();
    return () => {
      // 清理计时器
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (highlightTimerRef.current) {
        clearInterval(highlightTimerRef.current);
      }
    };
  }, [currentSegment]);

  // 录制指示灯动画
  useEffect(() => {
    if (isRecording) {
      const blinkAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(recordingIndicatorAnim, {
            toValue: 0.3,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(recordingIndicatorAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      );
      blinkAnimation.start();
      return () => blinkAnimation.stop();
    }
  }, [isRecording, recordingIndicatorAnim]);

  // 声波动画
  useEffect(() => {
    if (isRecording) {
      const waveAnimations_temp = waveAnimations.map((anim) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: Math.random() * 0.8 + 0.2,
              duration: 300 + Math.random() * 200,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: Math.random() * 0.8 + 0.2,
              duration: 300 + Math.random() * 200,
              useNativeDriver: true,
            }),
          ])
        )
      );
      
      waveAnimations_temp.forEach((animation) => animation.start());
      
      return () => {
        waveAnimations_temp.forEach((animation) => animation.stop());
      };
    }
  }, [isRecording, waveAnimations]);

  // 开始录制
  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    setHasCompletedSegment(false);
    setHighlightedWords([]);
    
    // 开始计时
    timerRef.current = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);
    
    // 模拟文本高亮（实际项目中应该基于语音识别）
    const words = RECORDING_TEXTS[currentSegment].split(' ');
    let wordIndex = 0;
    
    highlightTimerRef.current = setInterval(() => {
      if (wordIndex < words.length) {
        setHighlightedWords((prev) => [...prev, wordIndex]);
        wordIndex++;
      } else {
        // 录制完成
        stopRecording();
      }
    }, 800); // 每800ms高亮一个词
  };

  // 停止录制
  const stopRecording = () => {
    setIsRecording(false);
    setHasCompletedSegment(true);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    if (highlightTimerRef.current) {
      clearInterval(highlightTimerRef.current);
      highlightTimerRef.current = null;
    }
  };

  // 重新录制当前段落
  const retryCurrentSegment = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    if (highlightTimerRef.current) {
      clearInterval(highlightTimerRef.current);
    }
    startRecording();
  };

  // 下一段录制
  const nextSegment = () => {
    if (currentSegment < RECORDING_TEXTS.length - 1) {
      setCurrentSegment(prev => prev + 1);
    } else {
      // 所有段落录制完成
      Alert.alert(
        '录制完成',
        '您的声纹采集已完成，即将生成专属音色',
        [
          {
            text: '确定',
            onPress: onComplete
          }
        ]
      );
    }
  };

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // 渲染高亮文本
  const renderHighlightedText = () => {
    const words = RECORDING_TEXTS[currentSegment].split(' ');
    return (
      <Text style={styles.textContent}>
        {words.map((word, index) => (
          <Text
            key={index}
            style={[
              styles.textWord,
              highlightedWords.includes(index) && styles.highlightedWord
            ]}
          >
            {word}{' '}
          </Text>
        ))}
      </Text>
    );
  };

  // 渲染声波动画
  const renderWaveAnimation = () => {
    return (
      <View style={styles.waveContainer}>
        {waveAnimations.map((anim, index) => (
          <Animated.View
            key={index}
            style={[
              styles.waveBar,
              {
                transform: [
                  {
                    scaleY: anim,
                  },
                ],
              },
            ]}
          />
        ))}
      </View>
    );
  };

  const isLastSegment = currentSegment === RECORDING_TEXTS.length - 1;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>录制您的专属音色</Text>
        </View>
        
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>2/3</Text>
        </View>
      </View>

      {/* 主要内容区域 */}
      <View style={styles.content}>
        {/* 当前录制段落进度 */}
        <View style={styles.segmentProgressContainer}>
          <Text style={styles.segmentProgressText}>
            正在录制第 {currentSegment + 1} / {RECORDING_TEXTS.length} 段
          </Text>
        </View>

        {/* 待朗读文本卡片 */}
        <View style={styles.textCard}>
          <View style={styles.textHeader}>
            <Text style={styles.textLabel}>朗读文本</Text>
          </View>
          {renderHighlightedText()}
        </View>

        {/* 声波动画 */}
        <View style={styles.animationSection}>
          {renderWaveAnimation()}
        </View>

        {/* 录制状态与计时 */}
        <View style={styles.recordingStatus}>
          <View style={styles.recordingIndicatorContainer}>
            <Animated.View
              style={[
                styles.recordingIndicator,
                {
                  opacity: recordingIndicatorAnim,
                  backgroundColor: isRecording ? '#ef4444' : '#gray',
                }
              ]}
            />
            <Text style={styles.recordingStatusText}>
              {isRecording ? '正在录制...' : '录制完成'} {formatTime(recordingTime)}
            </Text>
          </View>
        </View>
      </View>

      {/* 底部操作按钮 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={retryCurrentSegment}
          disabled={isRecording}
        >
          <Text style={styles.retryIcon}>↻</Text>
          <Text style={styles.retryButtonText}>重新录制本段</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.nextButton,
            (!hasCompletedSegment || isRecording) && styles.disabledButton
          ]}
          onPress={nextSegment}
          disabled={!hasCompletedSegment || isRecording}
        >
          <Text style={styles.nextButtonText}>
            {isLastSegment ? '完成录制' : '下一段'}
          </Text>
          <Text style={styles.nextIcon}>
            {isLastSegment ? '✓' : '→'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* 跳过选项 */}
      <TouchableOpacity onPress={onSkip} style={styles.skipButton}>
        <Text style={styles.skipButtonText}>暂不录制</Text>
      </TouchableOpacity>
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
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  segmentProgressContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  segmentProgressText: {
    fontSize: 16,
    color: '#666666',
    fontWeight: '500',
  },
  textCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    minHeight: 120,
  },
  textHeader: {
    marginBottom: 16,
  },
  textLabel: {
    fontSize: 14,
    color: '#888888',
    fontWeight: '500',
  },
  textContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#333333',
  },
  textWord: {
    fontSize: 16,
    color: '#333333',
  },
  highlightedWord: {
    backgroundColor: '#3b82f6',
    color: '#ffffff',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  animationSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 60,
  },
  waveBar: {
    width: 4,
    height: 40,
    backgroundColor: '#3b82f6',
    marginHorizontal: 2,
    borderRadius: 2,
  },
  recordingStatus: {
    alignItems: 'center',
    marginBottom: 40,
  },
  recordingIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  recordingIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  recordingStatusText: {
    fontSize: 16,
    color: '#333333',
    fontWeight: '500',
  },
  bottomContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 16,
  },
  retryButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#3b82f6',
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  retryIcon: {
    fontSize: 18,
    color: '#3b82f6',
    marginRight: 8,
  },
  retryButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  nextButtonText: {
    fontSize: 16,
    color: '#ffffff',
    fontWeight: '600',
    marginRight: 8,
  },
  nextIcon: {
    fontSize: 18,
    color: '#ffffff',
  },
  skipButton: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingBottom: 20,
  },
  skipButtonText: {
    fontSize: 14,
    color: '#888888',
  },
});

export default VoiceprintRecordingScreen; 