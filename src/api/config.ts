/**
 * API配置文件
 */

// 开发环境和生产环境的API地址
export const API_CONFIG = {
  // 开发环境 - 使用自定义服务器
  DEV: {
    // ✅ 确认：服务器支持HTTP协议，80端口正常
    BASE_URL: 'http://218.244.147.232:80',
    
    // 备选配置（已测试不支持）：
    // BASE_URL: 'https://123.56.246.44:443', // HTTPS连接超时
    // BASE_URL: 'https://123.56.246.44',     // HTTPS连接超时
    
    TIMEOUT: 10000,
  },
  // 生产环境
  PROD: {
    BASE_URL: 'http://218.244.147.232:80',
    TIMEOUT: 15000,
  },
  // 测试环境
  TEST: {
    BASE_URL: 'http://218.244.147.232:80',
    TIMEOUT: 10000,
  },
};

// 当前环境配置
export const CURRENT_API_CONFIG = __DEV__ ? API_CONFIG.DEV : API_CONFIG.PROD;

// API端点路径
export const API_ENDPOINTS = {
  // 认证相关
  AUTH: {
    SEND_VERIFICATION_CODE: '/auth/send_verification_code',
    VERIFY_CODE: '/auth/verify_verification_code',
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    REFRESH_TOKEN: '/auth/refresh_token',
    SET_PASSWORD: '/accounts/set_password',
    MODIFY_PASSWORD: '/accounts/modify_password',
    FORGOT_PASSWORD_RESET: '/accounts/forgot_password_reset',
  },
  // 用户相关
  USER: {
    LOGIN: '/a', // JSONPlaceholder没有真实登录，我们用获取用户列表模拟
    REGISTER: '/users',
    LOGOUT: '/users',
    PROFILE: '/users',
    UPDATE_PROFILE: '/users',
  },
  // 文章相关
  POSTS: {
    LIST: '/posts',
    DETAIL: '/posts',
    CREATE: '/posts',
    UPDATE: '/posts',
    DELETE: '/posts',
  },
  // 评论相关
  COMMENTS: {
    LIST: '/comments',
    CREATE: '/comments',
  },
  // 相册相关
  ALBUMS: {
    LIST: '/albums',
    PHOTOS: '/photos',
  },
};

// 请求头配置
export const HEADERS = {
  'Content-Type': 'application/json',
  'Accept': 'application/json',
};

// 存储键名
export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  ACTION_TOKEN: 'action_token',
  USER_INFO: 'user_info',
};

// 认证相关常量
export const AUTH_CONSTANTS = {
  /**
   * 默认临时密码 - 用于注册流程中的临时登录
   */
  DEFAULT_TEMP_PASSWORD: 'melon_password',
}; 