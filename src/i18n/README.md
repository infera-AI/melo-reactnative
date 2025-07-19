# 国际化 (i18n) 配置指南

本项目使用 `react-i18next` 库实现多语言支持。

## 目录结构

```
src/i18n/
├── index.ts          # i18n 配置文件
├── types.ts          # TypeScript 类型定义
├── locales/          # 语言资源文件夹
│   ├── zh-CN.json    # 简体中文
│   └── en-US.json    # 英文
└── README.md         # 使用文档
```

## 快速开始

### 1. 基础使用

```tsx
import React from 'react';
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <Text>{t('common.loading')}</Text>
  );
}
```

### 2. 使用自定义Hook

```tsx
import React from 'react';
import { useI18n } from '../../hooks/useI18n';

function MyComponent() {
  const { t, changeLanguage, getCurrentLanguage } = useI18n();
  
  return (
    <View>
      <Text>{t('app.title')}</Text>
      <Text>当前语言: {getCurrentLanguage()}</Text>
    </View>
  );
}
```

## 功能特性

### 1. 自动语言检测
- 优先使用用户保存的语言设置
- 回退到系统语言
- 默认使用简体中文

### 2. 语言持久化
- 自动将用户选择的语言保存到 AsyncStorage
- 应用重启后保持用户的语言选择

### 3. 类型安全
- 完整的 TypeScript 支持
- 编译时检查翻译key的有效性

### 4. 格式化工具
- 日期时间格式化
- 数字格式化
- 货币格式化
- 文件大小格式化

## API 文档

### useI18n Hook

```tsx
const {
  // 基础功能
  t,                    // 翻译函数
  i18n,                // i18n实例
  
  // 语言管理
  changeLanguage,       // 切换语言
  getCurrentLanguage,   // 获取当前语言
  getAvailableLanguages,// 获取可用语言列表
  isChinese,           // 是否为中文
  isEnglish,           // 是否为英文
  
  // 格式化工具
  formatDateTime,       // 格式化日期时间
  formatNumber,         // 格式化数字
  formatCurrency,       // 格式化货币
  formatBytes,          // 格式化文件大小
  
  // 翻译工具
  translateMultiple,    // 批量翻译
  getErrorMessage,      // 获取错误消息
} = useI18n();
```

### 翻译函数使用

```tsx
// 基础翻译
t('common.loading')

// 带变量的翻译
t('validation.minLength', { count: 6 })

// 复数形式
t('posts.count', { count: 5 })
```

### 格式化工具使用

```tsx
// 日期格式化
formatDateTime(new Date(), { 
  year: 'numeric', 
  month: 'long', 
  day: 'numeric' 
});

// 数字格式化
formatNumber(12345.67);

// 货币格式化
formatCurrency(199.99, 'USD');

// 文件大小格式化
formatBytes(1024 * 1024); // "1 MB" 或 "1 MB"
```

## 添加新语言

### 1. 创建语言资源文件

在 `src/i18n/locales/` 目录下创建新的语言文件，如 `ja-JP.json`：

```json
{
  "common": {
    "loading": "読み込み中...",
    "success": "成功",
    ...
  }
}
```

### 2. 更新配置

在 `src/i18n/index.ts` 中添加新语言：

```typescript
import jaJP from './locales/ja-JP.json';

// 在 resources 中添加
resources: {
  'zh-CN': { translation: zhCN },
  'en-US': { translation: enUS },
  'ja-JP': { translation: jaJP },
}
```

### 3. 更新类型定义

在 `src/i18n/types.ts` 中更新语言代码类型：

```typescript
export type LanguageCode = 'zh-CN' | 'en-US' | 'ja-JP';
```

## 最佳实践

### 1. 翻译key命名规范
- 使用点分层级结构：`module.section.item`
- 使用描述性名称：`user.profile.editButton`
- 避免过深的层级（建议不超过4层）

### 2. 翻译内容规范
- 保持简洁明了
- 避免硬编码特定格式
- 使用插值变量处理动态内容

### 3. 组件使用规范
- 优先使用 `useI18n` Hook
- 避免在组件外使用翻译函数
- 合理使用翻译key的分组

## 常见问题

### Q: 如何处理复数形式？
A: 使用 count 参数：
```tsx
t('posts.count', { count: posts.length })
```

对应的翻译文件：
```json
{
  "posts": {
    "count_0": "没有文章",
    "count_1": "{{count}} 篇文章",
    "count_other": "{{count}} 篇文章"
  }
}
```

### Q: 如何在非组件中使用翻译？
A: 直接使用 i18n 实例：
```typescript
import i18n from '../i18n';

const message = i18n.t('common.error');
```

### Q: 如何处理嵌套的翻译内容？
A: 使用对象形式：
```json
{
  "errors": {
    "network": {
      "timeout": "网络超时",
      "offline": "网络已断开"
    }
  }
}
```

使用：`t('errors.network.timeout')` 