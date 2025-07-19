import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Dimensions,
} from 'react-native';

const { width: screenWidth } = Dimensions.get('window');
const scale = screenWidth / 375; // 假设设计稿基于375px宽度
const normalize = (size: number) => Math.round(size * scale);

interface RecordFinishProps {
  onWriteLyrics?: () => void;
  onAIMatch?: () => void;
  onLanguageToggle?: (language: 'zh' | 'en') => void;
  showLanguageToggle?: boolean;
}

const RecordFinish: React.FC<RecordFinishProps> = ({
  onWriteLyrics,
  onAIPolish,
  onLanguageToggle,
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState<'zh' | 'en'>('zh');
  const [inputText, setInputText] = useState('');

  const handleLanguageToggle = () => {
    const newLanguage = selectedLanguage === 'zh' ? 'en' : 'zh';
    setSelectedLanguage(newLanguage);
    onLanguageToggle?.(newLanguage);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        {/* Separator Line */}
        <View style={styles.separator} />
        
        {/* Main Content Container */}
        <View style={styles.mainContainer}>
          {/* Text Input Area */}
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.textInput}
              placeholder="根据用户哼唱内容预先填写"
              placeholderTextColor="#949494"
              value={inputText}
              onChangeText={setInputText}
              multiline
              textAlignVertical="top"
            />
            
            {/* Action Buttons */}
            <View style={styles.actionButtonsContainer}>
              {/* Write Lyrics Button */}
              <TouchableOpacity
                style={styles.writeLyricsButton}
                onPress={onWriteLyrics}
              >
                <Image
                  source={require('./icons/write_lyrics_icon.png')}
                  style={styles.buttonIcon}
                />
                <Text style={styles.writeLyricsText}>写歌词</Text>
              </TouchableOpacity>
              
              {/* AI Polish Button */}
              <TouchableOpacity
                style={styles.aiPolishButton}
                onPress={onAIPolish}
              >
                <Image
                  source={require('./icons/ai_polish_icon.png')}
                  style={styles.aiPolishIcon}
                />
                <Text style={styles.aiPolishText}>AI润饰</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          {/* Language Toggle */}
          <View style={styles.languageToggleContainer}>
            <Text style={styles.languageText}>英文</Text>
            <View style={styles.arrowIcon}>
              <View style={styles.arrowLine} />
            </View>
            <TouchableOpacity
              style={styles.languageButton}
              onPress={handleLanguageToggle}
            >
              <Image
                source={require('./icons/language_toggle_icon.png')}
                style={styles.languageIcon}
              />
            </TouchableOpacity>
            <View style={styles.arrowIcon}>
              <View style={styles.arrowLine} />
            </View>
            <Text style={styles.languageText}>中文</Text>
          </View>
        </View>
      </View>
      
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E6E9E9',
  },
  content: {
    flex: 1,
    paddingHorizontal: normalize(16),
  },
  separator: {
    width: 0,
    height: normalize(4),
    backgroundColor: '#E7E7E7',
    alignSelf: 'flex-end',
    marginTop: normalize(49),
    marginRight: normalize(10),
  },
  mainContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: normalize(6),
    width: normalize(338),
    height: normalize(224),
    marginTop: normalize(49),
  },
  inputContainer: {
    backgroundColor: 'rgba(243, 243, 243, 0.24)',
    borderRadius: normalize(6),
    margin: normalize(16),
    marginBottom: normalize(44),
    padding: normalize(16),
    paddingVertical: normalize(15),
    height: normalize(127),
  },
  textInput: {
    fontSize: normalize(12),
    fontFamily: 'Inter',
    color: '#949494',
    lineHeight: normalize(15),
    textAlignVertical: 'top',
    minHeight: normalize(15),
    marginBottom: normalize(10),
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: normalize(10),
    marginTop: normalize(12),
  },
  writeLyricsButton: {
    backgroundColor: '#DBEDF6',
    borderRadius: normalize(49),
    paddingHorizontal: normalize(10),
    paddingVertical: normalize(7),
    flexDirection: 'row',
    alignItems: 'center',
    width: normalize(74),
    height: normalize(29),
  },
  buttonIcon: {
    width: normalize(12),
    height: normalize(12),
    marginRight: normalize(6),
  },
  writeLyricsText: {
    fontSize: normalize(12),
    fontFamily: 'Inter',
    color: '#23BBC2',
    textAlign: 'center',
    lineHeight: normalize(15),
  },
  aiPolishButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiPolishIcon: {
    width: normalize(9),
    height: normalize(10),
    marginRight: normalize(4),
  },
  aiPolishText: {
    fontSize: normalize(12),
    fontFamily: 'Inter',
    color: '#949494',
    textAlign: 'center',
    lineHeight: normalize(15),
  },
  languageToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: normalize(16),
    paddingBottom: normalize(15),
    height: normalize(16),
  },
  languageText: {
    fontSize: normalize(12),
    fontFamily: 'Inter',
    color: '#000000',
    textAlign: 'center',
    lineHeight: normalize(14),
  },
  arrowIcon: {
    marginHorizontal: normalize(3),
  },
  arrowLine: {
    width: normalize(5.83),
    height: normalize(4.95),
    borderTopWidth: 1,
    borderRightWidth: 1,
    borderColor: '#949494',
    transform: [{ rotate: '45deg' }],
  },
  languageButton: {
    backgroundColor: '#DBEDF6',
    borderRadius: normalize(69),
    width: normalize(32),
    height: normalize(16),
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: normalize(5),
  },
  languageIcon: {
    width: normalize(12),
    height: normalize(8),
  },
});

export default RecordFinish;