/**
 * 基础权限授予页面 - 页面 3.1
 * 向用户解释应用所需的基本权限及其用途，并引导用户授予这些权限
 */
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Alert,
  Platform,
  PermissionsAndroid,
  Linking,
  AppState,
} from 'react-native';

// 权限类型定义
type PermissionType = 'microphone' | 'notification' | 'storage';
type PermissionStatus = 'not_requested' | 'granted' | 'denied';

interface PermissionItem {
  type: PermissionType;
  title: string;
  description: string;
  icon: string;
  status: PermissionStatus;
  androidPermission?: any;
}

interface BasicPermissionScreenProps {
  onNext: () => void;
  onSkip: () => void;
}

const BasicPermissionScreen: React.FC<BasicPermissionScreenProps> = ({
  onNext,
  onSkip,
}) => {
  const [permissions, setPermissions] = useState<PermissionItem[]>([
    {
      type: 'microphone',
      title: '麦克风权限',
      description: '用于语音翻译和声纹识别',
      icon: '🎤',
      status: 'not_requested',
      androidPermission: PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
    },
    {
      type: 'notification',
      title: '通知权限',
      description: '及时通知翻译结果和重要消息',
      icon: '🔔',
      status: 'not_requested',
      androidPermission: PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
    },
    {
      type: 'storage',
      title: '存储权限',
      description: '保存翻译历史和个人设置',
      icon: '📁',
      status: 'not_requested',
      androidPermission: PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    },
  ]);

  // 检查所有权限状态
  useEffect(() => {
    const checkAllPermissions = async () => {
      if (Platform.OS !== 'android') return;
      
      const updatedPermissions = await Promise.all(
        permissions.map(async (permission) => {
          let status: PermissionStatus = 'not_requested';
          
          try {
            if (permission.androidPermission) {
              // 通知权限特殊处理
              if (permission.type === 'notification' && Number(Platform.Version) < 33) {
                status = 'granted';
              } else {
                const hasPermission = await PermissionsAndroid.check(permission.androidPermission);
                status = hasPermission ? 'granted' : 'not_requested';
              }
            }
          } catch (error) {
            console.error(`检查${permission.type}权限失败:`, error);
          }
          
          return { ...permission, status };
        })
      );
      
      setPermissions(updatedPermissions);
    };

    checkAllPermissions();
    
    // 监听应用状态变化
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        checkAllPermissions();
      }
    });
    
    return () => subscription?.remove();
  }, [permissions]);

  // 请求权限
  const requestPermission = async (permission: PermissionItem) => {
    if (Platform.OS !== 'android' || !permission.androidPermission) {
      // iOS 或无权限定义时跳转设置
      openSettings();
      return;
    }

         try {
       // 通知权限特殊处理
       if (permission.type === 'notification' && Number(Platform.Version) < 33) {
         updatePermissionStatus(permission.type, 'granted');
         return;
       }

      const granted = await PermissionsAndroid.request(permission.androidPermission, {
        title: permission.title,
        message: `Lingo需要${permission.title}来${permission.description}`,
        buttonPositive: '允许',
        buttonNegative: '拒绝',
      });

      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        updatePermissionStatus(permission.type, 'granted');
      } else {
        updatePermissionStatus(permission.type, 'denied');
        
        // 权限被拒绝时显示简单提示
        if (granted === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) {
          showSettingsAlert(permission.title);
        }
      }
    } catch (error) {
      console.error('请求权限失败:', error);
      Alert.alert('错误', '权限请求失败，请重试');
    }
  };

  // 显示跳转设置的提示
  const showSettingsAlert = (permissionName: string) => {
    Alert.alert(
      '权限被拒绝',
      `${permissionName}被永久拒绝，请到设置中手动开启`,
      [
        { text: '取消', style: 'cancel' },
        { text: '去设置', onPress: openSettings },
      ]
    );
  };

  // 打开应用设置
  const openSettings = async () => {
    try {
      if (Platform.OS === 'android') {
        const packageName = 'com.lingoearphone.reactnative';
        const url = `android.settings.APPLICATION_DETAILS_SETTINGS?package=${packageName}`;
        const canOpen = await Linking.canOpenURL(url);
        
        if (canOpen) {
          await Linking.openURL(url);
        } else {
          await Linking.openSettings();
        }
      } else {
        await Linking.openSettings();
      }
    } catch (error) {
      console.error('打开设置失败:', error);
      Alert.alert('错误', '无法打开设置页面');
    }
  };

  // 更新权限状态
  const updatePermissionStatus = (type: PermissionType, status: PermissionStatus) => {
    setPermissions(prev =>
      prev.map(permission =>
        permission.type === type ? { ...permission, status } : permission
      )
    );
  };

  // 检查是否有权限被授予
  const hasAnyPermission = () => {
    return permissions.some(permission => permission.status === 'granted');
  };

  // 渲染权限项
  const renderPermissionItem = (permission: PermissionItem) => {
    const isGranted = permission.status === 'granted';

    return (
      <View key={permission.type} style={styles.permissionItem}>
        <View style={styles.permissionIcon}>
          <Text style={styles.iconText}>{permission.icon}</Text>
        </View>

        <View style={styles.permissionContent}>
          <Text style={styles.permissionTitle}>{permission.title}</Text>
          <Text style={styles.permissionDescription}>{permission.description}</Text>
        </View>

        <TouchableOpacity
          style={[
            styles.permissionButton,
            isGranted ? styles.permissionButtonGranted : styles.permissionButtonDefault
          ]}
          onPress={() => requestPermission(permission)}
          disabled={isGranted}
        >
          {isGranted ? (
            <View style={styles.grantedContent}>
              <Text style={styles.checkIcon}>✓</Text>
              <Text style={styles.grantedText}>已授权</Text>
            </View>
          ) : (
            <Text style={styles.buttonText}>去开启</Text>
          )}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* 顶部导航栏 */}
      <View style={styles.header}>
        <Text style={styles.title}>开启顺畅体验</Text>
        <Text style={styles.stepIndicator}>步骤 1/3</Text>
      </View>

      {/* 主要内容区域 */}
      <View style={styles.content}>
        <Text style={styles.subtitle}>
          为了给您提供完整的Lingo AI翻译服务，我们需要获取以下权限：
        </Text>

        <View style={styles.permissionList}>
          {permissions.map(renderPermissionItem)}
        </View>
      </View>

      {/* 底部按钮区域 */}
      <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={[
            styles.nextButton,
            hasAnyPermission() ? styles.nextButtonActive : styles.nextButtonDisabled
          ]}
          onPress={onNext}
          disabled={!hasAnyPermission()}
        >
          <Text style={[
            styles.nextButtonText,
            hasAnyPermission() ? styles.nextButtonTextActive : styles.nextButtonTextDisabled
          ]}>
            下一步
          </Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.skipButton} onPress={onSkip}>
          <Text style={styles.skipButtonText}>
            暂不开启，稍后在设置中开启
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  stepIndicator: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  subtitle: {
    fontSize: 16,
    color: '#374151',
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionList: {
    gap: 20,
  },
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  permissionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  iconText: {
    fontSize: 24,
  },
  permissionContent: {
    flex: 1,
  },
  permissionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  permissionDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  permissionButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  permissionButtonDefault: {
    backgroundColor: '#3b82f6',
  },
  permissionButtonGranted: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#d1d5db',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#ffffff',
  },
  grantedContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  checkIcon: {
    fontSize: 14,
    color: '#10b981',
    fontWeight: '600',
  },
  grantedText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
  bottomContainer: {
    padding: 20,
    gap: 16,
  },
  nextButton: {
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nextButtonActive: {
    backgroundColor: '#3b82f6',
  },
  nextButtonDisabled: {
    backgroundColor: '#f3f4f6',
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  nextButtonTextActive: {
    color: '#ffffff',
  },
  nextButtonTextDisabled: {
    color: '#9ca3af',
  },
  skipButton: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  skipButtonText: {
    fontSize: 14,
    color: '#3b82f6',
    textDecorationLine: 'underline',
  },
});

export default BasicPermissionScreen; 