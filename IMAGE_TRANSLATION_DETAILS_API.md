# 图片翻译详情 API 接口文档

## 接口概述

获取图片翻译任务的详细结果，包括每张图片的翻译结果图、原图、翻译信息等。

## 接口信息

- **路径**: `/translations/translate/imgs/{task_id}`
- **请求方式**: `GET`
- **认证**: 需要 Bearer Token

## 请求参数

### 路径参数

| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| task_id | string | 是 | 图片翻译任务ID |

### 请求头

| 参数名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| Authorization | string | 是 | Bearer Token |
| Content-Type | string | 是 | application/json |

## 响应格式

### 成功响应 (200)

```json
{
  "code": 200,
  "message": "获取图片翻译详情成功",
  "data": {
    "results": [
      {
        "final_image_url": "https://example.com/translated_image_1.jpg",
        "in_painting_url": "https://example.com/in_painting_1.jpg",
        "message": "图片翻译成功",
        "source_image_url": "https://example.com/source_image_1.jpg",
        "success": "true",
        "template_json": "{\"template\": \"data\"}"
      },
      {
        "final_image_url": "https://example.com/translated_image_2.jpg",
        "message": "图片翻译成功",
        "source_image_url": "https://example.com/source_image_2.jpg",
        "success": "true"
      }
    ],
    "status": "completed"
  },
  "success": "true"
}
```

### 错误响应

```json
{
  "code": 404,
  "message": "任务不存在",
  "data": {
    "results": [],
    "status": "error"
  },
  "success": "false"
}
```

## 响应字段说明

### 顶层字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| code | number | 自定义状态码 |
| message | string | 数据说明 |
| data | object | 返回数据 |
| success | string | 请求是否成功 |

### data 字段

| 字段名 | 类型 | 说明 |
|--------|------|------|
| results | array | 图片翻译结果数组 |
| status | string | 任务状态 |

### results 数组中的对象

| 字段名 | 类型 | 必需 | 说明 |
|--------|------|------|------|
| final_image_url | string | 是 | 单张图片的翻译结果图 URL |
| in_painting_url | string | 否 | 单张图片的译后编辑器背景图 |
| message | string | 是 | 单张图片的翻译信息 |
| source_image_url | string | 是 | 单张图片的原图 URL |
| success | string | 是 | 该图片翻译是否成功 |
| template_json | string | 否 | 单张图片的译后编辑器模版数据 |

## TypeScript 接口定义

```typescript
// 请求参数接口
export interface GetImageTranslationDetailsRequest {
  task_id: string;
  [property: string]: any;
}

// 响应数据接口
export interface ImageTranslationDetailsData {
  results: ImageTranslationResult[];
  status: string;
  [property: string]: any;
}

// 单个图片翻译结果接口
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
```

## 使用示例

### JavaScript/TypeScript

```typescript
import { translateService } from '@/api/services';

// 获取图片翻译详情
async function getImageTranslationDetails(taskId: string) {
  try {
    const response = await translateService.getImageTranslationDetails({
      task_id: taskId
    });
    
    console.log('翻译详情:', response.data);
    
    // 处理每张图片的结果
    response.data.results.forEach((result, index) => {
      console.log(`图片 ${index + 1}:`);
      console.log(`  原图: ${result.source_image_url}`);
      console.log(`  翻译结果: ${result.final_image_url}`);
      console.log(`  翻译信息: ${result.message}`);
      console.log(`  是否成功: ${result.success}`);
      
      if (result.in_painting_url) {
        console.log(`  编辑器背景图: ${result.in_painting_url}`);
      }
      
      if (result.template_json) {
        console.log(`  编辑器模版: ${result.template_json}`);
      }
    });
    
  } catch (error) {
    console.error('获取图片翻译详情失败:', error);
  }
}
```

### React Native 组件示例

```typescript
import React, { useState, useEffect } from 'react';
import { View, Text, Image, ScrollView, StyleSheet } from 'react-native';
import { translateService } from '@/api/services';

interface ImageTranslationDetailsProps {
  taskId: string;
}

const ImageTranslationDetails: React.FC<ImageTranslationDetailsProps> = ({ taskId }) => {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTranslationDetails();
  }, [taskId]);

  const loadTranslationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await translateService.getImageTranslationDetails({
        task_id: taskId
      });
      
      setDetails(response.data);
    } catch (err: any) {
      setError(err.message || '获取翻译详情失败');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>加载中...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>错误: {error}</Text>
      </View>
    );
  }

  if (!details || !details.results) {
    return (
      <View style={styles.container}>
        <Text>暂无翻译结果</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>图片翻译结果</Text>
      <Text style={styles.status}>状态: {details.status}</Text>
      
      {details.results.map((result: any, index: number) => (
        <View key={index} style={styles.resultItem}>
          <Text style={styles.imageTitle}>图片 {index + 1}</Text>
          
          <View style={styles.imageContainer}>
            <View style={styles.imageSection}>
              <Text style={styles.imageLabel}>原图:</Text>
              <Image 
                source={{ uri: result.source_image_url }} 
                style={styles.image}
                resizeMode="contain"
              />
            </View>
            
            <View style={styles.imageSection}>
              <Text style={styles.imageLabel}>翻译结果:</Text>
              <Image 
                source={{ uri: result.final_image_url }} 
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          </View>
          
          <Text style={styles.message}>翻译信息: {result.message}</Text>
          <Text style={styles.success}>
            状态: {result.success === 'true' ? '成功' : '失败'}
          </Text>
          
          {result.in_painting_url && (
            <View style={styles.imageSection}>
              <Text style={styles.imageLabel}>编辑器背景图:</Text>
              <Image 
                source={{ uri: result.in_painting_url }} 
                style={styles.image}
                resizeMode="contain"
              />
            </View>
          )}
        </View>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  status: {
    fontSize: 16,
    marginBottom: 16,
    color: '#666',
  },
  resultItem: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
  },
  imageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  imageContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  imageSection: {
    flex: 1,
    marginHorizontal: 4,
  },
  imageLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  image: {
    width: '100%',
    height: 150,
    borderRadius: 4,
  },
  message: {
    fontSize: 14,
    marginBottom: 4,
  },
  success: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4CAF50',
  },
  errorText: {
    color: '#f44336',
    fontSize: 16,
  },
});

export default ImageTranslationDetails;
```

## 状态码说明

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 400 | 请求参数错误 |
| 401 | 未授权，需要登录 |
| 403 | 禁止访问 |
| 404 | 任务不存在 |
| 500 | 服务器内部错误 |

## 注意事项

1. **认证**: 调用此接口需要有效的 Bearer Token
2. **任务状态**: 只有翻译完成的任务才能获取到详细结果
3. **图片URL**: 返回的图片URL可能有时效性，建议及时处理
4. **可选字段**: `in_painting_url` 和 `template_json` 为可选字段，可能为空
5. **错误处理**: 建议实现适当的错误处理和重试机制

## 测试

可以使用提供的测试脚本 `test-image-translation-details.js` 来验证接口功能：

```bash
node test-image-translation-details.js
```

测试脚本会验证：
- TypeScript 接口定义的正确性
- API 请求和响应的格式
- 响应数据结构的完整性
- 错误处理机制 