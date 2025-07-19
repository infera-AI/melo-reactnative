/**
 * i18n类型定义
 */
import 'react-i18next';

// 导入语言资源类型
import type zh from './locales/zh.json';
import type en from './locales/en.json';
import type ja from './locales/ja.json';
import type fr from './locales/fr.json';
import type es from './locales/es.json';

// 声明模块扩展
declare module 'react-i18next' {
  interface CustomTypeOptions {
    // 设置默认命名空间
    defaultNS: 'translation';
    // 设置资源类型
    resources: {
      translation: typeof zh;
    };
    // 确保返回值为字符串
    returnNull: false;
    returnEmptyString: false;
    returnObjects: false;
  }
}

// 导出语言代码类型
export type LanguageCode = 'zh' | 'en' | 'ja' | 'fr' | 'es';

// 语言选项类型
export interface LanguageOption {
  code: LanguageCode;
  name: string;
  nativeName: string;
}

// 翻译参数类型
export interface TranslationOptions {
  count?: number;
  context?: string;
  replace?: Record<string, string | number>;
  lng?: LanguageCode;
  ns?: string;
}

// 格式化选项类型
export interface FormatOptions {
  locale?: LanguageCode;
  timeZone?: string;
  currency?: string;
} 