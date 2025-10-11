<template>
  <div class="change-password-page">
    <div class="change-password-container">
      <div class="change-password-form-wrapper">
        <div class="change-password-header">
          <h1 class="change-password-title">实验室管理系统</h1>
          <p class="change-password-subtitle">修改密码</p>
        </div>

        <a-form ref="formRef" :model="formData" :rules="formRules" class="change-password-form" @finish="handleChangePassword">
          <a-form-item name="currentPassword">
            <a-input-password v-model:value="formData.currentPassword" size="large" placeholder="当前密码" :prefix="h(LockOutlined)" />
          </a-form-item>

          <a-form-item name="newPassword">
            <a-input-password v-model:value="formData.newPassword" size="large" placeholder="新密码" :prefix="h(LockOutlined)" />
          </a-form-item>

          <a-form-item name="confirmPassword">
            <a-input-password v-model:value="formData.confirmPassword" size="large" placeholder="确认新密码" :prefix="h(LockOutlined)" />
          </a-form-item>

          <a-form-item>
            <a-button type="primary" html-type="submit" size="large" :loading="loading" class="change-button" block> 修改密码 </a-button>
          </a-form-item>

          <div class="change-password-footer">
            <a @click="goToLogin">返回登录</a>
          </div>
        </a-form>
      </div>

      <div class="change-password-banner">
        <div class="banner-content">
          <h2>修改密码</h2>
          <p>为了您的账户安全，请定期修改密码</p>
          <div class="security-tips">
            <div class="tip-item">
              <ShieldCheckOutlined />
              <span>密码长度至少6位</span>
            </div>
            <div class="tip-item">
              <KeyOutlined />
              <span>建议包含字母和数字</span>
            </div>
            <div class="tip-item">
              <SafetyOutlined />
              <span>避免使用简单密码</span>
            </div>
            <div class="tip-item">
              <LockOutlined />
              <span>定期更换密码</span>
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
import { LockOutlined, ShieldCheckOutlined, KeyOutlined, SafetyOutlined } from '@ant-design/icons-vue'

const router = useRouter()

// 响应式数据
const formRef = ref()
const loading = ref(false)

// 表单数据
const formData = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const formRules = {
  currentPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, max: 20, message: '密码长度在6到20个字符', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (value === formData.currentPassword) {
          return Promise.reject('新密码不能与当前密码相同')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
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
const handleChangePassword = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    // 模拟修改密码API调用
    await new Promise((resolve) => setTimeout(resolve, 2000))

    message.success('密码修改成功！请使用新密码登录')
    router.push('/login')
  } catch (error) {
    console.error('修改密码失败:', error)
    message.error('修改密码失败，请检查输入信息')
  } finally {
    loading.value = false
  }
}

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.change-password-page {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.change-password-container {
  background: white;
  border-radius: 12px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  display: flex;
  max-width: 1000px;
  width: 100%;
  max-height: 90vh;
}

.change-password-form-wrapper {
  flex: 1;
  padding: 30px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  overflow-y: auto;
}

.change-password-header {
  text-align: center;
  margin-bottom: 30px;
}

.change-password-title {
  font-size: 28px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.change-password-subtitle {
  color: #666;
  font-size: 16px;
}

.change-password-form {
  max-width: 400px;
  margin: 0 auto;
  width: 100%;
}

.change-button {
  height: 48px;
  font-size: 16px;
  font-weight: 500;
  margin-top: 10px;
}

.change-password-footer {
  text-align: center;
  margin-top: 20px;
}

.change-password-footer a {
  color: #1890ff;
  text-decoration: none;
}

.change-password-footer a:hover {
  text-decoration: underline;
}

.change-password-banner {
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

.security-tips {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.tip-item {
  display: flex;
  align-items: center;
  gap: 15px;
  font-size: 16px;
}

.tip-item .anticon {
  font-size: 20px;
  color: #ffd700;
}

/* 移动端适配 - 768px以下 */
@media (max-width: 768px) {
  .change-password-page {
    padding: 20px;
  }

  .change-password-container {
    flex-direction: column;
    max-width: 100%;
    max-height: 100vh;
  }

  .change-password-banner {
    display: none;
  }

  .change-password-form-wrapper {
    padding: 20px;
  }

  .change-password-title {
    font-size: 24px;
  }

  .change-password-subtitle {
    font-size: 14px;
  }
}
</style>
