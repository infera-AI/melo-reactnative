/**
 * 0.1: 欢迎与核心价值/登录注册入口页 - 应用主入口页面展示品牌价值和用户引导
 */
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { useI18n } from '../../hooks/useI18n';
import FeatureCarousel from './FeatureCarousel';
import { AgreementModal } from '../modals';
import { LanguageSelector } from '../settings';

interface WelcomeScreenProps {
  onRegister: () => void;
  onLogin: () => void;
}

const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onRegister,
  onLogin,
}) => {
  const { t, getCurrentLanguage } = useI18n();
  const [showAgreementModal, setShowAgreementModal] = useState(false);
  const [agreementType, setAgreementType] = useState<'user' | 'privacy'>('user');
  const [languageSelectorVisible, setLanguageSelectorVisible] = useState(false);

  // 获取当前语言的显示名称
  const getCurrentLanguageDisplayName = () => {
    const language = getCurrentLanguage();
    switch (language) {
      case 'zh':
        return '欢迎使用 Lingo 耳机翻译';
      case 'en':
        return 'Welcome to Lingo Earphone Translation';
      case 'ja':
        return 'Lingo イヤホン翻訳へようこそ';
      case 'fr':
        return 'Bienvenue sur Lingo Traduction d\'Écouteurs';
      case 'es':
        return 'Bienvenido a Lingo Traducción de Auriculares';
      default:
        return '欢迎使用 Lingo 耳机翻译';
    }
  };

  // 处理协议链接点击
  const handleAgreementClick = (type: 'user' | 'privacy') => {
    setAgreementType(type);
    setShowAgreementModal(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      
      <ScrollView 
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.contentContainer}
      >
        {/* 顶部Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>Logo</Text>
          </View>
        </View>

        {/* 欢迎语/Slogan */}
        <View style={styles.sloganContainer}>
          <Text style={styles.appName}>{t('welcome.appName')}</Text>
          <Text style={styles.slogan}>{t('welcome.slogan')}</Text>
        </View>

        {/* 核心价值轮播区域 */}
        <View style={styles.carouselContainer}>
          <FeatureCarousel />
        </View>

        {/* 注册按钮 */}
        <TouchableOpacity style={styles.registerButton} onPress={onRegister}>
          <Text style={styles.registerButtonText}>
            {t('welcome.registerButton')}
          </Text>
        </TouchableOpacity>

        {/* 登录链接 */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginPrompt}>{t('welcome.loginPrompt')} </Text>
          <TouchableOpacity onPress={onLogin}>
            <Text style={styles.loginLink}>{t('welcome.loginLink')}</Text>
          </TouchableOpacity>
        </View>
        {/* 语言切换区域 */}
        <View style={styles.languageWrapper}>
          <Text style={styles.languageIcon}>🌐</Text>
          <TouchableOpacity 
            style={styles.languageSwitchContainer}
            onPress={() => setLanguageSelectorVisible(true)}
          >
            <Text style={styles.currentLanguage}>
              {t('language.current')}: {getCurrentLanguageDisplayName()}
            </Text>
            <Text style={styles.switchIcon}>⇄</Text>
          </TouchableOpacity>
        </View>

        {/* 语言选择器弹窗 */}
        <LanguageSelector
          visible={languageSelectorVisible}
          onClose={() => setLanguageSelectorVisible(false)}
        />

        {/* 底部法律条款链接 */}
        <View style={styles.agreementContainer}>
          <Text style={styles.agreementText}>
            {t('welcome.agreementText')}
          </Text>
          <View style={styles.agreementLinksContainer}>
            <TouchableOpacity onPress={() => handleAgreementClick('user')}>
              <Text style={styles.agreementLink}>
                {t('welcome.userAgreement')}
              </Text>
            </TouchableOpacity>
            <Text style={styles.agreementText}>
              {t('welcome.agreementSeparator')}
            </Text>
            <TouchableOpacity onPress={() => handleAgreementClick('privacy')}>
              <Text style={styles.agreementLink}>
                {t('welcome.privacyPolicy')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>

      {/* 协议弹窗 */}
      <AgreementModal
        visible={showAgreementModal}
        onClose={() => setShowAgreementModal(false)}
        type={agreementType}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContainer: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 30,
  },
  logoContainer: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 30,
  },
  logoBox: {
    width: 120,
    height: 80,
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  logoText: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 1,
  },
  sloganContainer: {
    alignItems: 'center',
    paddingHorizontal: 40,
    marginBottom: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1f2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  slogan: {
    fontSize: 18,
    fontWeight: '500',
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 26,
  },
  carouselContainer: {
    marginBottom: 50,
  },
  registerButton: {
    marginHorizontal: 40,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#3b82f6',
    alignItems: 'center',
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  registerButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#3b82f6',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  loginPrompt: {
    fontSize: 16,
    color: '#6b7280',
  },
  loginLink: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  languageWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 30,
    marginHorizontal: 40,
  },
  languageIcon: {
    fontSize: 20,
    marginRight: 12,
  },
  languageSwitchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    flex: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  currentLanguage: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
    flex: 1,
  },
  switchIcon: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '600',
  },
  agreementContainer: {
    paddingHorizontal: 40,
    alignItems: 'center',
  },
  agreementText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
  },
  agreementLinksContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 4,
  },
  agreementLink: {
    fontSize: 12,
    color: '#3b82f6',
    textDecorationLine: 'underline',
    lineHeight: 18,
  },
});

export default WelcomeScreen; 