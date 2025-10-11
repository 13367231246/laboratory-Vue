import { useUserStore } from '@/stores/user'

// 路由权限配置
const routePermissions = {
  // 公开路由 - 所有用户都可以访问
  public: ['/login', '/register', '/forgot-password', '/change-password'],

  // 访客可访问的路由 - 没登录的用户可以访问
  guestAccessible: ['/'],

  // 需要登录的路由 - 只有登录用户可以访问
  authenticated: ['/lab-application', '/repair-handling', '/repair-report', '/satisfaction'],

  // 仅教师可访问的路由
  teacherOnly: ['/lab-management']
}

// 检查用户是否有权限访问指定路由
function hasPermission(userRole, routePath, isLoggedIn) {
  // 公开路由，所有用户都可以访问
  if (routePermissions.public.includes(routePath)) {
    return true
  }

  // 访客可访问的路由 - 没登录的用户可以访问
  if (routePermissions.guestAccessible.includes(routePath)) {
    return true // 所有用户都可以访问
  }

  // 需要登录的路由
  if (routePermissions.authenticated.includes(routePath)) {
    return isLoggedIn // 只有登录用户可以访问
  }

  // 仅教师可访问的路由
  if (routePermissions.teacherOnly.includes(routePath)) {
    return isLoggedIn && userRole === 'teacher'
  }

  // 默认允许访问
  return true
}

// 路由守卫
export function setupRouterGuards(router) {
  // 全局前置守卫
  router.beforeEach((to, from, next) => {
    const userStore = useUserStore()

    // 初始化用户信息
    userStore.initUserInfo()

    const userRole = userStore.userInfo.role
    const isLoggedIn = userStore.isLoggedIn

    // 如果是公开路由，直接放行
    if (routePermissions.public.includes(to.path)) {
      next()
      return
    }

    // 检查权限
    if (hasPermission(userRole, to.path, isLoggedIn)) {
      // 对于需要登录的路由，检查是否已登录
      if (routePermissions.authenticated.includes(to.path) || routePermissions.teacherOnly.includes(to.path)) {
        if (!isLoggedIn) {
          // 未登录用户访问需要登录的页面，跳转到登录页
          next('/login')
          return
        }
      }

      // 有权限，放行
      next()
    } else {
      // 没有权限，根据用户状态决定跳转
      if (!isLoggedIn) {
        // 未登录用户，跳转到登录页
        next('/login')
      } else {
        // 已登录但权限不足，跳转到首页
        next('/')
      }
    }
  })

  // 全局后置钩子
  router.afterEach((to, from) => {
    // 可以在这里添加页面访问日志、页面标题设置等
    console.log(`路由跳转: ${from.path} -> ${to.path}`)
  })

  // 全局解析守卫
  router.beforeResolve((to, from, next) => {
    // 可以在这里添加数据预加载逻辑
    next()
  })

  // 全局错误处理
  router.onError((error) => {
    console.error('路由错误:', error)
  })
}

// 导出权限检查函数，供组件使用
export { hasPermission, routePermissions }
