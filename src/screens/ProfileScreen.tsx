import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import { useStores } from '../stores/StoreContext';

const ProfileScreen = observer(() => {
  const { userStore } = useStores();

  const profileOptions = [
    { title: '编辑资料', icon: '✏️', description: '修改个人信息' },
    { title: '账号安全', icon: '🔒', description: '密码和安全设置' },
    { title: '隐私设置', icon: '👁️', description: '隐私和权限管理' },
    { title: '通知设置', icon: '🔔', description: '消息通知配置' },
    { title: '帮助中心', icon: '❓', description: '常见问题和帮助' },
    { title: '意见反馈', icon: '💬', description: '提交建议和反馈' },
  ];

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView className="flex-1">
        {/* 用户信息卡片 */}
        <View className="bg-white mx-6 mt-6 rounded-2xl p-6 items-center">
          {/* 头像占位符 */}
          <View className="w-24 h-24 bg-blue-500 rounded-full items-center justify-center mb-4">
            <Text className="text-white text-3xl font-bold">
              {userStore.user?.name?.charAt(0) || 'U'}
            </Text>
          </View>
          
          <Text className="text-2xl font-bold text-gray-800 mb-2">
            {userStore.user?.name}
          </Text>
          <Text className="text-gray-600 mb-4">
            {userStore.user?.email}
          </Text>
          
          <View className="flex-row">
            <View className="bg-blue-50 px-4 py-2 rounded-full mr-3">
              <Text className="text-blue-600 font-medium">普通用户</Text>
            </View>
            <View className="bg-green-50 px-4 py-2 rounded-full">
              <Text className="text-green-600 font-medium">已认证</Text>
            </View>
          </View>
        </View>

        {/* 统计数据 */}
        <View className="mx-6 mt-6">
          <View className="bg-white rounded-2xl p-6">
            <Text className="text-lg font-semibold text-gray-800 mb-4">
              数据统计
            </Text>
            <View className="flex-row justify-between">
              <View className="items-center">
                <Text className="text-2xl font-bold text-blue-500">156</Text>
                <Text className="text-gray-600 text-sm">总任务</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-green-500">89</Text>
                <Text className="text-gray-600 text-sm">已完成</Text>
              </View>
              <View className="items-center">
                <Text className="text-2xl font-bold text-orange-500">25</Text>
                <Text className="text-gray-600 text-sm">进行中</Text>
              </View>
            </View>
          </View>
        </View>

        {/* 设置选项 */}
        <View className="mx-6 mt-6 mb-6">
          <Text className="text-lg font-semibold text-gray-800 mb-4">
            账户设置
          </Text>
          <View className="bg-white rounded-2xl">
            {profileOptions.map((option, index) => (
              <TouchableOpacity
                key={index}
                className={`flex-row items-center p-4 ${
                  index !== profileOptions.length - 1 ? 'border-b border-gray-100' : ''
                }`}>
                <Text className="text-2xl mr-4">{option.icon}</Text>
                <View className="flex-1">
                  <Text className="text-gray-800 font-medium mb-1">
                    {option.title}
                  </Text>
                  <Text className="text-gray-500 text-sm">
                    {option.description}
                  </Text>
                </View>
                <Text className="text-gray-400 text-xl">›</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* 退出登录按钮 */}
        <View className="mx-6 mb-8">
          <TouchableOpacity
            className="bg-red-500 rounded-xl py-4"
            onPress={userStore.logout}>
            <Text className="text-white text-center font-semibold text-lg">
              退出登录
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
});

export default ProfileScreen; 