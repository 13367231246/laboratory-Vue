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
          <a-form ref="profileFormRef" :model="profileForm" :rules="profileRules" layout="vertical"
            @finish="handleProfileSubmit">
            <a-row :gutter="24">
              <a-col :xs="24" :md="12">
                <a-form-item label="姓名" name="realName">
                  <a-input v-model:value="profileForm.realName" placeholder="请输入姓名" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="12">
                <a-form-item label="学号/学工号" name="studentId">
                  <a-input v-model:value="profileForm.studentId" disabled />
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

            <a-row :gutter="24">
              <a-col :xs="24" :md="8">
                <a-form-item label="学院" name="college">
                  <a-input v-model:value="profileForm.college" placeholder="请输入学院" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="8">
                <a-form-item label="专业" name="major">
                  <a-input v-model:value="profileForm.major" placeholder="请输入专业" />
                </a-form-item>
              </a-col>
              <a-col :xs="24" :md="8">
                <a-form-item label="班级" name="className">
                  <a-input v-model:value="profileForm.className" placeholder="请输入班级" />
                </a-form-item>
              </a-col>
            </a-row>

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
          <a-form ref="securityFormRef" :model="securityForm" :rules="securityRules" layout="vertical"
            @finish="handleSecuritySubmit">
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
import { modifyUserInfoService, modifyUserPasswordService, getUserInfoService } from '@/api/user'
import { saveLoginSuccess } from '@/utils/auth'
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

// 个人资料表单（与后端 User 字段保持一致）
const profileForm = reactive({
  id: userStore.userInfo.id,
  realName: userStore.userInfo.name || '',
  studentId: userStore.userInfo.idNumber,
  email: userStore.userInfo.email || '',
  phone: userStore.userInfo.phone || '',
  college: userStore.userInfo.college || '',
  major: userStore.userInfo.major || '',
  className: userStore.userInfo.className || '',
  status: userStore.userInfo.status ?? 1
})

// 安全设置表单
const securityForm = reactive({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
})

// 表单验证规则
const profileRules = {
  realName: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
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

// 更新个人资料 -> 调用后端 /user/updateInfo，然后重新获取并写入 auth/localStorage
const handleProfileSubmit = async () => {
  await profileFormRef.value.validate()
  profileLoading.value = true

  // 直接将当前表单（与后端 User 结构一致）作为入参
  const payload = { ...profileForm }

  // 1. 调用更新接口（code=0 即为成功，data 可能为 null）
  await modifyUserInfoService(payload)

  // 2. 更新成功后，再次获取最新用户信息
  const freshUser = await getUserInfoService().catch(() => {
    // 获取失败不阻断，但不更新 auth
    return null
  })

  if (freshUser) {
    // 3. 使用 auth 工具统一更新本地存储（token 使用当前已登录 token）
    const currentToken = userStore.userInfo.token
    if (currentToken) {
      saveLoginSuccess(currentToken, freshUser)
    }

    // 4. 同步更新 Pinia store 中的展示字段
    userStore.updateUserInfo({
      id: freshUser.id,
      name: freshUser.realName || freshUser.name,
      username: freshUser.username,
      idNumber: freshUser.studentId,
      email: freshUser.email,
      phone: freshUser.phone,
      role: freshUser.role,
      college: freshUser.college,
      major: freshUser.major,
      className: freshUser.className,
      status: freshUser.status
    })
  } else {
    // 如果 freshUser 为空，至少用刚刚提交的表单数据更新本地
    userStore.updateUserInfo({
      name: payload.realName,
      email: payload.email,
      phone: payload.phone
    })
  }

  message.success('个人资料更新成功')
  profileLoading.value = false
}

// 修改密码 -> 调用 /user/updatePwd
const handleSecuritySubmit = async () => {
  await securityFormRef.value.validate()
  securityLoading.value = true

  const payload = {
    old_pwd: securityForm.currentPassword,
    new_pwd: securityForm.newPassword,
    re_pwd: securityForm.confirmPassword
  }

  const result = await modifyUserPasswordService(payload).catch((error) => {
    message.error(error.message || '密码修改失败')
    securityLoading.value = false
    return null
  })

  if (result !== null) {
    message.success('密码修改成功，请重新登录')
    resetSecurityForm()
    securityLoading.value = false
    userStore.logout()
    router.push('/login')
  }
}

const resetProfileForm = () => {
  Object.assign(profileForm, {
    id: userStore.userInfo.id,
    realName: userStore.userInfo.name || '',
    studentId: userStore.userInfo.idNumber,
    email: userStore.userInfo.email || '',
    phone: userStore.userInfo.phone || '',
    college: userStore.userInfo.college || '',
    major: userStore.userInfo.major || '',
    className: userStore.userInfo.className || '',
    status: userStore.userInfo.status ?? 1
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
</style>
