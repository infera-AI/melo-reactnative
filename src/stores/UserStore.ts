import { makeAutoObservable } from 'mobx';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService, NewLoginRequest } from '../api/services/authService';
import tokenStorage from '../utils/tokenStorage';

interface User {
  id: string;
  name: string;
  email: string;
}

const USER_STORAGE_KEY = '@lingo_user_info';
const ONBOARDING_COMPLETED_KEY = '@lingo_onboarding_completed';

class UserStore {
  user: User | null = null;
  isLoading = false;
  errorMessage: string | null = null;
  onboardingCompleted = false;

  constructor() {
    makeAutoObservable(this);
    // 应用启动时尝试恢复登录状态
    this.restoreLoginState();
  }

  setUser(user: User) {
    this.user = user;
  }

  setLoading(loading: boolean) {
    this.isLoading = loading;
  }

  setError(message: string | null) {
    this.errorMessage = message;
  }

  clearUser() {
    this.user = null;
  }

  get isLoggedIn() {
    return this.user !== null;
  }

  // 保存用户信息到本地存储
  async saveUserToStorage(user: User, token?: string) {
    try {
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      if (token) {
        await tokenStorage.saveActionToken(token);
        console.log('🔑 保存新Token到本地存储:', token);
      }
      console.log('用户信息已保存到本地存储');
    } catch (error) {
      console.error('保存用户信息失败:', error);
    }
  }

  // 从本地存储恢复用户信息
  async restoreLoginState() {
    try {
      const userJson = await AsyncStorage.getItem(USER_STORAGE_KEY);
      const token = await tokenStorage.getActionToken();
      
      console.log('🔑 尝试恢复登录状态...');
      console.log('🔑 存储的Token:', token);
      
      if (userJson && token) {
        const user: User = JSON.parse(userJson);
        this.setUser(user);
        console.log('已恢复登录状态:', user);
        console.log('🔑 使用Token:', token);
        return true;
      } else {
        console.log('🔑 未找到有效的Token或用户信息');
      }
      return false;
    } catch (error) {
      console.error('恢复登录状态失败:', error);
      return false;
    }
  }

  // 清除本地存储的用户信息
  async clearUserFromStorage() {
    try {
      const oldToken = await tokenStorage.getActionToken();
      if (oldToken) {
        console.log('🔑 清除旧Token:', oldToken);
      }
      
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      await tokenStorage.removeToken('ACTION_TOKEN');
      console.log('已清除本地存储的用户信息');
    } catch (error) {
      console.error('清除用户信息失败:', error);
    }
  }

  // 获取存储的token
  async getStoredToken(): Promise<string | null> {
    try {
      const token = await tokenStorage.getActionToken();
      console.log('🔑 获取存储的Token:', token);
      return token;
    } catch (error) {
      console.error('获取token失败:', error);
      return null;
    }
  }

  // 使用新版登录接口
  async login(email: string, password: string) {
    this.setLoading(true);
    this.setError(null);
    
    try {
      // 使用统一的设备信息工具函数
      const { getDeviceInfo } = await import('../utils/deviceInfo');
      const deviceInfo = getDeviceInfo();
      
      // 构造登录请求参数
      const loginRequest: NewLoginRequest = {
        auth_type: email.includes('@') ? 'email' : 'phone',
        identifier: email,
        password: password,
        device_info: deviceInfo,
      };

      console.log('🔑 发起登录请求...');
      
      // 调用新版登录接口（authService会自动保存token）
      const response = await authService.loginWithDevice(loginRequest);
      
      if (response.code === 200 && response.data) {
        console.log('🔑 登录成功，Token已由authService保存');
        
        // 构造用户信息
        const user: User = {
          id: response.data.token, // 使用 token 作为临时 id
          name: email.split('@')[0], // 从邮箱提取用户名
          email: email,
        };
        
        this.setUser(user);
        // 只保存用户信息，token已由authService保存
        await this.saveUserToStorage(user);
        console.log('登录成功:', response.data);
      } else {
        throw new Error(response.message || '登录失败');
      }
    } catch (error: any) {
      console.error('登录失败:', error);
      const errorMessage = error.message || error.data?.message || '登录失败，请重试';
      this.setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      this.setLoading(false);
    }
  }

  // 标记引导完成
  async markOnboardingCompleted() {
    try {
      this.onboardingCompleted = true;
      await AsyncStorage.setItem(ONBOARDING_COMPLETED_KEY, 'true');
      console.log('引导流程已完成并保存');
    } catch (error) {
      console.error('保存引导完成状态失败:', error);
    }
  }

  // 检查引导是否已完成
  async checkOnboardingCompleted(): Promise<boolean> {
    try {
      const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETED_KEY);
      this.onboardingCompleted = completed === 'true';
      return this.onboardingCompleted;
    } catch (error) {
      console.error('检查引导完成状态失败:', error);
      return false;
    }
  }

  // 清除引导完成状态（用于测试或重置）
  async clearOnboardingStatus() {
    try {
      this.onboardingCompleted = false;
      await AsyncStorage.removeItem(ONBOARDING_COMPLETED_KEY);
      console.log('引导完成状态已清除');
    } catch (error) {
      console.error('清除引导完成状态失败:', error);
    }
  }

  // 登出
  async logout() {
    const oldToken = await this.getStoredToken();
    if (oldToken) {
      console.log('🔑 登出清除Token:', oldToken);
    }
    
    this.clearUser();
    this.setError(null);
    // 清除本地存储的用户信息
    await this.clearUserFromStorage();
    console.log('用户已登出');
  }
}

export default UserStore; 