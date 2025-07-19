/**
 * M1.3 歌曲配置与生成页
 * 页面目标: 音乐播放页面，展示歌曲列表、播放控制和歌词
 * 根据Figma设计稿高保真还原 - node-id: 401-1660
 * 优化版本：现代化UI设计，增强用户体验
 */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  ScrollView,
  Dimensions,
  Alert,
  SafeAreaView,
  Animated,
  Image,
} from 'react-native';
import { saveMusicWork } from '../../api/services/musicService';
import { useRef } from 'react';
import colors from '../../assets/colors';
// SongDetailScreen 已移除
// 移除顶部import calendarIcon
// 移除重复的calendarIcon样式定义，只保留新卡片用的calendarIcon样式

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
const normalize = (size: number) => Math.round(size * scale);

interface SongConfigScreenProps {
  onBack?: () => void;
  onNext?: () => void;
  onNavigateToMyWorks?: () => void;
  songData: any;
}

const SongConfigScreen: React.FC<SongConfigScreenProps> = ({ 
  onBack, 
  onNavigateToMyWorks = () => {},
  songData,
}) => {
  // 只用 songData 传递
  const [generating, setGenerating] = useState(false);
  const pollTimer = useRef<NodeJS.Timeout | null>(null);
  // 动画值
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const spinValue = useRef(new Animated.Value(0)).current;
  const [selectedIndex, setSelectedIndex] = useState(0);

  // 作品数组转换
  function convertSongData(songData: any) {
    if (!songData || !songData.work_url) return [];
    const length = songData.work_url.length;
    const genres = [];
    for (let i = 0; i < songData.work_genres.length; i++) {
      genres.push(songData.work_genres[i]);
    }
    const result = [];
    for (let i = 0; i < length; i++) {
      result.push({
        id:i,
        url: songData.work_url[i],
        cover: songData.work_cover[i],
        title: songData.work_title,
        lyrics: songData.work_lyrics,
        taskId:songData.task_id,
        genres,
      });
    }
    return result;
  }
  const songList = convertSongData(songData);

  // 所有useEffect都放在early return之前
  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim]);

  useEffect(() => {
    if (generating) {
      const spin = () => {
        Animated.loop(
          Animated.timing(spinValue, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true,
          })
        ).start();
      };
      spin();
    }
  }, [generating, spinValue]);

  useEffect(() => {
    return () => {
      if (pollTimer.current) {
        clearTimeout(pollTimer.current);
      }
    };
  }, []);

  if (!songData || !songData.work_url) {
    return <View style={{flex:1,justifyContent:'center',alignItems:'center'}}><Text>暂无作品数据</Text></View>;
  }

  // 获取推荐曲风逻辑已移除（由songData直接提供）

  // 保存作品
  const handleSaveWork = async () => {
    if (songList.length === 0) {
      Alert.alert('提示', '没有可保存的作品');
      return;
    }

    setGenerating(true);
    try {
      // 调用保存作品接口
      const result = await saveMusicWork({
        task_id:songList[selectedIndex].taskId,
        music_index_list: [selectedIndex.toString()] // 保存当前选中的作品
      });
      
        Alert.alert('保存成功', '作品已保存到我的作品');
        // 可选：跳转到我的作品页面
        if (onNavigateToMyWorks) {
          onNavigateToMyWorks();
        }
    } catch (e: any) {
      console.error('保存作品失败:', e);
      Alert.alert('保存失败', e.message || '网络错误，请重试');
    } finally {
      setGenerating(false);
    }
  };

  // 轮询查询任务状态（暂时保留，可能在其他地方使用）
  // const pollTaskStatus = async (taskId: string) => {
  //   const poll = async () => {
  //     try {
  //       const res = await getMusicTaskStatus({ task_id: taskId });
  //       if (res && res.data !== null) {
  //         setGenerating(false);
  //         onNavigateToMyWorks();
  //       } else {
  //         pollTimer.current = setTimeout(poll, 1500);
  //       }
  //     } catch (e) {
  //       setGenerating(false);
  //       Alert.alert('查询任务状态失败', '请重试');
  //     }
  //   };
  //   poll();
  // };

  // 返回主页
  const handleBack = () => {
    if (generating) {
      Alert.alert('提示', '歌曲生成中，请勿离开页面');
      return;
    }
    if (onBack) {
      onBack();
    }
  };

  // Tab切换处理
  const handleTabPress = (tab: string) => {
    console.log('Tab pressed:', tab);
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1A1A2E" />
      
      {/* 动态背景 */}
      <View style={styles.backgroundContainer}>
        <View style={[styles.backgroundGradient, styles.topGradient]} />
        <View style={[styles.backgroundGradient, styles.bottomGradient]} />
        <View style={styles.backgroundOverlay} />
      </View>

      <Animated.View 
        style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }]
          }
        ]}
      >
        {/* 顶部状态栏区域 */}
        <View style={styles.statusBarArea}>
          <Text style={styles.statusTime}>9:41</Text>
          <View style={styles.statusIcons}>
            <View style={styles.signalIcon} />
            <View style={styles.wifiIcon} />
            <View style={styles.batteryIcon}>
              <View style={styles.batteryFill} />
            </View>
          </View>
        </View>

        {/* 顶部状态栏 */}
        <View style={styles.topStatusBar}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={handleBack}
            disabled={generating}
          >
             <Image
                source={require('../../assets/images/return_main.png')}
                style={styles.returnIcon}
                resizeMode="contain"
              />
          </TouchableOpacity>
         
          <View style={styles.connectionStatus}>
          <View style={styles.circleContainer}>
            <Image
                source={require('../../assets/images/ear_phone_main.png')}
                style={styles.returnIcon}
                resizeMode="contain"
              />
          </View>
            <Text style={styles.connectionText}>30%</Text>
          </View>
          <View/>
        </View>

        {/* 主内容区域 */}
        <ScrollView 
          style={styles.mainContent}
          showsVerticalScrollIndicator={false}
          bounces={false}
        >
        

          {/* 歌词显示区域 */}
          <View style={styles.lyricsContainer}>
            <Text style={styles.lyricsLabel}>歌词</Text>
            <ScrollView style={styles.lyricsScrollView} showsVerticalScrollIndicator={false}>
              <Text style={styles.lyricsText}>
                {songList[selectedIndex]?.lyrics || '暂无歌词'}
              </Text>
            </ScrollView>
          </View>

          {/* 作品选择区域 */}
          <View style={styles.genreSelectionContainer}>
            <View style={styles.genreHeader}>
              <View style={styles.genreIcon} />
              <Text style={styles.genreSelectionTitle}>选择作品</Text>
            </View>
            {/* 移除loading */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.genreScrollView}
              contentContainerStyle={styles.genreScrollContent}
            >
              {songList.map((work, index) => (
                <TouchableOpacity
                  key={index}
                  style={[styles.cardContainer, selectedIndex === index && styles.cardContainerSelected]}
                  onPress={() => setSelectedIndex(index)}
                  activeOpacity={0.9}
                >
                  {/* 背景图 */}
                  <Image source={{ uri: work.cover }} style={styles.cardBgImage} />
                  {/* 顶部栏 */}
                  <View style={styles.cardTopBar}>
                    <View style={styles.cardTopLeft}>
                      <View style={styles.calendarIcon} />
                      <Text style={styles.topBarText}>每日推荐</Text>
                    </View>
                    <View style={styles.radioOuter}>
                      {selectedIndex === index && <View style={styles.radioInner} />}
                    </View>
                  </View>
                  {/* 播放按钮 */}
                  <View style={styles.playButton}>
                    <View style={styles.playTriangle} />
                  </View>
                  {/* 底部栏 */}
                  <View style={styles.cardBottomBar}>
                    <Text style={styles.bottomBarText}>{work.title || '今日限定好歌'}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </ScrollView>

        {/* 底部生成按钮 */}
        <View style={styles.bottomButtonContainer}>
          <TouchableOpacity 
            style={[styles.generateButton, generating && styles.generateButtonDisabled]}
            onPress={()=>{}}
            disabled={generating}
          >
            <View style={styles.generateButtonBackground} />
            {generating && (
              <Animated.View 
                style={[
                  styles.generateSpinner,
                  { transform: [{ rotate: spin }] }
                ]} 
              />
            )}
            <Text style={styles.generateButtonText}>
              再来一曲
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.generateButton, generating && styles.generateButtonDisabled]}
            onPress={handleSaveWork}
            disabled={generating}
          >
            <View style={styles.generateButtonBackground} />
            {generating && (
              <Animated.View 
                style={[
                  styles.generateSpinner,
                  { transform: [{ rotate: spin }] }
                ]} 
              />
            )}
            <Text style={styles.generateButtonText}>
                保存到我的作品
            </Text>
          </TouchableOpacity>
        </View>

        {/* 底部导航 */}
        <View style={styles.bottomNavigationContainer}>
          <View style={styles.bottomNavBackground} />
          <View style={styles.navContent}>
            <TouchableOpacity 
              style={styles.navGroup}
              onPress={() => handleTabPress('translation')}
            >
              <View style={styles.navIconContainer}>
                <View style={styles.translationIcon} />
              </View>
              <Text style={styles.navText}>翻译</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navGroup}
              onPress={() => handleTabPress('music')}
            >
              <View style={[styles.navIconContainer, styles.activeNavIcon]}>
                <View style={styles.musicIcon} />
              </View>
              <Text style={[styles.navText, styles.navTextActive]}>音乐</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.navGroup}
              onPress={() => handleTabPress('profile')}
            >
              <View style={styles.navIconContainer}>
                <View style={styles.profileIcon} />
              </View>
              <Text style={styles.navText}>我的</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Animated.View>

      {/* 生成过程遮罩 */}
      {generating && (
        <View style={styles.generatingOverlay}>
          <View style={styles.generatingModal}>
            <Animated.View 
              style={[
                styles.generatingSpinner,
                { transform: [{ rotate: spin }] }
              ]} 
            />
            <Text style={styles.generatingText}>正在创作您的音乐...</Text>
            <Text style={styles.generatingSubText}>AI正在为您精心制作，请稍候片刻</Text>
            <View style={styles.progressContainer}>
              <View style={styles.progressBar}>
                <Animated.View style={styles.progressFill} />
              </View>
            </View>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  
  // 动态背景
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  backgroundGradient: {
    position: 'absolute',
    width: normalize(300),
    height: normalize(300),
    borderRadius: normalize(150),
  },
  topGradient: {
    top: normalize(-100),
    right: normalize(-50),
    backgroundColor: 'rgba(120, 119, 198, 0.3)',
  },
  bottomGradient: {
    bottom: normalize(-100),
    left: normalize(-50),
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
  },
  backgroundOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(26, 26, 46, 0.85)',
  },

  content: {
    flex: 1,
  },

  // 状态栏区域
  statusBarArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(21),
    paddingTop: normalize(9),
    height: normalize(44),
  },
  statusTime: {
    fontSize: normalize(15),
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(5),
  },
  signalIcon: {
    width: normalize(17),
    height: normalize(11),
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(2),
    opacity: 0.8,
  },
  wifiIcon: {
    width: normalize(15),
    height: normalize(11),
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(2),
    opacity: 0.8,
  },
  batteryIcon: {
    width: normalize(25),
    height: normalize(12),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: normalize(3),
    position: 'relative',
  },
  batteryFill: {
    position: 'absolute',
    left: normalize(2),
    top: normalize(2),
    width: normalize(18),
    height: normalize(7),
    backgroundColor: '#4CAF50',
    borderRadius: normalize(1),
  },

  // 顶部状态栏
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
  circleContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#fff',
    margin: 2,
    alignItems: 'center',
    justifyContent: 'center',
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
  backButtonDisabled: {
    opacity: 0.4,
  },
  backIcon: {
    fontSize: normalize(20),
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  backIconDisabled: {
    color: '#888',
  },
  connectionFrame: {
    backgroundColor: 'rgba(76, 175, 80, 0.9)',
    borderRadius: normalize(20),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(8),
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  connectionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headphoneFrame: {
    width: normalize(24),
    height: normalize(24),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: normalize(12),
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginRight: normalize(8),
  },
  headphoneIndicator: {
    position: 'absolute',
    top: normalize(-2),
    right: normalize(-2),
    width: normalize(8),
    height: normalize(8),
    backgroundColor: '#FF6B6B',
    borderRadius: normalize(4),
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  headphoneIcon: {
    width: normalize(14),
    height: normalize(14),
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(3),
  },
  connectionText: {
    fontSize: normalize(13),
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // 主内容区域
  mainContent: {
    flex: 1,
    paddingHorizontal: normalize(20),
  },

  // 歌曲信息卡片
  songCard: {
    width: normalize(131),
    height: normalize(147),
    borderRadius: normalize(16),
    padding: normalize(12),
    marginHorizontal: normalize(6),
    flexDirection: 'column',
    justifyContent: 'space-between',
    position: 'relative',
    overflow: 'hidden',
  },
  songCardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#00BFFF',
    borderRadius: normalize(16),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  songCardGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: normalize(16),
  },
  songCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    width: '100%',
    marginBottom: normalize(8),
  },
  dailyRecommendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: normalize(12),
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(3),
  },
  // 只保留新卡片用的calendarIcon样式
  calendarIcon: {
    width: normalize(16),
    height: normalize(16),
    marginRight: normalize(4),
  },
  dailyRecommendText: {
    fontSize: normalize(8),
    color: '#FFFFFF',
    fontWeight: '600',
  },
  userAvatar: {
    width: normalize(24),
    height: normalize(24),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: normalize(12),
  },
  centerPlayButton: {
    position: 'absolute',
    right: normalize(8),
    bottom: normalize(35),
    width: normalize(28),
    height: normalize(28),
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: normalize(14),
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  centerPlayIcon: {
    width: 0,
    height: 0,
    borderLeftWidth: normalize(10),
    borderRightWidth: 0,
    borderTopWidth: normalize(7),
    borderBottomWidth: normalize(7),
    borderLeftColor: '#00BFFF',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
    marginLeft: normalize(1),
  },
  centerPauseIcon: {
    width: normalize(10),
    height: normalize(10),
    backgroundColor: '#00BFFF',
    borderRadius: normalize(1),
  },
  songCardFooter: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: normalize(8),
    padding: normalize(6),
    alignSelf: 'stretch',
  },
  songCardTitle: {
    fontSize: normalize(10),
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  genreTagSmall: {
    backgroundColor: 'rgba(120, 119, 198, 0.3)',
    borderRadius: normalize(8),
    paddingHorizontal: normalize(4),
    paddingVertical: normalize(2),
    borderWidth: 1,
    borderColor: 'rgba(120, 119, 198, 0.5)',
    marginTop: normalize(2),
  },
  genreTagSmallText: {
    fontSize: normalize(6),
    color: '#7877C6',
    fontWeight: '600',
  },

  // 歌词区域
  lyricsContainer: {
    borderRadius: normalize(20),
    padding: normalize(20),
    marginBottom: normalize(24),
    maxHeight: normalize(220),
    position: 'relative',
    overflow: 'hidden',
  },
  lyricsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(16),
  },
  lyricsIcon: {
    width: normalize(20),
    height: normalize(20),
    backgroundColor: '#FF6B6B',
    borderRadius: normalize(10),
    marginRight: normalize(10),
  },
  lyricsLabel: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  lyricsScrollView: {
    maxHeight: normalize(140),
  },
  lyricsText: {
    fontSize: normalize(15),
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: normalize(24),
    letterSpacing: 0.5,
  },

  // 曲风选择区域
  genreSelectionContainer: {
    borderRadius: normalize(20),
    padding: normalize(20),
    marginBottom: normalize(24),
    position: 'relative',
    overflow: 'hidden',
  },
  genreHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(16),
  },
  genreIcon: {
    width: normalize(20),
    height: normalize(20),
    backgroundColor: '#FFC107',
    borderRadius: normalize(10),
    marginRight: normalize(10),
  },
  genreSelectionTitle: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: normalize(20),
  },
  loadingSpinner: {
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: '#7877C6',
    marginBottom: normalize(8),
  },
  loadingText: {
    fontSize: normalize(14),
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
  },
  genreScrollView: {
    marginHorizontal: normalize(-8),
  },
  genreScrollContent: {
    paddingHorizontal: normalize(8),
  },
  genreOption: {
    width: normalize(131),
    height: normalize(147),
    borderRadius: normalize(24),
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(12),
    marginHorizontal: normalize(6),
    position: 'relative',
    overflow: 'hidden',
  },
  genreOptionImage: {
    width: normalize(131),
    height: normalize(147),
    borderRadius: normalize(24),
  },
  genreOptionBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: normalize(24),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  genreOptionBackgroundSelected: {
    backgroundColor: 'rgba(120, 119, 198, 0.3)',
    borderColor: '#7877C6',
    shadowColor: '#7877C6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  genreOptionText: {
    fontSize: normalize(14),
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
    textAlign: 'center',
  },
  genreOptionTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // 底部生成按钮
  bottomButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
  },
  generateButton: {
    width: '48%',
    borderRadius: normalize(28),
    paddingVertical: normalize(18),
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: normalize(20),
    position: 'relative',
    overflow: 'hidden',
    flexDirection: 'row',
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  generateButtonBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#667eea',
    borderRadius: normalize(28),
  },
  generateButtonDisabled: {
    opacity: 0.6,
    shadowOpacity: 0.1,
  },
  generateSpinner: {
    width: normalize(20),
    height: normalize(20),
    borderRadius: normalize(10),
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderTopColor: '#FFFFFF',
    marginRight: normalize(8),
  },
  generateButtonText: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // 底部导航
  bottomNavigationContainer: {
    paddingHorizontal: normalize(20),
    paddingBottom: normalize(20),
  },
  bottomNavBackground: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: normalize(28),
    height: normalize(72),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  navContent: {
    position: 'absolute',
    top: 0,
    left: normalize(20),
    right: normalize(20),
    height: normalize(72),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingHorizontal: normalize(20),
  },
  navGroup: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  navIconContainer: {
    width: normalize(32),
    height: normalize(32),
    marginBottom: normalize(6),
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: normalize(16),
  },
  activeNavIcon: {
    backgroundColor: 'rgba(120, 119, 198, 0.3)',
  },
  translationIcon: {
    width: normalize(18),
    height: normalize(18),
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: normalize(3),
  },
  musicIcon: {
    width: normalize(18),
    height: normalize(18),
    backgroundColor: '#7877C6',
    borderRadius: normalize(4),
  },
  profileIcon: {
    width: normalize(18),
    height: normalize(18),
    backgroundColor: 'rgba(255, 255, 255, 0.6)',
    borderRadius: normalize(9),
  },
  navText: {
    fontSize: normalize(11),
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
  },
  navTextActive: {
    fontWeight: '700',
    color: '#7877C6',
  },

  // 生成过程遮罩
  generatingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  generatingModal: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: normalize(24),
    padding: normalize(32),
    alignItems: 'center',
    marginHorizontal: normalize(40),
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.3,
    shadowRadius: 30,
    elevation: 20,
  },
  generatingSpinner: {
    width: normalize(48),
    height: normalize(48),
    borderRadius: normalize(24),
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    borderTopColor: '#7877C6',
    marginBottom: normalize(20),
  },
  generatingText: {
    fontSize: normalize(18),
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: normalize(8),
    textAlign: 'center',
  },
  generatingSubText: {
    fontSize: normalize(14),
    color: 'rgba(255, 255, 255, 0.7)',
    textAlign: 'center',
    marginBottom: normalize(20),
    lineHeight: normalize(20),
  },
  progressContainer: {
    width: '100%',
  },
  progressBar: {
    width: '100%',
    height: normalize(4),
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: normalize(2),
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#7877C6',
    borderRadius: normalize(2),
    width: '60%',
  },
  // 添加radio样式
  radioContainer: {
    position: 'absolute',
    top: normalize(6),
    left: normalize(6),
    zIndex: 10,
  },
  radioOuter: {
    width: normalize(18),
    height: normalize(18),
    borderRadius: normalize(9),
    borderWidth: 2,
    borderColor: '#00BFFF',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioInner: {
    width: normalize(10),
    height: normalize(10),
    borderRadius: normalize(5),
    backgroundColor: '#00BFFF',
  },
  cardContainer: {
    width: normalize(131),
    height: normalize(147),
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: '#B3E0FF',
    overflow: 'hidden',
    backgroundColor: '#00BFFF',
    position: 'relative',
    marginHorizontal: normalize(6),
  },
  cardContainerSelected: {
    borderColor: '#00BFFF',
    borderWidth: 2,
  },
  cardTopBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: normalize(32),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(8),
    zIndex: 2,
  },
  cardTopLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topBarText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: normalize(12),
  },
  cardBgImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  playButton: {
    position: 'absolute',
    right: normalize(12),
    top: normalize(50),
    width: normalize(32),
    height: normalize(32),
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: normalize(18),
    borderTopWidth: normalize(12),
    borderBottomWidth: normalize(12),
    borderLeftColor: '#fff',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },
  cardBottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: normalize(32),
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  bottomBarText: {
    color: '#fff',
    fontSize: normalize(14),
    fontWeight: 'bold',
  },
});

export default SongConfigScreen; 