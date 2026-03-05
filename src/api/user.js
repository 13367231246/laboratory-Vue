import request from '@/utils/request'

// 注册axios实例
export const userRegisterService = (data) => {
  return request.post('/user/register', data)
}

// 登录axios实例
export const userLoginService = (data) => {
  return request.post('/user/login', data)
}
// 获取用户信息axios实例
export const getUserInfoService = () => {
  return request.get('/user/userInfo')
}

// 修改用户信息axios实例 - 接收完整的 User 对象
export const modifyUserInfoService = (user) => {
  return request.put('/user/updateInfo', user)
}
//修改用户密码
export const modifyUserPasswordService = ({ old_pwd, new_pwd, re_pwd }) => {
  return request.patch('/user/updatePwd', {
    old_pwd,
    new_pwd,
    re_pwd
  })
}

// 上传头像axios实例
export const uploadAvatarService = (avatarUrl) => {
  const params = new URLSearchParams()
  params.append('avatarUrl', avatarUrl)
  return request.patch('/user/updateAvatar', params)
}

