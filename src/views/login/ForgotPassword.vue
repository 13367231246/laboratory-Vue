<template>
  <div class="forgot-password-page">
    <div class="forgot-password-container">
      <div class="forgot-password-form-wrapper">
        <div class="forgot-password-header">
          <h1 class="forgot-password-title">实验室管理系统</h1>
          <p class="forgot-password-subtitle">重置密码</p>
        </div>

        <a-form ref="formRef" :model="formData" :rules="formRules" class="forgot-password-form" @finish="handleResetPassword">
          <a-form-item name="email">
            <a-input v-model:value="formData.email" size="large" placeholder="请输入注册邮箱" :prefix="h(MailOutlined)" />
          </a-form-item>

          <a-form-item name="verificationCode">
            <div class="verification-code-group">
              <a-input v-model:value="formData.verificationCode" size="large" placeholder="验证码" />
              <a-button :disabled="countdown > 0" @click="sendVerificationCode" :loading="sendingCode">
                {{ countdown > 0 ? `${countdown}s` : '发送验证码' }}
              </a-button>
            </div>
          </a-form-item>

          <a-form-item name="newPassword">
            <a-input-password v-model:value="formData.newPassword" size="large" placeholder="新密码" :prefix="h(LockOutlined)" />
          </a-form-item>

          <a-form-item name="confirmPassword">
            <a-input-password v-model:value="formData.confirmPassword" size="large" placeholder="确认新密码" :prefix="h(LockOutlined)" />
          </a-form-item>

          <a-form-item>
            <a-button type="primary" html-type="submit" size="large" :loading="loading" class="reset-button" block> 重置密码 </a-button>
          </a-form-item>

          <div class="forgot-password-footer">
            <span>记起密码了？</span>
            <a @click="goToLogin">返回登录</a>
          </div>
        </a-form>
      </div>

      <div class="forgot-password-banner">
        <div class="banner-content">
          <h2>忘记密码？</h2>
          <p>不用担心，我们帮您快速重置密码</p>
          <div class="step-list">
            <div class="step-item">
              <div class="step-number">1</div>
              <div class="step-text">输入注册邮箱</div>
            </div>
            <div class="step-item">
              <div class="step-number">2</div>
              <div class="step-text">获取验证码</div>
            </div>
            <div class="step-item">
              <div class="step-number">3</div>
              <div class="step-text">设置新密码</div>
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
import { MailOutlined, LockOutlined } from '@ant-design/icons-vue'

const router = useRouter()

// 响应式数据
const formRef = ref()
const loading = ref(false)
const sendingCode = ref(false)
const countdown = ref(0)

// 表单数据
const formData = reactive({
  email: '',
  verificationCode: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const formRules = {
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  verificationCode: [
    { required: true, message: '请输入验证码', trigger: 'blur' },
    { len: 6, message: '验证码为6位数字', trigger: 'blur' }
  ],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6到20个字符', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (value !== formData.newPassword) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ]
}

// 事件处理
const handleResetPassword = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    // 模拟重置密码API调用
    await new Promise((resolve) => setTimeout(resolve, 2000))

    message.success('密码重置成功！请使用新密码登录')
    router.push('/login')
  } catch (error) {
    console.error('重置密码失败:', error)
    message.error('重置密码失败，请检查输入信息')
  } finally {
    loading.value = false
  }
}

const sendVerificationCode = async () => {
  if (!formData.email) {
    message.error('请先输入邮箱')
    return
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
    message.error('请输入正确的邮箱格式')
    return
  }

  sendingCode.value = true
  try {
    // 模拟发送验证码API调用
    await new Promise((resolve) => setTimeout(resolve, 1000))

    message.success('验证码已发送到您的邮箱')
    startCountdown()
  } catch (error) {
    message.error('发送验证码失败，请重试')
  } finally {
    sendingCode.value = false
  }
}

const startCountdown = () => {
  countdown.value = 60
  const timer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      clearInterval(timer)
    }
  }, 1000)
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.forgot-password-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.forgot-password-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  max-width: 1000px;
  width: 100%;
  max-height: 90vh;
}

.forgot-password-form-wrapper {
  flex: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow-y: auto;
}

.forgot-password-header {
  text-align: center;
  margin-bottom: 30px;
}

.forgot-password-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.forgot-password-subtitle {
  color: #666;
  font-size: 16px;
}

.forgot-password-form {
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
}

.verification-code-group {
  display: flex;
  gap: 10px;
}

.verification-code-group .ant-input {
  flex: 1;
}

.reset-button {
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 10px;
}

.forgot-password-footer {
  text-align: center;
  margin-top: 20px;
  color: #666;
}

.forgot-password-footer a {
  color: #1890ff;
  text-decoration: none;
  margin-left: 5px;
}

.forgot-password-footer a:hover {
  text-decoration: underline;
}

.forgot-password-banner {
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
}

.banner-content p {
  font-size: 18px;
  margin-bottom: 40px;
  opacity: 0.9;
}

.step-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 15px;
}

.step-number {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 18px;
}

.step-text {
  font-size: 16px;
}

/* 移动端适配 - 768px以下 */
@media (max-width: 768px) {
  .forgot-password-page {
    padding: 20px;
  }
  
  .forgot-password-container {
    flex-direction: column;
    max-width: 100%;
    max-height: 100vh;
  }

  .forgot-password-banner {
    display: none;
  }

  .forgot-password-form-wrapper {
    padding: 20px;
  }
  
  .forgot-password-title {
    font-size: 24px;
  }
  
  .forgot-password-subtitle {
    font-size: 14px;
  }
  
  .verification-code-group {
    flex-direction: column;
    gap: 8px;
  }
  
  .verification-code-group .ant-input {
    margin-bottom: 8px;
  }
}
</style>
