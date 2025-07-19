import { ApifoxModel, Data, GenerateMusicParams, GenerateMusicResponse, RecommendGenresParams, RecommendGenresResponse } from '../types';
import client from '../client';

/**
 * 统一的API响应处理函数
 * 检查code字段，如果不为200则抛出错误
 */
function handleApiResponse(response: any): any {
  if (response.code !== undefined && response.code !== 200) {
    throw new Error(response.message || `API错误，状态码：${response.code}`);
  }
  return response.data;
}

/**
 * 获取音乐作品列表（GET）
 * GET /music/works
 * 无请求参数
 * 返回: ApifoxModel<Data>
 */
export async function getMusicWorks(): Promise<ApifoxModel<Data>> {
  try {
    const res = await client.get<ApifoxModel<Data>>('/music/works');
    return handleApiResponse(res);
  } catch (error: any) {
    throw new Error(error.message || '获取音乐作品列表失败');
  }
}
  
/**
 * 歌曲生成接口
 * POST /music/generate
 * @param params work_genres, work_lyrics
 * @returns ApifoxModel<GenerateMusicResponse>
 */
export async function generateMusic(params: GenerateMusicParams): Promise<ApifoxModel<GenerateMusicResponse>> {
  try {
    const formData = new FormData();
    formData.append('work_lyrics', params.work_lyrics);
    params.work_genres.forEach((genre: string) => {
      formData.append('work_genres', genre);
    });
    const res = await client.post<ApifoxModel<GenerateMusicResponse>>(
      '/music/generate',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return handleApiResponse(res);
  } catch (error: any) {
    throw new Error(error.message || '歌曲生成失败');
  }
}

/**
 * 推荐曲风接口
 * POST /music/genres
 * @param params work_lyrics
 * @returns RecommendGenresResponse
 */
export async function recommendGenres(params: RecommendGenresParams): Promise<RecommendGenresResponse> {
  try {
    const res = await client.post<RecommendGenresResponse>('/music/genres', params);
    return handleApiResponse(res);
  } catch (error: any) {
    throw new Error(error.message || '推荐曲风失败');
  }
}

/**
 * 获取单个音乐作品信息（GET）
 * GET /music/work_info
 * @param params work_id
 * @returns ApifoxModel<Data>
 */
export async function getMusicWorkInfo(params: { work_id: string }): Promise<ApifoxModel<Data>> {
  try {
    const res = await client.get<ApifoxModel<Data>>('/music/work_info', { params });
    return handleApiResponse(res);
  } catch (error: any) {
    throw new Error(error.message || '获取作品信息失败');
  }
}

/**
 * 歌曲重命名接口
 * POST /music/modify_title
 * @param params work_id, work_title
 * @returns ApifoxModel<null>
 */
export async function modifyMusicTitle(params: { work_id: string; work_title: string }): Promise<ApifoxModel<null>> {
  try {
    const res = await client.post<ApifoxModel<null>>('/music/modify_title', params);
    return handleApiResponse(res);
  } catch (error: any) {
    throw new Error(error.message || '重命名失败');
  }
}

/**
 * 重制音乐作品接口
 * POST /music/regenerate
 * @param params work_genres, work_id, work_lyrics
 * @returns ApifoxModel<Data> (Data: { task_id })
 */
export async function regenerateMusicWork(params: { work_genres?: string[]; work_id?: string; work_lyrics?: string }): Promise<ApifoxModel<{ task_id: string }>> {
  try {
    const res = await client.post<ApifoxModel<{ task_id: string }>>('/music/regenerate', params);
    return handleApiResponse(res);
  } catch (error: any) {
    throw new Error(error.message || '重制音乐作品失败');
  }
}

/**
 * 删除音乐作品接口
 * POST /music/delete
 * @param params work_id
 * @returns ApifoxModel<null>
 */
export async function deleteMusicWork(params: { work_ids: number[] }): Promise<ApifoxModel<null>> {
  try {
    const res = await client.post<ApifoxModel<null>>('/music/delete', params);
    return handleApiResponse(res);
  } catch (error: any) {
    throw new Error(error.message || '删除音乐作品失败');
  }
}

/**
 * 查询歌曲生成结果接口
 * GET /music/task_status
 * @param params task_id
 * @returns ApifoxModel
 */
export async function getMusicTaskStatus(params: { task_id: string }): Promise<ApifoxModel<any>> {
  try {
    const res = await client.get<ApifoxModel<any>>('/music/task_status', { params });
    return res;
  } catch (error: any) {
    throw new Error(error.message || '查询任务状态失败');
  }
}
/**
 * 哼唱成曲接口
 * POST /music/sing
 * @param params audio_file: File
 * @returns ApifoxModel<Data>
 */
export async function singToMusic(audioFile: any): Promise<ApifoxModel<Data>> {
  try {
    const formData = new FormData();
    console.log('audioFile', audioFile);
    formData.append('audio_file', {
      uri: audioFile.uri,
      name: audioFile.name,
      type: audioFile.type,
    });
    const res = await client.post<ApifoxModel<Data>>(
      '/music/sing',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    
    return handleApiResponse(res);
  } catch (error: any) {
    throw new Error(error.message || '哼唱成曲失败');
  }
}

/**
 * 保存音乐作品接口
 * POST /music/save
 * @param params task_id（可选）, music_index_list（array[string]）
 * @returns ApifoxModel<null>
 */
export async function saveMusicWork(params: { task_id?: string; music_index_list: string[] }): Promise<ApifoxModel<null>> {
  try {
    const formData = new FormData();
    if (params.task_id) {
      formData.append('task_id', params.task_id);
    }
    // params.music_index_list.forEach((idx) => {
    //   formData.append('music_index_list', idx);
    // });
    formData.append('music_index_list', JSON.stringify(params.music_index_list));
    const res = await client.post<ApifoxModel<null>>(
      '/music/save',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return handleApiResponse(res);
  } catch (error: any) {
    throw new Error(error.message || '保存音乐作品失败');
  }
}

/**
 * 歌词润饰接口
 * POST /music/lyrics
 * @param params work_lyrics（string）
 * @returns ApifoxModel<Data>（Data: { work_lyrics: string }）
 */
export async function polishLyrics(params: { work_lyrics: string }): Promise<ApifoxModel<Data>> {
  try {
    const formData = new FormData();
    formData.append('work_lyrics', params.work_lyrics);
    const res = await client.post<ApifoxModel<Data>>(
      '/music/lyrics',
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } }
    );
    return handleApiResponse(res);
  } catch (error: any) {
    throw new Error(error.message || '歌词润饰失败');
  }
}
