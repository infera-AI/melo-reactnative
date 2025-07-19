/**
 * 设备信息获取工具 - 获取React Native应用的设备和环境信息
 */
import { Platform, Dimensions } from 'react-native';
import { DeviceInfo } from '../api/services/authService';

/**
 * 生成简单的设备指纹
 * 基于设备基本信息生成一个哈希值
 */
function generateDeviceFingerprint(): string {
  const { width, height } = Dimensions.get('screen');
  const baseInfo = `${Platform.OS}-${Platform.Version}-${width}x${height}`;
  
  // 简单的字符串哈希函数
  let hash = 0;
  for (let i = 0; i < baseInfo.length; i++) {
    const char = baseInfo.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // 转换为32位整数
  }
  
  return Math.abs(hash).toString(16);
}

/**
 * 检测网络类型
 * 注意：React Native需要额外的库来获取网络信息
 */
function getNetworkType(): string {
  // 这里返回默认值，实际项目中可以使用 @react-native-async-storage/async-storage
  // 或者 @react-native-community/netinfo 来获取真实的网络信息
  return 'unknown';
}

/**
 * 检测IP类型
 */
function getIpType(): string {
  // 在客户端很难准确判断IP类型，返回默认值
  return 'unknown';
}

/**
 * 获取设备型号
 */
function getDeviceModel(): string {
  // React Native没有直接获取设备型号的API
  // 实际项目中可以使用 react-native-device-info 库
  return Platform.OS === 'ios' ? 'iPhone' : 'Android Device';
}

/**
 * 获取应用版本
 */
function getAppVersion(): string {
  // 实际项目中可以从package.json或者使用react-native-device-info获取
  return '1.0.0';
}

/**
 * 获取完整的设备信息
 * @returns DeviceInfo对象
 */
export function getDeviceInfo(): DeviceInfo {
  const { width, height } = Dimensions.get('screen');
  
  return {
    app_version: getAppVersion(),
    device_model: getDeviceModel(),
    fingerprint: generateDeviceFingerprint(),
    ip_type: getIpType(),
    locale: 'zh', // 可以通过I18nManager.isRTL等获取
    network_type: getNetworkType(),
    os_type: Platform.OS,
    os_version: Platform.Version.toString(),
    screen_resolution: `${width}x${height}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Shanghai',
  };
}

/**
 * 获取设备信息的异步版本（为了兼容可能需要异步获取的信息）
 */
export async function getDeviceInfoAsync(): Promise<DeviceInfo> {
  // 如果将来需要异步获取某些设备信息，可以在这里处理
  return getDeviceInfo();
}

export default {
  getDeviceInfo,
  getDeviceInfoAsync,
}; 