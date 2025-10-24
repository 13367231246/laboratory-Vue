<template>
  <a-layout-header class="header">
    <div class="header-content">
      <!-- Logo 和标题 -->
      <div class="logo">
        <img src="../../assets/laboratory.png" width="30" alt="logo" />
      </div>

      <!-- 桌面端导航菜单 -->
      <a-menu v-model:selectedKeys="selectedKeys" mode="horizontal" class="nav-menu desktop-menu" :items="menuItems" @click="handleMenuClick" />

      <!-- 右侧功能区 -->
      <div class="header-right">
        <!-- 通知铃铛 -->
        <a-badge :count="messageCount" :offset="[-5, 5]">
          <a-button type="text" class="notification-btn" @click="showMessages">
            <BellOutlined />
          </a-button>
        </a-badge>

        <!-- 用户信息 -->
        <template v-if="userStore.isLoggedIn">
          <a-dropdown :trigger="['hover']">
            <a-button type="text" class="user-info">
              <a-avatar :src="userInfo.avatar" :size="32">
                {{ userInfo.name?.charAt(0) }}
              </a-avatar>
              <span class="username desktop-username">{{ userInfo.name }}</span>
            </a-button>
            <template #overlay>
              <a-menu @click="handleUserMenuClick">
                <a-menu-item key="profile">
                  <UserOutlined />
                  个人中心
                </a-menu-item>
                <a-menu-item key="settings">
                  <SettingOutlined />
                  用户设置
                </a-menu-item>
                <a-menu-divider />
                <a-menu-item key="logout">
                  <LogoutOutlined />
                  退出登录
                </a-menu-item>
              </a-menu>
            </template>
          </a-dropdown>
        </template>
        <template v-else>
          <a-button type="text" class="login-btn" @click="goToLogin"> 未登录 </a-button>
        </template>

        <!-- 移动端汉堡菜单按钮 -->
        <a-dropdown v-model:open="mobileMenuVisible" placement="bottomRight" :trigger="['hover']" :get-popup-container="getPopupContainer" :overlay-style="{ position: 'fixed' }">
          <a-button type="text" class="hamburger-btn">
            <MenuOutlined />
          </a-button>
          <template #overlay>
            <div class="mobile-dropdown-menu">
              <!-- 菜单项 -->
              <a-menu v-model:selectedKeys="selectedKeys" mode="vertical" class="mobile-menu" :items="mobileMenuItems" @click="handleMobileMenuClick" />
            </div>
          </template>
        </a-dropdown>
      </div>
    </div>
  </a-layout-header>
</template>

<script setup>
import { ref, computed, onMounted, h } from 'vue'
import { useRouter } from 'vue-router'
import { BellOutlined, DownOutlined, UserOutlined, SettingOutlined, LogoutOutlined, HomeOutlined, ExperimentOutlined, ToolOutlined, FileTextOutlined, TeamOutlined, MenuOutlined, CloseOutlined } from '@ant-design/icons-vue'
import { message } from 'ant-design-vue'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const selectedKeys = ref(['home'])
const messageCount = ref(3)
const mobileMenuVisible = ref(false)

// 用户信息
const userInfo = computed(() => userStore.userInfo)

// 菜单项配置
const menuItems = computed(() => {
  const baseItems = [
    {
      key: 'home',
      icon: () => h(HomeOutlined),
      label: '首页'
    }
  ]

  // 根据用户角色显示不同菜单
  if (userInfo.value.role === 'teacher') {
    baseItems.push(
      {
        key: 'lab-management',
        icon: () => h(ExperimentOutlined),
        label: '实验室管理'
      },
      {
        key: 'lab-application',
        icon: () => h(FileTextOutlined),
        label: '申请实验室'
      },
      {
        key: 'application-record',
        icon: () => h(FileTextOutlined),
        label: '申请记录'
      },
      {
        key: 'repair-handling',
        icon: () => h(ToolOutlined),
        label: '维修处理'
      }
    )
  } else if (userInfo.value.role === 'student') {
    baseItems.push(
      {
        key: 'lab-application',
        icon: () => h(FileTextOutlined),
        label: '申请实验室'
      },
      {
        key: 'application-record',
        icon: () => h(FileTextOutlined),
        label: '申请记录'
      }
    )
  }

  // 所有用户都有的菜单
  baseItems.push({
    key: 'satisfaction',
    icon: () => h(TeamOutlined),
    label: '满意度评价'
  })

  return baseItems
})

// 移动端菜单项配置
const mobileMenuItems = computed(() => {
  const baseItems = [
    {
      key: 'home',
      icon: () => h(HomeOutlined),
      label: '首页'
    }
  ]

  // 根据用户角色显示不同菜单
  if (userInfo.value.role === 'teacher') {
    baseItems.push(
      {
        key: 'lab-management',
        icon: () => h(ExperimentOutlined),
        label: '实验室管理'
      },
      {
        key: 'lab-application',
        icon: () => h(FileTextOutlined),
        label: '申请实验室'
      },
      {
        key: 'application-record',
        icon: () => h(FileTextOutlined),
        label: '申请记录'
      },
      {
        key: 'repair-handling',
        icon: () => h(ToolOutlined),
        label: '维修处理'
      }
    )
  } else if (userInfo.value.role === 'student') {
    baseItems.push(
      {
        key: 'lab-application',
        icon: () => h(FileTextOutlined),
        label: '申请实验室'
      },
      {
        key: 'application-record',
        icon: () => h(FileTextOutlined),
        label: '申请记录'
      }
    )
  }

  // 所有用户都有的菜单
  baseItems.push({
    key: 'satisfaction',
    icon: () => h(TeamOutlined),
    label: '满意度评价'
  })

  return baseItems
})

// 事件处理
const handleMenuClick = ({ key }) => {
  selectedKeys.value = [key]

  const routeMap = {
    home: '/',
    'lab-management': '/lab-management',
    'lab-application': '/lab-application',
    'application-record': '/application-record',
    'repair-handling': '/repair-handling',
    satisfaction: '/satisfaction',
    message: '/message'
  }

  if (routeMap[key]) {
    router.push(routeMap[key])
  }
}

const handleUserMenuClick = ({ key }) => {
  switch (key) {
    case 'profile':
      router.push('/profile')
      break
    case 'settings':
      router.push('/settings')
      break
    case 'logout':
      handleLogout()
      break
  }
}

const showMessages = () => {
  router.push('/message')
}

const handleLogout = () => {
  userStore.logout()
  message.success('已退出登录')
  router.push('/login')
}

const goToLogin = () => {
  router.push('/login')
}

// 安全的获取弹出容器方法
const getPopupContainer = () => {
  // 检查 document 是否存在
  if (typeof document === 'undefined') {
    return null
  }

  // 优先使用 body，如果不存在则使用 documentElement
  return document.body || document.documentElement || document
}

// 移动端菜单控制
const toggleMobileMenu = () => {
  mobileMenuVisible.value = !mobileMenuVisible.value
}

const closeMobileMenu = () => {
  mobileMenuVisible.value = false
}

const handleMobileMenuClick = ({ key }) => {
  selectedKeys.value = [key]
  closeMobileMenu()

  const routeMap = {
    home: '/',
    'lab-management': '/lab-management',
    'lab-application': '/lab-application',
    'application-record': '/application-record',
    'repair-handling': '/repair-handling',
    satisfaction: '/satisfaction',
    message: '/message'
  }

  if (routeMap[key]) {
    router.push(routeMap[key])
  }
}

// 生命周期
onMounted(() => {
  // 初始化用户信息
  userStore.initUserInfo()

  // 根据当前路由设置选中的菜单项
  const currentPath = router.currentRoute.value.path
  const pathToKey = {
    '/': 'home',
    '/lab-management': 'lab-management',
    '/lab-application': 'lab-application',
    '/repair-handling': 'repair-handling',
    '/satisfaction': 'satisfaction',
    '/message': 'message'
  }

  if (pathToKey[currentPath]) {
    selectedKeys.value = [pathToKey[currentPath]]
  }
})
</script>

<style scoped>
@import './index.scss';
</style>
