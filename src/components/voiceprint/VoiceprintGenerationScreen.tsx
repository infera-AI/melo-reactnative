/**
 * AI声纹采集 - 生成音色中页面
 * 页面4.3：告知用户声纹音色正在生成中，并提供进度反馈
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
  Alert,
} from 'react-native';
import { useI18n } from '../../hooks/useI18n';

interface VoiceprintGenerationScreenProps {
  onComplete: () => void;
  onError?: () => void;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const VoiceprintGenerationScreen: React.FC<VoiceprintGenerationScreenProps> = ({
  onComplete,
  onError,
}) => {
  const { t } = useI18n();
  
  // 生成状态管理
  const [progress, setProgress] = useState(0);
  const [isGenerating, setIsGenerating] = useState(true);
  
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
    new Animated.Value(0.5),
    new Animated.Value(0.2),
    new Animated.Value(0.8),
    new Animated.Value(0.4),
  ]).current;
  
  const voiceprintAnimations = useRef([
    new Animated.Value(0.2),
    new Animated.Value(0.4),
    new Animated.Value(0.7),
    new Animated.Value(0.3),
    new Animated.Value(0.8),
    new Animated.Value(0.5),
    new Animated.Value(0.6),
    new Animated.Value(0.3),
    new Animated.Value(0.9),
    new Animated.Value(0.4),
  ]).current;
  
  const transformAnimation = useRef(new Animated.Value(0)).current;
  const progressAnimation = useRef(new Animated.Value(0)).current;
  
  // 定时器引用
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 页面加载时开始生成过程
  useEffect(() => {
    startGeneration();
    return () => {
      // 清理计时器
      if (progressTimerRef.current) {
        clearInterval(progressTimerRef.current);
      }
    };
  }, []);

  // 声波到声纹转换动画
  useEffect(() => {
    if (isGenerating) {
      // 声波动画
      const waveAnimations_temp = waveAnimations.map((anim, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: Math.random() * 0.8 + 0.2,
              duration: 400 + Math.random() * 300,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: Math.random() * 0.8 + 0.2,
              duration: 400 + Math.random() * 300,
              useNativeDriver: true,
            }),
          ])
        )
      );
      
      // 声纹动画（更有序的模式）
      const voiceprintAnimations_temp = voiceprintAnimations.map((anim, index) =>
        Animated.loop(
          Animated.sequence([
            Animated.timing(anim, {
              toValue: 0.3 + (index % 3) * 0.3,
              duration: 800 + index * 50,
              useNativeDriver: true,
            }),
            Animated.timing(anim, {
              toValue: 0.2 + (index % 4) * 0.2,
              duration: 800 + index * 50,
              useNativeDriver: true,
            }),
          ])
        )
      );
      
      // 转换动画
      const transformAnim = Animated.loop(
        Animated.sequence([
          Animated.timing(transformAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(transformAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      );
      
      waveAnimations_temp.forEach((animation) => animation.start());
      voiceprintAnimations_temp.forEach((animation) => animation.start());
      transformAnim.start();
      
      return () => {
        waveAnimations_temp.forEach((animation) => animation.stop());
        voiceprintAnimations_temp.forEach((animation) => animation.stop());
        transformAnim.stop();
      };
    }
  }, [isGenerating, waveAnimations, voiceprintAnimations, transformAnimation]);

  // 进度条动画
  useEffect(() => {
    Animated.timing(progressAnimation, {
      toValue: progress / 100,
      duration: 500,
      useNativeDriver: false,
    }).start();
  }, [progress, progressAnimation]);

  // 开始生成过程
  const startGeneration = () => {
    setIsGenerating(true);
    setProgress(0);
    
    // 模拟进度更新（实际项目中应该基于真实的生成进度）
    let currentProgress = 0;
    progressTimerRef.current = setInterval(() => {
      currentProgress += Math.random() * 5 + 1; // 每次增加1-6%
      
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(currentProgress);
        
        // 延迟一点时间让用户看到100%
        setTimeout(() => {
          completeGeneration();
        }, 1000);
        
        if (progressTimerRef.current) {
          clearInterval(progressTimerRef.current);
          progressTimerRef.current = null;
        }
      } else {
        setProgress(currentProgress);
      }
    }, 400); // 每400ms更新一次进度
  };

  // 完成生成
  const completeGeneration = () => {
    setIsGenerating(false);
    
    // 模拟成功/失败（实际项目中应该基于真实结果）
    const isSuccess = Math.random() > 0.1; // 90%成功率
    
    if (isSuccess) {
      Alert.alert(
        '音色生成完成',
        '您的专属音色已成功生成！现在可以开始使用个性化翻译功能了。',
        [
          {
            text: '确定',
            onPress: onComplete
          }
        ]
      );
    } else {
      Alert.alert(
        '生成失败',
        '很抱歉，音色生成过程中出现了问题。请稍后重试。',
        [
          {
            text: '重试',
            onPress: () => startGeneration()
          },
          {
            text: '跳过',
            style: 'cancel',
            onPress: onError || onComplete
          }
        ]
      );
    }
  };

  // 渲染声波动画
  const renderWaveAnimation = () => {
    return (
      <View style={styles.waveContainer}>
        {waveAnimations.map((anim, index) => (
          <Animated.View
            key={`wave-${index}`}
            style={[
              styles.waveBar,
              {
                transform: [
                  {
                    scaleY: anim,
                  },
                ],
                opacity: transformAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [1, 0.3],
                }),
              },
            ]}
          />
        ))}
      </View>
    );
  };

  // 渲染声纹动画
  const renderVoiceprintAnimation = () => {
    return (
      <View style={styles.voiceprintContainer}>
        {voiceprintAnimations.map((anim, index) => (
          <Animated.View
            key={`voiceprint-${index}`}
            style={[
              styles.voiceprintBar,
              {
                transform: [
                  {
                    scaleY: anim,
                  },
                ],
                opacity: transformAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ]}
          />
        ))}
      </View>
    );
  };

  // 渲染进度指示器
  const renderProgressIndicator = () => {
    const circumference = 2 * Math.PI * 45; // 半径45的圆周长
    
    return (
      <View style={styles.progressContainer}>
        <View style={styles.progressCircle}>
          {/* 背景圆圈 */}
          <View style={styles.progressBackground} />
          
          {/* 进度圆圈 */}
          <Animated.View
            style={[
              styles.progressForeground,
              {
                transform: [
                  {
                    rotate: progressAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: ['0deg', '360deg'],
                    }),
                  },
                ],
              },
            ]}
          />
          
          {/* 中央百分比文字 */}
          <View style={styles.progressTextContainer}>
            <Text style={styles.progressText}>{Math.round(progress)}%</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>生成您的专属音色</Text>
        </View>
        
        <View style={styles.progressIndicator}>
          <Text style={styles.progressIndicatorText}>2/3</Text>
        </View>
      </View>

      {/* 主要内容区域 */}
      <View style={styles.content}>
        {/* 大型处理中动画 */}
        <View style={styles.animationSection}>
          {/* 声波转声纹动画容器 */}
          <View style={styles.transformAnimationContainer}>
            {renderWaveAnimation()}
            
            {/* 转换指示 */}
            <Animated.View
              style={[
                styles.transformIndicator,
                {
                  opacity: transformAnimation.interpolate({
                    inputRange: [0, 0.5, 1],
                    outputRange: [0.3, 1, 0.3],
                  }),
                },
              ]}
            >
              <Text style={styles.transformArrow}>→</Text>
            </Animated.View>
            
            {renderVoiceprintAnimation()}
          </View>
        </View>

        {/* 状态提示标题 */}
        <View style={styles.statusSection}>
          <Text style={styles.statusTitle}>正在生成您的专属音色…</Text>
        </View>

        {/* 进度指示器 */}
        {renderProgressIndicator()}

        {/* 补充说明文字 */}
        <View style={styles.descriptionSection}>
          <Text style={styles.descriptionText}>
            这大约需要45秒，请耐心等待，不要离开此页面。
          </Text>
        </View>
      </View>
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
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    position: 'relative',
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
  progressIndicator: {
    position: 'absolute',
    right: 16,
    alignItems: 'center',
  },
  progressIndicatorText: {
    fontSize: 14,
    color: '#666666',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  animationSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  transformAnimationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    marginRight: 20,
  },
  waveBar: {
    width: 4,
    height: 60,
    backgroundColor: '#3b82f6',
    marginHorizontal: 1,
    borderRadius: 2,
  },
  transformIndicator: {
    marginHorizontal: 15,
  },
  transformArrow: {
    fontSize: 24,
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  voiceprintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
    marginLeft: 20,
  },
  voiceprintBar: {
    width: 3,
    height: 50,
    backgroundColor: '#10b981',
    marginHorizontal: 1,
    borderRadius: 1.5,
  },
  statusSection: {
    marginBottom: 40,
  },
  statusTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333333',
    textAlign: 'center',
  },
  progressContainer: {
    marginBottom: 40,
  },
  progressCircle: {
    width: 100,
    height: 100,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBackground: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: '#f0f0f0',
  },
  progressForeground: {
    position: 'absolute',
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 4,
    borderColor: '#3b82f6',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  progressTextContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  descriptionSection: {
    paddingHorizontal: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default VoiceprintGenerationScreen; 