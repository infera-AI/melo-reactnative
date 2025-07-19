/**
 * M2.0 我的音乐库
 * 页面目标: 聚合和管理用户创作的所有音乐作品。
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  ScrollView,
  Dimensions,
  Modal,
  TextInput,
  Pressable,
  Image,
  Alert,
} from 'react-native';
import { getMusicWorks, modifyMusicTitle, deleteMusicWork } from '../../api/services/musicService';
import { Work } from '../../api/types';
import AudioRecorderPlayer from 'react-native-audio-recorder-player';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
const normalize = (size: number) => Math.round(size * scale);

interface MusicLibraryScreenProps {
  onBack?: () => void;
  onNavigateToSongDetail?: (songId: string) => void;
  onNavigateToHome?: () => void;
  onNavigateToRecreateMusic?: (workId: string) => void;
}

// 播放状态接口
interface PlayingState {
  songId: string | null;
  isPlaying: boolean;
  currentTime: number;
  totalDuration: number;
}

const MusicLibraryScreen: React.FC<MusicLibraryScreenProps> = ({
  onBack,
  onNavigateToSongDetail,
  onNavigateToHome,
  onNavigateToRecreateMusic,
}) => {
  const [songs, setSongs] = useState<Work[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSongs, setSelectedSongs] = useState<string[]>([]);
  const [actionModal, setActionModal] = useState(false);
  const [selectedSong, setSelectedSong] = useState<Work | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false);
  const [playingState, setPlayingState] = useState<PlayingState>({
    songId: null,
    isPlaying: false,
    currentTime: 0,
    totalDuration: 0,
  });
  const [audioRecorderPlayer] = useState(() => new AudioRecorderPlayer());

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMusicWorks();
        // 现在res.data是 ApifoxModel<Data>，实际作品列表在 res.data.data.works
        if(data?.works){
          setSongs(data.works || []);
        }
      } catch (e: any) {
        setError(e.message || '加载失败');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const toggleSongSelection = (songId: string) => {
    setSelectedSongs(prev =>
      prev.includes(songId)
        ? prev.filter(id => id !== songId)
        : [...prev, songId]
    );
  };

  // 播放音乐
  const playMusic = async (songId: string) => {
    try {
      const song = songs.find(s => s.work_id === songId);
      if (!song || !song.work_url) {
        Alert.alert('播放失败', '音频文件不存在');
        return;
      }

      // 如果正在播放其他歌曲，先停止
      if (playingState.isPlaying && playingState.songId !== songId) {
        await audioRecorderPlayer.stopPlayer();
      }

      // 如果点击的是当前播放的歌曲
      if (playingState.songId === songId) {
        if (playingState.isPlaying) {
          // 暂停
          await audioRecorderPlayer.pausePlayer();
          setPlayingState(prev => ({ ...prev, isPlaying: false }));
        } else {
          // 继续播放
          await audioRecorderPlayer.resumePlayer();
          setPlayingState(prev => ({ ...prev, isPlaying: true }));
        }
        return;
      }

      // 开始播放新歌曲
      console.log('🎵 开始播放:', song.work_title, '地址:', song.work_url);
      
      const result = await audioRecorderPlayer.startPlayer(song.work_url);
      console.log('🎵 播放开始成功:', result);
      
      setPlayingState({
        songId: songId,
        isPlaying: true,
        currentTime: 0,
        totalDuration: 0,
      });

      // 监听播放进度
      audioRecorderPlayer.addPlayBackListener((data) => {
        setPlayingState(prev => ({
          ...prev,
          currentTime: Math.floor(data.currentPosition),
          totalDuration: Math.floor(data.duration),
        }));
        
        // 播放结束
        if (data.currentPosition >= data.duration && data.duration > 0) {
          setPlayingState({
            songId: null,
            isPlaying: false,
            currentTime: 0,
            totalDuration: 0,
          });
          audioRecorderPlayer.removePlayBackListener();
        }
      });
      
    } catch (error: any) {
      console.error('🎵 播放失败:', error);
      Alert.alert('播放失败', error.message || '无法播放音频文件');
      setPlayingState({
        songId: null,
        isPlaying: false,
        currentTime: 0,
        totalDuration: 0,
      });
    }
  };

  // 停止播放
  const stopMusic = async () => {
    try {
      await audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
      setPlayingState({
        songId: null,
        isPlaying: false,
        currentTime: 0,
        totalDuration: 0,
      });
    } catch (error) {
      console.error('🎵 停止播放失败:', error);
    }
  };

  // 组件卸载时清理播放器
  useEffect(() => {
    return () => {
      audioRecorderPlayer.stopPlayer();
      audioRecorderPlayer.removePlayBackListener();
    };
  }, [audioRecorderPlayer]);

  const handleSongPress = (song: Work) => {
    if (isMultiSelectMode) {
      toggleSongSelection(song.work_id);
    } else if (onNavigateToSongDetail) {
      // onNavigateToSongDetail(song.work_id);
    }
  };

  const handleSongLongPress = (song: Work) => {
    if (!isMultiSelectMode) {
    setSelectedSong(song);
    setEditTitle(song.work_title);
    setActionModal(true);
    }
  };

  // const enterMultiSelectMode = () => {
  //   setIsMultiSelectMode(true);
  //   setSelectedSongs([]);
  // };

  const exitMultiSelectMode = () => {
    setIsMultiSelectMode(false);
    setSelectedSongs([]);
  };

  const selectAllSongs = () => {
    if (selectedSongs.length === songs.length) {
      setSelectedSongs([]);
    } else {
      setSelectedSongs(songs.map(song => song.work_id));
    }
  };

  const handleCloseModal = () => {
    setActionModal(false);
    setSelectedSong(null);
  };

  // 下面的操作函数可根据实际业务实现
  const handleSave = async () => {
    // 保存重命名
    if (selectedSong) {
      try {
        setLoading(true);
        await modifyMusicTitle({ work_id: selectedSong.work_id, work_title: editTitle });
        // 重命名成功后刷新列表 
        const data = await getMusicWorks();
        if(data?.works){
          setSongs(data.works || []);
        }
        handleCloseModal();
      } catch (e: any) {
        setError(e.message || '重命名失败');
      } finally {
        setLoading(false);
      }
    }
  };
  const handleDelete = async () => {
    if (selectedSong) {
      try {
        setLoading(true);
        await deleteMusicWork({ work_ids: [Number(selectedSong.work_id)] });
        // 删除成功后刷新列表
        const data = await getMusicWorks();
        if(data?.works){
          setSongs(data.works || []);
        }
        handleCloseModal();
      } catch (e: any) {
        setError(e.message || '删除失败');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBatchDelete = async () => {
    if (selectedSongs.length === 0) return;
    
    try {
      setLoading(true);
      // 批量删除选中的歌曲
      await deleteMusicWork({ work_ids: selectedSongs.map(id => Number(id)) });
      // 删除成功后刷新列表
      const data = await getMusicWorks();
      if(data?.works){
        setSongs(data.works || []);
      }
      exitMultiSelectMode();
    } catch (e: any) {
      setError(e.message || '批量删除失败');
    } finally {
      setLoading(false);
    }
  };
  const handleReset = () => {
    setEditTitle(selectedSong?.work_title || '');
    // 跳转重置音乐页面
    if (selectedSong && onNavigateToRecreateMusic) {
      onNavigateToRecreateMusic(selectedSong.work_id);
    }
  };
  const handleShare = () => {
    // 分享逻辑
    handleCloseModal();
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEF4F4" />
      
      {/* Gradient Background Circles */}
      <View style={styles.gradientCircle1} />
      <View style={styles.gradientCircle2} />
      
      {/* 顶部状态栏 */}
      <View style={styles.topStatusBar}>
        {isMultiSelectMode ? (
          <>
            <TouchableOpacity style={styles.backButton} onPress={exitMultiSelectMode}>
              <Text style={styles.backIcon}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              已选择 {selectedSongs.length}/{songs.length}
            </Text>
            <TouchableOpacity style={styles.selectAllButton} onPress={selectAllSongs}>
              <Text style={styles.selectAllText}>
                {selectedSongs.length === songs.length ? '取消全选' : '全选'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <TouchableOpacity style={styles.backButton} onPress={onBack}>
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
                  style={styles.earphoneIcon}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.connectionText}>30%</Text>
            </View>
            <View />
          </>
        )}
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Text style={styles.searchPlaceholder}>搜索音乐作品...</Text>
        </View>
      </View>

      {/* Song List */}
      <ScrollView style={styles.songList} showsVerticalScrollIndicator={false}>
        <View style={styles.songGrid}>
          {loading ? (
            <Text style={{ textAlign: 'center', marginTop: 40 }}>加载中...</Text>
          ) : error ? (
            <Text style={{ textAlign: 'center', color: 'red', marginTop: 40 }}>{error}</Text>
          ) : songs.length === 0 ? (
            <Text style={{ textAlign: 'center', marginTop: 40 }}>暂无作品</Text>
          ) : (
            songs.map((song) => (
              <TouchableOpacity 
                key={song.work_id} 
                style={[
                  styles.songItem,
                  isMultiSelectMode && selectedSongs.includes(song.work_id) && styles.songItemSelected
                ]}
                onPress={() => handleSongPress(song)}
                onLongPress={() => handleSongLongPress(song)}
              >
                {/* Song Cover */}
                <View style={styles.songCover}>
                  {/* 可根据实际需求用Image组件 */}
                  <Image source={{ uri: song.work_cover }} style={styles.albumArt} />
                </View>
                {/* Song Info */}
                <View style={styles.songInfo}>
                  <View style={styles.songHeader}>
                    <Text style={styles.songTitle}>{song.work_title}</Text>
                    {isMultiSelectMode ? (
                      <TouchableOpacity
                        style={[
                          styles.checkBox,
                          selectedSongs.includes(song.work_id) && styles.checkBoxSelected
                        ]}
                        onPress={() => toggleSongSelection(song.work_id)}
                      >
                        {selectedSongs.includes(song.work_id) && (
                          <Text style={styles.checkMark}>✓</Text>
                        )}
                      </TouchableOpacity>
                    ) : (
                      <TouchableOpacity
                        style={[
                          styles.playButton,
                          playingState.songId === song.work_id && playingState.isPlaying && styles.playButtonActive
                        ]}
                        onPress={() => playMusic(song.work_id)}
                      >
                        <Text style={[
                          styles.playButtonText,
                          playingState.songId === song.work_id && playingState.isPlaying && styles.playButtonTextActive
                        ]}>
                          {playingState.songId === song.work_id && playingState.isPlaying ? '⏸' : '▶'}
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <Text style={styles.songSubtitle}>{song.work_genres?.join(', ')}</Text>
                  <View style={styles.songMeta}>
                    <View style={styles.statusDot} />
                    <View style={styles.tagContainer}>
                      {song.work_genre?.map((tag, tagIndex) => (
                        <View key={tagIndex} style={styles.tag}>
                          <Text style={styles.tagText}>{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      </ScrollView>

      {/* Progress Bars */}
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={styles.progressFill} />
        </View>
        <View style={styles.progressIndicator} />
      </View>

      {/* Playing Control Bar - shows when playing music */}
      {playingState.isPlaying && (
        <View style={styles.playingControlBar}>
          <Text style={styles.nowPlayingText}>
            正在播放: {songs.find(s => s.work_id === playingState.songId)?.work_title}
          </Text>
          <TouchableOpacity style={styles.stopButton} onPress={stopMusic}>
            <Text style={styles.stopButtonText}>停止</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Batch Action Bar - shows when in multi-select mode */}
      {isMultiSelectMode && (
        <View style={styles.batchActionBar}>
          <TouchableOpacity 
            style={[styles.batchButton, styles.deleteButton, selectedSongs.length === 0 && styles.disabledButton]}
            onPress={handleBatchDelete}
            disabled={selectedSongs.length === 0}
          >
            <Text style={[styles.batchButtonText, styles.deleteButtonText]}>
              删除 ({selectedSongs.length})
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bottom Tab Bar */}
      {!isMultiSelectMode && (
      <View style={styles.tabBar}>
        <View style={styles.tabItem}>
          <View style={[styles.tabIcon, styles.tabIconActive]} />
          <Text style={[styles.tabText, styles.tabTextActive]}>翻译</Text>
        </View>
        <TouchableOpacity style={styles.tabItem} onPress={onNavigateToHome}>
          <View style={styles.tabIcon} />
          <Text style={styles.tabText}>音乐</Text>
        </TouchableOpacity>
        <View style={styles.tabItem}>
          <View style={styles.tabIcon} />
          <Text style={styles.tabText}>我的</Text>
        </View>
      </View>
      )}

      {/* Action Modal */}
      <Modal
        visible={actionModal}
        transparent
        animationType="fade"
        onRequestClose={handleCloseModal}
      >
        <Pressable style={styles.modalMask} onPress={handleCloseModal}>
          <View style={styles.actionSheet}>
            {/* 顶部输入框和保存按钮 */}
            <View style={styles.modalInputRow}>
              <TextInput
                style={styles.modalInput}
                value={editTitle}
                onChangeText={setEditTitle}
                placeholder="作品名"
                placeholderTextColor="#b0b0b0"
              />
              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSave}>
                <Text style={styles.modalSaveBtnText}>保存</Text>
              </TouchableOpacity>
            </View>
            {/* 操作按钮区 */}
            <View style={styles.modalActionsRow}>
              <TouchableOpacity style={styles.modalActionBtn} onPress={handleDelete}>
                <Text style={styles.modalActionIcon}>🗑️</Text>
                <Text style={styles.modalActionText}>删除</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalActionBtn} onPress={handleReset}>
                <Text style={styles.modalActionIcon}>🔄</Text>
                <Text style={styles.modalActionText}>重制</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalActionBtn} onPress={handleShare}>
                <Text style={styles.modalActionIcon}>🔗</Text>
                <Text style={styles.modalActionText}>分享</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
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
  earphoneIcon: {
    width: normalize(16),
    height: normalize(16),
  },
  circleContainer: {
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
    backgroundColor: '#23BBC2',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: normalize(8),
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
    color: '#949494',
  },
  headerTitle: {
    fontSize: normalize(14),
    color: '#949494',
    fontWeight: '400',
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
  searchContainer: {
    paddingHorizontal: normalize(20),
    marginBottom: normalize(20),
  },
  searchBar: {
    height: normalize(36),
    backgroundColor: 'rgba(255, 255, 255, 0.72)',
    borderRadius: normalize(18),
    justifyContent: 'center',
    paddingHorizontal: normalize(16),
  },
  searchPlaceholder: {
    fontSize: normalize(14),
    color: '#949494',
    fontStyle: 'italic',
  },
  songList: {
    flex: 1,
    paddingHorizontal: normalize(20),
  },
  songGrid: {
    paddingBottom: normalize(100),
  },
  songItem: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: normalize(6),
    padding: normalize(12),
    marginBottom: normalize(15),
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  songItemSelected: {
    backgroundColor: '#F0F8FF',
    borderWidth: 2,
    borderColor: '#23BBC2',
  },
  songCover: {
    width: normalize(56),
    height: normalize(56),
    borderRadius: normalize(6),
    backgroundColor: '#D9D9D9',
    marginRight: normalize(12),
    overflow: 'hidden',
  },
  albumArt: {
    width: '100%',
    height: '100%',
    borderRadius: normalize(6),
    backgroundColor: '#D9D9D9',
  },
  songInfo: {
    flex: 1,
  },
  songHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: normalize(4),
  },
  songTitle: {
    fontSize: normalize(16),
    fontWeight: '700',
    color: '#000',
    lineHeight: normalize(19),
    flex: 1,
    marginRight: normalize(8),
  },
  playButton: {
    width: normalize(32),
    height: normalize(32),
    borderRadius: normalize(16),
    backgroundColor: '#DBEDF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonSelected: {
    backgroundColor: '#19A0A6',
  },
  playIcon: {
    width: normalize(17),
    height: normalize(18),
    borderRadius: normalize(2),
  },
  playIconSelected: {
    backgroundColor: '#FFF',
  },
  playButtonActive: {
    backgroundColor: '#19A0A6',
  },
  playButtonText: {
    fontSize: normalize(12),
    color: '#19A0A6',
    fontWeight: '600',
  },
  playButtonTextActive: {
    color: '#FFF',
  },
  songSubtitle: {
    fontSize: normalize(16),
    color: '#000',
    marginBottom: normalize(8),
    lineHeight: normalize(19),
  },
  songMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: normalize(20),
    height: normalize(20),
    borderRadius: normalize(10),
    backgroundColor: '#D9D9D9',
    marginRight: normalize(8),
  },
  tagContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#DBEDF6',
    borderRadius: normalize(2),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(3),
    marginRight: normalize(8),
    marginBottom: normalize(4),
  },
  tagText: {
    fontSize: normalize(11),
    color: '#23BBC2',
    fontWeight: '400',
    lineHeight: normalize(13),
  },
  progressContainer: {
    position: 'absolute',
    bottom: normalize(140),
    left: normalize(20),
    right: normalize(20),
    flexDirection: 'row',
    alignItems: 'center',
  },
  progressBar: {
    flex: 1,
    height: normalize(11),
    backgroundColor: '#DBEDF6',
    borderRadius: normalize(6),
    marginRight: normalize(8),
    flexDirection: 'row',
  },
  progressFill: {
    width: normalize(4),
    height: '100%',
    backgroundColor: '#19A0A6',
    borderRadius: normalize(6),
    marginRight: normalize(6),
  },
  progressIndicator: {
    width: normalize(4),
    height: normalize(11),
    backgroundColor: '#19A0A6',
    borderRadius: normalize(6),
  },
  tabBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    borderWidth: 0.6,
    borderColor: '#23BBC2',
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
  modalMask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-end',
  },
  actionSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: normalize(22),
    borderTopRightRadius: normalize(22),
    paddingBottom: normalize(24),
    paddingTop: normalize(16),
    paddingHorizontal: normalize(18),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 8,
  },
  modalInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F4F8F8',
    borderRadius: normalize(16),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(8),
    marginBottom: normalize(18),
  },
  modalInput: {
    flex: 1,
    fontSize: normalize(16),
    color: '#222',
    backgroundColor: 'transparent',
    borderWidth: 0,
    marginRight: normalize(8),
  },
  modalSaveBtn: {
    backgroundColor: '#003337',
    borderRadius: normalize(16),
    paddingHorizontal: normalize(18),
    paddingVertical: normalize(8),
  },
  modalSaveBtnText: {
    color: '#fff',
    fontSize: normalize(16),
    fontWeight: 'bold',
  },
  modalActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: normalize(8),
  },
  modalActionBtn: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: normalize(10),
    marginHorizontal: normalize(4),
    backgroundColor: '#F4F8F8',
    borderRadius: normalize(16),
  },
  modalActionIcon: {
    fontSize: normalize(20),
    marginBottom: normalize(2),
  },
  modalActionText: {
    fontSize: normalize(14),
    color: '#003337',
  },
  // Multi-select mode styles
  multiSelectButton: {
    marginRight: normalize(12),
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
  },
  multiSelectText: {
    fontSize: normalize(14),
    color: '#23BBC2',
    fontWeight: '500',
  },
  selectAllButton: {
    paddingHorizontal: normalize(8),
    paddingVertical: normalize(4),
  },
  selectAllText: {
    fontSize: normalize(14),
    color: '#23BBC2',
    fontWeight: '500',
  },
  checkBox: {
    width: normalize(24),
    height: normalize(24),
    borderRadius: normalize(12),
    borderWidth: 2,
    borderColor: '#D9D9D9',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  checkBoxSelected: {
    borderColor: '#23BBC2',
    backgroundColor: '#23BBC2',
  },
  checkMark: {
    fontSize: normalize(14),
    color: '#FFF',
    fontWeight: 'bold',
  },
  // Batch action bar styles
  batchActionBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFF',
    paddingVertical: normalize(16),
    paddingHorizontal: normalize(20),
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  batchButton: {
    flex: 1,
    paddingVertical: normalize(12),
    borderRadius: normalize(8),
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButton: {
    backgroundColor: '#FF4444',
  },
  disabledButton: {
    backgroundColor: '#D9D9D9',
  },
  batchButtonText: {
    fontSize: normalize(16),
    fontWeight: '600',
  },
  deleteButtonText: {
    color: '#FFF',
  },
  // 播放控制栏样式
  playingControlBar: {
    position: 'absolute',
    bottom: normalize(90),
    left: normalize(20),
    right: normalize(20),
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#19A0A6',
    borderRadius: normalize(12),
    paddingHorizontal: normalize(16),
    paddingVertical: normalize(12),
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  nowPlayingText: {
    flex: 1,
    fontSize: normalize(14),
    color: '#FFF',
    fontWeight: '500',
  },
  stopButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: normalize(6),
    paddingHorizontal: normalize(12),
    paddingVertical: normalize(6),
  },
  stopButtonText: {
    fontSize: normalize(12),
    color: '#FFF',
    fontWeight: '600',
  },
});

export default MusicLibraryScreen; 