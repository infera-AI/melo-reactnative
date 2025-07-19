/**
 * API相关的类型定义
 */

// 基础响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data: T;
  success: boolean;
}

// 分页响应类型
export interface PaginationResponse<T> extends ApiResponse<T[]> {
  data: T[];
  pagination: {
    current: number;
    total: number;
    pageSize: number;
    totalPages: number;
  };
}

// 用户相关类型
export interface User {
  id: number; // JSONPlaceholder使用数字ID
  username: string;
  email: string;
  name: string; // 添加name属性以匹配JSONPlaceholder
  avatar?: string;
  nickname?: string;
  phone?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn?: number;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  name: string; // 添加name属性
  phone?: string; // 添加phone属性
}

// 文章相关类型
export interface Post {
  id: number; // JSONPlaceholder使用数字ID
  title: string;
  content: string;
  body?: string; // JSONPlaceholder使用body而不是content
  author?: User;
  userId?: number; // JSONPlaceholder的文章包含userId
  createdAt?: string;
  updatedAt?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface CreatePostRequest {
  title: string;
  content: string;
  body?: string; // 兼容JSONPlaceholder
  status?: 'draft' | 'published';
  userId?: number;
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  id: number;
}

// 请求配置类型
export interface RequestConfig {
  headers?: Record<string, string>;
  timeout?: number;
  params?: Record<string, any>;
}

// 错误响应类型
export interface ApiError {
  code: number;
  message: string;
  details?: any;
}

// 音乐作品相关类型
export interface Work {
  is_public: boolean;
  work_cover: string;
  work_genre: string[];
  work_id: string;
  work_lyrics: string;
  work_title: string;
  work_url: string;
  [property: string]: any;
}

export interface Data {
  total_count: number;
  works: Work[];
  [property: string]: any;
}

export interface ApifoxModel<T = any> {
  code: number;
  data: T;
  message: string;
  [property: string]: any;
}

// 歌曲生成请求参数
export interface GenerateMusicParams {
  work_genres: string[];
  work_lyrics: string;
  [property: string]: any;
}

// 歌曲生成返回数据
export interface GenerateMusicResponse {
  task_id: string;
  [property: string]: any;
}

// 推荐曲风接口请求参数
export interface RecommendGenresParams {
  work_lyrics: string;
  [property: string]: any;
}

// 推荐曲风接口返回数据
export interface RecommendGenresData {
  work_genres: string[];
  [property: string]: any;
}

// 推荐曲风接口返回模型
export interface RecommendGenresResponse extends ApifoxModel {
  data: RecommendGenresData;
} 