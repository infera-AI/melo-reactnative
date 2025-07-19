/**
 * 文章相关API服务
 */
import httpClient from '../client';
import { API_ENDPOINTS } from '../config';
import {
  Post,
  CreatePostRequest,
  UpdatePostRequest,
  ApiResponse,
  PaginationResponse,
} from '../types';

class PostService {
  /**
   * 获取文章列表 - 适配JSONPlaceholder
   */
  async getPostList(
    page: number = 1,
    pageSize: number = 10,
    filters?: {
      status?: 'draft' | 'published' | 'archived';
      keyword?: string;
      userId?: number;
    }
  ): Promise<PaginationResponse<Post>> {
    try {
      // JSONPlaceholder返回所有文章，我们在客户端进行分页
      const response = await httpClient.get<any[]>(API_ENDPOINTS.POSTS.LIST);
      
      // 处理JSONPlaceholder的直接数组响应
      const allPosts = Array.isArray(response) ? response : response.data || [];
      
      // 过滤和搜索
      let filteredPosts = allPosts;
      
      if (filters?.userId) {
        filteredPosts = filteredPosts.filter((post: any) => post.userId === filters.userId);
      }
      
      if (filters?.keyword) {
        const keyword = filters.keyword.toLowerCase();
        filteredPosts = filteredPosts.filter((post: any) => 
          post.title.toLowerCase().includes(keyword) || 
          post.body.toLowerCase().includes(keyword)
        );
      }
      
      // 客户端分页
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const paginatedPosts = filteredPosts.slice(startIndex, endIndex);
      
      // 转换为我们的Post类型
      const posts: Post[] = paginatedPosts.map((postData: any) => ({
        id: postData.id,
        title: postData.title,
        content: postData.body, // JSONPlaceholder使用body字段
        body: postData.body,
        userId: postData.userId,
        status: 'published' as const, // 默认为已发布
      }));
      
      return {
        success: true,
        code: 200,
        message: '获取文章列表成功',
        data: posts,
        pagination: {
          current: page,
          total: filteredPosts.length,
          pageSize,
          totalPages: Math.ceil(filteredPosts.length / pageSize),
        },
      };
    } catch (error: any) {
      console.error('Get post list failed:', error);
      throw {
        success: false,
        code: 500,
        message: error.message || '获取文章列表失败',
        data: [],
      };
    }
  }

  /**
   * 获取文章详情
   */
  async getPostDetail(id: number): Promise<ApiResponse<Post>> {
    try {
      const response = await httpClient.get<any>(`${API_ENDPOINTS.POSTS.DETAIL}/${id}`);
      
      // 处理JSONPlaceholder的响应
      const postData = response.data || response;
      
      const post: Post = {
        id: postData.id,
        title: postData.title,
        content: postData.body,
        body: postData.body,
        userId: postData.userId,
        status: 'published',
      };
      
      return {
        success: true,
        code: 200,
        message: '获取文章详情成功',
        data: post,
      };
    } catch (error: any) {
      console.error('Get post detail failed:', error);
      throw {
        success: false,
        code: 404,
        message: error.message || '文章不存在',
        data: null,
      };
    }
  }

  /**
   * 创建文章
   */
  async createPost(data: CreatePostRequest): Promise<ApiResponse<Post>> {
    try {
      // 构造JSONPlaceholder格式的数据
      const postData = {
        title: data.title,
        body: data.content || data.body || '',
        userId: data.userId || 1, // 默认用户ID
      };
      
      const response = await httpClient.post<any>(API_ENDPOINTS.POSTS.CREATE, postData);
      
      // 处理JSONPlaceholder的响应
      const createdPost = response.data || response;
      
      const post: Post = {
        id: createdPost.id || 101, // JSONPlaceholder通常返回101
        title: createdPost.title,
        content: createdPost.body,
        body: createdPost.body,
        userId: createdPost.userId,
        status: data.status || 'published',
      };
      
      return {
        success: true,
        code: 201,
        message: '创建文章成功',
        data: post,
      };
    } catch (error: any) {
      console.error('Create post failed:', error);
      throw {
        success: false,
        code: 500,
        message: error.message || '创建文章失败',
        data: null,
      };
    }
  }

  /**
   * 更新文章
   */
  async updatePost(data: UpdatePostRequest): Promise<ApiResponse<Post>> {
    try {
      const { id, ...updateData } = data;
      
      // 构造JSONPlaceholder格式的数据
      const postData = {
        title: updateData.title,
        body: updateData.content || updateData.body || '',
        userId: updateData.userId || 1,
      };
      
      const response = await httpClient.put<any>(
        `${API_ENDPOINTS.POSTS.UPDATE}/${id}`,
        postData
      );
      
      const updatedPost = response.data || response;
      
      const post: Post = {
        id: updatedPost.id || id,
        title: updatedPost.title,
        content: updatedPost.body,
        body: updatedPost.body,
        userId: updatedPost.userId,
        status: updateData.status || 'published',
      };
      
      return {
        success: true,
        code: 200,
        message: '更新文章成功',
        data: post,
      };
    } catch (error: any) {
      console.error('Update post failed:', error);
      throw {
        success: false,
        code: 500,
        message: error.message || '更新文章失败',
        data: null,
      };
    }
  }

  /**
   * 删除文章
   */
  async deletePost(id: number): Promise<ApiResponse<null>> {
    try {
      await httpClient.delete<any>(`${API_ENDPOINTS.POSTS.DELETE}/${id}`);
      
      return {
        success: true,
        code: 200,
        message: '删除文章成功',
        data: null,
      };
    } catch (error: any) {
      console.error('Delete post failed:', error);
      throw {
        success: false,
        code: 500,
        message: error.message || '删除文章失败',
        data: null,
      };
    }
  }

  /**
   * 发布文章
   */
  async publishPost(id: number): Promise<ApiResponse<Post>> {
    try {
      // JSONPlaceholder不支持PATCH，使用PUT模拟
      const response = await httpClient.put<any>(`${API_ENDPOINTS.POSTS.UPDATE}/${id}`, {
        status: 'published',
      });
      
      const postData = response.data || response;
      
      const post: Post = {
        id: postData.id || id,
        title: postData.title || '',
        content: postData.body || '',
        body: postData.body || '',
        userId: postData.userId || 1,
        status: 'published',
      };
      
      return {
        success: true,
        code: 200,
        message: '发布文章成功',
        data: post,
      };
    } catch (error: any) {
      console.error('Publish post failed:', error);
      throw {
        success: false,
        code: 500,
        message: error.message || '发布文章失败',
        data: null,
      };
    }
  }

  /**
   * 归档文章
   */
  async archivePost(id: number): Promise<ApiResponse<Post>> {
    try {
      const response = await httpClient.put<any>(`${API_ENDPOINTS.POSTS.UPDATE}/${id}`, {
        status: 'archived',
      });
      
      const postData = response.data || response;
      
      const post: Post = {
        id: postData.id || id,
        title: postData.title || '',
        content: postData.body || '',
        body: postData.body || '',
        userId: postData.userId || 1,
        status: 'archived',
      };
      
      return {
        success: true,
        code: 200,
        message: '归档文章成功',
        data: post,
      };
    } catch (error: any) {
      console.error('Archive post failed:', error);
      throw {
        success: false,
        code: 500,
        message: error.message || '归档文章失败',
        data: null,
      };
    }
  }
}

export const postService = new PostService();
export default postService; 