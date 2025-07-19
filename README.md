# React Native 项目指南

## 项目概述

这是一个完整的 React Native 项目，集成了以下技术栈：

- **React Native 0.80.1** - 跨平台移动应用开发框架
- **React Navigation v6** - 完整的路由和导航系统
- **MobX** - 状态管理库
- **NativeWind v4** - 基于 Tailwind CSS 的样式系统

## 项目结构

```
lingo-earphone-reactnative/
├── src/
│   ├── screens/           # 屏幕组件
│   │   ├── HomeScreen.tsx
│   │   ├── LoginScreen.tsx
│   │   ├── ProfileScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── stores/            # MobX 状态管理
│   │   ├── UserStore.ts
│   │   ├── RootStore.ts
│   │   └── StoreContext.tsx
│   ├── navigation/        # 导航配置
│   │   └── AppNavigator.tsx
│   └── components/        # 可复用组件
├── global.css            # NativeWind 全局样式
├── tailwind.config.js    # Tailwind 配置
└── App.tsx               # 应用入口
```

## 功能特性

### 1. 完整的路由系统
- **Stack Navigator**: 页面间跳转
- **Bottom Tab Navigator**: 底部标签导航
- **条件路由**: 根据登录状态显示不同页面

### 2. MobX 状态管理
- **UserStore**: 用户状态管理
- **Context Provider**: 全局状态访问
- **观察者模式**: 自动更新UI

### 3. NativeWind v4 样式系统
- **Tailwind CSS 类名**: 直接在组件中使用
- **响应式设计**: 支持不同屏幕尺寸
- **美观的UI**: 现代化的设计风格

### 4. 完整的页面功能
- **登录页面**: 用户认证界面
- **首页**: 展示用户信息和数据概览
- **个人资料页**: 用户信息管理
- **设置页**: 应用配置选项

## 如何运行项目

### 前提条件

确保你已经安装了：
- Node.js (建议 v16+)
- React Native 开发环境
- Android Studio (Android 开发)
- Xcode (iOS 开发，仅 macOS)

### 运行步骤

1. **安装依赖**
   ```bash
   npm install
   ```

2. **启动 Metro 服务器**
   ```bash
   npx react-native start
   ```

3. **运行 Android 应用**
   ```bash
   npx react-native run-android
   ```

4. **运行 iOS 应用** (仅 macOS)
   ```bash
   npx react-native run-ios
   ```

## 测试账号

使用以下测试账号进行登录：
- **邮箱**: test@example.com
- **密码**: 123456

## 主要配置文件

### babel.config.js
```javascript
module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: ["nativewind/babel"],
};
```

### tailwind.config.js
```javascript
module.exports = {
  content: ["./App.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

### metro.config.js
```javascript
const { getDefaultConfig } = require('@react-native/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);
module.exports = withNativeWind(config, { input: './global.css' });
```

## 开发说明

### 添加新页面
1. 在 `src/screens/` 目录下创建新的屏幕组件
2. 在 `src/navigation/AppNavigator.tsx` 中添加路由配置
3. 使用 `observer` 包装组件以支持 MobX

### 使用状态管理
```typescript
import { useStores } from '../stores/StoreContext';
import { observer } from 'mobx-react-lite';

const MyComponent = observer(() => {
  const { userStore } = useStores();
  
  return (
    // 组件内容
  );
});
```

### 使用 NativeWind 样式
```typescript
<View className="flex-1 bg-gray-50 justify-center px-6">
  <Text className="text-2xl font-bold text-gray-800">
    Hello World
  </Text>
</View>
```

## 疑难解答

### 清理缓存
如果遇到样式或导航问题，尝试清理缓存：
```bash
npx react-native start --reset-cache
```

### 重新安装依赖
```bash
rm -rf node_modules
npm install
```

### Android 构建问题
```bash
cd android
./gradlew clean
cd ..
npx react-native run-android
```

## 技术支持

如果你在使用过程中遇到问题，请检查：
1. Node.js 和 npm 版本是否正确
2. React Native 开发环境是否配置完整
3. 依赖包是否正确安装
4. 模拟器或设备是否正常连接

---

**项目创建完成！** 🎉

现在你可以开始开发你的 React Native 应用了。项目已经配置好了完整的路由、状态管理和样式系统，你可以在此基础上添加更多功能。 