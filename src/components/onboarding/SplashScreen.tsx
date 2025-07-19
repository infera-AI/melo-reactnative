/**
 * 应用启动页 - 品牌Logo展示和初始化加载
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
} from 'react-native';
import { useI18n } from '../../hooks/useI18n';

const { height } = Dimensions.get('window');

interface SplashScreenProps {
  onFinish: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { t } = useI18n();
  const [logoAnimation] = useState(new Animated.Value(0));
  const [sloganAnimation] = useState(new Animated.Value(0));
  const [fadeAnimation] = useState(new Animated.Value(0));

  useEffect(() => {
    // 启动动画序列
    const startAnimations = () => {
      // 整体淡入
      Animated.timing(fadeAnimation, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();

      // Logo动画 - 从下方滑入并缩放
      Animated.sequence([
        Animated.delay(300),
        Animated.spring(logoAnimation, {
          toValue: 1,
          tension: 50,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();

      // Slogan动画 - 淡入
      Animated.sequence([
        Animated.delay(800),
        Animated.timing(sloganAnimation, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start();
    };

    startAnimations();

    // 2.5秒后自动结束启动页
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, [logoAnimation, sloganAnimation, fadeAnimation, onFinish]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3b82f6" />
      
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnimation,
          }
        ]}
      >
        {/* Logo区域 */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoAnimation,
              transform: [
                {
                  translateY: logoAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [50, 0],
                  }),
                },
                {
                  scale: logoAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.8, 1],
                  }),
                },
              ],
            },
          ]}
        >
          {/* Logo图标 */}
          <View style={styles.logoIcon}>
            <Text style={styles.logoText}>{t('splash.appName')}</Text>
            <View style={styles.logoAccent} />
          </View>
        </Animated.View>

        {/* Slogan区域 */}
        <Animated.View
          style={[
            styles.sloganContainer,
            {
              opacity: sloganAnimation,
              transform: [
                {
                  translateY: sloganAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [20, 0],
                  }),
                },
              ],
            },
          ]}
        >
          <Text style={styles.slogan}>{t('splash.slogan')}</Text>
          <Text style={styles.subSlogan}>{t('splash.subSlogan')}</Text>
        </Animated.View>
      </Animated.View>

      {/* 版本号 */}
      <Animated.View 
        style={[
          styles.versionContainer,
          {
            opacity: fadeAnimation,
          }
        ]}
      >
        <Text style={styles.versionText}>
          {t('splash.version')} 1.0.0
        </Text>
      </Animated.View>

      {/* 背景装饰 */}
      <View style={styles.backgroundDecoration}>
        <View style={[styles.circle, styles.circle1]} />
        <View style={[styles.circle, styles.circle2]} />
        <View style={[styles.circle, styles.circle3]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoIcon: {
    alignItems: 'center',
    position: 'relative',
  },
  logoText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.3)',
    textShadowOffset: {
      width: 0,
      height: 2,
    },
    textShadowRadius: 4,
  },
  logoAccent: {
    width: 60,
    height: 4,
    backgroundColor: '#fbbf24',
    borderRadius: 2,
    marginTop: 8,
  },
  sloganContainer: {
    alignItems: 'center',
  },
  slogan: {
    fontSize: 20,
    fontWeight: '600',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 8,
    opacity: 0.95,
  },
  subSlogan: {
    fontSize: 16,
    fontWeight: '400',
    color: '#e0e7ff',
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.9,
  },
  versionContainer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  versionText: {
    fontSize: 14,
    color: '#cbd5e1',
    fontWeight: '500',
  },
  backgroundDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: -1,
  },
  circle: {
    position: 'absolute',
    borderRadius: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  circle1: {
    width: 200,
    height: 200,
    top: -100,
    right: -100,
  },
  circle2: {
    width: 150,
    height: 150,
    bottom: -75,
    left: -75,
  },
  circle3: {
    width: 100,
    height: 100,
    top: height * 0.2,
    left: -50,
  },
});

export default SplashScreen; 