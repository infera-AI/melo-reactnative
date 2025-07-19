/**
 * 综合主界面 - 翻译与音乐结合页
 * 基于Figma设计稿 - node-id: 401-1660
 * 包含翻译功能、音乐播放和歌词显示
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  TextInput,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
const normalize = (size: number) => Math.round(size * scale);

interface CombinedHomeScreenProps {
  onTabSwitch?: (tab: string) => void;
  onNavigateToMusic?: () => void;
  onNavigateToTranslation?: () => void;
  onNavigateToProfile?: () => void;
  onNavigateToSongConfig?: () => void; // 跳转到 SongConfigScreen
}

const CombinedHomeScreen: React.FC<CombinedHomeScreenProps> = ({
  onTabSwitch,
  onNavigateToMusic,
  onNavigateToTranslation,
  onNavigateToProfile,
  onNavigateToSongConfig,
}) => {
  const [activeTab, setActiveTab] = useState('translation');
  const [isPlaying, setIsPlaying] = useState(false);
  const [searchText, setSearchText] = useState('');

  // Tab切换处理
  const handleTabPress = (tab: string) => {
    setActiveTab(tab);
    if (onTabSwitch) {
      onTabSwitch(tab);
    }
    
    switch (tab) {
      case 'translation':
        onNavigateToTranslation?.();
        break;
      case 'music':
        onNavigateToMusic?.();
        break;
      case 'profile':
        onNavigateToProfile?.();
        break;
    }
  };

  // 播放/暂停处理
  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  // 返回处理
  const handleBack = () => {
    // 返回逻辑
    console.log('Back pressed');
  };

  // 下一步处理 - 跳转到歌曲配置与生成页
  const handleNextStep = () => {
    console.log('Navigate to SongConfigScreen');
    if (onNavigateToSongConfig) {
      onNavigateToSongConfig();
    }
    // 这里可以添加具体的导航逻辑，比如:
    // navigation.navigate('SongConfigScreen');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEF4F4" />
      
      {/* 背景渐变椭圆 */}
      <View style={[styles.backgroundEllipse, styles.topEllipse]} />
      <View style={[styles.backgroundEllipse, styles.bottomEllipse]} />

      {/* iPhone状态栏 */}
      <SafeAreaView style={styles.statusBarContainer}>
        <View style={styles.statusBar}>
          <View style={styles.statusLeft}>
            <Text style={styles.timeText}>9:41</Text>
          </View>
          <View style={styles.statusRight}>
            <View style={styles.cellularIcon} />
            <View style={styles.wifiIcon} />
            <View style={styles.batteryContainer}>
              <View style={styles.batteryBody}>
                <View style={styles.batteryPower} />
              </View>
              <View style={styles.batteryHead} />
            </View>
          </View>
        </View>
      </SafeAreaView>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* 顶部返回和连接状态 */}
        <View style={styles.headerContainer}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <View style={styles.backIcon} />
          </TouchableOpacity>
          
          <View style={styles.connectionFrame}>
            <View style={styles.connectionGroup}>
              <View style={styles.headphoneFrame}>
                <View style={styles.headphoneIndicator} />
                <View style={styles.headphoneIcon} />
              </View>
              <Text style={styles.connectionText}>30%</Text>
            </View>
          </View>
        </View>

        {/* 主内容区域 */}
        <View style={styles.mainContentArea}>
          {/* 顶部搜索框 */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              value={searchText}
              onChangeText={setSearchText}
              placeholder="搜索音乐、歌词..."
              placeholderTextColor="#949494"
            />
          </View>

          {/* 播放状态区域 */}
          <View style={styles.playingStatusContainer}>
            <TouchableOpacity style={styles.playingStatusFrame}>
              <Text style={styles.playingStatusText}>乐队演奏中</Text>
            </TouchableOpacity>
            <Text style={styles.genreText}>曲风</Text>
          </View>

          {/* 设置图标 */}
          <View style={styles.settingsContainer}>
            <View style={styles.settingsIcon1} />
            <View style={styles.settingsIcon2} />
          </View>

          {/* 音频波形线条 */}
          <View style={styles.waveformContainer}>
            <View style={styles.waveformLine} />
            <View style={styles.waveformLine} />
            <View style={styles.waveformLine} />
          </View>

          {/* 歌词显示区域 */}
          <View style={styles.lyricsContainer}>
            <Text style={styles.lyricsText}>
              {"\n聞更漏咽 頻教前塵辭長夜\n久無眠 深坐對宮簷\n多情最是春庭雪 年年落滿離人苑\n薛濤箋 上言若如初見\n"}
            </Text>
          </View>

          {/* 下方音频波形 */}
          <View style={styles.bottomWaveformContainer}>
            <View style={styles.waveformLine} />
            <View style={styles.waveformLine} />
            <View style={styles.waveformLine} />
          </View>

          {/* 音乐卡片列表 */}
          <View style={styles.musicCardsContainer}>
            {/* 第一行卡片 */}
            <View style={styles.musicCardRow}>
              {/* 每日推荐卡片 */}
              <View style={styles.musicCard}>
                <View style={styles.musicCardImage}>
                  <View style={styles.playOverlay}>
                    <View style={styles.cardTitleOverlay}>
                      <Text style={styles.musicCardTitle}>每日推荐</Text>
                      <View style={styles.cardBottomContainer}>
                        <View style={styles.starIcon} />
                        <Text style={styles.musicCardSubtitle}>今日限定好歌</Text>
                      </View>
                    </View>
                    <TouchableOpacity style={styles.playButtonOverlay} onPress={handlePlayPause}>
                      <View style={styles.playButton} />
                    </TouchableOpacity>
                  </View>
                </View>
                <View style={styles.pageIndicator}>
                  <View style={[styles.indicator, styles.indicatorActive]} />
                  <View style={styles.indicator} />
                  <View style={styles.indicator} />
                </View>
              </View>

              {/* 第二张专辑 */}
              <View style={styles.musicCard2}>
                <View style={styles.musicCardImage2} />
              </View>

              {/* 第三张专辑 */}
              <View style={styles.musicCard3}>
                <View style={styles.musicCardImage3}>
                  <View style={styles.playOverlay2}>
                    <TouchableOpacity style={styles.playButtonOverlay} onPress={handlePlayPause}>
                      <View style={styles.playButton} />
                    </TouchableOpacity>
                    <Text style={styles.musicCardSubtitle2}>今日限定好歌</Text>
                  </View>
                </View>
              </View>
            </View>

                      {/* 第二行白色卡片 */}
          <View style={styles.secondRowCards}>
            <View style={styles.whiteCard1} />
            <View style={styles.whiteCard2} />
          </View>
        </View>

        {/* 下一步按钮 */}
        <TouchableOpacity
          style={styles.nextStepButton}
          onPress={handleNextStep}
          activeOpacity={0.8}
        >
          <Text style={styles.nextStepButtonText}>下一步</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>

      {/* 底部导航 - 固定在底部 */}
      <View style={styles.bottomNavigationContainer}>
        <View style={styles.bottomNavBackground} />
        <View style={styles.navContent}>
          {/* 翻译Tab - 激活状态 */}
          <TouchableOpacity 
            style={styles.navGroup}
            onPress={() => handleTabPress('translation')}
          >
            <View style={styles.navIconContainer}>
              <View style={[styles.navEllipse, activeTab === 'translation' && styles.navEllipseActive]} />
              <View style={styles.translationIcon} />
            </View>
            <Text style={[styles.navText, activeTab === 'translation' && styles.navTextActive]}>翻译</Text>
          </TouchableOpacity>
          
          {/* 音乐Tab */}
          <TouchableOpacity 
            style={styles.navGroup}
            onPress={() => handleTabPress('music')}
          >
            <View style={styles.musicIcon} />
            <Text style={[styles.navText, activeTab === 'music' && styles.navTextActive]}>音乐</Text>
          </TouchableOpacity>
          
          {/* 我的Tab */}
          <TouchableOpacity 
            style={styles.navGroup}
            onPress={() => handleTabPress('profile')}
          >
            <View style={styles.profileIcon} />
            <Text style={[styles.navText, activeTab === 'profile' && styles.navTextActive]}>我的</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#EEF4F4',
  },
  
  // 背景渐变椭圆
  backgroundEllipse: {
    position: 'absolute',
    width: normalize(173),
    height: normalize(173),
    borderRadius: normalize(86.5),
  },
  topEllipse: {
    top: normalize(-34),
    right: normalize(32),
    backgroundColor: 'rgba(35, 187, 194, 0.31)',
  },
  bottomEllipse: {
    top: normalize(9),
    left: normalize(-9),
    backgroundColor: 'rgba(255, 233, 64, 0.31)',
  },

  // iPhone状态栏
  statusBarContainer: {
    backgroundColor: 'transparent',
  },
  statusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(21),
    height: normalize(44),
    paddingTop: normalize(9),
  },
  statusLeft: {
    width: normalize(54),
    alignItems: 'center',
  },
  timeText: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: '#000000',
    fontFamily: 'SF Pro Text',
  },
  statusRight: {
    flexDirection: 'row',
    alignItems: 'center',
    width: normalize(100),
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
    flexDirection: 'row',
    alignItems: 'center',
    width: normalize(25),
    height: normalize(12),
  },
  batteryBody: {
    width: normalize(22),
    height: normalize(11.33),
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: normalize(2.67),
    backgroundColor: '#FFFFFF',
  },
  batteryPower: {
    position: 'absolute',
    left: normalize(2),
    top: normalize(2),
    width: normalize(18),
    height: normalize(7.33),
    backgroundColor: '#000000',
    borderRadius: normalize(1.33),
  },
  batteryHead: {
    width: normalize(1.33),
    height: normalize(4),
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    marginLeft: normalize(1),
  },

  // 滚动视图
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: normalize(100), // 为底部导航留出空间
  },

  // 顶部导航区域
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    paddingTop: normalize(18),
    marginBottom: normalize(39),
  },
  backButton: {
    width: normalize(23),
    height: normalize(23),
    justifyContent: 'center',
    alignItems: 'center',
  },
  backIcon: {
    width: normalize(23),
    height: normalize(23),
    backgroundColor: '#003337',
  },
  connectionFrame: {
    backgroundColor: '#23BBC2',
    borderRadius: normalize(45),
    borderWidth: 1,
    borderColor: '#23BBC2',
    paddingHorizontal: normalize(3),
    paddingVertical: normalize(2),
    width: normalize(100),
    height: normalize(30),
  },
  connectionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    width: normalize(73),
    height: normalize(25),
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
  connectionText: {
    fontSize: normalize(14),
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    marginLeft: normalize(16),
  },

  // 主内容区域
  mainContentArea: {
    backgroundColor: 'rgba(255, 255, 255, 0.69)',
    borderRadius: normalize(6),
    marginHorizontal: normalize(20),
    minHeight: normalize(560),
    position: 'relative',
    paddingBottom: normalize(20),
  },

  // 搜索框
  searchContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: normalize(36),
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderTopLeftRadius: normalize(6),
    borderTopRightRadius: normalize(6),
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInput: {
    width: normalize(333),
    height: normalize(36),
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: normalize(37),
    paddingHorizontal: normalize(16),
    fontSize: normalize(14),
    color: '#003337',
    fontFamily: 'Inter',
  },

  // 播放状态
  playingStatusContainer: {
    alignItems: 'center',
    marginTop: normalize(70),
    paddingHorizontal: normalize(37),
    position: 'relative',
  },
  playingStatusFrame: {
    backgroundColor: '#003337',
    borderRadius: normalize(36),
    paddingHorizontal: normalize(82),
    paddingVertical: normalize(12),
  },
  playingStatusText: {
    fontSize: normalize(14),
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  genreText: {
    position: 'absolute',
    left: normalize(12),
    top: normalize(1),
    fontSize: normalize(14),
    fontWeight: '400',
    color: '#949494',
    fontFamily: 'Inter',
  },

  // 设置图标
  settingsContainer: {
    position: 'absolute',
    top: normalize(71),
    left: normalize(12),
    width: normalize(16),
    height: normalize(16),
  },
  settingsIcon1: {
    position: 'absolute',
    width: normalize(14.31),
    height: normalize(14.31),
    backgroundColor: '#949494',
    top: 0,
    left: 0,
  },
  settingsIcon2: {
    position: 'absolute',
    width: normalize(4.23),
    height: normalize(4.23),
    backgroundColor: '#949494',
    top: normalize(11.77),
    left: normalize(11.77),
  },

  // 音频波形
  waveformContainer: {
    marginTop: normalize(98),
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(21),
    marginBottom: normalize(25),
  },
  waveformLine: {
    width: 0,
    height: normalize(4),
    borderWidth: 0.5,
    borderColor: '#E7E7E7',
  },

  // 歌词区域
  lyricsContainer: {
    paddingHorizontal: normalize(52),
    marginBottom: normalize(182),
  },
  lyricsText: {
    fontSize: normalize(14),
    fontWeight: '400',
    color: '#CECECE',
    fontFamily: 'Inter',
    lineHeight: normalize(32),
    textAlign: 'center',
  },

  // 下方波形
  bottomWaveformContainer: {
    position: 'absolute',
    bottom: normalize(312),
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(21),
  },

  // 音乐卡片容器
  musicCardsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  musicCardRow: {
    flexDirection: 'row',
    paddingHorizontal: normalize(21),
    marginBottom: normalize(16),
  },
  
  // 每日推荐卡片
  musicCard: {
    width: normalize(131),
    height: normalize(147),
    marginRight: normalize(8),
    position: 'relative',
  },
  musicCardImage: {
    width: normalize(131),
    height: normalize(147),
    backgroundColor: '#D9D9D9',
    borderRadius: normalize(8),
    position: 'relative',
  },
  playOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: normalize(70),
    borderRadius: normalize(8),
  },
  cardTitleOverlay: {
    position: 'absolute',
    top: normalize(20),
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  musicCardTitle: {
    fontSize: normalize(14),
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    textAlign: 'center',
    marginBottom: normalize(8),
  },
  cardBottomContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  starIcon: {
    width: normalize(14),
    height: normalize(14),
    backgroundColor: '#FFFFFF',
    marginRight: normalize(4),
  },
  musicCardSubtitle: {
    fontSize: normalize(12),
    fontWeight: '400',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },
  playButtonOverlay: {
    position: 'absolute',
    bottom: normalize(0),
    right: 0,
    width: normalize(27),
    height: normalize(31),
    backgroundColor: 'rgba(190, 190, 190, 0.79)',
    borderRadius: normalize(3),
    justifyContent: 'center',
    alignItems: 'center',
  },
  playButton: {
    width: 0,
    height: 0,
    borderLeftWidth: normalize(8),
    borderRightWidth: 0,
    borderTopWidth: normalize(6),
    borderBottomWidth: normalize(6),
    borderLeftColor: '#FFFFFF',
    borderTopColor: 'transparent',
    borderBottomColor: 'transparent',
  },

  // 页面指示器
  pageIndicator: {
    position: 'absolute',
    bottom: normalize(6),
    left: normalize(54),
    flexDirection: 'row',
  },
  indicator: {
    width: normalize(12),
    height: normalize(12),
    borderRadius: normalize(6),
    backgroundColor: 'rgba(255, 255, 255, 0.54)',
    borderWidth: 1,
    borderColor: '#FFFFFF',
    marginHorizontal: normalize(3),
  },
  indicatorActive: {
    backgroundColor: '#FFFFFF',
  },

  // 第二张专辑
  musicCard2: {
    width: normalize(135),
    height: normalize(149),
    marginRight: normalize(8),
  },
  musicCardImage2: {
    width: normalize(135),
    height: normalize(149),
    backgroundColor: '#D9D9D9',
    borderRadius: normalize(8),
  },

  // 第三张专辑
  musicCard3: {
    width: normalize(76),
    height: normalize(149),
  },
  musicCardImage3: {
    width: normalize(76),
    height: normalize(149),
    backgroundColor: '#D9D9D9',
    borderRadius: normalize(8),
    position: 'relative',
  },
  playOverlay2: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: normalize(70),
    borderRadius: normalize(8),
  },
  musicCardSubtitle2: {
    position: 'absolute',
    bottom: normalize(11),
    left: normalize(2),
    fontSize: normalize(12),
    fontWeight: '400',
    color: '#FFFFFF',
    fontFamily: 'Inter',
  },

  // 第二行白色卡片
  secondRowCards: {
    flexDirection: 'row',
    paddingHorizontal: normalize(21),
    marginTop: normalize(16),
  },
  whiteCard1: {
    width: normalize(135),
    height: normalize(147),
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(6),
    marginRight: normalize(8),
  },
  whiteCard2: {
    width: normalize(135),
    height: normalize(147),
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(6),
  },

  // 底部导航 - 固定定位
  bottomNavigationContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: normalize(75),
    paddingHorizontal: normalize(20.5),
    paddingBottom: normalize(18),
  },
  bottomNavBackground: {
    position: 'absolute',
    bottom: normalize(18),
    left: normalize(20.5),
    right: normalize(20.5),
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
    position: 'absolute',
    bottom: normalize(35),
    left: normalize(64),
    right: normalize(64),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: normalize(41.02),
    paddingHorizontal: normalize(20),
  },
  navGroup: {
    alignItems: 'center',
    height: normalize(41.02),
    minWidth: normalize(60),
  },
  navIconContainer: {
    width: normalize(24),
    height: normalize(24),
    marginBottom: normalize(2.02),
    position: 'relative',
  },
  navEllipse: {
    position: 'absolute',
    width: normalize(24),
    height: normalize(24),
    backgroundColor: '#E6E9E9',
    borderRadius: normalize(12),
  },
  navEllipseActive: {
    backgroundColor: '#E6E9E9',
  },
  translationIcon: {
    position: 'absolute',
    width: normalize(14.04),
    height: normalize(13.58),
    backgroundColor: '#003337',
    top: normalize(5.21),
    left: normalize(4.98),
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
    backgroundColor: '#949494',
    marginTop: normalize(11),
    marginBottom: normalize(2),
  },
  navText: {
    fontSize: normalize(12),
    fontWeight: '400',
    color: '#949494',
    fontFamily: 'Inter',
    textAlign: 'center',
  },
  navTextActive: {
    fontWeight: '700',
    color: '#003337',
  },

  // 下一步按钮
  nextStepButton: {
    backgroundColor: '#003337',
    borderRadius: normalize(36),
    width: normalize(234),
    height: normalize(40),
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    marginTop: normalize(20),
    marginBottom: normalize(30),
  },
  nextStepButtonText: {
    fontSize: normalize(14),
    fontWeight: '700',
    color: '#FFFFFF',
    fontFamily: 'Inter',
    lineHeight: normalize(17),
  },
});

export default CombinedHomeScreen; 