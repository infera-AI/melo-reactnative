/**
 * 语言选择器 - 中英文语言切换组件
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  StyleSheet,
  Alert,
} from 'react-native';
import { useTranslation } from 'react-i18next';

interface Language {
  code: string;
  name: string;
  nativeName: string;
}

const LANGUAGES: Language[] = [
  {
    name: '中文',
    code: 'zh',
    flag: '🇨🇳',
  },
  {
    name: 'English',
    code: 'en',
    flag: '🇺🇸',
  },
  {
    name: '日本語',
    code: 'ja',
    flag: '🇯🇵',
  },
  {
    name: 'Français',
    code: 'fr',
    flag: '🇫🇷',
  },
  {
    name: 'Español',
    code: 'es',
    flag: '🇪🇸',
  },
];

interface LanguageSelectorProps {
  visible: boolean;
  onClose: () => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ visible, onClose }) => {
  const { t, i18n, ready } = useTranslation();
  const [isChanging, setIsChanging] = useState(false);

  // 如果i18n还没准备好，不显示模态框
  if (!ready) {
    return null;
  }

  const currentLanguage = LANGUAGES.find(lang => lang.code === i18n.language) || LANGUAGES[0];

  const handleLanguageChange = async (languageCode: string) => {
    if (languageCode === i18n.language) {
      onClose();
      return;
    }

    setIsChanging(true);
    try {
      await i18n.changeLanguage(languageCode);
      Alert.alert(
        t('common.success'),
        t('language.switchSuccess')
      );
      onClose();
    } catch (error) {
      Alert.alert(
        t('common.error'),
        t('language.switchFailed')
      );
    } finally {
      setIsChanging(false);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title}>{t('language.title')}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.currentLanguage}>
            <Text style={styles.currentLabel}>{t('language.current')}:</Text>
            <Text style={styles.currentValue}>{currentLanguage.nativeName}</Text>
          </View>

          <View style={styles.languageList}>
            <Text style={styles.listTitle}>{t('language.switch')}:</Text>
            
            {LANGUAGES.map((language) => (
              <TouchableOpacity
                key={language.code}
                style={[
                  styles.languageItem,
                  language.code === i18n.language && styles.activeLanguageItem,
                ]}
                onPress={() => handleLanguageChange(language.code)}
                disabled={isChanging}
              >
                <View style={styles.languageInfo}>
                  <Text style={[
                    styles.languageName,
                    language.code === i18n.language && styles.activeLanguageName,
                  ]}>
                    {language.nativeName}
                  </Text>
                  <Text style={styles.languageCode}>{language.name}</Text>
                </View>
                
                {language.code === i18n.language && (
                  <View style={styles.checkmark}>
                    <Text style={styles.checkmarkText}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          {isChanging && (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>{t('common.loading')}</Text>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    maxWidth: 400,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 16,
    color: '#64748b',
    fontWeight: 'bold',
  },
  currentLanguage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    marginBottom: 20,
  },
  currentLabel: {
    fontSize: 16,
    color: '#64748b',
    marginRight: 8,
  },
  currentValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
  },
  languageList: {
    marginBottom: 20,
  },
  listTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 12,
  },
  languageItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  activeLanguageItem: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1e293b',
    marginBottom: 2,
  },
  activeLanguageName: {
    color: '#3b82f6',
  },
  languageCode: {
    fontSize: 14,
    color: '#64748b',
  },
  checkmark: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmarkText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 10,
  },
  loadingText: {
    fontSize: 14,
    color: '#64748b',
  },
});

export default LanguageSelector; 