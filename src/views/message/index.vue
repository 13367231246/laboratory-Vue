<template>
  <div class="message-page">
    <!-- 消息筛选 -->
    <div class="filter-card">
      <a-space>
        <a-button @click="markAllRead" :disabled="unreadCount === 0">
          <CheckOutlined />
          全部标记为已读
        </a-button>
        <a-button @click="clearAllRead" :disabled="readCount === 0">
          <DeleteOutlined />
          清空已读消息
        </a-button>
      </a-space>
    </div>

    <!-- 消息列表 -->
    <div class="message-list-card">
      <a-list :data-source="messages" :loading="loading" :pagination="pagination" @change="handleTableChange">
        <template #renderItem="{ item }">
          <a-list-item :class="{ 'unread-message': !item.isRead }" @click="handleMessageClick(item)">
            <div class="message-card">
              <!-- 第一行：头像、标题、标签 -->
              <div class="message-header">
                <div class="message-avatar">
                  <a-avatar :style="{ backgroundColor: getMessageTypeColor(item.type) }">
                    {{ getMessageTypeIcon(item.type) }}
                  </a-avatar>
                </div>
                <div class="message-title-section">
                  <div class="message-title">{{ item.title }}</div>
                  <div class="message-tags">
                    <a-tag :color="getMessageTypeColor(item.type)" size="small">
                      {{ getMessageTypeText(item.type) }}
                    </a-tag>
                  </div>
                </div>
              </div>

              <!-- 第二行：消息内容 -->
              <div class="message-content">
                <p class="message-text">{{ item.content }}</p>
              </div>

              <!-- 第三行：时间、相关信息 -->
              <div class="message-footer">
                <span class="message-time">{{ item.time }}</span>
                <span v-if="item.relatedInfo" class="message-related"> 相关：{{ item.relatedInfo }} </span>
              </div>
            </div>
          </a-list-item>
        </template>
      </a-list>
    </div>

    <!-- 消息详情模态框 -->
    <a-modal v-model:open="detailVisible" :title="selectedMessage?.title" width="600px" :footer="null">
      <div v-if="selectedMessage" class="message-detail">
        <a-descriptions :column="1" bordered>
          <a-descriptions-item label="类型">
            <a-tag :color="getMessageTypeColor(selectedMessage.type)">
              {{ getMessageTypeText(selectedMessage.type) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="时间">
            {{ selectedMessage.time }}
          </a-descriptions-item>
          <a-descriptions-item v-if="selectedMessage.relatedInfo" label="相关">
            {{ selectedMessage.relatedInfo }}
          </a-descriptions-item>
          <a-descriptions-item label="内容" :span="1">
            <div class="message-detail-content">{{ selectedMessage.content }}</div>
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { CheckOutlined, DeleteOutlined, BellOutlined, ExclamationCircleOutlined } from '@ant-design/icons-vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const detailVisible = ref(false)
const selectedMessage = ref(null)

// 分页配置
const pagination = ref({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
})

// 消息数据
const messages = ref([
  // 系统消息
  {
    id: 1,
    type: 'system',
    title: '系统功能更新通知',
    content: '实验室管理系统已升级到v2.0版本，新增了设备报修功能、申请记录管理等功能，请及时体验新功能。',
    time: '2024-01-20 10:30',
    isRead: false,
    relatedInfo: '系统升级'
  },
  {
    id: 2,
    type: 'system',
    title: '维护通知',
    content: '系统将于本周六晚上22:00-24:00进行例行维护，期间可能影响正常使用，请提前做好相关准备。',
    time: '2024-01-19 14:20',
    isRead: true,
    relatedInfo: '系统维护'
  },
  {
    id: 3,
    type: 'system',
    title: '新功能介绍',
    content: '新增了满意度评价功能，您可以在使用完实验室后对服务进行评价，帮助我们改进服务质量。',
    time: '2024-01-18 09:15',
    isRead: true,
    relatedInfo: '功能介绍'
  },
  // 状态消息
  {
    id: 4,
    type: 'status',
    title: '设备故障通知',
    content: '您申请的计算机实验室A中的投影仪出现故障，已安排维修人员处理，预计修复时间：明天上午10:00。',
    time: '2024-01-20 16:45',
    isRead: false,
    relatedInfo: '计算机实验室A - 投影仪'
  },
  {
    id: 5,
    type: 'status',
    title: '申请状态更新',
    content: '您的实验室申请已通过审核，可以按计划时间使用。请按时到达实验室，如有变更请提前联系管理员。',
    time: '2024-01-19 11:30',
    isRead: true,
    relatedInfo: '物理实验室B - 2024-01-20 14:00-16:00'
  },
  {
    id: 6,
    type: 'status',
    title: '维修完成通知',
    content: '您报修的设备已维修完成，可以正常使用。感谢您的耐心等待，如有其他问题请随时联系。',
    time: '2024-01-18 15:20',
    isRead: true,
    relatedInfo: '化学实验室C - 实验台'
  },
  {
    id: 7,
    type: 'status',
    title: '紧急维护通知',
    content: '物理实验室B的电源系统出现异常，需要紧急维护。原定于今晚的实验课程已调整到明天同一时间。',
    time: '2024-01-17 18:30',
    isRead: false,
    relatedInfo: '物理实验室B - 电源系统'
  },
  {
    id: 8,
    type: 'status',
    title: '设备可用通知',
    content: '之前故障的显微镜已修复完成，现在可以正常申请使用。',
    time: '2024-01-16 10:15',
    isRead: true,
    relatedInfo: '化学实验室C - 显微镜'
  }
])

const unreadCount = computed(() => {
  return messages.value.filter((msg) => !msg.isRead).length
})

const readCount = computed(() => {
  return messages.value.filter((msg) => msg.isRead).length
})

// 方法
const getMessageTypeColor = (type) => {
  const colorMap = {
    system: '#1890ff',
    status: '#fa8c16'
  }
  return colorMap[type] || '#666'
}

const getMessageTypeIcon = (type) => {
  const iconMap = {
    system: '系',
    status: '状'
  }
  return iconMap[type] || '?'
}

const getMessageTypeText = (type) => {
  const textMap = {
    system: '系统消息',
    status: '状态消息'
  }
  return textMap[type] || '未知'
}

const handleTableChange = (pag) => {
  pagination.value.current = pag.current
  pagination.value.pageSize = pag.pageSize
}

const handleMessageClick = (msg) => {
  selectedMessage.value = msg
  detailVisible.value = true

  // 标记为已读
  if (!msg.isRead) {
    markAsRead(msg)
  }
}

const markAsRead = (msg) => {
  msg.isRead = true
}

const markAllRead = () => {
  messages.value.forEach((msg) => {
    msg.isRead = true
  })
  message.success('已全部标记为已读')
}

const clearAllRead = () => {
  messages.value = messages.value.filter((msg) => !msg.isRead)
  message.success('已清空所有已读消息')
}

// 生命周期
onMounted(() => {
  pagination.value.total = messages.value.length
})
</script>

<style scoped lang="scss">
.message-page {
  margin-top: 10px;
}
.filter-card,
.message-list-card {
  padding: 16px;
  cursor: pointer;
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.message-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.message-avatar {
  flex-shrink: 0;
}

.message-title-section {
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.message-title {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
  line-height: 1.4;
}

.message-actions {
  flex-shrink: 0;
  margin-left: auto;
}
.ant-list-item {
  padding: 10px;
}

.message-content {
  margin-bottom: 12px;

  .message-text {
    margin: 0;
    color: #666;
    line-height: 1.6;
    font-size: 14px;
  }
}

.message-footer {
  display: flex;
  align-items: center;
  gap: 16px;
  font-size: 12px;
  color: #999;
  flex-wrap: wrap;
}

.message-related {
  color: #1890ff;
}

.unread-message {
  border-radius: 8px;
  background-color: #f6ffed;
  border-left: 3px solid #52c41a;
}

.message-detail {
  .message-detail-content {
    white-space: pre-wrap;
    line-height: 1.6;
    color: #333;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .message-actions {
    margin-left: 0;
    align-self: flex-end;
  }

  .message-tags {
    margin-top: 4px;
  }

  .message-footer {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .message-title {
    font-size: 15px;
  }

  .message-text {
    font-size: 13px;
  }
}
</style>
