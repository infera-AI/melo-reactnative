import { PermissionsAndroid, Platform, Alert } from 'react-native';

export interface PermissionResult {
  granted: boolean;
  message?: string;
}

/**
 * 请求相机权限
 */
export const requestCameraPermission = async (): Promise<PermissionResult> => {
  if (Platform.OS !== 'android') {
    return { granted: true };
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.CAMERA,
      {
        title: '相机权限',
        message: '应用需要访问相机来拍摄照片进行图像翻译',
        buttonNeutral: '稍后询问',
        buttonNegative: '取消',
        buttonPositive: '确定',
      }
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return { granted: true };
    } else {
      return { 
        granted: false, 
        message: '需要相机权限才能使用拍照功能' 
      };
    }
  } catch (err) {
    console.error('请求相机权限失败:', err);
    return { 
      granted: false, 
      message: '请求相机权限时发生错误' 
    };
  }
};

/**
 * 请求存储权限
 */
export const requestStoragePermission = async (): Promise<PermissionResult> => {
  if (Platform.OS !== 'android') {
    return { granted: true };
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      {
        title: '存储权限',
        message: '应用需要访问存储来选择和保存图片',
        buttonNeutral: '稍后询问',
        buttonNegative: '取消',
        buttonPositive: '确定',
      }
    );

    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      return { granted: true };
    } else {
      return { 
        granted: false, 
        message: '需要存储权限才能访问相册' 
      };
    }
  } catch (err) {
    console.error('请求存储权限失败:', err);
    return { 
      granted: false, 
      message: '请求存储权限时发生错误' 
    };
  }
};

/**
 * 检查并请求相机权限
 */
export const checkAndRequestCameraPermission = async (): Promise<boolean> => {
  const result = await requestCameraPermission();
  
  if (!result.granted) {
    Alert.alert(
      '权限被拒绝',
      result.message || '需要相机权限才能使用拍照功能',
      [
        { text: '取消', style: 'cancel' },
        { text: '去设置', onPress: () => {
          // 这里可以引导用户去设置页面
          console.log('引导用户去设置页面');
        }}
      ]
    );
  }
  
  return result.granted;
};

/**
 * 检查并请求存储权限
 */
export const checkAndRequestStoragePermission = async (): Promise<boolean> => {
  const result = await requestStoragePermission();
  
  if (!result.granted) {
    Alert.alert(
      '权限被拒绝',
      result.message || '需要存储权限才能访问相册',
      [
        { text: '取消', style: 'cancel' },
        { text: '去设置', onPress: () => {
          // 这里可以引导用户去设置页面
          console.log('引导用户去设置页面');
        }}
      ]
    );
  }
  
  return result.granted;
}; 