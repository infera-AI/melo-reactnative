/**
 * 国际化配置文件
 */
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 导入语言资源
import zhCN from './locales/zh-CN.json';
import enUS from './locales/en-US.json';
import jaJP from './locales/ja-JP.json';
import frFR from './locales/fr-FR.json';
import esES from './locales/es-ES.json';

// 导入类型定义
import './types';

const LANGUAGE_DETECTOR = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lng: string) => void) => {
    try {
      // 从AsyncStorage读取保存的语言设置
      const savedLanguage = await AsyncStorage.getItem('user-language');
      if (savedLanguage) {
        callback(savedLanguage);
        return;
      }
      
      // 如果没有保存的语言，使用系统默认语言
      // React Native中获取系统语言的方法
      const systemLang = require('react-native').NativeModules.SettingsManager?.settings?.AppleLocale || 
                        require('react-native').NativeModules.I18nManager?.localeIdentifier || 
                        'zh-CN';
      
      // 映射系统语言到支持的语言
      let detectedLang = 'zh-CN';
      if (systemLang.startsWith('en')) {
        detectedLang = 'en-US';
      } else if (systemLang.startsWith('ja')) {
        detectedLang = 'ja-JP';
      } else if (systemLang.startsWith('fr')) {
        detectedLang = 'fr-FR';
      } else if (systemLang.startsWith('es')) {
        detectedLang = 'es-ES';
      } else if (systemLang.startsWith('zh')) {
        detectedLang = 'zh-CN';
      }
      
      callback(detectedLang);
    } catch (error) {
      // 发生错误时使用默认语言
      callback('zh-CN');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem('user-language', language);
    } catch (error) {
      console.error('Failed to save language preference:', error);
    }
  },
};

// 初始化i18n
i18n
  .use(LANGUAGE_DETECTOR)
  .use(initReactI18next)
  .init({
    // 语言资源
    resources: {
      'zh-CN': {
        translation: zhCN,
      },
      'en-US': {
        translation: enUS,
      },
      'ja-JP': {
        translation: jaJP,
      },
      'fr-FR': {
        translation: frFR,
      },
      'es-ES': {
        translation: esES,
      },
    },
    
    // 默认语言
    fallbackLng: 'zh-CN',
    
    // 调试模式
    debug: __DEV__,
    
    // 插值配置
    interpolation: {
      escapeValue: false, // React已经默认转义了
    },
    
    // 其他配置
    compatibilityJSON: 'v3', // 兼容性配置
    defaultNS: 'translation',
    
    // 重要：同步初始化，避免Suspense问题
    initImmediate: false,
    react: {
      useSuspense: false, // 禁用Suspense，避免渲染错误
    },
  });

export default i18n; 