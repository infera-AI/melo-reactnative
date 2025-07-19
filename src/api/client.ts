/**
 * HTTP客户端封装
 */
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CURRENT_API_CONFIG, HEADERS, STORAGE_KEYS } from './config';
import { ApiResponse, ApiError, RequestConfig } from './types';
import { networkMonitor } from '../utils/networkMonitor';
import { Logger } from '../utils/logger';
import tokenStorage from '../utils/tokenStorage';

// 全局类型声明
declare global {
  var loginRedirectHandler: (() => void) | undefined;
}

// 扩展axios配置类型
declare module 'axios' {
  interface InternalAxiosRequestConfig {
    metadata?: {
      requestId: string;
      startTime: number;
    };
  }
}

class HttpClient {
  private instance: AxiosInstance;

  constructor() {
    this.instance = axios.create({
      baseURL: CURRENT_API_CONFIG.BASE_URL + '/api',
      timeout: CURRENT_API_CONFIG.TIMEOUT,
      headers: HEADERS,
    });

    this.setupInterceptors();
  }

  /**
   * 智能添加token到请求头
   * 优先级：ACTION_TOKEN > ACCESS_TOKEN
   */
  private async addTokenToRequest(config: any) {
    try {
      console.log('🔑 addTokenToRequest called for URL:', config.url);
      
      // 调试：检查所有token状态
      await tokenStorage.debugAllTokens();
      
      // 获取action_token
      const token = await tokenStorage.getActionToken();
      console.log('🔑 Retrieved action_token:', token ? 'EXISTS' : 'NULL');
      
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('🔑 Authorization header set:', `Bearer ${token.substring(0, 10)}...`);
        Logger.info(`Using action_token for request: ${config.url}`);
      } else {
        console.log('🔑 No action_token available for request:', config.url);
        Logger.warn(`No action_token available for request: ${config.url}`);
      }
    } catch (error) {
      console.error('🔑 Error adding token to request:', error);
      Logger.error('Error adding token to request:', error);
    }
  }

  /**
   * 设置请求和响应拦截器
   */
  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      async (config) => {
        console.log('🔑 Request interceptor called for:', config.url);
        console.log('🔑 Request method:', config.method);
        console.log('🔑 Request headers before token:', config.headers);
        
        // 生成请求ID
        const requestId = networkMonitor.generateRequestId();
        config.metadata = { requestId, startTime: Date.now() };

        // 智能添加token到请求头
        await this.addTokenToRequest(config);
        
        console.log('🔑 Request headers after token:', config.headers);

        // 构建完整的请求URL
        const fullUrl = config.baseURL ? `${config.baseURL}${config.url}` : config.url;
        
        // 记录请求
        networkMonitor.logRequest(
          requestId,
          config.method || 'GET',
          fullUrl || '',
          config.headers,
          config.data
        );

        return config;
      },
      (error) => {
        console.error('🔑 Request interceptor error:', error);
        Logger.error('Request Error:', error);
        return Promise.reject(error);
      }
    );

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<ApiResponse>) => {
        const { requestId, startTime } = response.config.metadata || {};
        const duration = startTime ? Date.now() - startTime : undefined;

        // 记录响应
        if (requestId) {
          networkMonitor.logResponse(
            requestId,
            response.status,
            response.headers as Record<string, string>,
            response.data,
            duration
          );
        }

        // 检查业务状态码
        if (response.data && (response.data.code === 1003 || response.data.code === 403)) {
          console.log(`🔒 Token expired (code: ${response.data.code}), handling logout...`);
          this.handleTokenExpired();
        }

        return response;
      },
      async (error) => {
        const { requestId } = error.config?.metadata || {};

        // 记录错误
        if (requestId) {
          networkMonitor.logError(requestId, error.message, {
            code: error.code,
            response: error.response?.data,
            status: error.response?.status,
            statusText: error.response?.statusText,
            config: {
              url: error.config?.url,
              method: error.config?.method,
              baseURL: error.config?.baseURL,
            }
          });
        }

        // 处理401未授权错误
        if (error.response?.status === '401') {
          await this.handleUnauthorized();
        }

        // 处理业务状态码错误
        if (error.response?.data?.code === '1003' || error.response?.data?.code === '403') {
          console.log(`🔒 Token expired (code: ${error.response?.data?.code}), handling logout...`);
          await this.handleTokenExpired();
        }


        // 处理网络错误
        if (!error.response) {
          const apiError: ApiError = {
            code: -1,
            message: '网络连接失败，请检查网络设置',
            details: error.message,
          };
          return Promise.reject(apiError);
        }

        // 返回格式化的错误
        const apiError: ApiError = {
          code: error.response.status,
          message: error.response.data?.message || '请求失败',
          details: error.response.data,
        };

        return Promise.reject(apiError);
      }
    );
  }

  /**
   * 处理未授权错误
   */
  private async handleUnauthorized() {
    try {
      // 清除action_token
      await tokenStorage.removeToken('ACTION_TOKEN');
      
      // 清除其他存储的认证信息
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_INFO);

      // 可以在这里触发跳转到登录页面的逻辑
      console.log('🔒 Action token expired, redirecting to login...');
    } catch (error) {
      console.error('Error clearing storage:', error);
    }
  }

  /**
   * 处理token过期错误 (code: 1003)
   */
  private async handleTokenExpired() {
    try {
      console.log('🔒 Token expired, clearing all authentication data...');
      
      // 清除action_token
      await tokenStorage.removeToken('ACTION_TOKEN');
      
      // 清除其他存储的认证信息
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_INFO);
      
      // 触发全局登录跳转事件
      this.triggerLoginRedirect();
      
      console.log('🔒 Authentication cleared, login redirect triggered');
    } catch (error) {
      console.error('Error handling token expiration:', error);
    }
  }

  /**
   * 触发登录跳转事件
   */
  private triggerLoginRedirect() {
    // 使用全局事件系统触发登录跳转
    if (global.loginRedirectHandler) {
      global.loginRedirectHandler();
    } else {
      console.warn('🔒 No login redirect handler found, please set global.loginRedirectHandler');
    }
  }

  /**
   * GET请求
   */
  async get<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.get(url, config);
    return response.data;
  }

  /**
   * POST请求
   */
  async post<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.post(url, data, config);
    return response.data;
  }

  /**
   * PUT请求
   */
  async put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.put(url, data, config);
    return response.data;
  }

  /**
   * DELETE请求
   */
  async delete<T = any>(url: string, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.delete(url, config);
    return response.data;
  }

  /**
   * PATCH请求
   */
  async patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.patch(url, data, config);
    return response.data;
  }

  /**
   * 文件上传
   */
  async upload<T = any>(url: string, formData: FormData, config?: RequestConfig): Promise<ApiResponse<T>> {
    console.log('🔑 upload method called for URL:', url);
    
    const uploadConfig = {
      ...config,
      headers: {
        ...config?.headers,
        'Content-Type': 'multipart/form-data',
      },
    };

    console.log('🔑 uploadConfig headers before request:', uploadConfig.headers);
    
    const response = await this.instance.post(url, formData, uploadConfig);
    return response.data;
  }

  /**
   * 设置action token
   */
  async setActionToken(token: string) {
    await tokenStorage.saveActionToken(token);
  }

  /**
   * 清除action token
   */
  async clearToken() {
    await tokenStorage.removeToken('ACTION_TOKEN');
  }
}

// 导出单例实例
export const httpClient = new HttpClient();
export default httpClient; 