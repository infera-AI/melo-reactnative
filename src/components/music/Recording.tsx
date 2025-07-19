import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  StatusBar,
  Animated,
  SafeAreaView,
} from 'react-native';

interface RecordingProps {
  onRecordingToggle?: (isRecording: boolean) => void;
}

const Recording: React.FC<RecordingProps> = ({ onRecordingToggle }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  // 录制计时器
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // 录制指示器脉冲动画
  useEffect(() => {
    if (isRecording) {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.2,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [isRecording, pulseAnim]);

  const handleRecordingPress = () => {
    const newRecordingState = !isRecording;
    setIsRecording(newRecordingState);
    
    if (!newRecordingState) {
      setRecordingTime(0);
    }
    
    // 按钮动画效果
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.9,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    if (onRecordingToggle) {
      onRecordingToggle(newRecordingState);
    }
  };

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}：${secs.toString().padStart(2, '0')}`;
  };

  // 渲染波形线条
  const renderWaveformLines = () => {
    const lines = [];
    for (let i = 0; i < 67; i++) {
      const height = isRecording ? Math.random() * 30 + 5 : 4;
      lines.push(
        <View
          key={i}
          style={[
            styles.waveformLine,
            { height: height }
          ]}
        />
      );
    }
    return lines;
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEF4F4" />
      
      {/* 背景椭圆 */}
      <View style={styles.blueEllipse} />
      <View style={styles.yellowEllipse} />
      
      {/* 状态栏 */}
      <View style={styles.statusBar}>
        <View style={styles.statusBarLeft}>
          <Text style={styles.timeText}>9:41</Text>
        </View>
        <View style={styles.statusBarRight}>
          <View style={styles.cellularIcon} />
          <View style={styles.wifiIcon} />
          <View style={styles.batteryContainer}>
            <View style={styles.batteryBody}>
              <View style={styles.batteryFill} />
            </View>
            <View style={styles.batteryHead} />
          </View>
        </View>
      </View>

      {/* 顶部导航 */}
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton}>
          <View style={styles.backIcon} />
        </TouchableOpacity>
        <View style={styles.connectionStatus}>
          <View style={styles.connectionBadge}>
            <View style={styles.headphoneContainer}>
              <View style={styles.headphoneIndicator} />
              <View style={styles.headphoneIcon} />
            </View>
            <Text style={styles.connectionText}>30%</Text>
          </View>
        </View>
      </View>

      {/* 录制区域 */}
      <View style={styles.recordingArea}>
        <View style={styles.recordingAreaBackground} />
        <View style={styles.recordingOverlay} />
        
        {/* 时间显示 */}
        <View style={styles.timeSection}>
          <Text style={styles.mainTimeText}>{formatTime(recordingTime)}</Text>
          <View style={styles.subTimeRow}>
            <Text style={styles.subTimeText}>00：03</Text>
            <Text style={styles.subTimeText}>00：04</Text>
            <Text style={styles.subTimeText}>00：05</Text>
            <Text style={styles.subTimeText}>00：06</Text>
          </View>
        </View>

        {/* 录制指示器 */}
        <View style={styles.recordingIndicatorContainer}>
          <Animated.View style={[
            styles.recordingIndicatorOuter,
            isRecording && { transform: [{ scale: pulseAnim }] }
          ]}>
            <View style={styles.recordingIndicatorInner} />
          </Animated.View>
        </View>

        {/* 波形显示 */}
        <View style={styles.waveformContainer}>
          <View style={styles.waveformRow}>
            {renderWaveformLines()}
          </View>
          <View style={[styles.waveformRow, { marginTop: 207 }]}>
            {renderWaveformLines()}
          </View>
        </View>

        {/* 语言选择 */}
        <View style={styles.languageSelector}>
          <Text style={styles.languageText}>英文</Text>
          <View style={styles.languageSeparator} />
          <Text style={styles.languageText}>中文</Text>
          <View style={styles.languageSeparator} />
          <View style={styles.languageHighlight}>
            <View style={styles.microphoneGroup}>
              <View style={styles.micIcon1} />
              <View style={styles.micIcon2} />
              <View style={styles.micIcon3} />
            </View>
          </View>
        </View>
      </View>

      {/* 录制按钮区域 */}
      <View style={styles.recordingButtonArea}>
        <Text style={styles.recordingHint}>
          {isRecording ? '点击停止录制' : '点击开始录制'}
        </Text>
        
        <Animated.View style={[
          styles.recordingButtonContainer,
          { transform: [{ scale: scaleAnim }] }
        ]}>
          <TouchableOpacity 
            style={styles.recordingButton}
            onPress={handleRecordingPress}
            activeOpacity={0.8}
          >
            {/* 最外层青色圆圈 - Ellipse 87 */}
            <View style={styles.outerBlueCircle} />
            
            {/* 中间灰色圆圈 - Ellipse 86 */}
            <View style={styles.middleGrayCircle} />
            
            {/* 录制背景图片 - image 52 */}
            <Image 
              source={require('../../assets/images/recording_button_bg.png')}
              style={styles.recordingBgImage}
              resizeMode="cover"
            />
            
            {/* 渐变圆圈 - Ellipse 82 */}
            <View style={styles.gradientCircle} />
            
            {/* 中心播放/停止按钮 - Polygon 2 */}
            <View style={styles.playButtonContainer}>
              {isRecording ? (
                <View style={styles.stopButton} />
              ) : (
                <View style={styles.playButton} />
              )}
            </View>
            
            {/* 状态指示点 - Ellipse 88 */}
            <View style={[
              styles.statusIndicatorDot,
              isRecording && styles.statusIndicatorDotActive
            ]} />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* 歌词转译按钮 */}
      <TouchableOpacity style={styles.lyricsButton}>
        <Text style={styles.lyricsButtonText}>歌词转译</Text>
      </TouchableOpacity>

      {/* 操作按钮 */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.uploadButton}>
          <Text style={styles.uploadButtonText}>上传音频</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.nextButton}>
          <Text style={styles.nextButtonText}>下一步</Text>
        </TouchableOpacity>
      </View>

      {/* 底部导航 */}
      <View style={styles.bottomNavigation}>
        <View style={styles.bottomNavBackground} />
        <View style={styles.bottomNavContent}>
          <TouchableOpacity style={styles.navItem}>
            <View style={styles.navIconContainer}>
              <View style={styles.navIconBg} />
              <View style={styles.navIcon} />
            </View>
            <Text style={styles.navText}>翻译</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <View style={styles.musicNavIcon} />
            <Text style={[styles.navText, styles.navTextActive]}>音乐</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.navItem}>
            <View style={styles.profileNavIcon} />
            <Text style={styles.navText}>我的</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF4F4',
  },
  
  // 背景椭圆
  blueEllipse: {
    position: 'absolute',
    width: 173,
    height: 173,
    borderRadius: 86.5,
    backgroundColor: 'rgba(35, 187, 194, 0.31)',
    top: -34,
    right: 32,
  },
  yellowEllipse: {
    position: 'absolute',
    width: 173,
    height: 173,
    borderRadius: 86.5,
    backgroundColor: 'rgba(255, 233, 64, 0.31)',
    top: 13,
    left: -14,
  },

  // 状态栏
  statusBar: {
    height: 44,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 21,
    backgroundColor: '#FFFFFF',
  },
  statusBarLeft: {
    width: 54,
    height: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SF Pro Text',
  },
  statusBarRight: {
    width: 100,
    height: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  cellularIcon: {
    width: 17,
    height: 10.67,
    marginRight: 4,
    backgroundColor: '#000000',
    borderRadius: 2,
  },
  wifiIcon: {
    width: 15.27,
    height: 10.97,
    marginRight: 4,
    backgroundColor: '#000000',
    borderRadius: 2,
  },
  batteryContainer: {
    width: 25,
    height: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryBody: {
    width: 22,
    height: 11.33,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: 2.67,
    backgroundColor: '#FFFFFF',
  },
  batteryFill: {
    width: 18,
    height: 7.33,
    backgroundColor: '#000000',
    borderRadius: 1.33,
    margin: 2,
  },
  batteryHead: {
    width: 1.33,
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    marginLeft: 1,
  },

  // 顶部导航
  headerContainer: {
    height: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 18,
  },
  backButton: {
    width: 23,
    height: 23,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: 23,
    height: 23,
    backgroundColor: '#003337',
  },
  connectionStatus: {
    width: 100,
    height: 30,
    alignItems: 'flex-end',
  },
  connectionBadge: {
    width: 100,
    height: 30,
    backgroundColor: '#23BBC2',
    borderRadius: 45,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 3,
    paddingVertical: 2,
  },
  headphoneContainer: {
    width: 25,
    height: 25,
    backgroundColor: '#23BBC2',
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headphoneIndicator: {
    position: 'absolute',
    top: -1,
    right: 1,
    width: 6,
    height: 6,
    backgroundColor: '#FF5F5F',
    borderRadius: 3,
  },
  headphoneIcon: {
    width: 11.11,
    height: 13.89,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
  },
  connectionText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    marginLeft: 15,
  },

  // 录制区域
  recordingArea: {
    marginHorizontal: 17,
    marginTop: 18,
    height: 538,
    position: 'relative',
  },
  recordingAreaBackground: {
    position: 'absolute',
    width: 338,
    height: 538,
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
  },
  recordingOverlay: {
    position: 'absolute',
    left: 1,
    top: 132,
    width: 338,
    height: 203,
    backgroundColor: 'rgba(243, 243, 243, 0.24)',
  },

  // 时间显示
  timeSection: {
    position: 'absolute',
    left: 47,
    top: 27,
    width: 284,
    height: 94,
  },
  mainTimeText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#949494',
    fontFamily: 'Inter',
    textAlign: 'center',
    marginBottom: 63,
  },
  subTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 284,
  },
  subTimeText: {
    fontSize: 10,
    fontWeight: '300',
    color: '#949494',
    fontFamily: 'Inter',
    textAlign: 'center',
    width: 35,
  },

  // 录制指示器
  recordingIndicatorContainer: {
    position: 'absolute',
    left: 134,
    top: 140,
    width: 14,
    height: 14,
  },
  recordingIndicatorOuter: {
    width: 14,
    height: 14,
    backgroundColor: 'rgba(35, 187, 194, 0.2)',
    borderRadius: 7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  recordingIndicatorInner: {
    width: 4,
    height: 4,
    backgroundColor: '#23BBC2',
    borderRadius: 2,
  },

  // 波形显示
  waveformContainer: {
    position: 'absolute',
    left: 21,
    top: 238,
    width: 330,
    height: 4,
  },
  waveformRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: 330,
    height: 4,
  },
  waveformLine: {
    width: 1,
    backgroundColor: '#E7E7E7',
    borderWidth: 0.5,
    borderColor: '#E7E7E7',
  },

  // 语言选择
  languageSelector: {
    position: 'absolute',
    left: 17,
    top: 515,
    width: 105.83,
    height: 18.08,
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Inter',
    textAlign: 'center',
    width: 24,
  },
  languageSeparator: {
    width: 5.83,
    height: 5.86,
    backgroundColor: '#949494',
    marginHorizontal: 3,
  },
  languageHighlight: {
    position: 'absolute',
    left: 37,
    width: 32,
    height: 18.08,
    backgroundColor: '#DBEDF6',
    borderRadius: 69,
  },
  microphoneGroup: {
    position: 'absolute',
    left: 10.24,
    top: 4.02,
    width: 11.76,
    height: 9.67,
  },
  micIcon1: {
    position: 'absolute',
    left: 0.06,
    top: 2.9,
    width: 11.7,
    height: 0.92,
    backgroundColor: '#23BBC2',
  },
  micIcon2: {
    position: 'absolute',
    width: 11.7,
    height: 6.76,
    backgroundColor: '#23BBC2',
  },
  micIcon3: {
    position: 'absolute',
    left: 7.59,
    top: 5.84,
    width: 4.17,
    height: 3.83,
    backgroundColor: '#23BBC2',
  },

  // 录制按钮区域
  recordingButtonArea: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 608,
    alignItems: 'center',
    zIndex: 10,
  },
  recordingHint: {
    fontSize: 12,
    color: '#949494',
    fontFamily: 'Inter',
    fontWeight: '400',
    marginBottom: 14,
    textAlign: 'center',
  },
  recordingButtonContainer: {
    width: 100.69,
    height: 108.69,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recordingButton: {
    width: 100.69,
    height: 88,
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    position: 'relative',
    top: 20,
  },
  // 最外层青色圆圈 - Ellipse 87 (100.69x100.69px at 0,8 relative to Group 252)
  outerBlueCircle: {
    position: 'absolute',
    width: 100.69,
    height: 100.69,
    borderRadius: 50.35,
    backgroundColor: '#19A0A6',
    top: -12, // 8 - 20 (container top offset)
    left: 0,
  },
  // 中间灰色圆圈 - Ellipse 86 (76x76px at 12,20 relative to Group 252)
  middleGrayCircle: {
    position: 'absolute',
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#D9D9D9',
    top: 0, // 20 - 20 (container top offset)
    left: 12,
  },
  // 录制背景图片 - image 52 (59x59px at 0,0 relative to Group 245)
  recordingBgImage: {
    position: 'absolute',
    width: 59,
    height: 59,
    top: 9, // 29 - 20 (container top offset)
    left: 20,
    borderRadius: 29.5,
  },
  // 渐变圆圈 - Ellipse 82 (25x25px at 17,17 relative to Group 245)
  gradientCircle: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderRadius: 12.5,
    backgroundColor: '#27DDE6',
    borderWidth: 1,
    borderColor: '#19A0A6',
    top: 26, // 29 + 17 - 20 (container top offset)
    left: 37, // 20 + 17
  },
  // 状态指示点 - Ellipse 88 (6x6px at 62,22 relative to Group 252)
  statusIndicatorDot: {
    position: 'absolute',
    width: 6,
    height: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#19A0A6',
    top: 2, // 22 - 20 (container top offset)
    left: 62,
  },
  statusIndicatorDotActive: {
    backgroundColor: '#FF5F5F',
    borderColor: '#FF5F5F',
  },
  // 播放按钮容器 - Polygon 2 (28.95x28.95px at 36,44 relative to Group 252)
  playButtonContainer: {
    position: 'absolute',
    width: 28.95,
    height: 28.95,
    top: 24, // 44 - 20 (container top offset)
    left: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 0,
    borderTopWidth: 8,
    borderBottomWidth: 8,
    borderLeftColor: '#19A0A6',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: 3,
  },
  stopButton: {
    width: 16,
    height: 16,
    backgroundColor: '#19A0A6',
    borderRadius: 2,
  },

  // 歌词转译按钮
  lyricsButton: {
    position: 'absolute',
    right: 36,
    top: 736,
    width: 73,
    height: 24,
    backgroundColor: '#FCFCFC',
    borderWidth: 1,
    borderColor: '#23BBC2',
    borderRadius: 31,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 4,
  },
  lyricsButtonText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#23BBC2',
    fontFamily: 'Inter',
    textAlign: 'center',
  },

  // 操作按钮
  actionButtons: {
    position: 'absolute',
    left: 36,
    top: 780,
    width: 302,
    height: 40,
    flexDirection: 'row',
  },
  uploadButton: {
    width: 145,
    height: 40,
    backgroundColor: '#003337',
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 11,
  },
  uploadButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  nextButton: {
    marginLeft: 12,
    width: 145,
    height: 40,
    backgroundColor: '#003337',
    borderRadius: 36,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 11,
  },
  nextButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    textAlign: 'center',
  },

  // 底部导航
  bottomNavigation: {
    position: 'absolute',
    left: 20,
    bottom: 27,
    width: 334,
    height: 68,
  },
  bottomNavBackground: {
    position: 'absolute',
    width: 334,
    height: 68,
    backgroundColor: '#FFFFFF',
    borderWidth: 0.6,
    borderColor: '#23BBC2',
    borderRadius: 52,
    shadowColor: 'rgba(225, 236, 236, 0.67)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: 3.4,
    elevation: 4,
  },
  bottomNavContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 44,
    paddingTop: 17,
    paddingBottom: 15,
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    height: 38,
  },
  navIconContainer: {
    width: 24,
    height: 24,
    marginBottom: 2,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  navIconBg: {
    position: 'absolute',
    width: 24,
    height: 24,
    backgroundColor: '#E6E9E9',
    borderRadius: 12,
  },
  navIcon: {
    width: 14.04,
    height: 13.58,
    backgroundColor: '#949494',
    borderRadius: 2,
  },
  musicNavIcon: {
    width: 13,
    height: 16,
    marginBottom: 7,
    backgroundColor: '#949494',
    borderRadius: 2,
  },
  profileNavIcon: {
    width: 14,
    height: 13,
    marginTop: 7,
    marginBottom: 7,
    backgroundColor: '#949494',
    borderRadius: 2,
  },
  navText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#949494',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  navTextActive: {
    color: '#949494',
    fontWeight: '700',
  },
});

export default Recording; 