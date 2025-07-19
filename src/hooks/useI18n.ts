/**
 * 国际化自定义Hook
 */
import { useTranslation } from 'react-i18next';
import { useCallback, useEffect, useState } from 'react';

export const useI18n = () => {
  const { t, i18n, ready } = useTranslation();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (ready) {
      setIsReady(true);
    }
  }, [ready]);

  // 切换语言
  const changeLanguage = useCallback(async (languageCode: string) => {
    try {
      await i18n.changeLanguage(languageCode);
      return true;
    } catch (error) {
      console.error('Failed to change language:', error);
      return false;
    }
  }, [i18n]);

  // 获取当前语言
  const getCurrentLanguage = useCallback(() => {
    return i18n.language || 'zh-CN';
  }, [i18n.language]);

  // 获取可用语言列表
  const getAvailableLanguages = useCallback(() => {
    return [
      { code: 'zh-CN', name: '简体中文', nativeName: '简体中文' },
      { code: 'en-US', name: 'English', nativeName: 'English' },
    ];
  }, []);

  // 检查是否为中文
  const isChinese = useCallback(() => {
    return getCurrentLanguage().startsWith('zh');
  }, [getCurrentLanguage]);

  // 检查是否为英文
  const isEnglish = useCallback(() => {
    return getCurrentLanguage().startsWith('en');
  }, [getCurrentLanguage]);

  // 格式化日期时间（根据语言）
  const formatDateTime = useCallback((date: Date | string | number, options?: Intl.DateTimeFormatOptions) => {
    const dateObj = typeof date === 'string' || typeof date === 'number' ? new Date(date) : date;
    const locale = getCurrentLanguage();
    
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };

    return new Intl.DateTimeFormat(locale, { ...defaultOptions, ...options }).format(dateObj);
  }, [getCurrentLanguage]);

  // 格式化数字（根据语言）
  const formatNumber = useCallback((number: number, options?: Intl.NumberFormatOptions) => {
    const locale = getCurrentLanguage();
    return new Intl.NumberFormat(locale, options).format(number);
  }, [getCurrentLanguage]);

  // 格式化货币（根据语言）
  const formatCurrency = useCallback((amount: number, currency: string = 'CNY') => {
    const locale = getCurrentLanguage();
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  }, [getCurrentLanguage]);

  // 格式化文件大小
  const formatBytes = useCallback((bytes: number, decimals: number = 2) => {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = isChinese() 
      ? ['字节', 'KB', 'MB', 'GB', 'TB', 'PB']
      : ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }, [isChinese]);

  // 翻译带有变量的文本
  const translate = useCallback((key: string, options?: any): string => {
    if (!isReady) {
      // 如果i18n还没准备好，返回key作为fallback
      return key;
    }
    try {
      const result = t(key, options);
      return typeof result === 'string' ? result : String(result);
    } catch (error) {
      console.warn('Translation error:', error);
      return key;
    }
  }, [t, isReady]);

  // 翻译多个key，返回对象
  const translateMultiple = useCallback((keys: string[]) => {
    const result: Record<string, string> = {};
    keys.forEach(key => {
      result[key] = t(key);
    });
    return result;
  }, [t]);

  // 获取错误消息的翻译
  const getErrorMessage = useCallback((error: any, fallback?: string) => {
    if (typeof error === 'string') {
      return error;
    }
    
    if (error?.message) {
      return error.message;
    }
    
    if (error?.code) {
      const errorKey = `error.${error.code}`;
      const translated = t(errorKey);
      if (translated !== errorKey) {
        return translated;
      }
    }
    
    return fallback || t('common.error');
  }, [t]);

  return {
    // 基础功能
    t: translate,
    i18n,
    isReady,
    
    // 语言管理
    changeLanguage,
    getCurrentLanguage,
    getAvailableLanguages,
    isChinese,
    isEnglish,
    
    // 格式化工具
    formatDateTime,
    formatNumber,
    formatCurrency,
    formatBytes,
    
    // 翻译工具
    translateMultiple,
    getErrorMessage,
  };
};

export default useI18n; 