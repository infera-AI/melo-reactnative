/**
 * 哼唱录制页面
 * M1.1：引导用户在一个无干扰的环境下，轻松录制一段10-15秒的核心旋律
 * 根据Figma设计稿高保真还原 - node-id: 419-1992
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
  ScrollView,
  Image,
} from 'react-native';
import { normalize } from '../../utils/normalize';
import SongConfigScreen from './SongConfigScreen';
import { singToMusic } from '../../api/services/musicService';
import AudioRecorderPlayer, {
  AVEncoderAudioQualityIOSType,
  AudioEncoderAndroidType,
  AudioSourceAndroidType,
  RecordBackType,
} from 'react-native-audio-recorder-player';
import { PermissionsAndroid, Platform, Alert } from 'react-native';
import RNFS from 'react-native-fs';
import colors from '../../assets/colors';

interface HummingRecordingScreenProps {
  onBack?: () => void;
  onRecordingComplete?: (audioData: any) => void;
  onUploadAudio?: () => void;
  onNextStep?: () => void;
  onTabSwitch?: (tab: string) => void;
  onNavigateToLyricsCreateMusic?: (data: any) => void;
}

interface FileInfo {
  name: string;
  type: string;
  size: number;
  uri: string;
}

type RecordingState = 'ready' | 'recording' | 'analyzing';
type PageState = 'recording' | 'recordFinish' | 'songConfig';

const HummingRecordingScreen: React.FC<HummingRecordingScreenProps> = ({
  onBack,
  onRecordingComplete: _onRecordingComplete,
  onUploadAudio: _onUploadAudio,
  onNextStep: _onNextStep,
  onTabSwitch,
  onNavigateToLyricsCreateMusic,
}) => {
  const [recordingState, setRecordingState] = useState<RecordingState>('ready');
  const [currentPage, setCurrentPage] = useState<PageState>('recording');
  const [recordingTime, setRecordingTime] = useState(25);
  const [waveformKey, setWaveformKey] = useState(0);
  const [isRecording, setIsRecording] = useState(true);
  // const [_selectedLanguage, setSelectedLanguage] = useState<'chinese' | 'english'>('chinese');
  
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [_recordedAudioFile, setRecordedAudioFile] = useState<FileInfo | null>(null);
  const [uploading, setUploading] = useState(false);
  const audioRecorderPlayer = useRef(new AudioRecorderPlayer()).current;
  const [_recordingPath, setRecordingPath] = useState<string>('');

  // 请求录音权限
  const requestRecordPermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
          {
            title: '录音权限',
            message: '应用需要录音权限来录制您的哼唱',
            buttonNeutral: '稍后询问',
            buttonNegative: '取消',
            buttonPositive: '确定',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true;
  };

  // 开始录音
  const startRecording = React.useCallback(async () => {

  }, [audioRecorderPlayer]);

  // 停止录音
  const stopRecording = React.useCallback(async () => {
   
  }, [audioRecorderPlayer]);

  // 录制时的脉冲效果
  useEffect(() => {
    if (recordingState === 'recording') {
      const pulseAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      );
      pulseAnimation.start();
      return () => pulseAnimation.stop();
    }
  }, [recordingState, pulseAnim]);

  // 录制计时器和音波动画联动
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          if (newTime >= 60) {
            stopRecording();
            return prev;
          }
          return newTime;
        });
        setWaveformKey(prev => prev + 1); // 每秒刷新波形
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isRecording, stopRecording]);

  // 组件卸载时清理资源
  useEffect(() => {
    return () => {
      if (audioRecorderPlayer) {
        audioRecorderPlayer.stopRecorder();
        audioRecorderPlayer.removeRecordBackListener();
      }
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [audioRecorderPlayer]);

  // 组件挂载时自动开始录音
  useEffect(() => {
    startRecording();
  }, [startRecording]);

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}：${secs.toString().padStart(2, '0')}`;
  };

  // 处理Tab切换
  const handleTabPress = (tab: string) => {
    if (onTabSwitch) {
      onTabSwitch(tab);
    }
  };

  // 渲染音频波形 - 精确按照设计稿
  const renderWaveform = () => {
    const waveLines = [];
    for (let i = 0; i < 67; i++) {
      // 让每次渲染都不同，且与waveformKey相关，保证动画
      const seed = (waveformKey * 67 + i) % 1000;
      const height = (Math.sin(seed) + 1) * 15 + 5 + Math.random() * 5;
      waveLines.push(
        <View
          key={i}
          style={[
            styles.waveformLine,
            { height: normalize(height) }
          ]}
        />
      );
    }
    return waveLines;
  };

  // 录制按钮动画反馈
  const [_isRecordBtnPressed, setIsRecordBtnPressed] = useState(false);
  const recordBtnScale = useRef(new Animated.Value(1)).current;

  const handleRecordBtnPressIn = () => {
    setIsRecordBtnPressed(true);
    Animated.spring(recordBtnScale, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };
  const handleRecordBtnPressOut = () => {
    setIsRecordBtnPressed(false);
    Animated.spring(recordBtnScale, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };
  const handleRecordBtnPress = () => {
    if (recordingState === 'recording') {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // 处理下一步按钮点击 - 跳转到M1.3歌曲配置页面
  const handleNextStep = () => {
    console.log('跳转到歌曲配置页面');
    setCurrentPage('songConfig');
  };

  // 处理返回按钮 - 根据当前页面决定返回逻辑
  const handleBackPress = () => {
    if (currentPage === 'songConfig') {
      setCurrentPage('recording');
    } else if (currentPage === 'recordFinish') {
      setCurrentPage('recording');
    } else if (onBack) {
      onBack();
    }
  };

  // 处理上传音频文件
  const handleUploadAudio = async () => {
  };

  // 根据当前页面状态渲染不同组件
  if (currentPage === 'songConfig') {
    return (
      <SongConfigScreen 
        onBack={handleBackPress}
        {...(_onNextStep && { onNext: _onNextStep })}
      />
    );
  }

  // if (currentPage === 'recordFinish') {
  //   return (
  //     <RecordFinish 
  //       onWriteLyrics={() => console.log('写歌词')}
  //       onAIMatch={() => console.log('AI匹配')}
  //       onLanguageToggle={(lang) => console.log('语言切换:', lang)}
  //       showLanguageToggle={true}
  //     />
  //   );
  // }

    return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEF4F4" />
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} showsVerticalScrollIndicator={false}>
        {/* 背景渐变椭圆 - 精确位置 */}
        <View style={[styles.backgroundEllipse, styles.topEllipse]} />
        <View style={[styles.backgroundEllipse, styles.bottomEllipse]} />

        {/* 返回按钮和连接状态 */}
       {/* 顶部状态栏 */}
       <View style={styles.topStatusBar}>
        <TouchableOpacity style={styles.backButton} onPress={handleBackPress}>
           <Image
              source={require('../../assets/images/return_main.png')}
              style={styles.returnIcon}
              resizeMode="contain"
            />
        </TouchableOpacity>
       
        <View style={styles.connectionStatus}>
          <Image
              source={require('../../assets/images/ear_phone_main.png')}
              style={styles.returnIcon}
              resizeMode="contain"
            />
          <Text style={styles.connectionText}>30%</Text>
        </View>
        <View/>
      </View>

        {/* 录制区域容器 */}
        <View style={styles.recordingAreaContainer}>
          <View style={styles.recordingAreaBackground} />
          <View style={styles.recordingContentOverlay} />
          
          {/* 时间显示 */}
          <View style={styles.timeContainer}>
            <Text style={styles.mainTime}>{formatTime(recordingTime)}</Text>
            <View style={styles.subTimeContainer}>
              <Text style={styles.subTime}>{formatTime(Math.max(0, recordingTime - 3))}</Text>
              <Text style={styles.subTime}>{formatTime(Math.max(0, recordingTime - 1))}</Text>
              <Text style={styles.subTime}>{formatTime(recordingTime + 1)}</Text>
              <Text style={styles.subTime}>{formatTime(recordingTime + 3)}</Text>
            </View>
          </View>
            {/* 音频波形显示区域 */}
            <View style={styles.waveformSection}>
            <View style={styles.waveformContainer}>
              {renderWaveform()}
            </View>
            <View style={styles.waveformContainer}>
              {renderWaveform()}
            </View>
          </View>

          {/* 录制指示器 */}
          <View style={styles.recordingIndicatorContainer}>
          <Animated.View
              style={[
                styles.recordingIndicator,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <View style={styles.recordingDot} />
          </Animated.View>
          </View>

        

          {/* 录制按钮 - 按照Figma设计Group 252 */}
          <View style={styles.recordBtnWrapper}>
            <Text style={styles.recordBtnLabel}>
              {recordingState === 'recording' ? '点击停止录制' : '点击开始录制'}
            </Text>
            
            <Animated.View style={[
              styles.recordBtnContainer,
              { transform: [{ scale: recordBtnScale }] }
            ]}>
              <TouchableOpacity
                activeOpacity={0.8}
                onPressIn={handleRecordBtnPressIn}
                onPressOut={handleRecordBtnPressOut}
                onPress={handleRecordBtnPress}
                style={styles.recordBtn}
              >
                {/* 最外层青色圆圈 - Ellipse 87 */}
                <View style={styles.outerBlueCircle} />
                
                {/* 中间灰色圆圈 - Ellipse 86 */}
                <View style={styles.middleGrayCircle} />
                
                {/* 录制背景图片 - Group 245 */}
                <View style={styles.recordBgGroup}>
                  <Image 
                    source={require('../../assets/images/recording_button_bg.png')}
                    style={styles.recordBgImage}
                    resizeMode="cover"
                  />
                  
                  {/* 渐变圆圈 */}
                  <View style={styles.gradientCircle} />
                </View>
                
                {/* 中心播放/停止按钮 - Polygon 2 */}
                <View style={styles.playButtonContainer}>
                  {recordingState === 'recording' ? (
                    <View style={styles.stopButton} />
                  ) : (
                    <View style={styles.playButton} />
                  )}
                </View>
                
                {/* 状态指示点 - Ellipse 88 */}
                {/* <View style={[
                  styles.statusIndicatorDot,
                  recordingState === 'recording' && styles.statusIndicatorDotActive
                ]} /> */}
              </TouchableOpacity>
            </Animated.View>
          </View>
        </View>

        {/* 语言选择区域 */}
        {/* <View style={styles.languageSection}>
          <TouchableOpacity 
            style={[styles.languageOption]}
            onPress={() => setSelectedLanguage('english')}
          >
            <Text style={styles.languageText}>英文</Text>
          </TouchableOpacity>
          <View style={styles.languageDivider} />
          <TouchableOpacity 
            style={[styles.languageOption]}
            onPress={() => setSelectedLanguage('chinese')}
          >
            <Text style={styles.languageText}>中文</Text>
          </TouchableOpacity>
          <View style={styles.languageDivider} />
          <View style={styles.languageHighlight}>
            <View style={styles.microphoneGroup}>
              <View style={styles.microphoneIcon1} />
              <View style={styles.microphoneIcon2} />
              <View style={styles.microphoneIcon3} />
        </View>
      </View>
        </View> */}

       
        {/* 歌词转译按钮 */}
        {/* <View style={styles.lyricsTranslateContainer}>
          <TouchableOpacity style={styles.lyricsTranslateFrame}>
            <Text style={styles.lyricsTranslateText}>歌词转译</Text>
          </TouchableOpacity>
        </View> */}

         {/* 操作按钮组 */}
         <View style={styles.actionButtonsGroup}>
           {currentPage !== 'recordFinish' ? (
             <TouchableOpacity 
               style={styles.uploadFrame}
               onPress={() => setCurrentPage('recordFinish')}
               activeOpacity={0.8}
             >
               <Text style={styles.uploadText}>录制完成</Text>
             </TouchableOpacity>
           ) : (
             <TouchableOpacity
               style={[styles.uploadFrame, uploading && styles.uploadFrameDisabled]}
               onPress={handleUploadAudio}
               activeOpacity={0.8}
               disabled={uploading}
             >
               <Text style={styles.uploadText}>
                 {uploading ? '上传中...' : '上传音频文件'}
               </Text>
             </TouchableOpacity>
           )}
           <TouchableOpacity 
             style={styles.nextStepFrame}
             onPress={handleNextStep}
             activeOpacity={0.8}
           >
             <Text style={styles.nextStepText}>下一步</Text>
           </TouchableOpacity>
         </View>


      {/* 底部导航栏 */}
        <View style={styles.bottomNavigationContainer}>
          <View style={styles.bottomNavBackground} />
          <View style={styles.navContent}>
            {/* 翻译Tab */}
            <TouchableOpacity 
              style={styles.navGroup}
              onPress={() => handleTabPress('translation')}
            >
              <View style={styles.navIconContainer}>
                <View style={styles.navEllipse} />
                <View style={styles.translationIcon} />
              </View>
              <Text style={styles.navText}>翻译</Text>
        </TouchableOpacity>
        
            {/* 音乐Tab - 激活状态 */}
            <TouchableOpacity 
              style={styles.navGroup}
              onPress={() => handleTabPress('music')}
            >
              <View style={styles.musicIcon} />
              <Text style={[styles.navText, styles.navTextActive]}>音乐</Text>
        </TouchableOpacity>
        
            {/* 我的Tab */}
            <TouchableOpacity 
              style={styles.navGroup}
              onPress={() => handleTabPress('profile')}
            >
              <View style={styles.profileIcon} />
              <Text style={styles.navText}>我的</Text>
        </TouchableOpacity>
      </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF4F4',
  },
  
  // 背景椭圆 - 精确位置
  backgroundEllipse: {
    position: 'absolute',
    width: normalize(173),
    height: normalize(173),
    borderRadius: normalize(86.5),
  },
  topStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    marginTop: normalize(20),
    height: normalize(92),
  },
  backButton: {
    width: normalize(23),
    height: normalize(23),
    alignItems: 'center',
    justifyContent: 'center',
  },
  returnIcon: {
    width: normalize(23),
    height: normalize(23),
  },
  backIcon: {
    fontSize: normalize(23),
    color: '#003337',
    fontWeight: '300',
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.buttonColor,
    borderRadius: normalize(45),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(7),
    width: normalize(100),
    height: normalize(30),
    borderWidth: 1,
    borderColor: '#23BBC2',
  },
  connectionIcon: {
    width: normalize(6),
    height: normalize(6),
    borderRadius: normalize(3),
    backgroundColor: '#FF5F5F',
    marginRight: normalize(6),
  },
  connectionText: {
    fontSize: normalize(14),
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Inter',
    lineHeight: normalize(17),
  },
  topEllipse: {
    top: normalize(-34),
    right: normalize(32),
    backgroundColor: 'rgba(35, 187, 194, 0.31)',
  },
  bottomEllipse: {
    top: normalize(13),
    left: normalize(-14),
    backgroundColor: 'rgba(255, 233, 64, 0.31)',
  },

  // 状态栏 - iPhone状态栏样式
  statusBar: {
    height: normalize(44),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(21),
    backgroundColor: '#FFFFFF',
  },
  statusBarContent: {
    width: normalize(54),
    height: normalize(28),
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeText: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SF Pro Text',
  },
  statusBarInfo: {
    width: normalize(100),
    height: normalize(28),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  cellularIcon: {
    width: normalize(17),
    height: normalize(10.67),
    backgroundColor: '#000000',
    marginRight: normalize(4),
  },
  wifiIcon: {
    width: normalize(15.27),
    height: normalize(10.97),
    backgroundColor: '#000000',
    marginRight: normalize(4),
  },
  batteryContainer: {
    width: normalize(25),
    height: normalize(12),
    flexDirection: 'row',
    alignItems: 'center',
  },
  batteryBody: {
    width: normalize(22),
    height: normalize(11.33),
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: normalize(2.67),
    backgroundColor: '#FFFFFF',
  },
  batteryHead: {
    width: normalize(1.33),
    height: normalize(4),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    marginLeft: normalize(1),
  },

  // 顶部控制区域
  headerContainer: {
    height: normalize(30),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    marginTop: normalize(32),
  },
  connectionGroup: {
    width: normalize(73),
    height: normalize(25),
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23BBC2',
    borderRadius: normalize(18),
    paddingHorizontal: normalize(3),
    paddingVertical: normalize(2),
  },
  headphoneFrame: {
    width: normalize(25),
    height: normalize(25),
    backgroundColor: '#23BBC2',
    borderRadius: normalize(18),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  headphoneIndicator: {
    position: 'absolute',
    top: normalize(-1),
    right: normalize(1),
    width: normalize(6),
    height: normalize(6),
    backgroundColor: '#FF5F5F',
    borderRadius: normalize(3),
  },
  headphoneIcon: {
    width: normalize(11.11),
    height: normalize(13.89),
    backgroundColor: '#003337',
  },

  // 录制区域
  recordingAreaContainer: {
    position: 'relative',
    marginHorizontal: normalize(17),
    marginTop: normalize(48),
    height: normalize(538),
  },
  recordingAreaBackground: {
    position: 'absolute',
    width: normalize(338),
    height: normalize(538),
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(6),
  },
  recordingContentOverlay: {
    position: 'absolute',
    left: normalize(1),
    top: normalize(132),
    width: normalize(338),
    height: normalize(203),
    backgroundColor: 'rgba(243, 243, 243, 0.24)',
  },

  // 时间显示
  timeContainer: {
    position: 'absolute',
    left: normalize(47), // 保持原位置，主时间通过alignItems居中与录制指示器对齐
    top: normalize(27),
    width: normalize(284),
    height: normalize(94),
    alignItems: 'center', // 确保主时间水平居中，与录制指示器精确对齐
  },
  mainTime: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: '#949494',
    fontFamily: 'Inter',
    textAlign: 'center',
    marginBottom: normalize(63),
  },
  subTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: normalize(284),
  },
  subTime: {
    fontSize: normalize(10),
    fontWeight: '300',
    color: '#949494',
    fontFamily: 'Inter',
    textAlign: 'center',
    width: normalize(35),
  },

  // 录制指示器
  recordingIndicatorContainer: {
    position: 'absolute',
    left: normalize(182), // 精确对齐：时间容器中心189 - 指示器宽度14/2 = 182
    top: normalize(140),
    width: normalize(14),
    height: normalize(14),
  },
  recordingIndicator: {
    width: normalize(14),
    height: normalize(14),
  },
  recordingDot: {
    width: normalize(14),
    height: normalize(14),
    backgroundColor: 'rgba(35, 187, 194, 0.2)',
    borderRadius: normalize(7),
  },

  // 波形显示
  waveformSection: {
    position: 'absolute',
    left: normalize(47), // 与时间容器对齐
    top: normalize(4), // 紧接在时间显示区域下方 (27 + 94 + 29间距)
    width: normalize(284), // 与时间容器宽度完全一致
    height: normalize(207),
  },
  waveformContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    width: normalize(284), // 与时间容器宽度一致
    height: normalize(4),
    marginVertical: normalize(101.5),
  },
  waveformLine: {
    width: normalize(0),
    backgroundColor: '#E7E7E7',
    borderWidth: 0.5,
    borderColor: '#E7E7E7',
  },

  // 录制按钮 - 按照Figma Group 252设计
  recordBtnWrapper: {
    position: 'absolute',
    left: normalize(138), // 按照Figma设计位置
    top: normalize(498 - 110), // 相对于录制区域的位置
    width: normalize(100.69),
    height: normalize(108.69),
    alignItems: 'center',
    zIndex: 10,
  },
  recordBtnLabel: {
    fontSize: normalize(12),
    color: '#949494',
    fontWeight: '400',
    fontFamily: 'Inter',
    textAlign: 'center',
    marginBottom: normalize(14),
  },
  recordBtnContainer: {
    width: normalize(100.69),
    height: normalize(88),
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  recordBtn: {
    width: normalize(100.69),
    height: normalize(88),
    alignItems: 'flex-start',
    justifyContent: 'flex-start',
    position: 'relative',
  },
  // 最外层青色圆圈 - Ellipse 87 (100.69x100.69px at 0,8)
  outerBlueCircle: {
    position: 'absolute',
    width: normalize(100.69),
    height: normalize(100.69),
    borderRadius: normalize(50.35),
    backgroundColor: '#19A0A6',
    top: normalize(8),
    left: 0,
  },
  // 中间灰色圆圈 - Ellipse 86 (76x76px at 12,20)
  middleGrayCircle: {
    position: 'absolute',
    width: normalize(76),
    height: normalize(76),
    borderRadius: normalize(38),
    backgroundColor: '#D9D9D9',
    top: normalize(20),
    left: normalize(12),
  },
  // 录制背景组 - Group 245 (59x59px at 20,29)
  recordBgGroup: {
    position: 'absolute',
    width: normalize(59),
    height: normalize(59),
    top: normalize(29),
    left: normalize(20),
  },
  // 录制背景图片 - image 52
  recordBgImage: {
    position: 'absolute',
    width: normalize(59),
    height: normalize(59),
    top: 0,
    left: 0,
    borderRadius: normalize(29.5),
  },
  // 渐变圆圈 - Ellipse 82 (25x25px at 17,17 relative to Group 245)
  gradientCircle: {
    position: 'absolute',
    width: normalize(25),
    height: normalize(25),
    borderRadius: normalize(12.5),
    backgroundColor: '#27DDE6',
    borderWidth: 1,
    borderColor: '#19A0A6',
    top: normalize(17),
    left: normalize(17),
  },
  // 播放按钮容器 - Polygon 2 (28.95x28.95px at 36,44)
  playButtonContainer: {
    position: 'absolute',
    width: normalize(28.95),
    height: normalize(28.95),
    top: normalize(44),
    left: normalize(36),
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButton: {
    width: 0,
    height: 0,
    borderLeftWidth: normalize(12),
    borderRightWidth: 0,
    borderTopWidth: normalize(8),
    borderBottomWidth: normalize(8),
    borderLeftColor: '#19A0A6',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: normalize(3),
  },
  stopButton: {
    width: normalize(16),
    height: normalize(16),
    backgroundColor: '#19A0A6',
    borderRadius: normalize(2),
  },
  // 状态指示点 - Ellipse 88 (6x6px at 62,22)
  statusIndicatorDot: {
    position: 'absolute',
    width: normalize(6),
    height: normalize(6),
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(3),
    borderWidth: 1,
    borderColor: '#19A0A6',
    top: normalize(22),
    left: normalize(62),
  },
  statusIndicatorDotActive: {
    backgroundColor: '#FF5F5F',
    borderColor: '#FF5F5F',
  },

  // 语言选择
  languageSection: {
    position: 'absolute',
    left: normalize(29),
    top: normalize(612),
    width: normalize(105.83),
    height: normalize(18.08),
    flexDirection: 'row',
    alignItems: 'center',
  },
  languageOption: {
    paddingVertical: normalize(2),
  },
  languageText: {
    fontSize: normalize(12),
    fontWeight: '400',
    color: '#000000',
    fontFamily: 'Inter',
    textAlign: 'center',
    width: normalize(24),
  },
  languageDivider: {
    width: normalize(5.83),
    height: normalize(5.86),
    backgroundColor: '#949494',
    marginHorizontal: normalize(3),
  },
  languageHighlight: {
    position: 'absolute',
    left: normalize(37),
    width: normalize(32),
    height: normalize(18.08),
    backgroundColor: '#DBEDF6',
    borderRadius: normalize(69),
  },
  microphoneGroup: {
    position: 'absolute',
    left: normalize(10.24),
    top: normalize(4.02),
    width: normalize(11.76),
    height: normalize(9.67),
  },
  microphoneIcon1: {
    position: 'absolute',
    left: normalize(0.06),
    top: normalize(2.9),
    width: normalize(11.7),
    height: normalize(0.92),
    backgroundColor: '#23BBC2',
  },
  microphoneIcon2: {
    position: 'absolute',
    width: normalize(11.7),
    height: normalize(6.76),
    backgroundColor: '#23BBC2',
  },
  microphoneIcon3: {
    position: 'absolute',
    left: normalize(7.59),
    top: normalize(5.84),
    width: normalize(4.17),
    height: normalize(3.83),
    backgroundColor: '#23BBC2',
  },

  // 操作按钮
  actionButtonsGroup: {
    position: 'relative',
    left: normalize(36),
    top: normalize(10),
    width: normalize(302),
    height: normalize(40),
    flexDirection: 'row',
    marginBottom: normalize(100),
  },
  uploadFrame: {
    width: normalize(145),
    height: normalize(40),
    backgroundColor: '#003337',
    borderRadius: normalize(36),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: normalize(40),
    paddingVertical: normalize(11),
  },
  uploadText: {
    fontSize: normalize(14),
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  nextStepFrame: {
    marginLeft: normalize(12),
    width: normalize(145),
    height: normalize(40),
    backgroundColor: '#003337',
    borderRadius: normalize(36),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: normalize(40),
    paddingVertical: normalize(11),
  },
  nextStepText: {
    fontSize: normalize(14),
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  uploadFrameDisabled: {
    backgroundColor: '#949494',
  },

  // 歌词转译按钮
  lyricsTranslateContainer: {
    position: 'absolute',
    left: normalize(270),
    top: normalize(609),
    width: normalize(69),
    height: normalize(24),
  },
  lyricsTranslateFrame: {
    width: normalize(69),
    height: normalize(24),
    backgroundColor: '#FCFCFC',
    borderWidth: 1,
    borderColor: '#23BBC2',
    borderRadius: normalize(31),
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: normalize(9),
    paddingVertical: normalize(4),
  },
  lyricsTranslateText: {
    fontSize: normalize(12),
    fontWeight: '400',
    color: '#23BBC2',
    fontFamily: 'Inter',
    textAlign: 'center',
  },

  // 底部导航
  bottomNavigationContainer: {
    position: 'absolute',
    left: normalize(20),
    bottom: normalize(0),
    width: normalize(334),
    height: normalize(68),
  },
  bottomNavBackground: {
    position: 'absolute',
    width: normalize(334),
    height: normalize(68),
    backgroundColor: '#FFFFFF',
    borderWidth: normalize(0.6),
    borderColor: '#23BBC2',
    borderRadius: normalize(52),
    shadowColor: 'rgba(225, 236, 236, 0.67)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 1,
    shadowRadius: normalize(3.4),
    elevation: 4,
  },
  navContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(44),
    paddingTop: normalize(17),
    paddingBottom: normalize(15),
  },
  navGroup: {
    flex: 1,
    alignItems: 'center',
    height: normalize(38),
  },
  navIconContainer: {
    width: normalize(24),
    height: normalize(24),
    marginBottom: normalize(2),
    position: 'relative',
  },
  navEllipse: {
    position: 'absolute',
    width: normalize(24),
    height: normalize(24),
    backgroundColor: '#E6E9E9',
    borderRadius: normalize(12),
  },
  translationIcon: {
    position: 'absolute',
    width: normalize(14.04),
    height: normalize(13.58),
    backgroundColor: '#949494',
    left: normalize(5),
    top: normalize(5),
  },
  musicIcon: {
    width: normalize(13),
    height: normalize(16),
    backgroundColor: '#949494',
    marginBottom: normalize(7),
  },
  profileIcon: {
    width: normalize(14),
    height: normalize(13),
    backgroundColor: '#003337',
    marginTop: normalize(7),
    marginBottom: normalize(7),
  },
  navText: {
    fontSize: normalize(12),
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

export default HummingRecordingScreen; 