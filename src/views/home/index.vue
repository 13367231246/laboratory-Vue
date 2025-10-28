<template>
  <div class="home-page">
    <!-- 欢迎横幅 -->
    <a-row :gutter="24" class="welcome-section">
      <a-col :span="24">
        <a-card class="welcome-card">
          <div class="welcome-content">
            <div class="welcome-text">
              <a-typography-title :level="2" class="welcome-title"> 欢迎使用实验室管理系统 </a-typography-title>
              <a-typography-paragraph class="welcome-desc"> 高效管理实验室资源，简化申请流程，提升使用体验 </a-typography-paragraph>
            </div>
            <div class="welcome-actions">
              <a-button type="primary" size="large" @click="goToApplication"> 立即申请 </a-button>
              <a-button size="large" @click="goToRepair"> 设备报修 </a-button>
            </div>
          </div>
        </a-card>
      </a-col>
    </a-row>

    <!-- 统计卡片 -->
    <a-row :gutter="24" class="stats-section">
      <a-col :xs="12" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic title="可用实验室" :value="stats.availableLabs" :value-style="{ color: '#3f8600' }">
            <template #prefix>
              <ExperimentOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic title="使用中实验室" :value="stats.usingLabs" :value-style="{ color: '#1890ff' }">
            <template #prefix>
              <ClockCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic title="待维修设备" :value="stats.pendingRepairs" :value-style="{ color: '#cf1322' }">
            <template #prefix>
              <ToolOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic title="今日申请" :value="stats.todayApplications" :value-style="{ color: '#722ed1' }">
            <template #prefix>
              <FileTextOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 快速操作 -->
    <a-row :gutter="24" class="quick-actions-section">
      <a-col :span="24">
        <a-card title="快速操作" class="quick-actions-card">
          <a-row :gutter="16">
            <a-col :xs="12" :sm="12" :md="8" :lg="6" v-for="action in quickActions" :key="action.key">
              <a-card class="action-card" :hoverable="true" @click="handleQuickAction(action.key)">
                <div class="action-content">
                  <div class="action-icon">
                    <component :is="action.icon" />
                  </div>
                  <div class="action-text">
                    <div class="action-title">{{ action.title }}</div>
                    <div class="action-desc">{{ action.description }}</div>
                  </div>
                </div>
              </a-card>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>

    <!-- 最近活动 -->
    <a-row :gutter="24" class="recent-activities-section">
      <a-col :xs="24" :lg="12">
        <a-card title="最近申请" class="activities-card">
          <a-list :data-source="recentApplications" :loading="loading">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <a @click="viewApplication(item.id)">{{ item.labName }}</a>
                  </template>
                  <template #description>
                    <div class="activity-meta">
                      <span class="applicant">申请人：{{ item.applicant }}</span>
                      <a-tag :color="getStatusColor(item.status)">{{ getStatusText(item.status) }}</a-tag>
                      <span class="activity-time">{{ item.createTime }}</span>
                    </div>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
      <a-col :xs="24" :lg="12">
        <a-card title="系统公告" class="activities-card">
          <a-list :data-source="notices" :loading="loading">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <a @click="viewNotice(item.id)">{{ item.title }}</a>
                  </template>
                  <template #description>
                    <div class="activity-meta">
                      <a-tag color="blue">公告</a-tag>
                      <span class="activity-time">{{ item.createTime }}</span>
                    </div>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ExperimentOutlined, ClockCircleOutlined, ToolOutlined, FileTextOutlined, SettingOutlined, TeamOutlined } from '@ant-design/icons-vue'
import { useLabStore } from '@/stores/lab'
import { useRepairStore } from '@/stores/repair'
import { useApplicationStore } from '@/stores/application'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const labStore = useLabStore()
const repairStore = useRepairStore()
const applicationStore = useApplicationStore()
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)

// 统计数据
const stats = computed(() => ({
  availableLabs: labStore.stats.availableLabs,
  usingLabs: labStore.stats.usingLabs,
  pendingRepairs: repairStore.stats.pending,
  todayApplications: applicationStore.stats.monthly
}))

// 快速操作配置
const quickActions = computed(() => {
  const baseActions = [
    {
      key: 'apply-lab',
      title: '申请实验室',
      description: '申请使用实验室',
      icon: ExperimentOutlined
    },
    {
      key: 'repair-report',
      title: '设备报修',
      description: '报告设备故障',
      icon: ToolOutlined
    }
  ]

  // 根据用户角色添加特定操作
  if (userStore.isTeacher) {
    baseActions.unshift({
      key: 'lab-management',
      title: '实验室管理',
      description: '管理实验室信息',
      icon: SettingOutlined
    })
    baseActions.unshift({
      key: 'repair-handling',
      title: '维修处理',
      description: '处理维修申请',
      icon: ToolOutlined
    })
  }

  return baseActions
})

// 最近申请数据
const recentApplications = computed(() => {
  return applicationStore.applications.slice(0, 5).map((app) => ({
    id: app.id,
    labName: app.labName,
    applicant: app.applicant,
    status: app.status,
    createTime: app.applyTime
  }))
})

// 系统公告数据
const notices = ref([
  {
    id: 1,
    title: '实验室使用规范更新通知',
    createTime: '2024-01-15 09:00'
  },
  {
    id: 2,
    title: '新设备使用培训安排',
    createTime: '2024-01-14 15:30'
  },
  {
    id: 3,
    title: '寒假期间实验室开放时间调整',
    createTime: '2024-01-13 11:20'
  },
  {
    id: 4,
    title: '实验室安全使用规范',
    createTime: '2024-01-12 10:15'
  },
  {
    id: 5,
    title: '新学期实验室开放时间调整',
    createTime: '2024-01-11 15:45'
  }
])

// 事件处理
const goToApplication = () => {
  router.push('/lab-application')
}

const goToRepair = () => {
  router.push('/repair-report')
}

const handleQuickAction = (key) => {
  const routeMap = {
    'lab-management': '/lab-management',
    'repair-handling': '/repair-handling',
    'apply-lab': '/lab-application',
    'repair-report': '/repair-report',
    'lab-search': '/lab-search',
    satisfaction: '/satisfaction',
    'satisfaction-detail': '/satisfaction-detail'
  }

  if (routeMap[key]) {
    router.push(routeMap[key])
  }
}

const viewApplication = (id) => {
  router.push(`/application-detail/${id}`)
}

const viewNotice = (id) => {
  router.push(`/notice-detail/${id}`)
}

const getStatusColor = (status) => {
  const colorMap = {
    pending: 'orange', // 待审核
    approved: 'green', // 已通过
    rejected: 'red', // 已拒绝
    in_use: 'blue', // 使用中
    completed: 'green', // 已完成
    cancelled: 'gray' // 已取消
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
    in_use: '使用中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || '未知状态'
}

// 生命周期
onMounted(() => {
  // 加载数据
  loadData()
})

const loadData = async () => {
  loading.value = true
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000))
    // 数据已经在store中，这里可以添加其他数据加载逻辑
  } catch (error) {
    console.error('加载数据失败:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
@import './index.scss';
</style>
