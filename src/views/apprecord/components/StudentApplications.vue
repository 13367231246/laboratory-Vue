<template>
  <div class="student-applications">
    <div class="filter-card">
      <div class="filter-section">
        <div class="filter-left">
          <a-select v-model:value="filterType" placeholder="申请类型筛选" allow-clear @change="handleFilterChange"
            class="type-filter">
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="personal">个人使用</a-select-option>
            <a-select-option value="course">课程使用</a-select-option>
          </a-select>

          <a-select v-model:value="statusFilter" placeholder="状态筛选" allow-clear @change="handleFilter"
            class="type-filter">
            <a-select-option value="0">待审核</a-select-option>
            <a-select-option value="1">已批准</a-select-option>
            <a-select-option value="2">已拒绝</a-select-option>
            <a-select-option value="3">使用中</a-select-option>
            <a-select-option value="4">已完成</a-select-option>
            <a-select-option value="5">已取消</a-select-option>
          </a-select>
        </div>

        <div class="filter-right">
          <a-button @click="handleReset" :loading="loading">
            <ReloadOutlined />
            重置
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
      <a-table :columns="studentColumns" :data-source="filteredStudentRecords" :loading="loading" :scroll="{ x: 800 }"
        :pagination="pagination" row-key="id" @change="handleTableChange" size="small">
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
                  <a-menu-item v-if="record.status === 'pending' || record.status === 'approved'" key="cancel"
                    @click="handleCancel(record)">
                    <CloseCircleOutlined />
                    撤销
                  </a-menu-item>
                  <a-menu-item v-if="record.status === 'approved' || record.status === 'using'" key="complete"
                    @click="handleComplete(record)">
                    <CheckOutlined />
                    完成
                  </a-menu-item>
                  <a-menu-item v-if="record.status === 'completed' || record.status === 'cancelled'" key="delete"
                    @click="handleDelete(record)" danger>
                    <DeleteOutlined />
                    删除
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
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, ReloadOutlined, ExportOutlined, DownOutlined, EyeOutlined, CheckOutlined, ToolOutlined, CloseCircleOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { listMyApplications, cancelApplication, finishApplication, deleteApplication, getApplicationDetail } from '@/api/laboratoryRecord'

const router = useRouter()
const userStore = useUserStore()
const emit = defineEmits(['view-detail'])

// 响应式数据
const loading = ref(false)
const filterType = ref('all')
const statusFilter = ref(undefined)

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
})

// 学生申请数据
const studentRecords = ref([])

const statusCodeToTextKey = (status) => {
  if (typeof status === 'number') {
    return status
  }
  const parsed = parseInt(status, 10)
  if (!Number.isNaN(parsed)) {
    return parsed
  }
  const map = {
    pending: 0,
    approved: 1,
    rejected: 2,
    using: 3,
    completed: 4,
    cancelled: 5
  }
  return map[status] ?? status
}

const mapApplicationRecord = (item) => {
  const statusCode = statusCodeToTextKey(item.status)
  const statusMap = {
    0: 'pending',
    1: 'approved',
    2: 'rejected',
    3: 'using',
    4: 'completed',
    5: 'cancelled'
  }
  const startTime = item.startTime || item.start_time
  const endTime = item.endTime || item.end_time

  return {
    ...item,
    type: 'lab',
    applicationType: item.applicationType || (item.purpose === '课程使用' || item.courseName ? 'course' : 'personal'),
    labName: item.labName || item.laboratoryName || item.laboratory?.labName || '',
    labLocation: item.labLocation || item.laboratory?.location || '',
    applyTime: item.applyTime || item.createTime,
    timeRange: item.timeRange || (startTime && endTime ? `${startTime} - ${endTime}` : ''),
    participantCount: item.participantCount ?? item.studentCount,
    contactInfo: item.contactInfo || userStore.userInfo?.phone || userStore.userInfo?.email || '',
    status: statusMap[statusCode] || item.status
  }
}

const loadStudentApplications = () => {
  loading.value = true
  listMyApplications(pagination.current, pagination.pageSize)
    .then((data) => {
      const list = data?.items ?? data?.records ?? data?.list ?? (Array.isArray(data) ? data : [])
      const total = data?.total ?? data?.totalCount ?? list.length
      pagination.total = total
      studentRecords.value = list.map((item) => mapApplicationRecord(item))
    })
    .catch(() => {
      message.error('加载申请记录失败')
    })
    .finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  loadStudentApplications()
})

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

  // 状态筛选（数据库状态 0-5）
  if (statusFilter.value !== undefined && statusFilter.value !== null && statusFilter.value !== '') {
    const targetStatus = Number(statusFilter.value)
    result = result.filter((record) => statusCodeToTextKey(record.status) === targetStatus)
  }

  return result
})

// 方法
const getStatusColor = (status) => {
  const key = statusCodeToTextKey(status)
  const colorMap = {
    0: 'orange',
    1: 'green',
    2: 'red',
    3: 'blue',
    4: 'green',
    5: 'default'
  }
  return colorMap[key] || 'default'
}

const getStatusText = (status) => {
  const key = statusCodeToTextKey(status)
  const textMap = {
    0: '待审核',
    1: '已批准',
    2: '已拒绝',
    3: '使用中',
    4: '已完成',
    5: '已取消'
  }
  return textMap[key] || '未知'
}

const handleFilterChange = () => {
  pagination.current = 1
}

const handleFilter = () => {
  pagination.current = 1
}

const handleReset = () => {
  pagination.current = 1
  filterType.value = 'all'
  statusFilter.value = undefined
  loadStudentApplications()
}

const handleExport = () => {
  message.info('导出功能开发中...')
}

const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadStudentApplications()
}

const viewDetail = (record) => {
  loading.value = true
  getApplicationDetail(record.id)
    .then((data) => {
      const detail = mapApplicationRecord(data || record)
      emit('view-detail', detail)
    })
    .catch(() => {
      message.error('获取申请详情失败，已展示本地数据')
      emit('view-detail', record)
    })
    .finally(() => {
      loading.value = false
    })
}

const handleCancel = (record) => {
  loading.value = true
  cancelApplication(record.id)
    .then(() => {
      record.status = 'cancelled'
      message.success('申请已撤销')
    })
    .catch(() => {
      message.error('撤销失败')
    })
    .finally(() => {
      loading.value = false
    })
}

const handleComplete = (record) => {
  loading.value = true
  finishApplication(record.id)
    .then(() => {
      record.status = 'completed'
      message.success('已标记为完成')
    })
    .finally(() => {
      loading.value = false
    })
}

const handleDelete = (record) => {
  loading.value = true
  deleteApplication(record.id)
    .then(() => {
      studentRecords.value = studentRecords.value.filter((item) => item.id !== record.id)
      message.success('申请已删除')
    })
    .finally(() => {
      loading.value = false
    })
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
