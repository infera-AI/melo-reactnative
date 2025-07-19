/**
 * API模块统一导出
 */

// 导出HTTP客户端
export { default as httpClient } from './client';

// 导出配置
export * from './config';

// 导出类型
export * from './types';

// 导出服务
export { default as authService } from './services/authService';
export { default as userService } from './services/userService';
export { default as postService } from './services/postService';

// 统一的服务对象
export const apiServices = {
  auth: require('./services/authService').default,
  user: require('./services/userService').default,
  post: require('./services/postService').default,
}; 