<template>
  <div class="user-profile-page">
    <!-- 用户信息卡片 -->
    <a-card class="profile-card">
      <div class="profile-header">
        <div class="avatar-section">
          <a-avatar :size="80" :src="userInfo.avatar">
            {{ userInfo.name?.charAt(0) }}
          </a-avatar>
          <div class="user-basic-info">
            <h2>{{ userInfo.name }}</h2>
            <p class="user-role">{{ getRoleText(userInfo.role) }}</p>
            <p class="user-id">学号/学工号：{{ userInfo.idNumber || '未设置' }}</p>
            <p class="user-email">{{ userInfo.email || '未设置邮箱' }}</p>
          </div>
        </div>
        <a-button type="primary" @click="editProfile">
          <EditOutlined />
        </a-button>
      </div>
    </a-card>

    <!-- 统计信息 -->
    <a-row :gutter="24" class="stats-section">
      <a-col :xs="12" :sm="8" :md="6">
        <a-card class="stat-card">
          <a-statistic title="申请次数" :value="userStats.labApplicationCount" :value-style="{ color: '#1890ff' }">
            <template #prefix>
              <FileTextOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="8" :md="6">
        <a-card class="stat-card">
          <a-statistic title="报修次数" :value="userStats.maintenanceApplicationCount" :value-style="{ color: '#fa8c16' }">
            <template #prefix>
              <ToolOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="8" :md="6">
        <a-card class="stat-card">
          <a-statistic title="维修数" :value="userStats.maintenanceCompletedCount" :value-style="{ color: '#52c41a' }">
            <template #prefix>
              <ToolOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="8" :md="6">
        <a-card class="stat-card">
          <a-statistic title="使用实验室数" :value="userStats.usedLaboratoryCount" :value-style="{ color: '#722ed1' }">
            <template #prefix>
              <ExperimentOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 快速操作 -->
    <a-card title="快速操作" class="quick-actions-card">
      <div class="quick-actions-content">
        <a-button type="primary" block @click="goToApplication">
          <FileTextOutlined />
          申请实验室
        </a-button>
        <a-button block @click="goToRecords">
          <HistoryOutlined />
          申请记录
        </a-button>
        <a-button block @click="goToRepair">
          <ToolOutlined />
          设备报修
        </a-button>
        <a-button block @click="goToSettings">
          <SettingOutlined />
          个人设置
        </a-button>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { getMyStatistics } from '@/api/labApplication'
import { EditOutlined, FileTextOutlined, ClockCircleOutlined, ToolOutlined, StarOutlined, HistoryOutlined, SettingOutlined, ExperimentOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const userStore = useUserStore()

// 用户信息
const userInfo = computed(() => {
  console.log('userInfo111', userStore.userInfo)
  return userStore.userInfo
})

// 用户统计数据
const userStats = ref({
  labApplicationCount: 0,
  maintenanceApplicationCount: 0,
  maintenanceCompletedCount: 0,
  usedLaboratoryCount: 0
})

// 方法
const getRoleText = (role) => {
  const roleMap = {
    teacher: '教师',
    student: '学生'
  }
  return roleMap[role] || '未知'
}

const editProfile = () => {
  router.push('/settings')
}

const goToApplication = () => {
  router.push('/lab-application')
}

const goToRecords = () => {
  router.push('/application-record')
}

const goToRepair = () => {
  router.push('/repair-report')
}

const goToSettings = () => {
  router.push('/settings')
}

// 加载用户统计数据
const loadUserStats = async () => {
  try {
    const data = await getMyStatistics()
    userStats.value = {
      labApplicationCount: data?.labApplicationCount ?? 0,
      maintenanceApplicationCount: data?.maintenanceApplicationCount ?? 0,
      maintenanceCompletedCount: data?.maintenanceCompletedCount ?? 0,
      usedLaboratoryCount: data?.usedLaboratoryCount ?? 0
    }
  } catch (error) {
    console.error('加载用户统计失败:', error)
  }
}

// 生命周期
onMounted(async () => {
  loadUserStats()
})
</script>

<style scoped lang="scss">
.profile-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.profile-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.avatar-section {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-basic-info {
  h2 {
    margin: 0 0 8px 0;
    color: #333;
    font-size: 24px;
    font-weight: 600;
  }

  .user-role {
    margin: 0 0 4px 0;
    color: #1890ff;
    font-size: 14px;
    font-weight: 500;
  }

  .user-email {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
}

.stats-section {
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.activity-card,
.quick-actions-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.quick-actions-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;

  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .user-profile-page {
    margin-top: 10px;
  }

  .stats-section {
    margin-bottom: 16px;
  }

  .stat-card {
    margin-bottom: 8px;
  }
}
</style>
