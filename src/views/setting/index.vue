<template>
  <div class="user-settings-page">
    <a-row :gutter="24">
      <!-- 设置菜单 -->
      <a-col :xs="24" :lg="6">
        <div class="settings-menu-card">
          <a-menu v-model:selectedKeys="selectedMenu" :mode="menuMode" @click="handleMenuClick">
            <a-menu-item key="profile">
              <UserOutlined />
              个人资料
            </a-menu-item>
            <a-menu-item key="security">
              <SafetyOutlined />
              安全设置
            </a-menu-item>
          </a-menu>
        </div>
      </a-col>

      <!-- 右侧设置内容 -->
      <a-col :xs="24" :lg="18">
        <!-- 个人资料设置 -->
        <a-card v-if="selectedMenu.includes('profile')" title="个人资料" class="settings-content-card">
          <a-form ref="profileFormRef" :model="profileForm" :rules="profileRules" layout="vertical" @finish="handleProfileSubmit">
            <a-row :gutter="24">
              <a-col :xs="24" :md="12">
                <a-form-item label="头像" name="avatar">
                  <div class="avatar-upload">
                    <a-avatar :size="80" :src="profileForm.avatar">
                      {{ profileForm.name?.charAt(0) }}
                    </a-avatar>
                    <a-upload :show-upload-list="false" :before-upload="beforeAvatarUpload" @change="handleAvatarChange">
                      <a-button type="link">更换头像</a-button>
                    </a-upload>
                  </div>
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item label="姓名" name="name">
                  <a-input v-model:value="profileForm.name" placeholder="请输入姓名" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-row :gutter="24">
              <a-col :xs="24" :md="12">
                <a-form-item label="邮箱" name="email">
                  <a-input v-model:value="profileForm.email" placeholder="请输入邮箱" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item label="手机号" name="phone">
                  <a-input v-model:value="profileForm.phone" placeholder="请输入手机号" />
                </a-form-item>
              </a-col>
            </a-row>

            <a-form-item label="个人简介" name="bio">
              <a-textarea v-model:value="profileForm.bio" placeholder="请输入个人简介" :rows="4" />
            </a-form-item>

            <a-form-item>
              <a-space>
                <a-button type="primary" html-type="submit" :loading="profileLoading">保存</a-button>
                <a-button @click="resetProfileForm">重置</a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </a-card>

        <!-- 安全设置 -->
        <a-card v-if="selectedMenu.includes('security')" title="安全设置" class="settings-content-card">
          <a-form ref="securityFormRef" :model="securityForm" :rules="securityRules" layout="vertical" @finish="handleSecuritySubmit">
            <a-form-item label="当前密码" name="currentPassword">
              <a-input-password v-model:value="securityForm.currentPassword" placeholder="请输入当前密码" />
            </a-form-item>

            <a-form-item label="新密码" name="newPassword">
              <a-input-password v-model:value="securityForm.newPassword" placeholder="请输入新密码" />
            </a-form-item>

            <a-form-item label="确认新密码" name="confirmPassword">
              <a-input-password v-model:value="securityForm.confirmPassword" placeholder="请再次输入新密码" />
            </a-form-item>

            <a-form-item>
              <a-space>
                <a-button type="primary" html-type="submit" :loading="securityLoading">修改密码</a-button>
                <a-button @click="resetSecurityForm">重置</a-button>
              </a-space>
            </a-form-item>
          </a-form>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { message } from 'ant-design-vue'
import { UserOutlined, SafetyOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const selectedMenu = ref(['profile'])
const profileLoading = ref(false)
const securityLoading = ref(false)

// 菜单模式 - 响应式
const menuMode = ref('vertical')

// 表单引用
const profileFormRef = ref()
const securityFormRef = ref()

// 个人资料表单
const profileForm = reactive({
  name: userStore.userInfo.name || '',
  email: userStore.userInfo.email || '',
  phone: userStore.userInfo.phone || '',
  bio: userStore.userInfo.bio || '',
  avatar: userStore.userInfo.avatar || ''
})

// 安全设置表单
const securityForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const profileRules = {
  name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
  email: [
    { required: true, message: '请输入邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }]
}

const securityRules = {
  currentPassword: [{ required: true, message: '请输入当前密码', trigger: 'blur' }],
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于6位', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value) => {
        if (value !== securityForm.newPassword) {
          return Promise.reject('两次输入的密码不一致')
        }
        return Promise.resolve()
      },
      trigger: 'blur'
    }
  ]
}

// 方法
const handleMenuClick = ({ key }) => {
  selectedMenu.value = [key]
}

const beforeAvatarUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件!')
    return false
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片大小不能超过 2MB!')
    return false
  }
  return false // 阻止自动上传
}

const handleAvatarChange = (info) => {
  if (info.file.status === 'done') {
    profileForm.avatar = info.file.response?.url || info.file.thumbUrl
  }
}

const handleProfileSubmit = async () => {
  try {
    await profileFormRef.value.validate()
    profileLoading.value = true

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 更新用户信息
    userStore.updateUserInfo(profileForm)
    message.success('个人资料更新成功')
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    profileLoading.value = false
  }
}

const handleSecuritySubmit = async () => {
  try {
    await securityFormRef.value.validate()
    securityLoading.value = true

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000))

    message.success('密码修改成功')
    resetSecurityForm()
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    securityLoading.value = false
  }
}

const resetProfileForm = () => {
  Object.assign(profileForm, {
    name: userStore.userInfo.name || '',
    email: userStore.userInfo.email || '',
    phone: userStore.userInfo.phone || '',
    bio: userStore.userInfo.bio || '',
    avatar: userStore.userInfo.avatar || ''
  })
}

const resetSecurityForm = () => {
  Object.assign(securityForm, {
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
}

// 检测屏幕尺寸
const checkScreenSize = () => {
  if (window.innerWidth <= 768) {
    menuMode.value = 'horizontal'
  } else {
    menuMode.value = 'vertical'
  }
}

// 生命周期
onMounted(() => {
  // 初始化数据
  checkScreenSize()
  window.addEventListener('resize', checkScreenSize)
})
</script>

<style scoped lang="scss">
.user-settings-page {
  margin-top: 10px;
}
.settings-menu-card {
  padding: 10px 8px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.settings-content-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
}

.avatar-upload {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .settings-menu-card {
    margin-bottom: 16px;
  }

  .avatar-upload {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  // 水平菜单样式
  :deep(.ant-menu-horizontal) {
    border-bottom: none;
    display: flex;
    justify-content: center;
  }

  :deep(.ant-menu-horizontal .ant-menu-item) {
    flex: 1;
    text-align: center;
    border-radius: 6px;
    margin: 0 4px;
  }

  :deep(.ant-menu-horizontal .ant-menu-item-selected) {
    background-color: #e6f7ff;
    color: #1890ff;
  }
}
</style>
