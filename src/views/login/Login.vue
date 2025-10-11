<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-form-wrapper">
        <div class="login-header">
          <h1 class="login-title">实验室管理系统</h1>
          <p class="login-subtitle">请登录您的账户</p>
        </div>

        <a-form ref="formRef" :model="formData" :rules="formRules" class="login-form" @finish="handleLogin">
          <a-form-item name="username">
            <a-input v-model:value="formData.username" size="large" placeholder="手机号/学号" :prefix="h(UserOutlined)" />
          </a-form-item>

          <a-form-item name="password">
            <a-input-password v-model:value="formData.password" size="large" placeholder="密码" :prefix="h(LockOutlined)" />
          </a-form-item>

          <a-form-item name="userType">
            <a-radio-group v-model:value="formData.userType" class="user-type-group">
              <a-radio-button value="teacher">教师</a-radio-button>
              <a-radio-button value="student">学生</a-radio-button>
            </a-radio-group>
          </a-form-item>

          <a-form-item>
            <div class="login-options">
              <a-checkbox v-model:checked="formData.rememberMe"> 记住我 </a-checkbox>
              <a class="forgot-password" @click="goToForgotPassword"> 忘记密码？ </a>
            </div>
          </a-form-item>

          <a-form-item>
            <a-button type="primary" html-type="submit" size="large" :loading="loading" class="login-button" block> 登录 </a-button>
            <!-- 注册按钮 -->
            <a-button html-type="submit" size="large" class="login-button" block @click="goToRegister"> 去注册 </a-button>
          </a-form-item>
        </a-form>

        <div class="login-footer">
          <div class="login-tips">
            <p class="tip-text">默认账号：123456，密码：123456</p>
          </div>
        </div>
      </div>

      <div class="login-banner">
        <div class="banner-content">
          <h2>欢迎使用实验室管理系统</h2>
          <p>高效管理实验室资源，简化申请流程，提升使用体验</p>
          <div class="feature-list">
            <div class="feature-item">
              <ExperimentOutlined />
              <span>实验室管理</span>
            </div>
            <div class="feature-item">
              <ToolOutlined />
              <span>设备报修</span>
            </div>
            <div class="feature-item">
              <FileTextOutlined />
              <span>申请流程</span>
            </div>
            <div class="feature-item">
              <TeamOutlined />
              <span>用户管理</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, h } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { UserOutlined, LockOutlined, WechatOutlined, QqOutlined, AlipayOutlined, ExperimentOutlined, ToolOutlined, FileTextOutlined, TeamOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const formRef = ref()
const loading = ref(false)

// 表单数据
const formData = reactive({
  username: '',
  password: '',
  userType: 'teacher',
  rememberMe: false
})

// 表单验证规则
const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  userType: [{ required: true, message: '请选择用户类型', trigger: 'change' }]
}

// 事件处理
const handleLogin = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    // 使用用户状态管理进行登录
    const result = await userStore.login({
      username: formData.username,
      password: formData.password,
      userType: formData.userType
    })

    if (result.success) {
      message.success('登录成功！')
      router.push('/')
    } else {
      message.error('登录失败，请检查用户名和密码')
    }
  } finally {
    loading.value = false
  }
}

const goToForgotPassword = () => {
  router.push('/forgot-password')
}

const goToRegister = () => {
  router.push('/register')
}

// 检查是否已登录
const checkLoginStatus = () => {
  if (userStore.isLoggedIn) {
    router.push('/')
  }
}

// 页面加载时检查登录状态
checkLoginStatus()
</script>

<style scoped>
.login-page {
  max-height: 100vh;
  padding: 60px 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.login-container {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  display: flex;
  max-width: 1000px;
  width: 100%;
  max-height: 90vh;
}

.login-form-wrapper {
  flex: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow-y: auto;
}

.login-header {
  text-align: center;
  margin-bottom: 30px;
}

.login-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.login-subtitle {
  color: #666;
  font-size: 16px;
  margin: 0;
}

.login-form {
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
}

.user-type-group {
  width: 100%;
  display: flex;
}

.user-type-group :deep(.ant-radio-button-wrapper) {
  flex: 1;
  text-align: center;
}

.login-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.forgot-password {
  color: #1890ff;
  text-decoration: none;
}

.forgot-password:hover {
  text-decoration: underline;
}

.login-button {
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 10px;
}

.login-footer {
  margin-top: 10px;
  text-align: center;
}

.login-tips {
  margin-bottom: 16px;
}

.tip-text {
  color: #666;
  font-size: 14px;
  margin: 0;
  padding: 8px 12px;
  background: #f0f2f5;
  border-radius: 4px;
  border: 1px dashed #d9d9d9;
}

.login-banner {
  flex: 1;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 60px 40px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-content {
  text-align: center;
  max-width: 400px;
}

.banner-content h2 {
  font-size: 32px;
  font-weight: 600;
  margin-bottom: 20px;
  line-height: 1.2;
}

.banner-content p {
  font-size: 18px;
  margin-bottom: 40px;
  opacity: 0.9;
  line-height: 1.6;
}

.feature-list {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 40px;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 16px;
  opacity: 0.9;
}

.feature-item .anticon {
  font-size: 20px;
  color: rgba(255, 255, 255, 0.8);
}

/* 移动端适配 - 768px以下 */
@media (max-width: 768px) {
  .login-page {
    padding: 20px;
  }

  .login-container {
    flex-direction: column;
    max-width: 100%;
    max-height: 100vh;
  }

  .login-banner {
    display: none;
  }

  .login-form-wrapper {
    padding: 20px;
  }

  .login-title {
    font-size: 24px;
  }

  .login-subtitle {
    font-size: 14px;
  }

  .user-type-group :deep(.ant-radio-button-wrapper) {
    margin-bottom: 8px;
  }
}
</style>
