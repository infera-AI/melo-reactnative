/**
 * 引导完成/进入主页页面
 * 页面5：告知用户初始设置已成功完成，并以积极的方式引导用户进入应用主界面
 */
import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';

interface OnboardingCompleteScreenProps {
  onEnterApp: () => void;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const OnboardingCompleteScreen: React.FC<OnboardingCompleteScreenProps> = ({
  onEnterApp,
}) => {
  // 动画相关
  const logoScale = useRef(new Animated.Value(0.5)).current;
  const logoRotation = useRef(new Animated.Value(0)).current;
  const celebrationLines = useRef(
    Array.from({ length: 8 }, () => ({
      scale: new Animated.Value(0),
      opacity: new Animated.Value(0),
    }))
  ).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleTranslateY = useRef(new Animated.Value(30)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleTranslateY = useRef(new Animated.Value(30)).current;
  const buttonOpacity = useRef(new Animated.Value(0)).current;
  const buttonTranslateY = useRef(new Animated.Value(30)).current;
  const tipOpacity = useRef(new Animated.Value(0)).current;

  // 自动跳转定时器
  const autoJumpTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // 启动庆祝动画序列
    startCelebrationAnimation();
    
    // 设置3秒后自动跳转
    autoJumpTimerRef.current = setTimeout(() => {
      onEnterApp();
    }, 3000);
    
    return () => {
      if (autoJumpTimerRef.current) {
        clearTimeout(autoJumpTimerRef.current);
      }
    };
  }, [onEnterApp]);

  // 启动庆祝动画
  const startCelebrationAnimation = () => {
    // Logo动画
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.timing(logoRotation, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // 庆祝线条动画
    const lineAnimations = celebrationLines.map((line, index) => {
      return Animated.sequence([
        Animated.delay(200 + index * 50),
        Animated.parallel([
          Animated.spring(line.scale, {
            toValue: 1,
            tension: 80,
            friction: 4,
            useNativeDriver: true,
          }),
          Animated.timing(line.opacity, {
            toValue: 1,
            duration: 300,
            useNativeDriver: true,
          }),
        ]),
      ]);
    });

    Animated.parallel(lineAnimations).start();

    // 文字动画序列
    Animated.sequence([
      Animated.delay(600),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(titleTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(200),
      Animated.parallel([
        Animated.timing(subtitleOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(subtitleTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(300),
      Animated.parallel([
        Animated.timing(buttonOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(buttonTranslateY, {
          toValue: 0,
          tension: 50,
          friction: 6,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(200),
      Animated.timing(tipOpacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // 处理点击进入应用
  const handleEnterApp = () => {
    if (autoJumpTimerRef.current) {
      clearTimeout(autoJumpTimerRef.current);
    }
    onEnterApp();
  };

  // 渲染庆祝线条
  const renderCelebrationLines = () => {
    return celebrationLines.map((line, index) => {
      const angle = (index * 45) - 180; // 分布在圆周上
      const radius = 80;
      const x = Math.cos((angle * Math.PI) / 180) * radius;
      const y = Math.sin((angle * Math.PI) / 180) * radius;

      return (
        <Animated.View
          key={index}
          style={[
            styles.celebrationLine,
            {
              transform: [
                { translateX: x },
                { translateY: y },
                { rotate: `${angle + 90}deg` },
                { scaleY: line.scale },
              ],
              opacity: line.opacity,
            },
          ]}
        />
      );
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />
      
      {/* 主要内容区域 */}
      <View style={styles.content}>
        {/* Logo和庆祝动画区域 */}
        <View style={styles.logoSection}>
          <View style={styles.logoContainer}>
            {/* 庆祝线条 */}
            <View style={styles.celebrationContainer}>
              {renderCelebrationLines()}
            </View>
            
            {/* Logo */}
            <Animated.View
              style={[
                styles.logoWrapper,
                {
                  transform: [
                    { scale: logoScale },
                    {
                      rotate: logoRotation.interpolate({
                        inputRange: [0, 1],
                        outputRange: ['0deg', '360deg'],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Text style={styles.logoText}>Lingo</Text>
            </Animated.View>
          </View>
        </View>

        {/* 文字内容区域 */}
        <View style={styles.textSection}>
          {/* 主标题 */}
          <Animated.View
            style={[
              styles.titleContainer,
              {
                opacity: titleOpacity,
                transform: [{ translateY: titleTranslateY }],
              },
            ]}
          >
            <Text style={styles.mainTitle}>太棒了！所有准备已完成。</Text>
          </Animated.View>

          {/* 副标题 */}
          <Animated.View
            style={[
              styles.subtitleContainer,
              {
                opacity: subtitleOpacity,
                transform: [{ translateY: subtitleTranslateY }],
              },
            ]}
          >
            <Text style={styles.subtitle}>现在，开始您的Lingo智能沟通之旅吧！</Text>
          </Animated.View>
        </View>
      </View>

      {/* 底部操作区域 */}
      <View style={styles.bottomSection}>
        {/* 进入应用按钮 */}
        <Animated.View
          style={[
            styles.buttonContainer,
            {
              opacity: buttonOpacity,
              transform: [{ translateY: buttonTranslateY }],
            },
          ]}
        >
          <TouchableOpacity
            style={styles.enterButton}
            onPress={handleEnterApp}
            activeOpacity={0.8}
          >
            <Text style={styles.enterButtonText}>进入Lingo世界</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* 提示文字 */}
        <Animated.View
          style={[
            styles.tipContainer,
            { opacity: tipOpacity },
          ]}
        >
          <Text style={styles.tipText}>
            您可以在"我的"页面随时调整各项个性化设置。
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3b82f6',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    position: 'relative',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationContainer: {
    position: 'absolute',
    width: 200,
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  celebrationLine: {
    position: 'absolute',
    width: 4,
    height: 40,
    backgroundColor: '#fbbf24',
    borderRadius: 2,
  },
  logoWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#ffffff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 16,
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#3b82f6',
    letterSpacing: 1,
  },
  textSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  titleContainer: {
    marginBottom: 20,
  },
  mainTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 32,
  },
  subtitleContainer: {
    marginBottom: 40,
  },
  subtitle: {
    fontSize: 18,
    color: '#e0f2fe',
    textAlign: 'center',
    lineHeight: 26,
  },
  bottomSection: {
    paddingHorizontal: 40,
    paddingBottom: 50,
  },
  buttonContainer: {
    marginBottom: 20,
  },
  enterButton: {
    backgroundColor: '#ffffff',
    paddingVertical: 18,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  enterButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3b82f6',
  },
  tipContainer: {
    alignItems: 'center',
  },
  tipText: {
    fontSize: 14,
    color: '#bfdbfe',
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default OnboardingCompleteScreen; 