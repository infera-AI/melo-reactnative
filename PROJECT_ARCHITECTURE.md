# Lingo Earphone React Native 项目架构文档

## 项目概述

本项目是一个基于 React Native 开发的智能耳机配套应用，采用现代化的模块化架构设计，支持多语言国际化和跨平台部署。

## 🏗️ 整体架构

```
lingo-earphone-reactnative/
├── 📱 平台配置
│   ├── android/          # Android 平台配置
│   └── ios/              # iOS 平台配置
├── 🔧 构建配置
│   ├── babel.config.js   # Babel 转译配置
│   ├── metro.config.js   # Metro 打包配置
│   └── jest.config.js    # 单元测试配置
├── 📦 依赖管理
│   ├── package.json      # NPM 依赖和脚本
│   └── Gemfile          # Ruby 依赖 (Fastlane)
└── 💻 源代码
    └── src/             # 主要源代码目录
```

## 📁 核心目录结构

### `/src` - 源代码主目录

```
src/
├── 🔌 api/              # API 层 - 网络请求与数据交互
├── 🧩 components/       # 组件层 - UI 组件库
├── 🪝 hooks/            # 自定义 React Hooks
├── 🌍 i18n/             # 国际化配置
├── 🧭 navigation/       # 路由导航配置
├── 📱 screens/          # 页面级组件
├── 🗃️ stores/           # 状态管理 (MobX)
└── 🛠️ utils/            # 工具函数库
```

## 🔌 API 层架构 (`/src/api`)

### 设计理念
- **分层设计**: 配置层 → 客户端层 → 服务层
- **统一管理**: 集中处理请求拦截、错误处理、Token管理
- **类型安全**: 完整的 TypeScript 类型定义

### 目录结构
```
api/
├── config.ts           # API 基础配置 (BASE_URL, 超时设置)
├── client.ts           # HTTP 客户端 (Axios 封装)
├── types.ts            # 通用 API 类型定义
├── index.ts            # API 层统一导出
├── services/           # 具体业务服务
│   ├── authService.ts  # 认证服务 (登录/注册/验证)
│   ├── userService.ts  # 用户服务 (个人信息管理)
│   ├── postService.ts  # 内容服务 (示例)
│   └── index.ts        # 服务层统一导出
└── README.md          # API 使用文档
```

### 核心特性
- **自动 Token 管理**: 自动添加认证头，处理过期刷新
- **统一错误处理**: 网络错误、业务错误统一处理
- **请求/响应拦截**: 统一日志记录和数据转换
- **类型安全**: 完整的请求和响应类型定义

## 🧩 组件层架构 (`/src/components`)

### 设计理念
- **分类组织**: 按功能域分组，提高代码可维护性
- **高度复用**: 单一职责原则，组件可在多处使用
- **统一导出**: 每个分类提供 index.ts 统一导出

### 目录结构
```
components/
├── auth/               # 认证相关组件
│   ├── LoginScreen.tsx
│   ├── RegisterScreen.tsx
│   ├── SetPasswordScreen.tsx
│   ├── VerificationCodeScreen.tsx
│   └── index.ts
├── onboarding/         # 欢迎引导组件
│   ├── SplashScreen.tsx
│   ├── WelcomeScreen.tsx
│   ├── FeatureCarousel.tsx
│   └── index.ts
├── bluetooth/          # 蓝牙功能组件
│   ├── BluetoothPairingScreen.tsx
│   ├── BluetoothHelpModal.tsx
│   └── index.ts
├── settings/           # 设置选择器组件
│   ├── LanguageSelector.tsx
│   ├── RegionSelector.tsx
│   └── index.ts
├── modals/             # 弹窗组件
│   ├── AgreementModal.tsx
│   └── index.ts
├── debug/              # 调试工具组件
│   ├── DebugPanel.tsx
│   ├── FloatingDebugButton.tsx
│   └── index.ts
└── common/             # 通用组件
    ├── LoadingScreen.tsx
    └── index.ts
```

### 组件分类说明

| 分类 | 职责 | 示例组件 |
|------|------|---------|
| **auth** | 用户认证流程 | 登录、注册、密码设置 |
| **onboarding** | 用户引导体验 | 启动页、欢迎页、功能介绍 |
| **bluetooth** | 蓝牙设备管理 | 配对流程、帮助指南 |
| **settings** | 应用设置界面 | 语言选择、地区选择 |
| **modals** | 弹窗交互 | 协议弹窗、确认对话框 |
| **debug** | 开发调试工具 | 调试面板、浮动按钮 |
| **common** | 通用 UI 组件 | 加载页、通用按钮 |

## 🌍 国际化架构 (`/src/i18n`)

### 设计理念
- **多语言支持**: 完整的中英文双语支持
- **类型安全**: TypeScript 类型检查防止翻译遗漏
- **动态切换**: 运行时语言切换，无需重启应用

### 目录结构
```
i18n/
├── index.ts            # 国际化初始化配置
├── types.ts            # 翻译键值类型定义
├── locales/            # 语言资源文件
│   ├── zh-CN.json      # 简体中文
│   └── en-US.json      # 英文
└── README.md          # 国际化使用指南
```

### 使用方式
```typescript
// 自定义 Hook
const { t, currentLanguage, changeLanguage } = useI18n();

// 在组件中使用
<Text>{t('welcome.title')}</Text>
```

## 🗃️ 状态管理架构 (`/src/stores`)

### 设计理念
- **MobX 响应式**: 简单直观的状态管理
- **模块化设计**: 按业务域拆分 Store
- **Context 注入**: React Context 提供全局访问

### 目录结构
```
stores/
├── RootStore.ts        # 根 Store，组合所有子 Store
├── StoreContext.tsx    # React Context 提供者
└── UserStore.ts        # 用户状态管理
```

### 使用方式
```typescript
// 在组件中使用
const { userStore } = useStores();
const { currentUser, login, logout } = userStore;
```

## 🧭 导航架构 (`/src/navigation`)

### 设计理念
- **React Navigation**: 标准的 React Native 导航解决方案
- **类型安全**: 完整的路由参数类型定义
- **集中配置**: 统一的导航结构定义

### 目录结构
```
navigation/
└── AppNavigator.tsx    # 主导航配置
```

## 📱 页面架构 (`/src/screens`)

### 设计理念
- **容器组件**: 页面级组件，组合业务逻辑
- **最小职责**: 主要负责布局和数据流转
- **复用组件**: 最大化复用 components 中的组件

### 目录结构
```
screens/
├── HomeScreen.tsx      # 首页
├── LoginScreen.tsx     # 登录页
├── ProfileScreen.tsx   # 个人中心
└── SettingsScreen.tsx  # 设置页
```

## 🛠️ 工具函数架构 (`/src/utils`)

### 设计理念
- **纯函数**: 无副作用，便于测试
- **单一职责**: 每个工具专注解决一个问题
- **高复用性**: 跨组件、跨页面复用

### 目录结构
```
utils/
├── logger.ts           # 日志工具
├── networkMonitor.ts   # 网络状态监控
└── deviceInfo.ts       # 设备信息获取
```

## 🔧 构建与配置

### 主要配置文件

| 文件 | 作用 |
|------|------|
| `babel.config.js` | Babel 转译配置，支持最新 JS 特性 |
| `metro.config.js` | Metro 打包配置，自定义打包规则 |
| `jest.config.js` | 单元测试配置 |
| `tsconfig.json` | TypeScript 编译配置 |

### 平台特定配置

#### Android (`/android`)
- **Gradle 构建**: 原生 Android 构建配置
- **资源文件**: 图标、启动页等资源
- **权限配置**: AndroidManifest.xml

#### iOS (`/ios`)
- **Xcode 项目**: 原生 iOS 项目配置
- **Info.plist**: 应用配置和权限
- **CocoaPods**: 原生依赖管理

## 🚀 核心特性

### 1. 模块化架构
- **清晰的分层**: API → Store → Component → Screen
- **高内聚低耦合**: 各模块独立，接口清晰
- **易于扩展**: 新功能可独立开发和测试

### 2. 类型安全
- **全面 TypeScript**: 所有代码使用 TypeScript
- **类型推导**: 充分利用 TypeScript 类型推导
- **编译时检查**: 在构建阶段发现潜在问题

### 3. 开发体验
- **热重载**: 开发时实时预览变更
- **调试工具**: 集成调试面板和日志系统
- **代码规范**: ESLint + Prettier 自动格式化

### 4. 性能优化
- **懒加载**: 按需加载组件和资源
- **状态优化**: MobX 精准响应式更新
- **包体积优化**: Metro 优化打包体积

## 📝 开发规范

### 代码组织原则
1. **单一职责**: 每个文件/组件只负责一个功能
2. **命名规范**: 使用语义化的文件和变量命名
3. **目录结构**: 按功能域组织，避免深层嵌套
4. **导出规范**: 统一使用 index.ts 文件导出

### 组件开发规范
1. **功能注释**: 每个组件文件顶部添加功能描述注释
2. **Props 类型**: 使用 TypeScript 接口定义组件属性
3. **状态管理**: 优先使用 Store，避免过度使用本地状态
4. **样式组织**: 组件内部样式，复用样式抽取到主题

## 🔄 数据流

```
用户操作 → Screen → Store → API → 后端服务
        ↓         ↑      ↑
      Component ← Store ← API 响应
```

1. **用户交互**: 用户在 Screen/Component 中进行操作
2. **状态更新**: 通过 Store 更新应用状态
3. **API 调用**: Store 调用 API 与后端交互
4. **响应处理**: API 响应更新 Store，触发 UI 重新渲染

## 📚 扩展指南

### 添加新功能模块
1. 在 `src/components` 创建新的功能目录
2. 在 `src/api/services` 添加对应的 API 服务
3. 在 `src/stores` 添加状态管理（如需要）
4. 更新导航配置添加新页面
5. 添加国际化翻译

### 添加新页面
1. 在 `src/screens` 创建页面组件
2. 在 `AppNavigator.tsx` 添加路由配置
3. 组合使用现有组件，避免重复开发

---

*本文档随项目发展持续更新，确保架构文档与实际代码保持同步。* 