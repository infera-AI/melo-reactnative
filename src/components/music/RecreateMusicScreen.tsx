/**
 * 重制音乐页面
 * 根据Figma设计稿还原UI
 */
import React, { useState, useEffect, useRef } from 'react';
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
import { regenerateMusicWork, recommendGenres, getMusicTaskStatus, getMusicWorkInfo } from '../../api/services/musicService';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
const normalize = (size: number) => Math.round(size * scale);

interface RecreateMusicScreenProps {
  onBack?: () => void;
  workId?: string | null;
  initialLyrics?: string;
  initialGenres?: string[];
  onRegenerate?: (taskId: string) => void;
  onNavigateToSongConfig?: (data: any) => void;
}

const RecreateMusicScreen: React.FC<RecreateMusicScreenProps> = ({
  onBack,
  workId,
  initialLyrics = '',
  initialGenres = [],
  onRegenerate,
  onNavigateToSongConfig,
}) => {
  const [lyrics, setLyrics] = useState(initialLyrics);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialGenres);
  const [loading, setLoading] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLyricsMode, setIsLyricsMode] = useState(true); // true: 写歌词, false: AI匹配
  const [invalid, setInvalid] = useState(false);
  const [genres, setGenres] = useState<string[]>([]);
  const pollTimer = useRef<NodeJS.Timeout | null>(null);
  const [workInfo, setWorkInfo] = useState<any>(null);

  // 页面卸载时清除轮询定时器
  useEffect(() => {
    return () => {
      if (pollTimer.current) {
        clearTimeout(pollTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!workId) {
      setInvalid(true);
      if (onBack) onBack();
    }
  }, [workId, onBack]);
  if (invalid) {
    return null;
  }
 
  // 页面加载时获取作品信息
  useEffect(() => {
    if (!workId) return;
    setLoading(true);
    getMusicWorkInfo({ work_id: workId })
      .then((data: any) => {
        setWorkInfo(data);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message || '获取作品信息失败');
        setLoading(false);
      });
  }, [workId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#EEF4F4" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }
  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#EEF4F4" />
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: 'red' }}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  // 可选曲风列表
  // const availableGenres = ['R&B', '古典', '蒸汽波', '说唱', '古埃及'];

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    );
  };

  const handleAIRecommend = async () => {
    if (!lyrics.trim()) return;
    try { 
      setLoading(true);
      const data = await recommendGenres({ work_lyrics: lyrics });
      if (data?.work_genres) {
        setGenres(data.work_genres);
      }
    } catch (e: any) {
      setError(e.message || '推荐失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRegenerate = async () => {
    try {
      setLoading(true);
      const data = await regenerateMusicWork({
        work_id: workId || undefined,
        work_lyrics: lyrics,
        work_genres: selectedGenres,
      });
      if (data?.task_id) {
        setPolling(true);
        pollTaskStatus(data.task_id);
      }
    } catch (e: any) {
      setError(e.message || '重制失败');
      setLoading(false);
    }
  };

  // 轮询查询任务状态
  const pollTaskStatus = async (taskId: string) => {
    try {
      const poll = async () => {
        const res = await getMusicTaskStatus({ task_id: taskId });
        if (res && res.data !== null) {
          setPolling(false);
          setLoading(false);
          if (onNavigateToSongConfig) onNavigateToSongConfig(res.data);
        } else {
          pollTimer.current = setTimeout(poll, 1500);
        }
      };
      poll();
    } catch (e: any) {
      setError(e.message || '查询任务状态失败');
      setPolling(false);
      setLoading(false);
    }
  };

  const handleReset = () => {
    setLyrics(initialLyrics);
    setSelectedGenres(initialGenres);
    setError(undefined);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEF4F4" />
      
      {/* Gradient Background Circles */}
      <View style={styles.gradientCircle1} />
      <View style={styles.gradientCircle2} />
      
      {/* Status Bar Area */}
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
          onPress={polling ? undefined : onBack}
          disabled={polling}
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
       {/* Song Preview Card */}
       <View style={styles.songPreviewCard}>
          <View style={styles.songPreviewContent}>
            <View style={styles.songCover} />
            <View style={styles.songInfo}>
              <Text style={styles.songTitle}>{workInfo?.work_title || '未知歌曲'}</Text>
              <Text style={styles.songGenre}>{workInfo?.work_genres?.join(', ') || '未知曲风'}</Text>
              <View style={styles.songStatusDot} />
              <View style={styles.songTags}>
                {(workInfo?.work_tags || []).map((tag: string, idx: number) => (
                  <View style={styles.songTag} key={idx}>
                    <Text style={styles.songTagText}>{tag}</Text>
                  </View>
                ))}
                <Text style={styles.songDuration}>{workInfo?.work_duration || '--:--'}</Text>
              </View>
            </View>
            <TouchableOpacity style={styles.playButton}>
              <View style={styles.playIcon} />
            </TouchableOpacity>
          </View>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View style={styles.progressFill} />
            </View>
          </View>
        </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Lyrics Section */}
        <View style={styles.lyricsSection}>
          <View style={styles.lyricsSectionCard}>
         
            {/* Mode Switch */}
            <View style={styles.modeSwitch}>
              <TouchableOpacity 
                style={[styles.modeButton, isLyricsMode && styles.modeButtonActive]}
                onPress={() => setIsLyricsMode(true)}
              >
                <Text style={styles.modeButtonIcon}>✏️</Text>
                <Text style={[styles.modeButtonText, isLyricsMode && styles.modeButtonTextActive]}>写歌词</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.aiButton}
                onPress={handleAIRecommend}
              >
                <Text style={styles.aiButtonText}>AI润饰</Text>
                <Text style={styles.aiButtonIcon}>✨</Text>
              </TouchableOpacity>
            </View>
        
               {/* 歌词输入框和歌词转译按钮并排 */}
               <View style={styles.lyricsRow}>
              <TextInput
                style={styles.lyricsInput}
                value={lyrics}
                onChangeText={setLyrics}
                placeholder="根据用户哼唱内容预先填写"
                placeholderTextColor="#b0b0b0"
                multiline
              />
          </View>
          <View style={styles.buttonRow}>
                {/* Language Switch */}
                <View style={styles.languageSwitch}>
                  <Text style={styles.languageText}>英文</Text>
                  <Text style={styles.languageSeparator}>|</Text>
                  <Text style={styles.languageText}>中文</Text>
                  <View style={styles.languageToggle}>
                    <Text style={styles.languageToggleIcon}>🌐</Text>
                  </View>
                </View>
                  <TouchableOpacity style={styles.lyricsTranslateButton}>
                    <Text style={styles.lyricsTranslateText}>歌词转译</Text>
                  </TouchableOpacity>
                </View>
               </View>
        </View>

     

        {/* Genre Section */}
        <View style={styles.genreSection}>
          <View style={styles.genreSectionCard}>
           {/* 选择曲风 和 歌词转译 按钮并排，两端对齐 */}
            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.selectGenreButton}>
                <Text style={styles.selectGenreText}>选择曲风</Text>
                <Text style={styles.selectGenreIcon}>▼</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.lyricsTranslateButton}>
                <Text style={styles.lyricsTranslateText}>歌词转译</Text>
              </TouchableOpacity>
            </View>

            <TextInput
                style={styles.lyricsInput}
                value={lyrics}
                onChangeText={setLyrics}
                placeholder="根据用户哼唱内容预先填写"
                placeholderTextColor="#b0b0b0"
                multiline
              />
            
            <View style={styles.aiMatchButton}>
              <TouchableOpacity style={styles.aiMatchButton} onPress={handleAIRecommend}>
                <Text style={styles.aiMatchText}>AI匹配</Text>
                <Text style={styles.aiMatchIcon}>✨</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Genre Tags */}
        <View style={styles.genreTags}>
          {genres.map((genre) => (
            <TouchableOpacity
              key={genre}
              style={[
                styles.genreTag,
                selectedGenres.includes(genre) && styles.genreTagSelected
              ]}
              onPress={() => toggleGenre(genre)}
            >
              <Text style={[
                styles.genreTagText,
                selectedGenres.includes(genre) && styles.genreTagTextSelected
              ]}>
                {genre}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomButtons}>
        <TouchableOpacity style={styles.resetButton} onPress={handleReset}>
          <Text style={styles.resetButtonText}>还原</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[styles.nextButton, (loading || polling) && styles.nextButtonDisabled]} 
          onPress={handleRegenerate}
          disabled={loading || polling}
        >
          <Text style={styles.nextButtonText}>
            {(loading || polling) ? '制作中...' : '下一步'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Tab Bar */}
      <View style={styles.tabBar}>
        <View style={styles.tabItem}>
          <View style={[styles.tabIcon, styles.tabIconActive]} />
          <Text style={[styles.tabText, styles.tabTextActive]}>翻译</Text>
        </View>
        <View style={styles.tabItem}>
          <View style={styles.tabIcon} />
          <Text style={styles.tabText}>音乐</Text>
        </View>
        <View style={styles.tabItem}>
          <View style={styles.tabIcon} />
          <Text style={styles.tabText}>我的</Text>
        </View>
      </View>

      {error && (
        <View style={styles.errorMessage}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  lyricsRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: normalize(10),
    marginBottom: normalize(10),
  },
  container: {
    flex: 1,
    backgroundColor: '#EEF4F4',
  },
  gradientCircle1: {
    position: 'absolute',
    top: normalize(-34),
    right: normalize(0),
    width: normalize(173),
    height: normalize(173),
    borderRadius: normalize(173 / 2),
    backgroundColor: 'rgba(35, 187, 194, 0.31)',
  },
  gradientCircle2: {
    position: 'absolute',
    top: normalize(9),
    left: normalize(-9),
    width: normalize(173),
    height: normalize(173),
    borderRadius: normalize(173 / 2),
    backgroundColor: 'rgba(255, 233, 64, 0.31)',
  },
  statusBarArea: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(21),
    paddingTop: normalize(9),
    height: normalize(44),
  },
  statusTime: {
    fontSize: normalize(14),
    fontWeight: '600',
    color: '#000',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: normalize(5),
  },
  signalIcon: {
    width: normalize(17),
    height: normalize(11),
    backgroundColor: '#000',
    borderRadius: normalize(2),
  },
  wifiIcon: {
    width: normalize(15),
    height: normalize(11),
    backgroundColor: '#000',
    borderRadius: normalize(2),
  },
  batteryIcon: {
    width: normalize(25),
    height: normalize(12),
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: normalize(3),
    position: 'relative',
  },
  batteryFill: {
    position: 'absolute',
    left: normalize(2),
    top: normalize(2),
    width: normalize(18),
    height: normalize(7),
    backgroundColor: '#000',
    borderRadius: normalize(1),
  },
  topStatusBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(20),
    marginTop: normalize(20),
    height: normalize(92),
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
    backgroundColor: '#23BBC2',
    borderRadius: normalize(45),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(7),
    width: normalize(100),
    height: normalize(30),
    borderWidth: 1,
    borderColor: '#23BBC2',
  },
  connectionText: {
    fontSize: normalize(14),
    color: '#FFFFFF',
    fontWeight: '700',
    fontFamily: 'Inter',
    lineHeight: normalize(17),
  },
  backButton: {
    width: normalize(23),
    height: normalize(23),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: normalize(20),
    color: '#003337',
  },
  permissionIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#23BBC2',
    borderRadius: normalize(15),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
    borderWidth: 1,
    borderColor: '#23BBC2',
  },
  permissionDot: {
    width: normalize(6),
    height: normalize(6),
    borderRadius: normalize(3),
    backgroundColor: '#FF5F5F',
    marginRight: normalize(8),
  },
  permissionText: {
    fontSize: normalize(14),
    fontWeight: '700',
    color: '#FFF',
  },
  content: {
    flex: 1,
    paddingHorizontal: normalize(17),
  },
  lyricsSection: {
    marginBottom: normalize(15),
  },
  lyricsSectionCard: {
    backgroundColor: '#FFF',
    borderRadius: normalize(6),
    padding: normalize(16),
    marginBottom: normalize(15),
  },
  placeholderText: {
    fontSize: normalize(12),
    color: '#949494',
    marginBottom: normalize(15),
  },
  lyricsInput: {
    fontSize: normalize(14),
    color: '#000',
    padding: normalize(10),
    minHeight: normalize(100),
    backgroundColor: 'transparent',
    borderWidth: 0,
    borderRadius: 0,
    textAlignVertical: 'top',
    flex: 1,
    marginRight: normalize(10),
  },
  lyricsTranslateButton: {
    backgroundColor: '#FCFCFC',
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: '#23BBC2',
    paddingHorizontal: normalize(9),
    paddingVertical: normalize(8),
    alignSelf: 'flex-start',
    minWidth: normalize(60),
    alignItems: 'center',
    justifyContent: 'center',
  },
  modeSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: normalize(15),
  },
  modeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DBEDF6',
    borderRadius: normalize(25),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(8),
  },
  modeButtonActive: {
    backgroundColor: '#DBEDF6',
  },
  modeButtonIcon: {
    fontSize: normalize(12),
    marginRight: normalize(6),
  },
  modeButtonText: {
    fontSize: normalize(12),
    color: '#23BBC2',
  },
  modeButtonTextActive: {
    color: '#23BBC2',
    fontWeight: '600',
  },
  aiButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiButtonText: {
    fontSize: normalize(12),
    color: '#949494',
    marginRight: normalize(6),
  },
  aiButtonIcon: {
    fontSize: normalize(10),
  },
  languageSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  languageText: {
    fontSize: normalize(12),
    color: '#000',
  },
  languageSeparator: {
    fontSize: normalize(12),
    color: '#949494',
    marginHorizontal: normalize(8),
  },
  languageToggle: {
    backgroundColor: '#DBEDF6',
    borderRadius: normalize(8),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(4),
  },
  languageToggleIcon: {
    fontSize: normalize(12),
  },
  genreSection: {
    marginBottom: normalize(15),
  },
  genreSectionCard: {
    backgroundColor: '#FFF',
    borderRadius: normalize(6),
    padding: normalize(16),
  },
  aiMatchButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  aiMatchText: {
    fontSize: normalize(12),
    color: '#949494',
    marginRight: normalize(6),
  },
  aiMatchIcon: {
    fontSize: normalize(10),
  },
  genreTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: normalize(7),
    marginBottom: normalize(15),
  },
  genreTag: {
    backgroundColor: '#FCFCFC',
    borderRadius: normalize(12),
    borderWidth: 1,
    borderColor: '#23BBC2',
    paddingHorizontal: normalize(15),
    paddingVertical: normalize(4),
  },
  genreTagSelected: {
    backgroundColor: '#DBEDF6',
  },
  genreTagText: {
    fontSize: normalize(12),
    color: '#23BBC2',
  },
  genreTagTextSelected: {
    color: '#23BBC2',
    fontWeight: '600',
  },
  lyricsTranslateText: {
    fontSize: normalize(12),
    color: '#23BBC2',
  },
  selectGenreButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: normalize(20),
  },
  selectGenreText: {
    fontSize: normalize(12),
    color: '#23BBC2',
    marginRight: normalize(6),
  },
  selectGenreIcon: {
    fontSize: normalize(10),
    color: '#23BBC2',
  },
  songPreviewCard: {
    backgroundColor: '#19A0A6',
    borderRadius: normalize(20),
    borderWidth: 1,
    borderColor: '#19A0A6',
    padding: normalize(8),
    margin: normalize(10),
    marginTop: normalize(0),
  },
  songPreviewContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: normalize(0),
  },
  songCover: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(6),
    backgroundColor: '#D9D9D9',
    marginRight: normalize(12),
  },
  songInfo: {
    flex: 1,
  },
  songTitle: {
    fontSize: normalize(12),
    fontWeight: '700',
    color: '#000',
  },
  songGenre: {
    fontSize: normalize(10),
    color: '#000',
    marginBottom: normalize(2),
  },
  songStatusDot: {
    width: normalize(10),
    height: normalize(10),
    borderRadius: normalize(5),
    backgroundColor: '#D9D9D9',
    marginBottom: normalize(4),
  },
  songTags: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: normalize(4),
  },
  songTag: {
    backgroundColor: '#23BBC2',
    borderRadius: normalize(2),
    paddingHorizontal: normalize(6),
    paddingVertical: normalize(2),
  },
  songTagText: {
    fontSize: normalize(6),
    color: '#FFF',
  },
  songDuration: {
    fontSize: normalize(11),
    color: '#FFF',
  },
  playButton: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playIcon: {
    width: normalize(14),
    height: normalize(11),
    backgroundColor: '#19A0A6',
    borderRadius: normalize(2),
  },
  progressContainer: {
    marginTop: normalize(10),
  },
  progressBar: {
    height: normalize(2),
    backgroundColor: '#D9D9D9',
    borderRadius: normalize(1),
    marginBottom: normalize(2),
  },
  progressFill: {
    width: '70%',
    height: '100%',
    backgroundColor: '#23BBC2',
    borderRadius: normalize(1),
  },
  bottomButtons: {
    flexDirection: 'row',
    paddingHorizontal: normalize(36),
    paddingBottom: normalize(20),
    gap: normalize(12),
  },
  resetButton: {
    flex: 1,
    backgroundColor: '#003337',
    borderRadius: normalize(20),
    paddingVertical: normalize(11),
    alignItems: 'center',
  },
  resetButtonText: {
    fontSize: normalize(14),
    fontWeight: '700',
    color: '#FFF',
  },
  nextButton: {
    flex: 1,
    backgroundColor: '#003337',
    borderRadius: normalize(20),
    paddingVertical: normalize(11),
    alignItems: 'center',
  },
  nextButtonDisabled: {
    opacity: 0.5,
  },
  nextButtonText: {
    fontSize: normalize(14),
    fontWeight: '700',
    color: '#FFFFFF',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    paddingVertical: normalize(16),
    paddingHorizontal: normalize(44),
    borderTopLeftRadius: normalize(26),
    borderTopRightRadius: normalize(26),
    elevation: 4,
    shadowColor: '#E1ECEC',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.67,
    shadowRadius: 3.4,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: normalize(8),
  },
  tabIcon: {
    width: normalize(14),
    height: normalize(13),
    backgroundColor: '#949494',
    marginBottom: normalize(6),
    borderRadius: normalize(2),
  },
  tabIconActive: {
    backgroundColor: '#003337',
  },
  tabText: {
    fontSize: normalize(12),
    color: '#949494',
    fontWeight: '400',
  },
  tabTextActive: {
    color: '#003337',
    fontWeight: '700',
  },
  errorMessage: {
    position: 'absolute',
    top: normalize(100),
    left: normalize(20),
    right: normalize(20),
    backgroundColor: '#FF5F5F',
    borderRadius: normalize(8),
    padding: normalize(12),
  },
  errorText: {
    color: '#FFF',
    textAlign: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: normalize(15),
    gap: normalize(10),
  },
  backButtonDisabled: { opacity: 0.4 },
  backIconDisabled: { color: '#aaa' },
});

export default RecreateMusicScreen; 