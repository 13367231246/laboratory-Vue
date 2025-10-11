<template>
  <div class="lab-management-page">
    <!-- 统计卡片 -->
    <a-row :gutter="24" class="stats-section">
      <a-col :xs="12" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic title="总实验室数" :value="stats.totalLabs" :value-style="{ color: '#1890ff' }">
            <template #prefix>
              <ExperimentOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic title="使用中" :value="stats.usingLabs" :value-style="{ color: '#52c41a' }">
            <template #prefix>
              <ClockCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic title="需要处理" :value="stats.pendingLabs" :value-style="{ color: '#faad14' }">
            <template #prefix>
              <ExclamationCircleOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
      <a-col :xs="12" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic title="总设备数" :value="stats.totalEquipment" :value-style="{ color: '#722ed1' }">
            <template #prefix>
              <ToolOutlined />
            </template>
          </a-statistic>
        </a-card>
      </a-col>
    </a-row>

    <!-- 搜索和筛选 -->
    <a-card class="search-card">
      <div class="search-filters">
        <a-input v-model:value="searchText" placeholder="搜索" allow-clear class="search-input">
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>

        <a-select v-model:value="statusFilter" placeholder="状态筛选" allow-clear @change="handleFilter" class="filter-select">
          <a-select-option value="0">正常且空闲</a-select-option>
          <a-select-option value="1">使用中</a-select-option>
          <a-select-option value="2">需要处理</a-select-option>
        </a-select>

        <a-select v-model:value="managerFilter" placeholder="负责人筛选" allow-clear @change="handleFilter" class="filter-select">
          <a-select-option value="张老师">张老师</a-select-option>
          <a-select-option value="李老师">李老师</a-select-option>
          <a-select-option value="王老师">王老师</a-select-option>
        </a-select>
      </div>

      <div class="action-buttons">
        <a-button type="primary" @click="handleSearch" :loading="loading" class="action-btn primary-btn">
          <SearchOutlined />
          搜索
        </a-button>
        <a-button @click="handleRefresh" :loading="loading" class="action-btn">
          <ReloadOutlined />
          刷新
        </a-button>
        <a-button type="primary" @click="goToAddLab" class="action-btn primary-btn">
          <PlusOutlined />
          添加实验室
        </a-button>
        <a-button @click="handleExport" class="action-btn">
          <ExportOutlined />
          导出数据
        </a-button>
      </div>
    </a-card>

    <!-- 实验室列表 -->
    <a-card class="lab-list-card">
      <a-table :columns="columns" :data-source="filteredLabs" :loading="loading" :pagination="pagination" :scroll="{ x: 800 }" row-key="id" @change="handleTableChange" size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'equipment'">
            <a-badge :count="record.equipmentCount" :number-style="{ backgroundColor: '#52c41a' }">
              <a-button type="link" @click="showEquipmentModal(record)"> 查看设备 </a-button>
            </a-badge>
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-dropdown>
              <a-button type="link" size="small">
                操作
                <DownOutlined />
              </a-button>
              <template #overlay>
                <a-menu>
                  <a-menu-item key="edit" @click="editLab(record)">
                    <EditOutlined />
                    编辑
                  </a-menu-item>
                  <a-menu-item key="detail" @click="viewLabDetail(record)">
                    <EyeOutlined />
                    详情
                  </a-menu-item>
                  <a-menu-divider />
                  <a-menu-item key="delete" @click="deleteLab(record.id)" danger>
                    <DeleteOutlined />
                    删除
                  </a-menu-item>
                </a-menu>
              </template>
            </a-dropdown>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 设备列表模态框 -->
    <a-modal v-model:open="equipmentModalVisible" title="设备列表" width="1000px" :footer="null">
      <div class="equipment-modal-header">
        <h3>{{ selectedLab?.name }} - 设备管理</h3>
        <a-button type="primary" @click="showAddEquipmentModal">
          <PlusOutlined />
          添加设备
        </a-button>
      </div>

      <a-table :columns="equipmentColumns" :data-source="selectedLab?.equipment || []" :pagination="false" row-key="id" size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getEquipmentStatusColor(record.status)">
              {{ getEquipmentStatusText(record.status) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button type="link" size="small" @click="editEquipment(record)"> 编辑 </a-button>
              <a-button type="link" size="small" @click="deleteEquipment(record.id)" danger> 删除 </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined, ImportOutlined, ExportOutlined, SearchOutlined, ReloadOutlined, ExperimentOutlined, ClockCircleOutlined, ExclamationCircleOutlined, ToolOutlined, DownOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons-vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const searchText = ref('')
const statusFilter = ref(undefined)
const managerFilter = ref(undefined)
const equipmentModalVisible = ref(false)
const selectedLab = ref(null)

// 统计数据
const stats = ref({
  totalLabs: 12,
  usingLabs: 8,
  pendingLabs: 2,
  totalEquipment: 156
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

// 实验室数据
const labs = ref([
  {
    id: 1,
    name: '计算机实验室A',
    location: '教学楼A座201',
    capacity: 40,
    status: 0,
    manager: '张老师',
    phone: '13800138001',
    description: '主要用于计算机课程教学',
    equipmentCount: 45,
    equipment: [
      { id: 1, name: '台式电脑', model: 'Dell OptiPlex', status: 0, serialNumber: 'PC001' },
      { id: 2, name: '投影仪', model: 'Epson CB-X41', status: 0, serialNumber: 'PJ001' },
      { id: 3, name: '网络设备', model: 'Cisco Switch', status: 0, serialNumber: 'NW001' }
    ]
  },
  {
    id: 2,
    name: '物理实验室B',
    location: '实验楼B座301',
    capacity: 30,
    status: 1,
    manager: '李老师',
    phone: '13800138002',
    description: '物理实验教学专用',
    equipmentCount: 38,
    equipment: [
      { id: 4, name: '实验台', model: 'Lab Table Pro', status: 0, serialNumber: 'TB001' },
      { id: 5, name: '测量仪器', model: 'Digital Multimeter', status: 0, serialNumber: 'MM001' }
    ]
  },
  {
    id: 3,
    name: '化学实验室C',
    location: '实验楼C座101',
    capacity: 25,
    status: 2,
    manager: '王老师',
    phone: '13800138003',
    description: '化学实验教学专用',
    equipmentCount: 32,
    equipment: [
      { id: 6, name: '实验台', model: 'Chem Table', status: 0, serialNumber: 'CT001' },
      { id: 7, name: '通风设备', model: 'Ventilation System', status: 2, serialNumber: 'VS001' }
    ]
  }
])

// 表格列配置
const columns = [
  {
    title: '实验室名称',
    dataIndex: 'name',
    key: 'name',
    sorter: true,
    width: 120,
    ellipsis: true
  },
  {
    title: '位置',
    dataIndex: 'location',
    key: 'location',
    width: 100,
    ellipsis: true
  },
  {
    title: '容量',
    dataIndex: 'capacity',
    key: 'capacity',
    sorter: true,
    width: 80
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '负责人',
    dataIndex: 'manager',
    key: 'manager',
    width: 80,
    ellipsis: true
  },
  {
    title: '设备数',
    key: 'equipment',
    width: 100
  },
  {
    title: '操作',
    key: 'actions',
    width: 50,
    fixed: 'right'
  }
]

// 设备表格列配置
const equipmentColumns = [
  {
    title: '设备名称',
    dataIndex: 'name',
    key: 'name'
  },
  {
    title: '型号',
    dataIndex: 'model',
    key: 'model'
  },
  {
    title: '序列号',
    dataIndex: 'serialNumber',
    key: 'serialNumber'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '操作',
    key: 'actions',
    width: 150
  }
]

// 计算属性
const filteredLabs = computed(() => {
  let result = labs.value

  // 搜索过滤
  if (searchText.value) {
    result = result.filter((lab) => lab.name.toLowerCase().includes(searchText.value.toLowerCase()) || lab.location.toLowerCase().includes(searchText.value.toLowerCase()))
  }

  // 状态过滤
  if (statusFilter.value !== undefined) {
    result = result.filter((lab) => lab.status === parseInt(statusFilter.value))
  }

  // 负责人过滤
  if (managerFilter.value) {
    result = result.filter((lab) => lab.manager === managerFilter.value)
  }

  return result
})

// 方法
const getStatusColor = (status) => {
  const colorMap = {
    0: 'green', // 正常且空闲
    1: 'blue', // 使用中
    2: 'orange' // 需要处理
  }
  return colorMap[status] || 'default'
}

const getStatusText = (status) => {
  const textMap = {
    0: '正常且空闲',
    1: '使用中',
    2: '需要处理'
  }
  return textMap[status] || '未知'
}

const getEquipmentStatusColor = (status) => {
  const colorMap = {
    0: 'green', // 正常且空闲
    1: 'blue', // 使用中
    2: 'red' // 异常
  }
  return colorMap[status] || 'default'
}

const getEquipmentStatusText = (status) => {
  const textMap = {
    0: '正常且空闲',
    1: '使用中',
    2: '异常'
  }
  return textMap[status] || '未知'
}

const handleSearch = () => {
  // 搜索逻辑已在计算属性中处理
}

const handleFilter = () => {
  // 筛选逻辑已在计算属性中处理
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

const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

const goToAddLab = () => {
  router.push('/lab-add')
}

const editLab = (record) => {
  message.info('编辑功能开发中...')
}

const viewLabDetail = (record) => {
  router.push(`/lab-detail/${record.id}`)
}

const deleteLab = async (id) => {
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500))
    labs.value = labs.value.filter((lab) => lab.id !== id)
    message.success('删除成功')
  } catch (error) {
    message.error('删除失败')
  }
}

const showEquipmentModal = (record) => {
  selectedLab.value = record
  equipmentModalVisible.value = true
}

const editEquipment = (record) => {
  message.info('编辑设备功能开发中...')
}

const deleteEquipment = async (id) => {
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 500))
    selectedLab.value.equipment = selectedLab.value.equipment.filter((eq) => eq.id !== id)
    message.success('删除成功')
  } catch (error) {
    message.error('删除失败')
  }
}

const showAddEquipmentModal = () => {
  message.info('添加设备功能开发中...')
}

const handleImport = () => {
  message.info('批量导入功能开发中...')
}

const handleExport = () => {
  message.info('导出数据功能开发中...')
}

// 生命周期
onMounted(() => {
  // 加载数据
  pagination.total = labs.value.length
})
</script>

<style scoped>
.lab-management-page {
  margin-top: 10px;
}
.stats-section {
  margin-bottom: 24px;
}

.stat-card {
  text-align: center;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-card {
  margin-bottom: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-filters {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.search-input {
  width: 240px;
  min-width: 200px;
}

.filter-select {
  width: 240px;
  min-width: 200px;
}

.action-buttons {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.action-btn {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.primary-btn {
  background: linear-gradient(135deg, #1890ff 0%, #40a9ff 100%);
  border: none;
  box-shadow: 0 2px 8px rgba(24, 144, 255, 0.3);
}

.primary-btn:hover {
  background: linear-gradient(135deg, #40a9ff 0%, #69c0ff 100%);
  box-shadow: 0 4px 16px rgba(24, 144, 255, 0.4);
}

.lab-list-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.equipment-modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid #f0f0f0;
}

.equipment-modal-header h3 {
  margin: 0;
  color: #333;
}

/* 移动端适配 - 768px以下 */
@media (max-width: 768px) {
  .stats-section {
    margin-bottom: 16px;
  }

  .stat-card {
    margin-bottom: 8px;
  }

  .lab-list-card {
    margin-bottom: 16px;
  }

  /* 表格移动端优化 */
  .lab-list-card :deep(.ant-table) {
    font-size: 12px;
  }

  .lab-list-card :deep(.ant-table-thead > tr > th) {
    padding: 8px 4px;
    font-size: 12px;
  }

  .lab-list-card :deep(.ant-table-tbody > tr > td) {
    padding: 8px 4px;
    font-size: 12px;
  }

  .lab-list-card :deep(.ant-table-tbody > tr > td .ant-btn) {
    padding: 2px 4px;
    font-size: 12px;
  }

  .lab-list-card :deep(.ant-table-tbody > tr > td .ant-tag) {
    font-size: 11px;
    padding: 2px 6px;
  }

  /* 分页器移动端优化 */
  .lab-list-card :deep(.ant-pagination) {
    text-align: center;
    margin-top: 16px;
  }

  .lab-list-card :deep(.ant-pagination-item) {
    min-width: 28px;
    height: 28px;
    line-height: 26px;
  }

  .lab-list-card :deep(.ant-pagination-prev),
  .lab-list-card :deep(.ant-pagination-next) {
    min-width: 28px;
    height: 28px;
    line-height: 26px;
  }

  .search-input,
  .filter-select {
    width: 100%;
    min-width: auto;
  }

  .action-buttons {
    flex-direction: column;
    gap: 8px;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
