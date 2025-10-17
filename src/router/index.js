import { createRouter, createWebHistory } from 'vue-router'
import Layout from '../views/index.vue'
import HomeView from '../views/home/HomeView.vue'
import { setupRouterGuards } from './guards'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // 主应用路由（带布局）
    {
      path: '/',
      component: Layout,
      children: [
        {
          path: '/',
          name: 'home',
          component: HomeView
        },
        // 登录相关路由（独立页面）
        {
          path: '/login',
          name: 'login',
          component: () => import('@/views/login/Login.vue')
        },
        {
          path: '/register',
          name: 'register',
          component: () => import('@/views/login/Register.vue')
        },
        {
          path: '/forgot-password',
          name: 'forgot-password',
          component: () => import('@/views/login/ForgotPassword.vue')
        },
        {
          path: '/change-password',
          name: 'change-password',
          component: () => import('@/views/login/ChangePassword.vue')
        },
        {
          path: 'lab-management',
          name: 'lab-management',
          component: () => import('@/views/lab/LabManagement.vue')
        },
        {
          path: 'equipment-details/:id',
          name: 'equipment-details',
          component: () => import('@/views/lab/equipment-details/index.vue')
        },
        {
          path: 'application-record',
          name: 'application-record',
          component: () => import('@/views/apprecord/index.vue')
        },
        {
          path: 'lab-add',
          name: 'lab-add',
          component: () => import('@/views/lab/add-laboratory/index.vue')
        },
        {
          path: 'lab-application',
          name: 'lab-application',
          component: () => import('@/views/application/LabApplication.vue')
        },
        {
          path: 'repair-handling',
          name: 'repair-handling',
          component: () => import('@/views/repair/RepairHandling.vue')
        },
        {
          path: 'repair-report',
          name: 'repair-report',
          component: () => import('@/views/repair/RepairReport.vue')
        },
        {
          path: 'satisfaction',
          name: 'satisfaction',
          component: () => import('@/views/satisfaction/Satisfaction.vue')
        },
        {
          path: 'satisfaction-detail',
          name: 'satisfaction-detail',
          component: () => import('@/views/satisfaction/ReviewDetails.vue')
        },
        {
          path: 'profile',
          name: 'profile',
          component: () => import('@/views/userInfo/index.vue')
        },
        {
          path: 'settings',
          name: 'settings',
          component: () => import('@/views/setting/index.vue')
        },
        {
          path: 'message',
          name: 'message',
          component: () => import('@/views/message/index.vue')
        }
      ]
    }
  ]
})

// 设置路由守卫
setupRouterGuards(router)

export default router
