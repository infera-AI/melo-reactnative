import { launchCamera, launchImageLibrary, ImagePickerResponse, Image } from 'react-native-image-picker';
import { checkAndRequestCameraPermission, checkAndRequestStoragePermission } from '../utils/permissions';

export interface ImageInfo {
  id: string;
  uri: string;
  name: string;
  type: string;
  size: number;
  width?: number;
  height?: number;
}

/**
 * 拍照功能
 */
export const takePhoto = async (): Promise<ImageInfo | null> => {
  try {
    // 检查相机权限
    const hasPermission = await checkAndRequestCameraPermission();
    if (!hasPermission) {
      return null;
    }

    const result: ImagePickerResponse = await launchCamera({
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: false,
      saveToPhotos: true,
      cameraType: 'back',
    });

    if (result.didCancel) {
      console.log('用户取消了拍照');
      return null;
    }

    if (result.errorCode) {
      console.error('拍照错误:', result.errorMessage);
      return null;
    }

    if (result.assets && result.assets.length > 0) {
      const asset = result.assets[0];
      if (asset.uri) {
        const imageInfo: ImageInfo = {
          id: Date.now().toString(),
          uri: asset.uri,
          name: asset.fileName || `photo_${Date.now()}.jpg`,
          type: asset.type || 'image/jpeg',
          size: asset.fileSize || 0,
          width: asset.width,
          height: asset.height,
        };
        return imageInfo;
      }
    }

    return null;
  } catch (error) {
    console.error('拍照失败:', error);
    return null;
  }
};

/**
 * 从相册选择图片
 */
export const selectFromGallery = async (maxCount: number = 3): Promise<ImageInfo[]> => {
  try {
    // 检查存储权限
    const hasPermission = await checkAndRequestStoragePermission();
    if (!hasPermission) {
      return [];
    }

    const result: ImagePickerResponse = await launchImageLibrary({
      mediaType: 'photo',
      quality: 0.8,
      includeBase64: false,
      selectionLimit: maxCount,
      includeExtra: true,
    });

    if (result.didCancel) {
      console.log('用户取消了相册选择');
      return [];
    }

    if (result.errorCode) {
      console.error('相册选择错误:', result.errorMessage);
      return [];
    }

    if (result.assets && result.assets.length > 0) {
      const images: ImageInfo[] = result.assets.map((asset, index) => ({
        id: `${Date.now()}_${index}`,
        uri: asset.uri!,
        name: asset.fileName || `image_${Date.now()}_${index}.jpg`,
        type: asset.type || 'image/jpeg',
        size: asset.fileSize || 0,
        width: asset.width,
        height: asset.height,
      }));
      return images;
    }

    return [];
  } catch (error) {
    console.error('相册选择失败:', error);
    return [];
  }
};

/**
 * 验证图片格式和大小
 */
export const validateImage = (image: ImageInfo): { valid: boolean; message?: string } => {
  // 检查文件大小 (限制为10MB)
  const maxSize = 10 * 1024 * 1024; // 10MB
  if (image.size > maxSize) {
    return { valid: false, message: '图片大小不能超过10MB' };
  }

  // 检查文件类型
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(image.type.toLowerCase())) {
    return { valid: false, message: '只支持JPEG、PNG、WebP格式的图片' };
  }

  return { valid: true };
};

/**
 * 批量验证图片
 */
export const validateImages = (images: ImageInfo[]): { valid: boolean; message?: string } => {
  for (const image of images) {
    const validation = validateImage(image);
    if (!validation.valid) {
      return validation;
    }
  }
  return { valid: true };
};

/**
 * 格式化文件大小
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

/**
 * 生成缩略图URI（如果需要的话）
 */
export const generateThumbnailUri = (uri: string, width: number = 100, height: number = 100): string => {
  // 这里可以添加缩略图生成逻辑
  // 目前直接返回原图URI
  return uri;
}; 