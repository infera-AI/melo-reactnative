import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Switch,
} from 'react-native';
import { observer } from 'mobx-react-lite';

const SettingsScreen = observer(() => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSync, setAutoSync] = useState(true);
  const [faceId, setFaceId] = useState(false);

  const settingsSections = [
    {
      title: '通用设置',
      items: [
        {
          title: '推送通知',
          description: '接收应用推送消息',
          type: 'switch',
          value: notifications,
          onToggle: setNotifications,
        },
        {
          title: '深色模式',
          description: '启用深色主题',
          type: 'switch',
          value: darkMode,
          onToggle: setDarkMode,
        },
        {
          title: '自动同步',
          description: '自动同步数据到云端',
          type: 'switch',
          value: autoSync,
          onToggle: setAutoSync,
        },
      ],
    },
    {
      title: '安全设置',
      items: [
        {
          title: 'Face ID / 指纹',
          description: '使用生物识别解锁',
          type: 'switch',
          value: faceId,
          onToggle: setFaceId,
        },
        {
          title: '修改密码',
          description: '更改登录密码',
          type: 'arrow',
        },
        {
          title: '双重验证',
          description: '启用两步验证',
          type: 'arrow',
        },
      ],
    },
    {
      title: '数据管理',
      items: [
        {
          title: '清除缓存',
          description: '清除应用缓存数据',
          type: 'arrow',
        },
        {
          title: '导出数据',
          description: '导出个人数据',
          type: 'arrow',
        },
        {
          title: '删除账户',
          description: '永久删除账户和数据',
          type: 'arrow',
          danger: true,
        },
      ],
    },
    {
      title: '关于应用',
      items: [
        {
          title: '版本信息',
          description: 'v1.0.0 (Build 1)',
          type: 'arrow',
        },
        {
          title: '服务条款',
          description: '查看使用条款',
          type: 'arrow',
        },
        {
          title: '隐私政策',
          description: '查看隐私政策',
          type: 'arrow',
        },
      ],
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        <View className="px-6 py-4">
          <Text className="text-3xl font-bold text-gray-800">设置</Text>
        </View>

        {settingsSections.map((section, sectionIndex) => (
          <View key={sectionIndex} className="mx-6 mb-6">
            <Text className="text-lg font-semibold text-gray-800 mb-3">
              {section.title}
            </Text>
            <View className="bg-white rounded-2xl">
              {section.items.map((item, itemIndex) => (
                <TouchableOpacity
                  key={itemIndex}
                  className={`flex-row items-center p-4 ${
                    itemIndex !== section.items.length - 1
                      ? 'border-b border-gray-100'
                      : ''
                  }`}
                  disabled={item.type === 'switch'}>
                  <View className="flex-1">
                    <Text
                      className={`font-medium mb-1 ${
                        item.danger ? 'text-red-500' : 'text-gray-800'
                      }`}>
                      {item.title}
                    </Text>
                    <Text className="text-gray-500 text-sm">
                      {item.description}
                    </Text>
                  </View>
                  {item.type === 'switch' ? (
                    <Switch
                      value={item.value}
                      onValueChange={item.onToggle}
                      trackColor={{ false: '#f3f4f6', true: '#3b82f6' }}
                      thumbColor={item.value ? '#ffffff' : '#9ca3af'}
                    />
                  ) : (
                    <Text className="text-gray-400 text-xl">›</Text>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}

        {/* 底部信息 */}
        <View className="mx-6 mb-8">
          <View className="bg-blue-50 rounded-xl p-4">
            <Text className="text-blue-800 font-medium mb-2">
              💡 提示
            </Text>
            <Text className="text-blue-700 text-sm">
              修改设置可能需要重新启动应用才能生效。某些功能需要网络连接。
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

export default SettingsScreen; 