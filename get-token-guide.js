/**
 * Token获取指南
 * 帮助用户获取真实的WebSocket认证token
 */

console.log('=== WebSocket Token 获取指南 ===\n');

console.log('🔑 要使用WebSocket音频流功能，您需要获取真实的认证token。\n');

console.log('📱 方法1: 从React Native应用获取');
console.log('1. 在您的React Native应用中登录');
console.log('2. 打开调试工具或添加日志输出');
console.log('3. 查找存储在AsyncStorage中的ACTION_TOKEN');
console.log('4. 复制token值\n');

console.log('🌐 方法2: 从浏览器开发者工具获取');
console.log('1. 在浏览器中打开您的Web应用（如果有）');
console.log('2. 按F12打开开发者工具');
console.log('3. 在Console中执行: localStorage.getItem("ACTION_TOKEN")');
console.log('4. 复制返回的token值\n');

console.log('🔧 方法3: 通过API获取新token');
console.log('1. 使用登录API获取新的token');
console.log('2. 确保token格式正确（通常以"Bearer "开头）\n');

console.log('📝 使用步骤:');
console.log('1. 获取token后，编辑测试脚本');
console.log('2. 将token替换到WS_URL中');
console.log('3. 运行测试脚本\n');

console.log('🔍 当前测试脚本中的token:');
console.log('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6Im1lbG9uX3VzZXIiLCJhdXRoX3R5cGUiOiJlbWFpbCIsImlkZW50aWZpZXIiOiIyOTgyODc1NDkyQHFxLmNvbSIsImV4cCI6MTc1MzA2MjcyNX0.bUZYCp4w_zx0OLYQdHMwoXQytI-Afkptp2y9vOZk7wU\n');

console.log('⚠️  注意: 这个token可能已经过期，需要替换为有效的token\n');

console.log('🚀 获取token后，您可以运行以下命令测试:');
console.log('node test-quick.js');
console.log('node test-audio-stream-demo.js');
console.log('node test-audio-simple.js <音频文件路径>\n');

console.log('📞 如果遇到问题，请检查:');
console.log('- token是否有效且未过期');
console.log('- 网络连接是否正常');
console.log('- 服务器是否在线'); 