import httpClient from '../client';

// 翻译文档响应数据结构
export interface ApifoxModel {
  /**
   * 自定义状态码
   */
  code: number;
  /**
   * 返回数据
   */
  data: Data;
  /**
   * 数据说明
   */
  message: string;
  [property: string]: any;
}

/**
 * 返回数据
 */
export interface Data {
  message: string;
  request_id: string;
  /**
   * 翻译任务状态
   */
  status: string;
  /**
   * 任务创建是否成功
   */
  success: string;
  /**
   * 该翻译任务id，用于后续查询结果
   */
  task_id: string;
  [property: string]: any;
}

// 翻译文档请求参数
export interface TranslateDocumentRequest {
  /**
   * 源语言
   */
  source_language: string;
  /**
   * 目标语言
   */
  target_language: string;
  /**
   * 要翻译的文件
   */
  file: {
    uri: string;
    name: string;
    type: string;
  };
}

// 翻译图片请求参数
export interface TranslateImageRequest {
  /**
   * 源语言
   */
  source_language: string;
  /**
   * 目标语言
   */
  target_language: string;
  /**
   * 要翻译的图片文件列表
   */
  img_files: {
    uri: string;
    name: string;
    type: string;
  }[];
}

// 获取翻译文档任务请求参数
export interface GetTranslationTaskRequest {
  task_id: string;
  [property: string]: any;
}

// 翻译文档任务详情响应数据
export interface TranslationTaskData {
  page_count: string;
  request_id: string;
  status: string;
  task_id: string;
  translate_error_message: string;
  translate_file_url: string;
  message: string;
  success: string;
  [property: string]: any;
}

// 实时翻译WebSocket配置
export interface RealTimeTranslationConfig {
  format: string;
  sample_rate: number;
  source_language: string;
  target_language: string;
}

// 实时翻译请求参数
export interface RealTimeTranslationRequest {
  conversation_id?: string;
  token?: string;
  [property: string]: any;
}

// 实时翻译响应
export interface RealTimeTranslationResponse {
  conversation_id: string;
  original_text?: string;
  translated_text?: string;
  audio_data?: ArrayBuffer;
  status: 'processing' | 'completed' | 'error';
  error_message?: string;
}

// 创建新会话请求
export interface CreateConversationRequest {
  source_language: string;
  target_language: string;
  contact_name?: string;
}

// 创建新会话响应
export interface CreateConversationResponse {
  conversation_id: string;
  status: string;
  message: string;
  request_id: string;
  success: string;
  task_id: string;
}

// 获取翻译图片详情请求参数
export interface GetImageTranslationDetailsRequest {
  task_id: string;
  [property: string]: any;
}

// 翻译图片详情响应数据
export interface ImageTranslationDetailsData {
  results: ImageTranslationResult[];
  status: string;
  [property: string]: any;
}

export interface ImageTranslationResult {
  /**
   * 单张图片的翻译结果图 URL
   */
  final_image_url: string;
  /**
   * 单张图片的译后编辑器背景图
   */
  in_painting_url?: string;
  /**
   * 单张图片的翻译信息
   */
  message: string;
  /**
   * 单张图片的原图 URL
   */
  source_image_url: string;
  success: string;
  /**
   * 单张图片的译后编辑器模版数据
   */
  template_json?: string;
  [property: string]: any;
}

// 翻译文本请求参数
export interface TranslateTextRequest {
  /**
   * 文本格式：html/text
   */
  format_type: string;
  /**
   * 支持语言查看：https://help.aliyun.com/zh/machine-translation/support/supported-languages-and-codes?spm=api-workbench.api_explorer.0.0.59593014ULnLuq
   */
  source_language: string;
  source_text: string;
  /**
   * 支持语言查看：https://help.aliyun.com/zh/machine-translation/support/supported-languages-and-codes?spm=api-workbench.api_explorer.0.0.59593014ULnLuq
   */
  target_language: string;
  [property: string]: any;
}

// 翻译文本响应数据
export interface TranslateTextData {
  /**
   * 源语言传入 auto 时，语种识别后的源语言代码
   */
  detected_language: string;
  /**
   * 翻译后的结果
   */
  translated: string;
  /**
   * 总单词数
   */
  word_count: string;
  [property: string]: any;
}

// 翻译服务类
class TranslateService {
  /**
   * 翻译文档接口
   * @param params 翻译参数
   * @returns Promise<ApifoxModel>
   */
  async translateDocument(params: TranslateDocumentRequest): Promise<ApifoxModel> {
    try {
      // 创建FormData对象用于文件上传
      const formData = new FormData();
      formData.append('source_language', params.source_language);
      formData.append('target_language', params.target_language);
      
      formData.append('file', {
        uri: params.file.uri,
        name: params.file.name,
        type: params.file.type,
      });

      // 使用httpClient的upload方法
      const response = await httpClient.upload<Data>(
        '/translations/translate/docs',
        formData,
        {
          timeout: 300000, // 设置上传超时时间为5分钟
        }
      );

      // 构造ApifoxModel格式的响应
      const result: ApifoxModel = {
        code: response.code,
        message: response.message,
        data: response.data,
        success: response.success,
      };

      return result;
    } catch (error: any) {
      console.error('文档翻译请求失败:', error);
      
      // 返回标准化的错误响应
      const errorResponse: ApifoxModel = {
        code: error.code || 500,
        message: error.message || '文档翻译失败',
        data: {
          message: error.message || '文档翻译请求失败',
          request_id: '',
          status: 'failed',
          success: 'false',
          task_id: '',
        }
      };
      
      throw errorResponse;
    }
  }

  /**
   * 翻译图片接口
   * @param params 翻译参数
   * @returns Promise<ApifoxModel>
   */
  async translateImage(params: TranslateImageRequest): Promise<ApifoxModel> {
    try {
      // 创建FormData对象用于文件上传
      const formData = new FormData();
      formData.append('source_language', params.source_language);
      formData.append('target_language', params.target_language);
      
      
      // 添加所有图片文件
      params.img_files.forEach((file) => {
          formData.append('img_files', {
          uri: file.uri,
          name: file.name,
          type: file.type,
        });
      });

      // 使用httpClient的upload方法
      const response = await httpClient.upload<Data>(
        '/translations/translate/imgs',
        formData,
        {
          timeout: 300000, // 设置上传超时时间为5分钟
        }
      );

      // 构造ApifoxModel格式的响应
      const result: ApifoxModel = {
        code: response.code,
        message: response.message,
        data: response.data,
        success: response.success,
      };

      return result;
    } catch (error: any) {
      console.error('图片翻译请求失败:', error);
      
      // 返回标准化的错误响应
      const errorResponse: ApifoxModel = {
        code: error.code || 500,
        message: error.message || '图片翻译失败',
        data: {
          message: error.message || '图片翻译请求失败',
          request_id: '',
          status: 'failed',
          success: 'false',
          task_id: '',
        }
      };
      
      throw errorResponse;
    }
  }

  /**
   * 查询翻译任务状态
   * @param taskId 任务ID
   * @returns Promise<ApifoxModel>
   */
  async getTranslationStatus(taskId: string): Promise<ApifoxModel> {
    try {
      const response = await httpClient.get<Data>(
        `/translations/translate/docs/${taskId}/status`
      );

      // 构造ApifoxModel格式的响应
      const result: ApifoxModel = {
        code: response.code,
        message: response.message,
        data: response.data,
        success: response.success,
      };

      return result;
    } catch (error: any) {
      console.error('查询翻译状态失败:', error);
      
      const errorResponse: ApifoxModel = {
        code: error.code || 500,
        message: error.message || '查询翻译状态失败',
        data: {
          message: error.message || '查询翻译状态失败',
          request_id: '',
          status: 'error',
          success: 'false',
          task_id: taskId,
        }
      };
      
      throw errorResponse;
    }
  }

  /**
   * 获取翻译文档任务详情
   * @param taskId 任务ID
   * @returns Promise<ApifoxModel>
   */
  async getTranslationTask(taskId: string): Promise<ApifoxModel> {
    try {
      const response = await httpClient.get<TranslationTaskData>(
        `/translations/translate/docs/${taskId}`
      );

      // 构造ApifoxModel格式的响应
      const result: ApifoxModel = {
        code: response.code,
        message: response.message,
        data: response.data,
        success: response.success,
      };

      return result;
    } catch (error: any) {
      console.error('获取翻译任务详情失败:', error);
      
      const errorResponse: ApifoxModel = {
        code: error.code || 500,
        message: error.message || '获取翻译任务详情失败',
        data: {
          page_count: '0',
          request_id: '',
          status: 'error',
          task_id: taskId,
          translate_error_message: error.message || '获取翻译任务详情失败',
          translate_file_url: '',
          message: error.message || '获取翻译任务详情失败',
          success: 'false',
        }
      };
      
      throw errorResponse;
    }
  }

  /**
   * 下载翻译结果
   * @param taskId 任务ID
   * @returns Promise<Blob>
   */
  async downloadTranslationResult(taskId: string): Promise<Blob> {
    try {
      // 由于需要responseType: 'blob'，这里需要直接使用axios实例
      // 获取httpClient的内部axios实例
      const axiosInstance = (httpClient as any).instance;
      
      const response = await axiosInstance.get(
        `/translations/translate/docs/${taskId}/download`,
        {
          responseType: 'blob',
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('下载翻译结果失败:', error);
      throw error;
    }
  }

  /**
   * 获取图片翻译详情
   * @param params 图片详情请求参数
   * @returns Promise<ApifoxModel>
   */
  async getImageTranslationDetails(params: GetImageTranslationDetailsRequest): Promise<ApifoxModel> {
    try {
      const response = await httpClient.get<ImageTranslationDetailsData>(
        `/translations/translate/imgs/${params.task_id}`
      );

      // 构造ApifoxModel格式的响应
      const result: ApifoxModel = {
        code: response.code,
        message: response.message,
        data: response.data as any, // 使用类型断言，因为ImageTranslationDetailsData结构与Data不同
        success: response.success,
      };

      return result;
    } catch (error: any) {
      console.error('获取图片翻译详情失败:', error);
      
      const errorResponse: ApifoxModel = {
        code: error.code || 500,
        message: error.message || '获取图片翻译详情失败',
        data: {
          results: [],
          status: 'error',
          message: error.message || '获取图片翻译详情失败',
          request_id: '',
          success: 'false',
          task_id: params.task_id,
        } as any
      };
      
      throw errorResponse;
    }
  }

  /**
   * 翻译文本接口
   * @param params 翻译参数
   * @returns Promise<ApifoxModel>
   */
  async translateText(params: TranslateTextRequest): Promise<ApifoxModel> {
    try {
      const response = await httpClient.post<TranslateTextData>(
        '/translations/translate/text',
        params
      );
      
      // 检查响应状态码
      if (response.code !== undefined && response.code !== 200) {
        throw new Error(response.message || `翻译失败，状态码：${response.code}`);
      }
      
      const data = response.data as any;
      // 保证data字段包含Data接口的所有必需字段
      const result: ApifoxModel = {
        code: response.code,
        message: response.message,
        data: {
          message: '',
          request_id: '',
          status: '',
          success: '',
          task_id: '',
          ...data,
        },
        success: response.success,
      };
      return result;
    } catch (error: any) {
      console.error('文本翻译请求失败:', error);
      throw new Error(error.message || '文本翻译失败');
    }
  }

  /**
   * 创建新会话
   * @param params 会话参数
   * @returns Promise<ApifoxModel>
   */
  async createConversation(params: CreateConversationRequest): Promise<ApifoxModel> {
    try {
      const response = await httpClient.post<CreateConversationResponse>(
        '/conversations/new',
        params
      );

      const result: ApifoxModel = {
        code: response.code,
        message: response.message,
        data: response.data,
        success: response.success,
      };

      return result;
    } catch (error: any) {
      console.error('创建会话失败:', error);
      
      const errorResponse: ApifoxModel = {
        code: error.code || 500,
        message: error.message || '创建会话失败',
        data: {
          conversation_id: '',
          status: 'failed',
          message: error.message || '创建会话请求失败',
          request_id: '',
          success: 'false',
          task_id: '',
        }
      };
      
      throw errorResponse;
    }
  }
}

// 创建并导出服务实例
const translateService = new TranslateService();
export default translateService;
