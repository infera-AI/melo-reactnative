/**
 * 导航示例 - 展示如何使用 CombinedHomeScreen 并跳转到 SongConfigScreen
 * 这个文件展示了正确的导航集成方式
 */
import React, { useState } from 'react';
import { View } from 'react-native';
import CombinedHomeScreen from './CombinedHomeScreen';
import { SongConfigScreen } from '../music';

interface NavigationExampleProps {
  // 如果使用 React Navigation，可能会有 navigation prop
  // navigation?: any;
}

const NavigationExample: React.FC<NavigationExampleProps> = () => {
  const [currentScreen, setCurrentScreen] = useState<'combined' | 'songConfig'>('combined');

  // 处理跳转到歌曲配置页面
  const handleNavigateToSongConfig = () => {
    console.log('Navigating from CombinedHomeScreen to SongConfigScreen');
    setCurrentScreen('songConfig');
    
    // 如果使用 React Navigation:
    // navigation.navigate('SongConfigScreen');
  };

  // 处理从歌曲配置页面返回
  const handleBackFromSongConfig = () => {
    console.log('Navigating back from SongConfigScreen to CombinedHomeScreen');
    setCurrentScreen('combined');
    
    // 如果使用 React Navigation:
    // navigation.goBack();
  };

  // Tab 切换处理
  const handleTabSwitch = (tab: string) => {
    console.log('Tab switched to:', tab);
    // 处理 tab 切换逻辑
  };

  if (currentScreen === 'songConfig') {
    return (
      <SongConfigScreen 
        onBack={handleBackFromSongConfig}
      />
    );
  }

  return (
    <CombinedHomeScreen
      onNavigateToSongConfig={handleNavigateToSongConfig}
      onTabSwitch={handleTabSwitch}
      onNavigateToMusic={() => console.log('Navigate to Music')}
      onNavigateToTranslation={() => console.log('Navigate to Translation')}
      onNavigateToProfile={() => console.log('Navigate to Profile')}
    />
  );
};

export default NavigationExample;

/*
使用方法:

1. 基本使用 (状态管理):
```tsx
const [currentScreen, setCurrentScreen] = useState('combined');

<CombinedHomeScreen
  onNavigateToSongConfig={() => setCurrentScreen('songConfig')}
/>
```

2. 使用 React Navigation:
```tsx
<CombinedHomeScreen
  onNavigateToSongConfig={() => navigation.navigate('SongConfigScreen')}
/>
```

3. 使用 Stack Navigator 配置:
```tsx
// 在你的 Stack Navigator 中
<Stack.Screen name="CombinedHome" component={CombinedHomeScreen} />
<Stack.Screen name="SongConfigScreen" component={SongConfigScreen} />
```
*/ 