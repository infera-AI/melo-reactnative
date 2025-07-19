/**
 * 歌曲播放与编辑页面
 * M1.5：提供已生成歌曲的完整播放体验，并作为"再创作"的核心入口。
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Image,
  Modal,
  ActivityIndicator,
  Dimensions,
  Pressable,
  Alert,
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const scale = SCREEN_WIDTH / 375;
const normalize = (size: number) => Math.round(size * scale);

// mock歌曲数据库
const mockSongsDB = {
  '1': {
    id: '1',
    title: '停船',
    version: '原创 - Chill-Hop, Lofi, 哼唱',
    cover: 'https://img1.imgtp.com/2023/07/21/abcd1234.jpg',
    duration: '03:24',
    isPublic: true,
  },
  '2': {
    id: '2',
    title: '歌名',
    version: '日语版',
    cover: '',
    duration: '03:24',
    isPublic: false,
  },
} as const;

type SongType = typeof mockSongsDB[keyof typeof mockSongsDB];

interface SongDetailScreenProps {
  onBack: () => void;
  songId: string | null;
}

const langOptions = ['法语', '日语', '韩语', '英语', '西班牙语'];
const styleOptions = ['Lofi', 'Chill-Hop', '电子', '民谣', '摇滚'];

const SongDetailScreen: React.FC<SongDetailScreenProps> = ({ onBack, songId }) => {
  const [playing, setPlaying] = useState(false);
  const [progress] = useState(0.2); // 0~1
  const [showLangPanel, setShowLangPanel] = useState(false);
  const [showStylePanel, setShowStylePanel] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const [song, setSong] = useState<SongType | null>(null);

  // 加载歌曲数据
  useEffect(() => {
    if (songId && songId in mockSongsDB) {
      setSong(mockSongsDB[songId as keyof typeof mockSongsDB]);
    }
  }, [songId]);

  // 分享
  const handleShare = () => {
    // 可集成分享SDK
    Alert.alert('分享', '分享功能开发中');
  };

  // 播放/暂停
  const handlePlayPause = () => {
    setPlaying(v => !v);
  };

  // 多语言翻唱
  const handleLangSelect = (lang: string) => {
    setShowLangPanel(false);
    setLoadingText(`正在生成${lang}版...`);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLoadingText('');
      Alert.alert('成功', `${lang}版生成成功！`);
    }, 2200);
  };

  // 风格重置
  const handleStyleSelect = (style: string) => {
    setShowStylePanel(false);
    setLoadingText(`正在生成${style}风格版...`);
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLoadingText('');
      Alert.alert('成功', `${style}风格版生成成功！`);
    }, 2200);
  };

  if (!song) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#fff" />
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
            <Text style={styles.backButtonIcon}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>歌曲详情</Text>
          <View style={{ width: normalize(40) }} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>加载中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {/* 顶部状态栏 */}
      <View style={styles.topStatusBar}>
        <TouchableOpacity style={styles.backButton} onPress={onBack} activeOpacity={0.7}>
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
      {/* 简短概括词 */}
      <Text style={styles.pageDesc}>完整播放与再创作中心</Text>
      {/* 播放器区 */}
      <View style={styles.playerBox}>
        {song.cover ? (
          <Image source={{ uri: song.cover }} style={styles.coverImg} />
        ) : (
          <View style={styles.coverPlaceholder}>
            <Text style={styles.coverPlaceholderText}>封面</Text>
          </View>
        )}
        <Text style={styles.songTitle}>{song.title}</Text>
        <Text style={styles.songVersion}>{song.version}</Text>
        {/* 进度条 */}
        <View style={styles.progressBarBg}>
          <View style={[styles.progressBar, { width: `${progress * 100}%` }]} />
        </View>
        <View style={styles.playerRow}>
          <Text style={styles.durationText}>00:00</Text>
          <TouchableOpacity style={styles.playBtn} onPress={handlePlayPause}>
            <Text style={styles.playBtnIcon}>{playing ? '⏸️' : '▶️'}</Text>
          </TouchableOpacity>
          <Text style={styles.durationText}>{song.duration}</Text>
        </View>
      </View>
      {/* 再创作工具栏 */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.toolbarBtn} onPress={() => setShowLangPanel(true)}>
          <Text style={styles.toolbarBtnText}>多语言翻唱</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toolbarBtn} onPress={() => setShowStylePanel(true)}>
          <Text style={styles.toolbarBtnText}>地域风格重置</Text>
        </TouchableOpacity>
      </View>
      {/* 多语言选择面板 */}
      <Modal visible={showLangPanel} transparent animationType="slide" onRequestClose={() => setShowLangPanel(false)}>
        <Pressable style={styles.modalMask} onPress={() => setShowLangPanel(false)}>
          <View style={styles.bottomSheet}>
            <Text style={styles.sheetTitle}>选择翻唱语言</Text>
            {langOptions.map(lang => (
              <TouchableOpacity key={lang} style={styles.sheetOption} onPress={() => handleLangSelect(lang)}>
                <Text style={styles.sheetOptionText}>{lang}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.sheetCancel} onPress={() => setShowLangPanel(false)}>
              <Text style={styles.sheetCancelText}>取消</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      {/* 风格选择面板 */}
      <Modal visible={showStylePanel} transparent animationType="slide" onRequestClose={() => setShowStylePanel(false)}>
        <Pressable style={styles.modalMask} onPress={() => setShowStylePanel(false)}>
          <View style={styles.bottomSheet}>
            <Text style={styles.sheetTitle}>选择地域风格</Text>
            {styleOptions.map(style => (
              <TouchableOpacity key={style} style={styles.sheetOption} onPress={() => handleStyleSelect(style)}>
                <Text style={styles.sheetOptionText}>{style}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={styles.sheetCancel} onPress={() => setShowStylePanel(false)}>
              <Text style={styles.sheetCancelText}>取消</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
      {/* 再创作加载中动画 */}
      <Modal visible={loading} transparent animationType="fade">
        <View style={styles.loadingMask}>
          <ActivityIndicator size="large" color="#3b82f6" />
          <Text style={styles.loadingText}>{loadingText || '再创作生成中...'}</Text>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
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
    width: normalize(40),
    height: normalize(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonIcon: {
    fontSize: normalize(22),
    color: '#222',
  },
  headerTitle: {
    fontSize: normalize(18),
    fontWeight: 'bold',
    color: '#222',
  },
  shareBtn: {
    minWidth: normalize(40),
    alignItems: 'center',
    justifyContent: 'center',
  },
  shareBtnText: {
    fontSize: normalize(15),
    color: '#3b82f6',
    fontWeight: 'bold',
  },
  pageDesc: {
    fontSize: normalize(14),
    color: '#64748b',
    textAlign: 'center',
    marginTop: normalize(4),
    marginBottom: normalize(12),
    fontWeight: '400',
  },
  playerBox: {
    alignItems: 'center',
    marginTop: normalize(18),
    marginBottom: normalize(24),
    paddingHorizontal: normalize(24),
  },
  coverImg: {
    width: normalize(160),
    height: normalize(160),
    borderRadius: normalize(16),
    marginBottom: normalize(18),
    backgroundColor: '#e5e7eb',
  },
  coverPlaceholder: {
    width: normalize(160),
    height: normalize(160),
    borderRadius: normalize(16),
    marginBottom: normalize(18),
    backgroundColor: '#e5e7eb',
    alignItems: 'center',
    justifyContent: 'center',
  },
  coverPlaceholderText: {
    fontSize: normalize(16),
    color: '#94a3b8',
  },
  songTitle: {
    fontSize: normalize(20),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: normalize(4),
  },
  songVersion: {
    fontSize: normalize(14),
    color: '#64748b',
    marginBottom: normalize(18),
  },
  progressBarBg: {
    width: '100%',
    height: normalize(6),
    backgroundColor: '#e5e7eb',
    borderRadius: normalize(3),
    marginBottom: normalize(8),
    overflow: 'hidden',
  },
  progressBar: {
    height: normalize(6),
    backgroundColor: '#3b82f6',
    borderRadius: normalize(3),
  },
  playerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: normalize(2),
  },
  durationText: {
    fontSize: normalize(13),
    color: '#64748b',
    fontWeight: '500',
  },
  playBtn: {
    width: normalize(56),
    height: normalize(56),
    borderRadius: normalize(28),
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: normalize(12),
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 6,
  },
  playBtnIcon: {
    fontSize: normalize(28),
    color: '#fff',
  },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(32),
    paddingTop: normalize(8),
    borderTopWidth: 0.5,
    borderTopColor: '#e5e7eb',
    backgroundColor: '#fff',
  },
  toolbarBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: normalize(22),
    paddingHorizontal: normalize(28),
    paddingVertical: normalize(14),
    alignItems: 'center',
  },
  toolbarBtnText: {
    color: '#fff',
    fontSize: normalize(16),
    fontWeight: 'bold',
  },
  modalMask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'flex-end',
  },
  bottomSheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: normalize(18),
    borderTopRightRadius: normalize(18),
    paddingBottom: normalize(24),
    paddingTop: normalize(8),
    paddingHorizontal: normalize(16),
  },
  sheetTitle: {
    fontSize: normalize(16),
    fontWeight: 'bold',
    color: '#222',
    marginBottom: normalize(12),
    textAlign: 'center',
  },
  sheetOption: {
    paddingVertical: normalize(16),
    alignItems: 'center',
  },
  sheetOptionText: {
    fontSize: normalize(16),
    color: '#222',
  },
  sheetCancel: {
    marginTop: normalize(8),
    paddingVertical: normalize(16),
    alignItems: 'center',
    borderTopWidth: 0.5,
    borderTopColor: '#e5e7eb',
  },
  sheetCancelText: {
    fontSize: normalize(16),
    color: '#64748b',
  },
  loadingMask: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.18)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: normalize(18),
    fontSize: normalize(16),
    color: '#3b82f6',
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SongDetailScreen; 