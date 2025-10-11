import { useUserStore } from '@/stores/user'

// HTTP请求拦截器
export function setupRequestInterceptor(axiosInstance) {
  // 请求拦截器
  axiosInstance.interceptors.request.use(
    (config) => {
      const userStore = useUserStore()

      // 添加认证token
      if (userStore.userInfo.token) {
        config.headers.Authorization = `Bearer ${userStore.userInfo.token}`
      }

      // 添加请求时间戳
      config.metadata = { startTime: new Date() }

      // 添加用户信息到请求头
      if (userStore.userInfo.role) {
        config.headers['X-User-Role'] = userStore.userInfo.role
      }

      console.log('发送请求:', {
        url: config.url,
        method: config.method,
        headers: config.headers,
        userRole: userStore.userInfo.role
      })

      return config
    },
    (error) => {
      console.error('请求拦截器错误:', error)
      return Promise.reject(error)
    }
  )
}

// HTTP响应拦截器
export function setupResponseInterceptor(axiosInstance) {
  // 响应拦截器
  axiosInstance.interceptors.response.use(
    (response) => {
      const userStore = useUserStore()

      // 计算请求耗时
      if (response.config.metadata) {
        const endTime = new Date()
        const duration = endTime - response.config.metadata.startTime
        console.log(`请求完成: ${response.config.url} (${duration}ms)`)
      }

      // 处理成功响应
      console.log('收到响应:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      })

      return response
    },
    (error) => {
      const userStore = useUserStore()

      console.error('响应错误:', {
        url: error.config?.url,
        status: error.response?.status,
        message: error.message,
        data: error.response?.data
      })

      // 处理401未授权错误
      if (error.response?.status === 401) {
        console.log('用户未授权，清除登录状态')
        userStore.logout()

        // 跳转到登录页（如果在浏览器环境中）
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
      }

      // 处理403禁止访问错误
      if (error.response?.status === 403) {
        console.log('用户权限不足')
        // 可以显示权限不足的提示
        if (typeof window !== 'undefined') {
          // 这里可以触发全局通知组件
          console.warn('权限不足，无法访问该资源')
        }
      }

      // 处理网络错误
      if (!error.response) {
        console.error('网络错误:', error.message)
        // 可以显示网络错误提示
      }

      return Promise.reject(error)
    }
  )
}

// 设置所有拦截器
export function setupInterceptors(axiosInstance) {
  setupRequestInterceptor(axiosInstance)
  setupResponseInterceptor(axiosInstance)
}

// 导出拦截器配置
export default {
  setupRequestInterceptor,
  setupResponseInterceptor,
  setupInterceptors
}
