<template>
  <div class="usage-records">
    <div class="filter-card">
      <div class="filter-section">
        <div class="filter-left">
          <a-select v-model:value="usageStatusFilter" placeholder="使用状态筛选" allow-clear @change="handleFilterChange" class="type-filter">
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="using">使用中</a-select-option>
            <a-select-option value="completed">已完成</a-select-option>
          </a-select>

          <a-input v-model:value="searchText" placeholder="搜索申请人或内容" allow-clear class="search-input">
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </div>

        <div class="filter-right">
          <a-button @click="handleRefresh" :loading="loading">
            <ReloadOutlined />
            刷新
          </a-button>
          <a-button type="primary" @click="handleExport">
            <ExportOutlined />
            导出
          </a-button>
        </div>
      </div>
    </div>

    <!-- 使用记录列表 -->
    <div class="record-list-card">
      <a-table :columns="usageColumns" :data-source="filteredUsageRecords" :loading="loading" :scroll="{ x: 800 }" :pagination="pagination" row-key="id" @change="handleTableChange" size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button type="link" size="small" @click="viewDetail(record)">详情</a-button>
              <a-button v-if="record.status === 'using'" type="link" size="small" @click="handleComplete(record)" style="color: #52c41a">完成</a-button>
              <a-button type="link" size="small" @click="handleRepair(record)" style="color: #fa8c16">报修</a-button>
              <a-button v-if="record.status === 'completed'" type="link" size="small" @click="deleteRecord(record)" style="color: #ff4d4f">删除</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, ReloadOutlined, ExportOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const emit = defineEmits(['view-detail'])

// 响应式数据
const loading = ref(false)
const usageStatusFilter = ref('all')
const searchText = ref('')

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
})

// 模拟使用记录数据 - 只显示当前老师负责的实验室的使用记录
const usageRecords = ref([
  {
    id: 1,
    type: 'lab',
    applicationType: 'course',
    applicant: '张三',
    phone: '13800138001',
    labId: 1,
    labName: '计算机实验室A',
    labLocation: '教学楼A座201',
    applyTime: '2024-01-15 09:30',
    timeRange: '2024-01-16 08:00 - 2024-01-16 10:00',
    participantCount: 25,
    purpose: 'Java编程课程教学',
    requiredEquipment: ['台式电脑', '投影仪'],
    specialRequirements: '需要网络连接',
    contactInfo: '13800138001',
    status: 'using',
    remark: '课程教学需要'
  },
  {
    id: 2,
    type: 'lab',
    applicationType: 'personal',
    applicant: '李四',
    phone: '13800138002',
    labId: 2,
    labName: '物理实验室B',
    labLocation: '实验楼B座301',
    applyTime: '2024-01-15 14:20',
    timeRange: '2024-01-17 14:00 - 2024-01-17 16:00',
    participantCount: 5,
    purpose: '个人研究项目',
    requiredEquipment: ['实验台', '测量仪器'],
    specialRequirements: '需要安静环境',
    contactInfo: 'lisi@email.com',
    status: 'completed',
    remark: '研究项目需要'
  }
])

// 表格列配置
const usageColumns = [
  {
    title: '申请人',
    dataIndex: 'applicant',
    key: 'applicant',
    width: 100,
    ellipsis: true
  },
  {
    title: '实验室',
    dataIndex: 'labName',
    key: 'labName',
    width: 120,
    ellipsis: true
  },
  {
    title: '使用时间',
    dataIndex: 'timeRange',
    key: 'timeRange',
    width: 200,
    ellipsis: true
  },
  {
    title: '使用状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right'
  }
]

// 计算属性
const filteredUsageRecords = computed(() => {
  let result = usageRecords.value

  // 使用状态筛选
  if (usageStatusFilter.value !== 'all') {
    result = result.filter((record) => record.status === usageStatusFilter.value)
  }

  // 搜索筛选
  if (searchText.value) {
    const searchLower = searchText.value.toLowerCase()
    result = result.filter((record) => record.applicant.toLowerCase().includes(searchLower) || record.purpose.toLowerCase().includes(searchLower) || record.labName.toLowerCase().includes(searchLower))
  }

  return result
})

// 方法
const getStatusColor = (status) => {
  const colorMap = {
    using: 'blue',
    completed: 'green'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    using: '使用中',
    completed: '已完成'
  }
  return textMap[status] || '未知'
}

const handleFilterChange = () => {
  pagination.current = 1
}

const handleRefresh = async () => {
  loading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    message.success('数据刷新成功')
  } catch (error) {
    message.error('数据刷新失败')
  } finally {
    loading.value = false
  }
}

const handleExport = () => {
  message.info('导出功能开发中...')
}

const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

const viewDetail = (record) => {
  emit('view-detail', record)
}

const handleComplete = async (record) => {
  try {
    loading.value = true
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 更新记录状态
    record.status = 'completed'
    message.success('使用完成')
  } catch (error) {
    message.error('操作失败')
  } finally {
    loading.value = false
  }
}

const handleRepair = (record) => {
  // 跳转到报修页面，并传递相关参数
  router.push({
    path: '/repair-report',
    query: {
      labId: record.labId,
      labName: record.labName,
      applicant: record.applicant,
      applicationId: record.id
    }
  })
}

const deleteRecord = async (record) => {
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500))

    // 从使用记录中删除
    const index = usageRecords.value.findIndex((item) => item.id === record.id)
    if (index !== -1) {
      usageRecords.value.splice(index, 1)
    }

    message.success('记录已删除')
  } catch (error) {
    message.error('删除失败')
  }
}
</script>

<style scoped lang="scss">
.filter-card {
  padding: 16px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  @media (max-width: 768px) {
    padding: 0px;
    box-shadow: none;
  }
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.type-filter {
  width: 150px;
}

.search-input {
  width: 240px;
  min-width: 200px;
}

.filter-right {
  display: flex;
  gap: 12px;
}

.record-list-card {
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  @media (max-width: 768px) {
    padding: 0px;
    box-shadow: none;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .filter-left {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .type-filter,
  .search-input {
    width: 100%;
    min-width: auto;
  }

  .filter-right {
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>
