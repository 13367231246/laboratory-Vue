<template>
  <div class="student-applications">
    <a-tabs v-model:activeKey="activeTab" class="record-tabs" @change="handleTabChange">
      <a-tab-pane key="lab" tab="实验室申请" />
      <a-tab-pane key="equipment" tab="设备申请" />
    </a-tabs>

    <div class="filter-card">
      <div class="filter-section">
        <div class="filter-left">
          <a-select v-if="activeTab === 'lab'" v-model:value="filterType" placeholder="申请类型筛选" allow-clear @change="handleFilterChange" class="type-filter">
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="personal">个人使用</a-select-option>
            <a-select-option value="course">课程使用</a-select-option>
          </a-select>

          <a-select v-model:value="statusFilter" placeholder="状态筛选" allow-clear @change="handleFilter" class="type-filter">
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
        </div>
      </div>
    </div>

    <!-- 我的申请记录列表 -->
    <div class="record-list-card">
      <a-table :columns="columns" :data-source="filteredRecords" :loading="loading" :scroll="{ x: 800 }" :pagination="pagination" row-key="id" @change="handleTableChange" size="small">
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
                  <a-menu-item v-if="record.status === 'pending' || record.status === 'approved'" key="cancel" @click="handleCancel(record)">
                    <CloseCircleOutlined />
                    撤销
                  </a-menu-item>
                  <a-menu-item v-if="record.status === 'approved' || record.status === 'using'" key="complete" @click="handleComplete(record)">
                    <CheckOutlined />
                    完成
                  </a-menu-item>
                  <a-menu-item v-if="activeTab === 'lab' && (record.status === 'completed' || record.status === 'using')" key="repair" @click="handleRepair(record)">
                    <ToolOutlined />
                    报修
                  </a-menu-item>
                  <a-menu-item v-if="record.status === 'rejected'" @click="router.push('/lab-application')">
                    <CheckOutlined />
                    重申
                  </a-menu-item>
                  <a-menu-item v-if="record.status === 'completed' || record.status === 'cancelled'" key="delete" @click="handleDelete(record)" danger>
                    <DeleteOutlined />
                    删除
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
import { ReloadOutlined, DownOutlined, EyeOutlined, CheckOutlined, ToolOutlined, CloseCircleOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/stores/user'
import { listMyApplications, cancelApplication, finishApplication, deleteApplication, getApplicationDetail } from '@/api/laboratoryRecord'
import { listMyApplications as listMyEquipmentApplications, cancel as cancelEquipmentApplication, finish as finishEquipmentApplication, remove as deleteEquipmentApplication, getDetail as getEquipmentApplicationDetail } from '@/api/equipmentApplication'

const router = useRouter()
const userStore = useUserStore()
const emit = defineEmits(['view-detail'])

// 响应式数据
const loading = ref(false)
const activeTab = ref('lab')
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

// 申请数据
const records = ref([])

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

const mapEquipmentRecord = (item) => {
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
    type: 'equipment',
    labId: item.laboratoryId ?? item.labId ?? item.laboratory?.id,
    equipmentId: item.equipmentId ?? item.equipment?.id,
    equipmentName: item.equipmentName || item.equipment_name || item.equipment?.equipmentName || item.equipment?.name || '',
    quantity: item.quantity,
    labName: item.labName || item.laboratoryName || item.laboratory?.labName || item.laboratory?.name || '',
    labLocation: item.labLocation || item.laboratory?.location || '',
    applyTime: item.applyTime || item.createTime,
    timeRange: item.timeRange || (startTime && endTime ? `${startTime} - ${endTime}` : ''),
    contactInfo: item.contactInfo || userStore.userInfo?.phone || userStore.userInfo?.email || '',
    status: statusMap[statusCode] || item.status
  }
}

const loadRecords = () => {
  loading.value = true

  const loader = activeTab.value === 'equipment' ? listMyEquipmentApplications(pagination.current, pagination.pageSize) : listMyApplications(pagination.current, pagination.pageSize)

  loader
    .then((data) => {
      const list = data?.items ?? data?.records ?? data?.list ?? (Array.isArray(data) ? data : [])
      const total = data?.total ?? data?.totalCount ?? list.length
      pagination.total = total

      records.value = activeTab.value === 'equipment' ? list.map((item) => mapEquipmentRecord(item)) : list.map((item) => mapApplicationRecord(item))
    })
    .catch(() => {
      message.error('加载申请记录失败')
    })
    .finally(() => {
      loading.value = false
    })
}

onMounted(() => {
  loadRecords()
})

const labColumns = [
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

const equipmentColumns = [
  {
    title: '设备',
    dataIndex: 'equipmentName',
    key: 'equipmentName',
    width: 140,
    ellipsis: true
  },
  {
    title: '数量',
    dataIndex: 'quantity',
    key: 'quantity',
    width: 80
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

const columns = computed(() => {
  return activeTab.value === 'equipment' ? equipmentColumns : labColumns
})

const filteredRecords = computed(() => {
  let result = records.value

  if (activeTab.value === 'lab') {
    if (filterType.value !== 'all') {
      result = result.filter((record) => record.applicationType === filterType.value)
    }
  }

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
  loadRecords()
}

const handleTableChange = (pag) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadRecords()
}

const viewDetail = (record) => {
  loading.value = true
  const detailLoader = activeTab.value === 'equipment' ? getEquipmentApplicationDetail(record.id) : getApplicationDetail(record.id)

  detailLoader
    .then((data) => {
      const detail = activeTab.value === 'equipment' ? mapEquipmentRecord(data || record) : mapApplicationRecord(data || record)
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
  const canceler = activeTab.value === 'equipment' ? cancelEquipmentApplication : cancelApplication
  canceler(record.id)
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
  const finisher = activeTab.value === 'equipment' ? finishEquipmentApplication : finishApplication
  finisher(record.id)
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
  const deleter = activeTab.value === 'equipment' ? deleteEquipmentApplication : deleteApplication
  deleter(record.id)
    .then(() => {
      records.value = records.value.filter((item) => item.id !== record.id)
      message.success('申请已删除')
    })
    .finally(() => {
      loading.value = false
    })
}

const handleTabChange = () => {
  pagination.current = 1
  filterType.value = 'all'
  statusFilter.value = undefined
  loadRecords()
}

const handleRepair = (record) => {
  // 跳转到报修页面，并传递相关参数
  router.push({
    path: '/repair-report',
    query: {
      labId: record.labId,
      equipmentId: record.equipmentId,
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
