import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { userLoginService, getUserInfoService } from '@/api/user'
import { saveLoginSuccess, logout as authLogout } from '@/utils/auth'

export const useUserStore = defineStore('user', () => {
  // 用户信息 - 默认为未登录状态
  const userInfo = ref({
    id: null,
    name: '',
    role: '', // teacher, student
    username: '',
    idNumber: '',
    avatar: '',
    email: '',
    phone: '',
    department: '',
    isLoggedIn: false,
    token: ''
  })

  // 计算属性
  const isTeacher = computed(() => userInfo.value.role === 'teacher')
  const isStudent = computed(() => userInfo.value.role === 'student')
  const isVisitor = computed(() => !userInfo.value.isLoggedIn) // 没登录的就是访客
  const isLoggedIn = computed(() => userInfo.value.isLoggedIn)

  // 登录
  const login = async (credentials) => {
    // 调用登录API
    const token = await userLoginService({
      password: credentials.password,
      studentId: credentials.idNumber,
      phone: credentials.username,
      role: credentials.userType
    })
    console.log('token',token)

    // 登录成功，保存token
    userInfo.value.token = token
    userInfo.value.isLoggedIn = true
    userInfo.value.role = credentials.userType
    userInfo.value.phone = credentials.username
    userInfo.value.idNumber = credentials.idNumber

    // 获取用户详细信息
    const userDetail = await getUserInfoService()

    if (userDetail) {
      userInfo.value = {
        ...userInfo.value,
        id: userDetail.id,
        name: userDetail.realName || userDetail.name,
        username: userDetail.username || credentials.username,
        email: userDetail.email || '',
        avatar: userDetail.avatar || '',
        department: userDetail.department || ''
      }
    }

    // 统一保存到 auth 本地存储
    saveLoginSuccess(token, userDetail || {
      id: userInfo.value.id,
      username: userInfo.value.username,
      realName: userInfo.value.name,
      studentId: userInfo.value.idNumber,
      phone: userInfo.value.phone,
      email: userInfo.value.email,
      role: userInfo.value.role,
      status: 1
    })

    // 保存到localStorage
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
    localStorage.setItem('isLoggedIn', 'true')
    localStorage.setItem('token', token)

    return { success: true, data: userInfo.value }
  }

  // 登出 - 重置为未登录状态
  const logout = () => {
    authLogout()

    userInfo.value = {
      id: null,
      name: '',
      role: '',
      username: '',
      idNumber: '',
      avatar: '',
      email: '',
      phone: '',
      department: '',
      isLoggedIn: false,
      token: ''
    }

    localStorage.removeItem('userInfo')
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('token')
  }

  // 初始化用户信息
  const initUserInfo = () => {
    const savedUserInfo = localStorage.getItem('userInfo')
    const isLoggedIn = localStorage.getItem('isLoggedIn')
    const token = localStorage.getItem('token')

    if (savedUserInfo && isLoggedIn === 'true' && token) {
      try {
        const parsedUserInfo = JSON.parse(savedUserInfo)
        userInfo.value = { ...parsedUserInfo, token }
      } catch (error) {
        console.error('解析用户信息失败:', error)
        logout()
      }
    }
  }

  // 更新用户信息
  const updateUserInfo = (newInfo) => {
    userInfo.value = { ...userInfo.value, ...newInfo }
    localStorage.setItem('userInfo', JSON.stringify(userInfo.value))
  }

  return {
    userInfo,
    isTeacher,
    isStudent,
    isVisitor,
    isLoggedIn,
    login,
    logout,
    initUserInfo,
    updateUserInfo
  }
})
