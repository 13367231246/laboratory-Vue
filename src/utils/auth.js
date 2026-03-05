import storage from 'store'

// 登录表单（记住密码）
const LOGIN_FORM_KEY = 'LOGIN_FORM'
// 保存最近一次完整登录信息（包含用户与 token）
const LOGIN_INFO_KEY = 'LOGIN_INFO'
// 用户信息
const USER_INFO_KEY = 'USER_INFO'

//  本地设置登录信息（兼容旧结构，但推荐使用 saveLoginSuccess）
export const setLoginInfoStorageSync = (userId, accessToken) => {
  if (userId) {
    storage.set('userId', userId)
  }
  if (accessToken) {
    storage.set('accessToken', accessToken)
  }
  // 记录登录时间戳
  storage.set('loginTime', Date.now())
}

// 获取登录信息（兼容 LOGIN_INFO_KEY 与旧字段）
export const getLoginInfoStorageSync = () => {
  const info = storage.get(LOGIN_INFO_KEY)
  if (info) {
    return info
  }
  return {
    userId: storage.get('userId'),
    accessToken: storage.get('accessToken'),
    loginTime: storage.get('loginTime')
  }
}

// 删除登录信息
export const removeLoginInfoStorageSync = () => {
  storage.remove(LOGIN_INFO_KEY)
  storage.remove('userId')
  storage.remove('accessToken')
  storage.remove('loginTime')
}

// 设置token
export const setToken = (token) => {
  if (token) {
    storage.set('accessToken', token)
  }
}

// 获取token
export const getToken = () => {
  return storage.get('accessToken')
}

// ============= 用户信息管理 =============

// 设置用户信息
export const setUserInfo = (userInfo) => {
  if (userInfo) {
    storage.set(USER_INFO_KEY, userInfo)
  }
}

// 获取用户信息
export const getUserInfo = () => {
  return storage.get(USER_INFO_KEY) || {}
}

// 更新用户信息
export const updateUserInfo = (updates) => {
  const currentInfo = getUserInfo()
  const newInfo = { ...currentInfo, ...updates }
  storage.set(USER_INFO_KEY, newInfo)
  return newInfo
}

// 清除用户信息
export const clearUserInfo = () => {
  storage.remove(USER_INFO_KEY)
}

// 清除token相关信息
export const clearTokens = () => {
  removeLoginInfoStorageSync()
}

// 登录成功后统一保存 token 与用户信息
// data 结构示例：
// {
//   id: 6,
//   username: 'teacher002',
//   realName: 'teacher002',
//   studentId: 'T2024001',
//   phone: '13800138006',
//   email: 'teacherwang@example.com',
//   role: 'teacher',
//   ...
// }
export const saveLoginSuccess = (token, data) => {
  if (!token || !data) {
    return
  }

  const loginInfo = {
    userId: data.id,
    username: data.username,
    realName: data.realName,
    studentId: data.studentId,
    phone: data.phone,
    email: data.email,
    role: data.role,
    status: data.status,
    college: data.college,
    major: data.major,
    className: data.className,
    createTime: data.createTime,
    updateTime: data.updateTime,
    token
  }

  storage.set(LOGIN_INFO_KEY, loginInfo)
  setToken(token)
  setUserInfo(loginInfo)
}
// 获得用户ID
export const getUserId = () => {
  return storage.get('userId')
}

// ============= 登录表单管理 =============

// 存储登录表单信息
export const setLoginForm = (data) => {
  if (data && data.remember) {
    storage.set(LOGIN_FORM_KEY, {
      mobile: data.mobile,
      password: data.password,
      remember: true,
      savedAt: Date.now()
    })
  } else {
    storage.remove(LOGIN_FORM_KEY)
  }
}

// 获取登录表单信息
export const getLoginForm = () => {
  const saved = storage.get(LOGIN_FORM_KEY)
  if (saved) {
    // 检查保存时间，超过30天则清除
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    if (saved.savedAt < thirtyDaysAgo) {
      storage.remove(LOGIN_FORM_KEY)
      return { mobile: '', password: '', remember: false }
    }
    return {
      mobile: saved.mobile || '',
      password: saved.password || '',
      remember: saved.remember || false
    }
  }
  return { mobile: '', password: '', remember: false }
}

// 完整的登出清理
export const logout = () => {
  clearUserInfo()
  clearTokens()
  // 清除其他可能的缓存数据
  storage.remove('CART_DATA')
  storage.remove('SEARCH_HISTORY')
}
