/**
 * 蓝牙配对页面 - 耳机设备连接和配对指导
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  Animated,
} from 'react-native';
import { useI18n } from '../../hooks/useI18n';
import BluetoothHelpModal from './BluetoothHelpModal';

interface BluetoothPairingScreenProps {
  onClose?: () => void;
}

const BluetoothPairingScreen: React.FC<BluetoothPairingScreenProps> = ({ onClose }) => {
  const { t } = useI18n();
  const [isSearching, setIsSearching] = useState(true);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [searchAnimation] = useState(new Animated.Value(0));
  const [pulseAnimation] = useState(new Animated.Value(1));

  // 搜索动画效果
  useEffect(() => {
    const startSearchAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(searchAnimation, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          }),
          Animated.timing(searchAnimation, {
            toValue: 0,
            duration: 2000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    const startPulseAnimation = () => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnimation, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnimation, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    };

    if (isSearching) {
      startSearchAnimation();
      startPulseAnimation();
    }
  }, [isSearching, searchAnimation, pulseAnimation]);

  const handleTryAgain = () => {
    setShowHelpModal(false);
    setIsSearching(true);
    // 这里可以添加重新搜索的逻辑
  };

  const handleShowHelp = () => {
    setShowHelpModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* 页面标题 */}
      <View style={styles.header}>
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Text style={styles.backButtonText}>←</Text>
          </TouchableOpacity>
        )}
        <Text style={styles.title}>{t('bluetooth.title')}</Text>
        {onClose && <View style={styles.backButton} />}
      </View>

      {/* 主要内容区域 */}
      <View style={styles.content}>
        {/* 搜索状态动画 */}
        <View style={styles.animationContainer}>
          <Animated.View
            style={[
              styles.searchCircle,
              {
                transform: [
                  {
                    scale: pulseAnimation,
                  },
                ],
                opacity: searchAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ]}
          >
            <View style={styles.innerCircle}>
              <View style={styles.headphoneIcon}>
                <Text style={styles.headphoneIconText}>🎧</Text>
              </View>
            </View>
          </Animated.View>
          
          {/* 搜索波纹效果 */}
          <Animated.View
            style={[
              styles.ripple,
              {
                transform: [
                  {
                    scale: searchAnimation.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.8, 1.5],
                    }),
                  },
                ],
                opacity: searchAnimation.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 0.5, 0],
                }),
              },
            ]}
          />
        </View>

        {/* 搜索状态指示器 */}
        <View style={styles.searchStatusContainer}>
          <ActivityIndicator size="small" color="#3b82f6" />
          <Text style={styles.searchingText}>{t('bluetooth.searching')}</Text>
        </View>

        {/* 操作指引 */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>{t('bluetooth.stepTitle')}</Text>
          <Text style={styles.instructionText}>{t('bluetooth.step1')}</Text>
          <Text style={styles.instructionText}>{t('bluetooth.step2')}</Text>
          <Text style={styles.instructionText}>{t('bluetooth.step3')}</Text>
          <Text style={styles.generalInstructions}>
            {t('bluetooth.instructions')}
          </Text>
        </View>
      </View>

      {/* 帮助入口 */}
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleShowHelp} style={styles.helpButton}>
          <Text style={styles.helpButtonText}>{t('bluetooth.helpLink')}</Text>
        </TouchableOpacity>
      </View>

      {/* 帮助弹窗 */}
      <BluetoothHelpModal
        visible={showHelpModal}
        onClose={() => setShowHelpModal(false)}
        onTryAgain={handleTryAgain}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
    color: '#3b82f6',
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  animationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 40,
    height: 200,
    position: 'relative',
  },
  searchCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f0f9ff',
    borderWidth: 2,
    borderColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  innerCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headphoneIcon: {
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headphoneIconText: {
    fontSize: 30,
    color: '#ffffff',
  },
  ripple: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 2,
    borderColor: '#3b82f6',
    backgroundColor: 'transparent',
  },
  searchStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    gap: 8,
  },
  searchingText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
  },
  instructionsContainer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  instructionsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 16,
    color: '#374151',
    marginBottom: 8,
    textAlign: 'center',
  },
  generalInstructions: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: 16,
    lineHeight: 20,
  },
  footer: {
    padding: 20,
    alignItems: 'center',
  },
  helpButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  helpButtonText: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
});

export default BluetoothPairingScreen; 