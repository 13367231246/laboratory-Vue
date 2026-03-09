<template>
  <div class="repair-handling-page">
    <!-- 统计卡片 -->
    <a-row :gutter="24" class="stats-section">
      <a-col :xs="12" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic title="待处理" :value="stats.waiting" :value-style="{ color: '#faad14' }">
            <template #prefix>
              <ClockCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic title="维修中" :value="stats.repairing" :value-style="{ color: '#1890ff' }">
            <template #prefix>
              <ToolOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic title="已完成" :value="stats.completed" :value-style="{ color: '#52c41a' }">
            <template #prefix>
              <CheckCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic title="无需维护" :value="stats.noNeed" :value-style="{ color: '#722ed1' }">
            <template #prefix>
              <CalendarOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 搜索和筛选 -->
    <a-card class="search-card">
      <div class="search-filters">
        <a-input v-model:value="searchText" placeholder="搜索设备名称" allow-clear @change="handleSearch" class="search-input">
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>

        <a-select v-model:value="statusFilter" placeholder="状态筛选" allow-clear @change="handleFilter" class="search-input">
          <a-select-option value="0">等待维修</a-select-option>
          <a-select-option value="1">维修中</a-select-option>
          <a-select-option value="2">完成维修</a-select-option>
        </a-select>

        <a-button type="primary" @click="handleSearch" :loading="loading" class="btn">
          <SearchOutlined />
          搜索
        </a-button>
        <a-button type="primary" @click="handleRefresh" :loading="loading" class="btn">
          <ReloadOutlined />
          刷新
        </a-button>
      </div>
    </a-card>

    <!-- 维修列表 -->
    <div class="repair-list-card">
      <a-table :columns="columns" :data-source="filteredRepairs" :scroll="{ x: 800 }" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange" size="small">
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
                  <a-menu-item key="start" @click="startRepair(record)" v-if="record.status === 0">
                    <ToolOutlined />
                    开始维修
                  </a-menu-item>
                  <a-menu-item key="noNeed" @click="markNoNeed(record)" v-if="record.status === 0">
                    <CloseCircleOutlined />
                    无需维护
                  </a-menu-item>
                  <a-menu-item key="complete" @click="completeRepair(record)" v-if="record.status === 1">
                    <CheckOutlined />
                    完成
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 维修详情模态框 -->
    <a-modal v-model:open="detailModalVisible" title="维修详情" width="800px" :footer="null">
      <RepairDetail :repair="selectedRepair" />
    </a-modal>

    <!-- 完成维修模态框 -->
    <a-modal v-model:open="completeRepairModalVisible" title="完成维修" @ok="handleCompleteRepair" @cancel="handleCompleteRepairCancel">
      <a-form ref="completeRepairFormRef" :model="completeRepairFormData" :rules="completeRepairFormRules" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="维修结果" name="repairResult">
          <a-textarea v-model:value="completeRepairFormData.repairResult" placeholder="请填写维修过程与结果" :rows="4" />
        </a-form-item>

        <a-form-item label="维修费用" name="cost">
          <a-input-number v-model:value="completeRepairFormData.cost" :min="0" style="width: 100%" placeholder="请输入费用（可填0）" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, ReloadOutlined, ClockCircleOutlined, ToolOutlined, CheckCircleOutlined, CalendarOutlined, DownOutlined, EyeOutlined, CheckOutlined, CloseCircleOutlined } from '@ant-design/icons-vue'
import RepairDetail from './repair-details/index.vue'
import { listTodoAsTeacher, startRepairAsTeacher, completeRepairAsTeacher, summaryForTeacher, markNoNeedAsTeacher } from '@/api/maintenance'

// 响应式数据
const loading = ref(false)
const completeRepairFormRef = ref()
const searchText = ref('')
const statusFilter = ref(undefined)
const detailModalVisible = ref(false)
const completeRepairModalVisible = ref(false)
const selectedRepair = ref(null)

// 统计数据
const stats = ref({
  waiting: 0,
  repairing: 0,
  completed: 0,
  noNeed: 0
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
})

// 维修数据
const repairs = ref([])

// 表格列配置
const columns = [
  {
    title: '实验室',
    dataIndex: 'labName',
    key: 'labName',
    sorter: true
  },
  {
    title: '设备名称',
    dataIndex: 'equipmentName',
    key: 'equipmentName'
  },
  {
    title: '故障描述',
    dataIndex: 'description',
    key: 'description',
    ellipsis: true
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '报修时间',
    dataIndex: 'reportTime',
    key: 'reportTime',
    sorter: true
  },
  {
    title: '操作',
    key: 'actions',
    width: 80,
    fixed: 'right'
  }
]

// 完成维修表单数据
const completeRepairFormData = reactive({
  repairResult: '',
  cost: 0
})

// 完成维修表单验证规则
const completeRepairFormRules = {
  repairResult: [{ required: true, message: '请填写维修结果', trigger: 'blur' }]
}

// 计算属性
const filteredRepairs = computed(() => {
  let result = repairs.value

  // 搜索过滤
  if (searchText.value) {
    result = result.filter((repair) => repair.equipmentName.toLowerCase().includes(searchText.value.toLowerCase()) || repair.reporter.toLowerCase().includes(searchText.value.toLowerCase()))
  }

  // 状态过滤
  if (statusFilter.value !== undefined) {
    result = result.filter((repair) => repair.status === parseInt(statusFilter.value))
  }

  return result
})

// 方法
const getStatusColor = (status) => {
  const colorMap = {
    0: 'orange', // 等待维修
    1: 'blue', // 维修中
    2: 'green' // 完成维修
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    0: '等待维修',
    1: '维修中',
    2: '完成维修'
  }
  return textMap[status] || '未知'
}

const getRepairTypeText = (type) => {
  const typeMap = {
    equipment: '设备故障',
    environment: '环境问题',
    safety: '安全问题'
  }
  return typeMap[type] || '未知'
}

const handleFilter = () => {
  // 筛选逻辑已在计算属性中处理
}
const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const mapMaintenanceRecord = (item) => {
  const laboratory = item.laboratory || {}
  const equipment = item.equipment || {}
  return {
    ...item,
    labName: item.labName || laboratory.labName || laboratory.name || item.laboratoryName || '',
    equipmentName: item.equipmentName || equipment.equipmentName || equipment.name || '',
    description: item.description || item.issueDescription || item.faultDescription || '',
    reporter: item.reporter || item.applicant || item.createBy || item.username || '',
    contactInfo: item.contactInfo || item.phone || item.mobile || '',
    reportTime: item.reportTime || item.createTime || item.createdAt || '',
    repairType: item.equipmentId || equipment.id ? 'equipment' : 'environment',
    images: Array.isArray(item.images) ? item.images : [],
    repairRecords: Array.isArray(item.repairRecords) ? item.repairRecords : []
  }
}

const loadSummary = () => {
  return summaryForTeacher()
    .then((data) => {
      stats.value.waiting = data?.waiting ?? 0
      stats.value.repairing = data?.repairing ?? 0
      stats.value.completed = data?.completed ?? 0
      stats.value.noNeed = data?.noNeed ?? 0
    })
    .catch(() => {
      message.error('加载汇总数据失败')
    })
}

const loadRepairs = () => {
  loading.value = true

  return listTodoAsTeacher(pagination.current, pagination.pageSize)
    .then((data) => {
      const list = data?.items ?? data?.records ?? data?.list ?? (Array.isArray(data) ? data : [])
      const total = data?.total ?? data?.totalCount ?? list.length

      repairs.value = (list || []).map((item) => mapMaintenanceRecord(item))
      pagination.total = total
    })
    .catch(() => {
      message.error('加载维修列表失败')
    })
    .finally(() => {
      loading.value = false
    })
}

const handleRefresh = () => {
  return Promise.all([loadSummary(), loadRepairs()]).then(() => {
    message.success('数据刷新成功')
  })
}

const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
  loadRepairs()
}

const viewDetail = (record) => {
  selectedRepair.value = record
  detailModalVisible.value = true
}
const completeRepair = (record) => {
  selectedRepair.value = record
  completeRepairModalVisible.value = true
}

const startRepair = (record) => {
  loading.value = true
  startRepairAsTeacher(record.id)
    .then(() => {
      message.success('已开始维修')
      return Promise.all([loadSummary(), loadRepairs()])
    })
    .catch(() => {
      message.error('开始维修失败')
    })
    .finally(() => {
      loading.value = false
    })
}

const markNoNeed = (record) => {
  loading.value = true
  markNoNeedAsTeacher(record.id)
    .then(() => {
      message.success('已标记为无需维护')
      return Promise.all([loadSummary(), loadRepairs()])
    })
    .catch(() => {
      message.error('操作失败')
    })
    .finally(() => {
      loading.value = false
    })
}

const handleCompleteRepair = async () => {
  const valid = await completeRepairFormRef.value?.validate?.().catch(() => false)
  if (!valid) return
  if (!selectedRepair.value?.id) return

  loading.value = true
  completeRepairAsTeacher(selectedRepair.value.id, {
    repairResult: completeRepairFormData.repairResult,
    cost: completeRepairFormData.cost ?? 0
  })
    .then(() => {
      message.success('维修已完成')
      completeRepairModalVisible.value = false
      resetCompleteRepairForm()
      return Promise.all([loadSummary(), loadRepairs()])
    })
    .catch(() => {
      message.error('操作失败')
    })
    .finally(() => {
      loading.value = false
    })
}

const handleCompleteRepairCancel = () => {
  completeRepairModalVisible.value = false
  resetCompleteRepairForm()
}

const resetCompleteRepairForm = () => {
  Object.assign(completeRepairFormData, {
    repairResult: '',
    cost: 0
  })
}

// 生命周期
onMounted(() => {
  Promise.all([loadSummary(), loadRepairs()])
})
</script>

<style scoped lang="scss">
.stats-section {
  margin-bottom: 16px;
}

.stat-card {
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-card {
  gap: 10px;
  margin-bottom: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}
.search-filters {
  display: flex;
  align-items: center;
  gap: 10px;
  @media (max-width: 768px) {
    flex-direction: column;
  }
}
.search-input {
  width: 240px;
  min-width: 200px;
}
.repair-list-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.repair-detail {
  padding: 16px 0;
}

.timeline-content {
  margin-left: 8px;
}

.timeline-title {
  font-weight: 500;
  color: #333;
  margin-bottom: 4px;
}

.timeline-desc {
  color: #666;
  margin-bottom: 8px;
  line-height: 1.5;
}

.timeline-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

.repair-images {
  margin-top: 20px;
}

.repair-images h4 {
  margin-bottom: 12px;
  color: #333;
}

/* 移动端适配 - 768px以下 */
@media (max-width: 768px) {
  .stats-section {
    margin-bottom: 16px;
  }

  .stat-card {
    margin-bottom: 16px;
  }

  .search-section {
    margin-bottom: 16px;
  }

  .search-form .ant-form-item {
    margin-bottom: 12px;
  }

  .table-section {
    margin-bottom: 16px;
  }

  .page-header-extra {
    flex-direction: column;
    gap: 8px;
  }

  .page-header-extra .ant-btn {
    width: 100%;
  }
  .search-input {
    width: 100%;
    min-width: auto;
  }

  .repair-list-card :deep(.ant-table-thead > tr > th) {
    padding: 8px 4px;
    font-size: 12px;
  }

  .repair-list-card :deep(.ant-table-tbody > tr > td) {
    font-size: 12px;
  }
  .repair-list-card :deep(.ant-table-tbody > tr > td .ant-btn) {
    padding: 2px 4px;
  }
}
</style>
