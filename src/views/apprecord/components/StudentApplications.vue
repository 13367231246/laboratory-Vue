<template>
  <div class="student-applications">
    <div class="filter-card">
      <div class="filter-section">
        <div class="filter-left">
          <a-select v-model:value="filterType" placeholder="申请类型筛选" allow-clear @change="handleFilterChange" class="type-filter">
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="personal">个人使用</a-select-option>
            <a-select-option value="course">课程使用</a-select-option>
          </a-select>

          <a-select v-model:value="statusFilter" placeholder="状态筛选" allow-clear @change="handleFilter" class="type-filter">
            <a-select-option value="pending">待审核</a-select-option>
            <a-select-option value="approved">已通过</a-select-option>
            <a-select-option value="rejected">已拒绝</a-select-option>
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

    <!-- 我的申请记录列表 -->
    <div class="record-list-card">
      <a-table :columns="studentColumns" :data-source="filteredStudentRecords" :loading="loading" :scroll="{ x: 800 }" :pagination="pagination" row-key="id" @change="handleTableChange" size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-dropdown>
              <a-button type="link" size="small">
                操作
                <DownOutlined />
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="detail" @click="viewDetail(record)">
                    <EyeOutlined />
                    详情
                  </a-menu-item>
                  <a-menu-item v-if="record.status === 'using'" key="complete" @click="handleComplete(record)">
                    <CheckOutlined />
                    完成
                  </a-menu-item>
                  <a-menu-item key="repair" @click="handleRepair(record)">
                    <ToolOutlined />
                    报修
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </template>
      </a-table>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, ReloadOutlined, ExportOutlined, DownOutlined, EyeOutlined, CheckOutlined, ToolOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'

const router = useRouter()
const userStore = useUserStore()
const emit = defineEmits(['view-detail'])

// 响应式数据
const loading = ref(false)
const filterType = ref('all')
const statusFilter = ref(undefined)
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

// 模拟学生申请数据 - 只显示当前学生的申请
const studentRecords = ref([
  {
    id: 1,
    type: 'lab',
    applicationType: 'course',
    applicant: userStore.userInfo?.name || '当前学生',
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
    applicant: userStore.userInfo?.name || '当前学生',
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
const studentColumns = [
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
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '操作',
    key: 'actions',
    width: 50,
    fixed: 'right'
  }
]

// 计算属性
const filteredStudentRecords = computed(() => {
  let result = studentRecords.value

  // 申请类型筛选
  if (filterType.value !== 'all') {
    result = result.filter((record) => record.applicationType === filterType.value)
  }

  // 状态筛选
  if (statusFilter.value) {
    result = result.filter((record) => record.status === statusFilter.value)
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
    pending: 'orange',
    approved: 'green',
    rejected: 'red',
    using: 'blue',
    completed: 'green'
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝',
    using: '使用中',
    completed: '已完成'
  }
  return textMap[status] || '未知'
}

const handleFilterChange = () => {
  pagination.current = 1
}

const handleFilter = () => {
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
