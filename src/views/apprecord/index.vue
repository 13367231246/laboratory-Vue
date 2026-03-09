<template>
  <div class="application-record-page">
    <!-- 老师 / 学生共用的申请记录列表 -->
    <StudentApplications @view-detail="viewDetail" />

    <!-- 详情模态框 -->
    <a-modal v-model:open="detailModalVisible" title="申请详情" width="800px" :footer="null">
      <div v-if="selectedRecord" class="detail-content">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="申请类型">
            <a-tag :color="getTypeColor(selectedRecord.type)">
              {{ getTypeText(selectedRecord.type) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="申请人">
            {{ selectedRecord.applicant }}
          </a-descriptions-item>
          <a-descriptions-item label="申请时间">
            {{ selectedRecord.applyTime }}
          </a-descriptions-item>
          <a-descriptions-item label="状态">
            <a-tag :color="getStatusColor(selectedRecord.status)">
              {{ getStatusText(selectedRecord.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="实验室"> {{ selectedRecord.labName }} ({{ selectedRecord.labLocation }})
          </a-descriptions-item>
          <a-descriptions-item label="使用时间">
            {{ selectedRecord.timeRange }}
          </a-descriptions-item>
          <a-descriptions-item label="预计人数"> {{ selectedRecord.participantCount }} 人 </a-descriptions-item>
          <a-descriptions-item label="使用目的" :span="2">
            {{ selectedRecord.purpose }}
          </a-descriptions-item>
          <a-descriptions-item label="所需设备" :span="2">
            {{ selectedRecord.requiredEquipment?.join(', ') || '无' }}
          </a-descriptions-item>
          <!-- 拒绝原因 -->
          <a-descriptions-item v-if="selectedRecord.reviewComment" label="拒绝原因" :span="2">
            {{ selectedRecord.reviewComment }}
          </a-descriptions-item>
          <a-descriptions-item v-if="selectedRecord.specialRequirements" label="特殊要求" :span="2">
            {{ selectedRecord.specialRequirements }}
          </a-descriptions-item>
          <a-descriptions-item label="联系方式">
            {{ selectedRecord.contactInfo }}
          </a-descriptions-item>
          <a-descriptions-item v-if="selectedRecord.remark" label="备注" :span="2">
            {{ selectedRecord.remark }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import StudentApplications from './components/StudentApplications.vue'

// 响应式数据
const detailModalVisible = ref(false)
const selectedRecord = ref(null)

// 方法
const getTypeColor = (type) => {
  const colorMap = {
    lab: 'blue',
    equipment: 'green'
  }
  return colorMap[type] || 'default'
}

const getTypeText = (type) => {
  const textMap = {
    lab: '实验室',
    equipment: '设备'
  }
  return textMap[type] || '未知'
}
const getStatusColor = (status) => {
  const colorMap = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red',
    using: 'blue',
    completed: 'green',
    cancelled: 'default'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
    using: '使用中',
    completed: '已完成',
    cancelled: '已取消'
  }
  return textMap[status] || '未知'
}

const viewDetail = (record) => {
  selectedRecord.value = record
  detailModalVisible.value = true
}
</script>

<style scoped lang="scss">
.role-tabs {
  margin-bottom: 16px;
}

.detail-content {
  .ant-descriptions {
    margin-top: 16px;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .application-record-page {
    margin-top: 10px;
  }

  /* 详情模态框移动端适配 */
  .detail-content :deep(.ant-descriptions) {
    .ant-descriptions-item-label {
      font-size: 12px;
      padding: 8px 12px;
    }

    .ant-descriptions-item-content {
      font-size: 12px;
      padding: 8px 12px;
    }
  }
}
</style>
