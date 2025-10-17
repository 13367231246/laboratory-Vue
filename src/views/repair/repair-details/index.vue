<template>
  <div class="repair-detail" v-if="repair">
    <a-descriptions :column="2" bordered size="small" class="detail-descriptions">
      <a-descriptions-item label="报修类型">
        {{ getRepairTypeText(repair.repairType) }}
      </a-descriptions-item>
      <a-descriptions-item label="实验室">
        {{ repair.labName }}
      </a-descriptions-item>
      <a-descriptions-item label="设备名称">
        {{ repair.equipmentName }}
      </a-descriptions-item>
      <a-descriptions-item label="紧急程度">
        <a-tag :color="getUrgencyColor(repair.urgency)">{{ getUrgencyText(repair.urgency) }}</a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="报修人">
        {{ repair.reporter }}
      </a-descriptions-item>
      <a-descriptions-item label="联系方式">
        {{ repair.contactInfo }}
      </a-descriptions-item>
      <a-descriptions-item label="报修时间">
        {{ repair.reportTime }}
      </a-descriptions-item>
      <a-descriptions-item label="当前状态">
        <a-tag :color="getStatusColor(repair.status)">{{ getStatusText(repair.status) }}</a-tag>
      </a-descriptions-item>
      <a-descriptions-item label="故障描述" :span="2">
        {{ repair.description }}
      </a-descriptions-item>
      <a-descriptions-item v-if="repair.repairRecords && repair.repairRecords.length" label="维修记录" :span="2">
        <a-timeline>
          <a-timeline-item v-for="record in repair.repairRecords" :key="record.id" :color="record.status === 'completed' ? 'green' : 'blue'">
            <div class="timeline-content">
              <div class="timeline-title">{{ record.title }}</div>
              <div class="timeline-desc">{{ record.description }}</div>
              <div class="timeline-meta">
                <span>{{ record.operator }}</span>
                <span>{{ record.time }}</span>
              </div>
            </div>
          </a-timeline-item>
        </a-timeline>
      </a-descriptions-item>
    </a-descriptions>

    <div v-if="repair.images && repair.images.length > 0" class="repair-images">
      <h4>故障照片</h4>
      <a-image-preview-group>
        <a-image v-for="(image, index) in repair.images" :key="index" :src="image.url" :width="100" :height="100" class="thumb" />
      </a-image-preview-group>
    </div>
  </div>
  <div v-else class="empty">
    <a-empty description="暂无详情" />
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

const props = defineProps({
  repair: {
    type: Object,
    default: null
  }
})

const getStatusColor = (status) => {
  const colorMap = { 0: 'orange', 1: 'blue', 2: 'green' }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = { 0: '等待维修', 1: '维修中', 2: '完成维修' }
  return textMap[status] || '未知'
}

const getUrgencyColor = (urgency) => {
  const colorMap = { low: 'green', medium: 'blue', high: 'orange', critical: 'red' }
  return colorMap[urgency] || 'default'
}

const getUrgencyText = (urgency) => {
  const textMap = { low: '低', medium: '中', high: '高', critical: '紧急' }
  return textMap[urgency] || '未知'
}

const getRepairTypeText = (type) => {
  const typeMap = { equipment: '设备故障', environment: '环境问题', safety: '安全问题' }
  return typeMap[type] || '未知'
}
</script>

<style scoped>
.repair-detail {
  padding: 16px 0;
}

.detail-descriptions :deep(.ant-descriptions-item-content) {
  word-break: break-word;
}

.repair-images {
  margin-top: 16px;
}

.thumb {
  margin-right: 8px;
  margin-bottom: 8px;
  border-radius: 4px;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .detail-descriptions :deep(.ant-descriptions-view) {
    font-size: 12px;
  }
  .detail-descriptions :deep(.ant-descriptions-item-label),
  .detail-descriptions :deep(.ant-descriptions-item-content) {
    padding: 8px 10px;
  }
  .thumb {
    width: 88px !important;
    height: 88px !important;
  }
}
</style>
