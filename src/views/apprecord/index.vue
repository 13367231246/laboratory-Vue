<template>
  <div class="application-record-page">
    <!-- 筛选和搜索 -->
    <div class="filter-card">
      <div class="filter-section">
        <div class="filter-left">
          <a-select v-model:value="filterType" placeholder="申请类型筛选" allow-clear @change="handleFilterChange" class="type-filter">
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="personal">个人使用</a-select-option>
            <a-select-option value="course">课程使用</a-select-option>
          </a-select>

          <a-select v-model:value="statusFilter" placeholder="状态筛选" allow-clear @change="handleFilter" class="type-filter">
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

    <!-- 申请记录列表 -->
    <div class="record-list-card">
      <a-table :columns="columns" :data-source="filteredRecords" :loading="loading" :scroll="{ x: 800 }" :pagination="pagination" row-key="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'type'">
            <div>
              <a-tag :color="getTypeColor(record.type)">
                {{ getTypeText(record.type) }}
              </a-tag>
              <br />
              <a-tag :color="getApplicationTypeColor(record.applicationType)" size="small">
                {{ getApplicationTypeText(record.applicationType) }}
              </a-tag>
            </div>
          </template>

          <template v-else-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button type="link" size="small" @click="viewDetail(record)"> 详情 </a-button>
              <a-button v-if="record.status === 'using'" type="link" size="small" @click="handleComplete(record)" style="color: #52c41a"> 完成 </a-button>
              <a-button type="link" size="small" @click="handleRepair(record)" style="color: #fa8c16"> 报修 </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 详情模态框 -->
    <a-modal v-model:open="detailModalVisible" title="申请详情" width="800px" :footer="null">
      <div v-if="selectedRecord" class="detail-content">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="申请类型">
            <a-tag :color="getTypeColor(selectedRecord.type)">
              {{ getTypeText(selectedRecord.type) }}
            </a-tag>
            <a-tag :color="getApplicationTypeColor(selectedRecord.applicationType)" style="margin-left: 8px">
              {{ getApplicationTypeText(selectedRecord.applicationType) }}
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
          <a-descriptions-item label="实验室"> {{ selectedRecord.labName }} ({{ selectedRecord.labLocation }}) </a-descriptions-item>
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
import { ref, reactive, computed, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, ReloadOutlined, ExportOutlined, EyeOutlined, CheckOutlined, ToolOutlined } from '@ant-design/icons-vue'
import { useRouter } from 'vue-router'
const router = useRouter()
// 响应式数据
const loading = ref(false)
const filterType = ref('all')
const statusFilter = ref(undefined)
const searchText = ref('')
const detailModalVisible = ref(false)
const selectedRecord = ref(null)

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
})

// 模拟数据
const records = ref([
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
    status: 'using',
    remark: '研究项目需要'
  },
  {
    id: 3,
    type: 'lab',
    applicationType: 'course',
    applicant: '王五',
    phone: '13800138003',
    labId: 3,
    labName: '化学实验室C',
    labLocation: '实验楼C座101',
    applyTime: '2024-01-14 16:45',
    timeRange: '2024-01-15 09:00 - 2024-01-15 11:00',
    participantCount: 20,
    purpose: '有机化学实验教学',
    requiredEquipment: ['实验台', '通风设备'],
    specialRequirements: '需要通风设备',
    contactInfo: '13800138003',
    status: 'completed',
    remark: '实验教学完成'
  },
  {
    id: 4,
    type: 'lab',
    applicationType: 'personal',
    applicant: '赵六',
    phone: '13800138004',
    labId: 1,
    labName: '计算机实验室A',
    labLocation: '教学楼A座201',
    applyTime: '2024-01-14 11:15',
    timeRange: '2024-01-15 19:00 - 2024-01-15 21:00',
    participantCount: 1,
    purpose: '个人编程学习',
    requiredEquipment: ['台式电脑'],
    specialRequirements: '',
    contactInfo: 'zhaoliu@email.com',
    status: 'completed',
    remark: '时间冲突，实验室已有预约'
  },
  {
    id: 5,
    type: 'lab',
    applicationType: 'course',
    applicant: '钱七',
    phone: '13800138005',
    labId: 2,
    labName: '物理实验室B',
    labLocation: '实验楼B座301',
    applyTime: '2024-01-13 08:30',
    timeRange: '2024-01-18 10:00 - 2024-01-18 12:00',
    participantCount: 30,
    purpose: '物理实验课程',
    requiredEquipment: ['实验台', '测量仪器', '电源设备'],
    specialRequirements: '需要所有设备正常',
    contactInfo: '13800138005',
    status: 'using',
    remark: '重要课程实验'
  }
])

// 表格列配置
const columns = [
  {
    title: '申请类型',
    dataIndex: 'type',
    key: 'type',
    width: 100
  },
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
    title: '人数',
    dataIndex: 'participantCount',
    key: 'participantCount',
    width: 60
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
    width: 70
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right'
  }
]

// 计算属性 - 过滤后的记录
const filteredRecords = computed(() => {
  let result = records.value

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

const getApplicationTypeColor = (applicationType) => {
  const colorMap = {
    personal: 'blue',
    course: 'green'
  }
  return colorMap[applicationType] || 'default'
}

const getApplicationTypeText = (applicationType) => {
  const textMap = {
    personal: '个人使用',
    course: '课程使用'
  }
  return textMap[applicationType] || '未知'
}

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
  // 类型筛选变化时重置分页
  pagination.current = 1
}

const handleFilter = () => {
  // 状态筛选变化时重置分页
  pagination.current = 1
}

const handleRefresh = async () => {
  loading.value = true
  try {
    // 模拟API调用
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
  selectedRecord.value = record
  detailModalVisible.value = true
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

// 生命周期
onMounted(() => {
  pagination.total = records.value.length
})
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
  .ant-radio-button-wrapper {
    border-radius: 6px;
    font-weight: 500;
  }
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

  .type-filter {
    width: 100%;

    .ant-radio-group {
      display: flex;
      width: 100%;
    }

    .ant-radio-button-wrapper {
      flex: 1;
      text-align: center;
    }
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

  /* 表格移动端优化 */
  .record-list-card :deep(.ant-table) {
    font-size: 12px;
  }

  .record-list-card :deep(.ant-table-thead > tr > th) {
    padding: 8px 4px;
    font-size: 12px;
  }

  .record-list-card :deep(.ant-table-tbody > tr > td) {
    padding: 8px 4px;
    font-size: 12px;
  }

  .record-list-card :deep(.ant-table-tbody > tr > td .ant-btn) {
    padding: 2px 4px;
    font-size: 12px;
  }

  .record-list-card :deep(.ant-table-tbody > tr > td .ant-tag) {
    font-size: 11px;
    padding: 2px 6px;
  }

  /* 分页器移动端优化 */
  .record-list-card :deep(.ant-pagination) {
    text-align: center;
    margin-top: 16px;
  }

  .record-list-card :deep(.ant-pagination-item) {
    min-width: 28px;
    height: 28px;
    line-height: 26px;
  }

  .record-list-card :deep(.ant-pagination-prev),
  .record-list-card :deep(.ant-pagination-next) {
    min-width: 28px;
    height: 28px;
    line-height: 26px;
  }
}

/* 详情模态框移动端适配 */
@media (max-width: 768px) {
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
