/**
 * AI声纹采集 - 初始引导页面 (页面 4.1)
 * 引导用户进行声纹采集前的准备工作，强调录制环境和状态的重要性
 */
import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';

interface VoiceprintCollectionIntroScreenProps {
  onStartRecording: () => void;
  onSkip: () => void;
}

const VoiceprintCollectionIntroScreen: React.FC<VoiceprintCollectionIntroScreenProps> = ({
  onStartRecording,
  onSkip,
}) => {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <Text style={styles.title}>录制您的专属音色</Text>
        <Text style={styles.stepIndicator}>2/3</Text>
      </View>

      {/* 主要内容区域 */}
      <View style={styles.content}>
        {/* 引导图标 */}
        <View style={styles.iconContainer}>
          <View style={styles.microphoneIcon}>
            <Text style={styles.microphoneEmoji}>🎤</Text>
            <View style={styles.soundWaveContainer}>
              <View style={[styles.soundWave, styles.wave1]} />
              <View style={[styles.soundWave, styles.wave2]} />
              <View style={[styles.soundWave, styles.wave3]} />
            </View>
          </View>
        </View>

        {/* 主引导标题 */}
        <Text style={styles.mainTitle}>个性化您的声音，让翻译更自然</Text>

        {/* 详细说明与准备提示 */}
        <View style={styles.instructionsContainer}>
          <Text style={styles.instructionsTitle}>为了精准克隆您的音色，请您：</Text>
          
          <View style={styles.tipsList}>
            {/* 提示项1：安静环境 */}
            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Text style={styles.tipEmoji}>🔇</Text>
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipText}>
                  在 <Text style={styles.highlightText}>安静的环境</Text> 下进行录制
                </Text>
                <Text style={styles.tipSubText}>避免背景噪音和干扰声音</Text>
              </View>
            </View>

            {/* 提示项2：自然语速 */}
            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Text style={styles.tipEmoji}>🗣️</Text>
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipText}>
                  用您 <Text style={styles.highlightText}>自然、清晰的语速和音量</Text> 朗读
                </Text>
                <Text style={styles.tipSubText}>保持平时说话的状态和节奏</Text>
              </View>
            </View>

            {/* 提示项3：距离保持 */}
            <View style={styles.tipItem}>
              <View style={styles.tipIcon}>
                <Text style={styles.tipEmoji}>📱</Text>
              </View>
              <View style={styles.tipContent}>
                <Text style={styles.tipText}>
                  请将手机麦克风 <Text style={styles.highlightText}>正对您，并保持 15-20厘米</Text> 距离
                </Text>
                <Text style={styles.tipSubText}>确保音频清晰且音量适中</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* 底部按钮区域 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity style={styles.startButton} onPress={onStartRecording}>
          <Text style={styles.startButtonText}>我准备好了，开始录制</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipButtonText}>
            暂不录制，稍后在设置中录制
          </Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  stepIndicator: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 40,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: 30,
  },
  microphoneIcon: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  microphoneEmoji: {
    fontSize: 64,
    marginBottom: 10,
  },
  soundWaveContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  soundWave: {
    backgroundColor: '#3b82f6',
    borderRadius: 2,
    width: 4,
  },
  wave1: {
    height: 16,
  },
  wave2: {
    height: 24,
  },
  wave3: {
    height: 20,
  },
  mainTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 28,
  },
  instructionsContainer: {
    width: '100%',
    alignItems: 'flex-start',
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 20,
  },
  tipsList: {
    width: '100%',
    gap: 24,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  tipIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  tipEmoji: {
    fontSize: 24,
  },
  tipContent: {
    flex: 1,
    paddingTop: 4,
  },
  tipText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
    marginBottom: 4,
  },
  highlightText: {
    fontWeight: '600',
    color: '#3b82f6',
  },
  tipSubText: {
    fontSize: 13,
    color: '#6b7280',
    lineHeight: 18,
  },
  bottomContainer: {
    padding: 20,
    gap: 16,
  },
  startButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  startButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffffff',
  },
  skipButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
});

export default VoiceprintCollectionIntroScreen; 