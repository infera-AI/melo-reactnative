/**
 * 生成音乐页面
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
  TextInput,
  Image,
} from 'react-native';
import { recommendGenres, getMusicTaskStatus, generateMusic, polishLyrics } from '../../api/services/musicService';
import translateService from '../../api/services/translateService';
import { Alert } from 'react-native';
import colors from '../../assets/colors';
import { normalize } from '../../utils/normalize';

interface RecreateMusicScreenProps {
  onBack?: () => void;
  workId?: string | null;
  initialLyrics?: string;
  initialGenres?: string[];
  onNavigateToSongConfig?: (data: any) => void;
  lyricsText?: string;
  geners?: string[];
}

const LyricsCreateMusicScreen: React.FC<RecreateMusicScreenProps> = ({
  onBack,
  lyricsText,
  geners,
  initialLyrics = '', 
  initialGenres = [],
  onNavigateToSongConfig,
}) => {
  const [lyrics, setLyrics] = useState(lyricsText || '');
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialGenres);
  const [loading, setLoading] = useState(false);
  const [catching,setCatching] = useState(false);
  const [polling, setPolling] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [isLyricsMode, setIsLyricsMode] = useState(true); // true: 写歌词, false: AI匹配
  const [genres, setGenres] = useState<string[]>(geners || []);
  const pollTimer = useRef<NodeJS.Timeout | null>(null);
  
  const [sourceLang, setSourceLang] = useState('英文');
  const [targetLang, setTargetLang] = useState('中文');
  const languageCodeMap: Record<string, string> = {
    '中文': 'zh',
    '英文': 'en',
    '日文': 'ja',
    '韩文': 'ko',
    '西班牙文': 'es',
    '法文': 'fr',
    '德文': 'de',
    '意大利文': 'it',
    '俄文': 'ru',
    '泰文': 'th',
  };
  const [translateLoading, setTranslateLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);

  // 语言选择相关状态
  const languageOptions = [
    { code: 'zh', name: '中文' },
    { code: 'en', name: '英文' },
    { code: 'ja', name: '日文' },
    { code: 'ko', name: '韩文' },
    { code: 'es', name: '西班牙文' },
    { code: 'fr', name: '法文' },
    { code: 'de', name: '德文' },
    { code: 'it', name: '意大利文' },
    { code: 'ru', name: '俄文' },
    { code: 'th', name: '泰文' },
  ];
  const [showSourceLangPicker, setShowSourceLangPicker] = useState(false);
  const [showTargetLangPicker, setShowTargetLangPicker] = useState(false);

  const handleLanguageSwitch = () => {
    const temp = sourceLang;
    setSourceLang(targetLang);
    setTargetLang(temp);
  };
  const handleSourceLangSelect = (lang: { code: string; name: string }) => {
    setSourceLang(lang.name);
    setShowSourceLangPicker(false);
  };
  const handleTargetLangSelect = (lang: { code: string; name: string }) => {
    setTargetLang(lang.name);
    setShowTargetLangPicker(false);
  };

  // 页面卸载时清除轮询定时器
  useEffect(() => {

    return () => {
      if (pollTimer.current) {
        clearTimeout(pollTimer.current);
      }
    };
  }, []);

  useEffect(() => {
    console.log('geners', geners);
    setGenres(geners || []);
    setLyrics(lyricsText || '');
    console.log('lyricsText', lyricsText);
  }, [lyricsText,geners]);
 

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
      setCatching(true);
      const data = await recommendGenres({ work_lyrics: lyrics });
      if (data?.work_genres) {
        setGenres(data.work_genres);
      }
    } catch (e: any) {
      setError(e.message || '推荐失败');
    } finally {
      setCatching(false);
    }
  };

  const handleRegenerate = async () => {
  };

  // 轮询查询任务状态
  const pollTaskStatus = async (taskId: string) => {
    try {
      const poll = async () => {
        const res = await getMusicTaskStatus({ task_id: taskId });
        // 如果code等于500 则表示生成失败   
        if (res && res.code === 500) {
          setError('生成失败');
          setPolling(false);
          setLoading(false);
          pollTimer.current&&clearTimeout(pollTimer.current);
          return;
        }
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
    setGenres([])
    setSelectedGenres(initialGenres);
    setError(undefined);
  };

  const handleLyricsTranslate = async () => {
    if (!lyrics.trim()) {
      Alert.alert('提示', '请先输入要翻译的歌词');
      return;
    }
    setTranslateLoading(true);
    try {
      const sourceCode = languageCodeMap[sourceLang];
      const targetCode = languageCodeMap[targetLang];
      if (!sourceCode || !targetCode) {
        Alert.alert('错误', '不支持的语言类型');
        return;
      }
      const translateParams = {
        source_language: sourceCode,
        target_language: targetCode,
        source_text: lyrics,
        format_type: 'text'
      };
      const result = await translateService.translateText(translateParams);
      if (result.code === 200 && result.data?.data.Translated) {
        setLyrics(result.data.data.Translated);
        Alert.alert('翻译成功', `已翻译为${targetLang}`);
      } else {
        Alert.alert('翻译失败', result.message || '请重试');
      }
    } catch (error: any) {
      Alert.alert('翻译失败', error.message || '网络错误，请重试');
    } finally {
      setTranslateLoading(false);
    }
  };

  // AI润饰
  const handleAIPolish = async () => {
    if (!lyrics.trim()) {
      Alert.alert('提示', '请先输入要润饰的歌词');
      return;
    }
    setAiLoading(true);
    try {
      const data = await polishLyrics({ work_lyrics: lyrics });
      if (data &&  typeof data.work_lyrics === 'string') {
        setLyrics(data.work_lyrics);
        Alert.alert('AI润饰完成', '歌词已优化');
      } else {
        Alert.alert('AI润饰失败', data?.message || '请重试');
      }
    } catch (e: any) {
      Alert.alert('AI润饰失败', e?.message || '网络错误，请重试');
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#EEF4F4" />
      
      {/* Gradient Background Circles */}
      <View style={styles.gradientCircle1} />
      <View style={styles.gradientCircle2} />

       {/* 顶部状态栏 */}
       <View style={styles.topStatusBar}>
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
              style={styles.returnIcon}
              resizeMode="contain"
            />
        </View>
          <Text style={styles.connectionText}>30%</Text>
        </View>
        <View/>
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
                <Image source={require('../../assets/images/write_main.png')} style={styles.pencilIcon} />
                <Text style={[styles.modeButtonText, isLyricsMode && styles.modeButtonTextActive]}>写歌词</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.aiButton}
                onPress={handleAIPolish}
                disabled={aiLoading}
              >
                 <Image source={require('../../assets/images/ai_icon_main.png')} style={styles.pencilIcon} />
                {aiLoading ? (
                  <Text style={styles.aiButtonText}>生成中...</Text>
                ) : (
                  <Text style={styles.aiButtonText}>AI润饰</Text>
                )}
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
                  <TouchableOpacity onPress={() => setShowSourceLangPicker(true)}>
                    <Text style={styles.languageText}>{sourceLang}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.languageToggle} onPress={handleLanguageSwitch}>
                    <Image source={require('../../assets/images/exchang_icon_main.png')} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setShowTargetLangPicker(true)}>
                    <Text style={styles.languageText}>{targetLang}</Text>
                  </TouchableOpacity>
                </View>
                  <TouchableOpacity 
                    style={styles.lyricsTranslateButton} 
                    onPress={handleLyricsTranslate} 
                    disabled={translateLoading}
                  >
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
              <TouchableOpacity style={styles.aiMatchButton} onPress={handleAIRecommend}>
              <Image source={require('../../assets/images/ai_icon_main.png')} style={styles.pencilIcon} />
              {catching ? (
                  <Text style={styles.aiButtonText}>生成中...</Text>
                ) : (
                  <Text style={styles.aiMatchText}>AI匹配</Text>
                )}
              
              </TouchableOpacity>
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
          </View>
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

      {/* 源语言选择弹窗 */}
      {showSourceLangPicker && (
        <View style={styles.languagePickerOverlay}>
          <View style={styles.languagePickerModal}>
            <View style={styles.languagePickerHeader}>
              <Text style={styles.languagePickerTitle}>选择源语言</Text>
              <TouchableOpacity onPress={() => setShowSourceLangPicker(false)}>
                <Text style={styles.languagePickerClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.languagePickerList}>
              {languageOptions.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languagePickerItem,
                    sourceLang === lang.name && styles.languagePickerItemSelected
                  ]}
                  onPress={() => handleSourceLangSelect(lang)}
                >
                  <Text style={[
                    styles.languagePickerItemText,
                    sourceLang === lang.name && styles.languagePickerItemTextSelected
                  ]}>
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      )}

      {/* 目标语言选择弹窗 */}
      {showTargetLangPicker && (
        <View style={styles.languagePickerOverlay}>
          <View style={styles.languagePickerModal}>
            <View style={styles.languagePickerHeader}>
              <Text style={styles.languagePickerTitle}>选择目标语言</Text>
              <TouchableOpacity onPress={() => setShowTargetLangPicker(false)}>
                <Text style={styles.languagePickerClose}>✕</Text>
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.languagePickerList}>
              {languageOptions.map((lang) => (
                <TouchableOpacity
                  key={lang.code}
                  style={[
                    styles.languagePickerItem,
                    targetLang === lang.name && styles.languagePickerItemSelected
                  ]}
                  onPress={() => handleTargetLangSelect(lang)}
                >
                  <Text style={[
                    styles.languagePickerItemText,
                    targetLang === lang.name && styles.languagePickerItemTextSelected
                  ]}>
                    {lang.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: normalize(20),
    paddingVertical: normalize(16),
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
  pencilIcon: {
    width: normalize(12),
    height: normalize(12),
    borderRadius: normalize(2),
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
    marginRight:normalize(10)
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
    marginRight:normalize(10)
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
  // 语言选择器样式
  languagePickerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  languagePickerModal: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(16),
    margin: normalize(20),
    maxHeight: '70%',
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  languagePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  languagePickerTitle: {
    fontSize: normalize(18),
    fontWeight: '600',
    color: '#333',
  },
  languagePickerClose: {
    fontSize: normalize(20),
    color: '#999',
    fontWeight: 'bold',
  },
  languagePickerList: {
    maxHeight: normalize(300),
  },
  languagePickerItem: {
    padding: normalize(16),
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  languagePickerItemSelected: {
    backgroundColor: '#E3F2FD',
  },
  languagePickerItemText: {
    fontSize: normalize(16),
    color: '#333',
  },
  languagePickerItemTextSelected: {
    color: '#2196F3',
    fontWeight: '600',
  },
});

export default LyricsCreateMusicScreen; 