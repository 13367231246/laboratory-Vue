# 路由权限系统

## 概述

本系统实现了基于角色的路由访问控制，支持访客、学生、教师三种用户角色，每种角色有不同的页面访问权限。

## 文件结构

- `index.js` - 路由配置
- `guards.js` - 路由守卫和权限控制
- `README.md` - 权限系统说明文档

## 用户角色

### 1. 访客（未登录用户）

- **默认身份**：系统启动时默认为未登录状态，未登录的用户就是访客
- **可访问页面**：
  - 首页 (`/`)
  - 登录页 (`/login`)
  - 注册页 (`/register`)
  - 忘记密码页 (`/forgot-password`)
  - 修改密码页 (`/change-password`)
- **限制**：无法访问需要登录的功能页面

### 2. 学生 (student)

- **登录方式**：通过登录页面选择学生身份登录
- **可访问页面**：
  - 所有访客可访问的页面
  - 实验室申请 (`/lab-application`)
  - 维修处理 (`/repair-handling`)
  - 维修报告 (`/repair-report`)
  - 满意度调查 (`/satisfaction`)
- **限制**：无法访问实验室管理页面

### 3. 教师 (teacher)

- **登录方式**：通过登录页面选择教师身份登录
- **可访问页面**：
  - 所有学生可访问的页面
  - 实验室管理 (`/lab-management`) - **仅教师可访问**
- **权限**：拥有最高权限，可以访问所有功能

## 路由权限配置

```javascript
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
```

## 访问控制逻辑

1. **公开路由**：所有用户都可以访问，无需登录
2. **访客可访问路由**：没登录的用户和登录用户都可以访问
3. **需要登录的路由**：只有已登录的用户可以访问
4. **仅教师可访问路由**：只有已登录的教师用户可以访问

## 路由守卫行为

- **未登录用户**访问需要登录的页面 → 跳转到登录页
- **学生用户**访问教师专用页面 → 跳转到首页
- **权限不足**的用户访问受限页面 → 跳转到首页

## 使用方法

### 在组件中检查权限

```javascript
import { useUserStore } from '@/stores/user'
import { hasPermission } from '@/router/guards'

export default {
  setup() {
    const userStore = useUserStore()

    // 检查是否有权限访问某个页面
    const canAccessLabManagement = hasPermission(userStore.userInfo.role, '/lab-management', userStore.isLoggedIn)

    return {
      canAccessLabManagement
    }
  }
}
```

### 在模板中根据角色显示内容

```vue
<template>
  <div>
    <!-- 只有教师可以看到 -->
    <div v-if="userStore.isTeacher">
      <router-link to="/lab-management">实验室管理</router-link>
    </div>

    <!-- 学生和教师都可以看到 -->
    <div v-if="userStore.isStudent || userStore.isTeacher">
      <router-link to="/lab-application">实验室申请</router-link>
    </div>

    <!-- 所有用户都可以看到 -->
    <div>
      <router-link to="/">首页</router-link>
    </div>
  </div>
</template>
```

## 测试

开发环境下会自动运行路由权限测试，可以在浏览器控制台查看测试结果。

## 注意事项

1. 系统启动时默认为未登录状态，未登录的用户就是访客
2. 访客可以访问首页，但无法使用需要登录的功能
3. 实验室管理页面仅对教师开放
4. 所有权限检查都在路由守卫中进行，确保安全性
