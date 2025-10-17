import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

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
    try {
      // 模拟API调用
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // 检查默认账号
      if (credentials.username === '123456' && credentials.password === '123456') {
        // 默认账号登录
        const userData = {
          id: 1,
          name: '张老师',
          role: 'teacher',
          username: credentials.username,
          idNumber: credentials.idNumber || 'T20230001',
          avatar: '',
          email: 'zhang@university.edu',
          phone: '13800138001',
          department: '计算机学院',
          isLoggedIn: true,
          token: 'mock_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
        }

        userInfo.value = userData

        // 保存到localStorage
        localStorage.setItem('userInfo', JSON.stringify(userData))
        localStorage.setItem('isLoggedIn', 'true')
        localStorage.setItem('token', userData.token)

        return { success: true, data: userData }
      }

      // 根据用户类型返回不同的用户信息
      let userData = {}
      switch (credentials.userType) {
        case 'teacher':
          userData = {
            id: 1,
            name: '张老师',
            role: 'teacher',
            username: credentials.username,
            idNumber: credentials.idNumber || 'T20230001',
            avatar: '',
            email: 'zhang@university.edu',
            phone: '13800138001',
            department: '计算机学院',
            isLoggedIn: true,
            token: 'mock_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
          }
          break
        case 'student':
          userData = {
            id: 2,
            name: '李同学',
            role: 'student',
            username: credentials.username,
            idNumber: credentials.idNumber || 'S20230001',
            avatar: '',
            email: 'li@student.edu',
            phone: '13800138002',
            department: '计算机学院',
            isLoggedIn: true,
            token: 'mock_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
          }
          break
      }

      userInfo.value = userData

      // 保存到localStorage
      localStorage.setItem('userInfo', JSON.stringify(userData))
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('token', userData.token)

      return { success: true, data: userData }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  // 登出 - 重置为未登录状态
  const logout = () => {
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
