import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores/StoreContext';

const HomeScreen = observer(() => {
  const { userStore } = useStores();

  const features = [
    { title: '消息中心', description: '查看最新消息', color: 'bg-blue-500' },
    { title: '数据统计', description: '查看使用数据', color: 'bg-green-500' },
    { title: '任务管理', description: '管理待办事项', color: 'bg-purple-500' },
    { title: '设置中心', description: '个人设置', color: 'bg-orange-500' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* 头部欢迎区域 */}
        <View className="bg-white px-6 py-8 mb-6">
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            你好, {userStore.user?.name}! 👋
          </Text>
          <Text className="text-gray-600">
            欢迎回来，今天是个美好的一天
          </Text>
        </View>

        {/* 快速统计卡片 */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            今日概览
          </Text>
          <View className="flex-row justify-between">
            <View className="bg-white rounded-xl p-4 flex-1 mr-3">
              <Text className="text-2xl font-bold text-blue-500">12</Text>
              <Text className="text-gray-600 text-sm">待办任务</Text>
            </View>
            <View className="bg-white rounded-xl p-4 flex-1 ml-3">
              <Text className="text-2xl font-bold text-green-500">8</Text>
              <Text className="text-gray-600 text-sm">已完成</Text>
            </View>
          </View>
        </View>

        {/* 功能网格 */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            功能中心
          </Text>
          <View className="flex-row flex-wrap justify-between">
            {features.map((feature, index) => (
              <TouchableOpacity
                key={index}
                className="bg-white rounded-xl p-4 mb-4 w-[48%]">
                <View className={`w-12 h-12 ${feature.color} rounded-xl mb-3 justify-center items-center`}>
                  <Text className="text-white text-xl">📱</Text>
                </View>
                <Text className="text-gray-800 font-semibold mb-1">
                  {feature.title}
                </Text>
                <Text className="text-gray-600 text-sm">
                  {feature.description}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 最近活动 */}
        <View className="px-6 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            最近活动
          </Text>
          <View className="bg-white rounded-xl p-4">
            <View className="flex-row items-center mb-3">
              <View className="w-3 h-3 bg-green-500 rounded-full mr-3" />
              <Text className="text-gray-800 flex-1">完成了项目设计</Text>
              <Text className="text-gray-500 text-sm">2小时前</Text>
            </View>
            <View className="flex-row items-center mb-3">
              <View className="w-3 h-3 bg-blue-500 rounded-full mr-3" />
              <Text className="text-gray-800 flex-1">参加了团队会议</Text>
              <Text className="text-gray-500 text-sm">4小时前</Text>
            </View>
            <View className="flex-row items-center">
              <View className="w-3 h-3 bg-purple-500 rounded-full mr-3" />
              <Text className="text-gray-800 flex-1">更新了用户资料</Text>
              <Text className="text-gray-500 text-sm">1天前</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

export default HomeScreen; 