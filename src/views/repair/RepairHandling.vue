<template>
  <div class="repair-handling-page">
    <!-- 统计卡片 -->
    <a-row :gutter="24" class="stats-section">
      <a-col :xs="12" :sm="12" :md="6">
        <a-card class="stat-card">
          <a-statistic title="待处理" :value="stats.pending" :value-style="{ color: '#faad14' }">
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
          <a-statistic title="本月维修" :value="stats.monthly" :value-style="{ color: '#722ed1' }">
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
        <a-input v-model:value="searchText" placeholder="搜索设备名称或报修人" allow-clear @change="handleSearch" class="search-input">
          <template #prefix>
            <SearchOutlined />
          </template>
        </a-input>

        <a-select v-model:value="statusFilter" placeholder="状态筛选" allow-clear @change="handleFilter" class="search-input">
          <a-select-option value="0">等待维修</a-select-option>
          <a-select-option value="1">维修中</a-select-option>
          <a-select-option value="2">完成维修</a-select-option>
        </a-select>

        <a-select v-model:value="urgencyFilter" placeholder="紧急程度" allow-clear @change="handleFilter" class="search-input">
          <a-select-option value="low">低</a-select-option>
          <a-select-option value="medium">中</a-select-option>
          <a-select-option value="high">高</a-select-option>
          <a-select-option value="critical">紧急</a-select-option>
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
    <a-card class="repair-list-card">
      <a-table :columns="columns" :data-source="filteredRepairs" :scroll="{ x: 800 }" :loading="loading" :pagination="pagination" row-key="id" @change="handleTableChange">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getStatusColor(record.status)">
              {{ getStatusText(record.status) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'urgency'">
            <a-tag :color="getUrgencyColor(record.urgency)">
              {{ getUrgencyText(record.urgency) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'images'">
            <a-button type="link" size="small" @click="showImages(record)"> 查看照片 ({{ record.images?.length || 0 }}) </a-button>
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space>
              <a-button type="link" size="small" @click="completeRepair(record)" v-if="record.status === 1"> 完成维修 </a-button>
              <a-button type="link" size="small" @click="viewDetail(record)"> 详情 </a-button>
              <a-button type="link" size="small" @click="editRepair(record)"> 编辑 </a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </a-card>

    <!-- 维修详情模态框 -->
    <a-modal v-model:open="detailModalVisible" title="维修详情" width="800px" :footer="null">
      <div class="repair-detail" v-if="selectedRepair">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="报修类型">
            {{ getRepairTypeText(selectedRepair.repairType) }}
          </a-descriptions-item>
          <a-descriptions-item label="实验室">
            {{ selectedRepair.labName }}
          </a-descriptions-item>
          <a-descriptions-item label="设备名称">
            {{ selectedRepair.equipmentName }}
          </a-descriptions-item>
          <a-descriptions-item label="紧急程度">
            <a-tag :color="getUrgencyColor(selectedRepair.urgency)">
              {{ getUrgencyText(selectedRepair.urgency) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="报修人">
            {{ selectedRepair.reporter }}
          </a-descriptions-item>
          <a-descriptions-item label="联系方式">
            {{ selectedRepair.contactInfo }}
          </a-descriptions-item>
          <a-descriptions-item label="报修时间">
            {{ selectedRepair.reportTime }}
          </a-descriptions-item>
          <a-descriptions-item label="当前状态">
            <a-tag :color="getStatusColor(selectedRepair.status)">
              {{ getStatusText(selectedRepair.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="故障描述" :span="2">
            {{ selectedRepair.description }}
          </a-descriptions-item>
          <a-descriptions-item label="维修记录" :span="2" v-if="selectedRepair.repairRecords">
            <a-timeline>
              <a-timeline-item v-for="record in selectedRepair.repairRecords" :key="record.id" :color="record.status === 'completed' ? 'green' : 'blue'">
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

        <div v-if="selectedRepair.images && selectedRepair.images.length > 0" class="repair-images">
          <h4>故障照片</h4>
          <a-image-preview-group>
            <a-image v-for="(image, index) in selectedRepair.images" :key="index" :src="image.url" :width="120" :height="120" style="margin-right: 8px; margin-bottom: 8px" />
          </a-image-preview-group>
        </div>
      </div>
    </a-modal>

    <!-- 完成维修模态框 -->
    <a-modal v-model:open="completeRepairModalVisible" title="完成维修" @ok="handleCompleteRepair" @cancel="handleCompleteRepairCancel">
      <a-form ref="completeRepairFormRef" :model="completeRepairFormData" :rules="completeRepairFormRules" :label-col="{ span: 6 }" :wrapper-col="{ span: 18 }">
        <a-form-item label="维修结果" name="result">
          <a-radio-group v-model:value="completeRepairFormData.result">
            <a-radio value="success">维修成功</a-radio>
            <a-radio value="partial">部分修复</a-radio>
            <a-radio value="failed">维修失败</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="维修总结" name="summary">
          <a-textarea v-model:value="completeRepairFormData.summary" placeholder="请描述维修过程和结果" :rows="4" />
        </a-form-item>

        <a-form-item label="使用材料" name="materials">
          <a-textarea v-model:value="completeRepairFormData.materials" placeholder="记录使用的材料和成本" :rows="2" />
        </a-form-item>

        <a-form-item label="维修照片" name="repairImages">
          <a-upload v-model:file-list="completeRepairFormData.repairImages" list-type="picture-card" :before-upload="beforeUpload" :max-count="3" accept="image/*">
            <div v-if="completeRepairFormData.repairImages.length < 3">
              <PlusOutlined />
              <div style="margin-top: 8px">上传照片</div>
            </div>
          </a-upload>
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined, ExportOutlined, SearchOutlined, ReloadOutlined, ClockCircleOutlined, ToolOutlined, CheckCircleOutlined, CalendarOutlined } from '@ant-design/icons-vue'

const router = useRouter()

// 响应式数据
const loading = ref(false)
const searchText = ref('')
const statusFilter = ref(undefined)
const urgencyFilter = ref(undefined)
const detailModalVisible = ref(false)
const completeRepairModalVisible = ref(false)
const selectedRepair = ref(null)

// 统计数据
const stats = ref({
  pending: 8,
  repairing: 5,
  completed: 23,
  monthly: 36
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
const repairs = ref([
  {
    id: 1,
    repairType: 'equipment',
    labName: '计算机实验室A',
    equipmentName: '台式电脑',
    description: '电脑无法开机，电源指示灯不亮',
    urgency: 'high',
    status: 0,
    reporter: '张同学',
    contactInfo: '13800138001',
    reportTime: '2024-01-15 14:30',
    images: [{ url: 'https://via.placeholder.com/300x200?text=故障照片1' }, { url: 'https://via.placeholder.com/300x200?text=故障照片2' }],
    repairRecords: []
  },
  {
    id: 2,
    repairType: 'environment',
    labName: '物理实验室B',
    equipmentName: '空调设备',
    description: '空调制冷效果差，温度降不下来',
    urgency: 'medium',
    status: 1,
    reporter: '李老师',
    contactInfo: '13800138002',
    reportTime: '2024-01-14 10:20',
    images: [{ url: 'https://via.placeholder.com/300x200?text=空调故障' }],
    repairRecords: [
      {
        id: 1,
        title: '开始维修',
        description: '检查空调制冷系统，发现制冷剂不足',
        operator: '王师傅',
        time: '2024-01-14 15:30',
        status: 'completed'
      }
    ]
  },
  {
    id: 3,
    repairType: 'equipment',
    labName: '化学实验室C',
    equipmentName: '通风设备',
    description: '通风设备噪音过大，影响正常使用',
    urgency: 'low',
    status: 2,
    reporter: '王同学',
    contactInfo: '13800138003',
    reportTime: '2024-01-13 16:45',
    images: [],
    repairRecords: [
      {
        id: 1,
        title: '开始维修',
        description: '检查通风设备，发现风扇轴承磨损',
        operator: '赵师傅',
        time: '2024-01-13 17:00',
        status: 'completed'
      },
      {
        id: 2,
        title: '完成维修',
        description: '更换风扇轴承，测试运行正常',
        operator: '赵师傅',
        time: '2024-01-13 18:30',
        status: 'completed'
      }
    ]
  }
])

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
    title: '紧急程度',
    dataIndex: 'urgency',
    key: 'urgency'
  },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status'
  },
  {
    title: '报修人',
    dataIndex: 'reporter',
    key: 'reporter'
  },
  {
    title: '报修时间',
    dataIndex: 'reportTime',
    key: 'reportTime',
    sorter: true
  },
  {
    title: '故障照片',
    key: 'images'
  },
  {
    title: '操作',
    key: 'actions',
    width: 200
  }
]

// 完成维修表单数据
const completeRepairFormData = reactive({
  result: 'success',
  summary: '',
  materials: '',
  repairImages: []
})

// 完成维修表单验证规则
const completeRepairFormRules = {
  result: [{ required: true, message: '请选择维修结果', trigger: 'change' }],
  summary: [{ required: true, message: '请输入维修总结', trigger: 'blur' }]
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

  // 紧急程度过滤
  if (urgencyFilter.value) {
    result = result.filter((repair) => repair.urgency === urgencyFilter.value)
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

const getUrgencyColor = (urgency) => {
  const colorMap = {
    low: 'green',
    medium: 'blue',
    high: 'orange',
    critical: 'red'
  }
  return colorMap[urgency] || 'default'
}

const getUrgencyText = (urgency) => {
  const textMap = {
    low: '低',
    medium: '中',
    high: '高',
    critical: '紧急'
  }
  return textMap[urgency] || '未知'
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
  console.log('搜索')
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

const showImages = (record) => {
  selectedRepair.value = record
  detailModalVisible.value = true
}

const viewDetail = (record) => {
  selectedRepair.value = record
  detailModalVisible.value = true
}

const editRepair = (record) => {
  message.info('编辑维修记录功能开发中...')
}

const completeRepair = (record) => {
  selectedRepair.value = record
  completeRepairModalVisible.value = true
}

const handleCompleteRepair = async () => {
  try {
    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 更新维修状态
    selectedRepair.value.status = 2
    selectedRepair.value.repairRecords.push({
      id: Date.now(),
      title: '完成维修',
      description: completeRepairFormData.summary,
      operator: '当前用户',
      time: new Date().toLocaleString(),
      status: 'completed'
    })

    message.success('维修已完成')
    completeRepairModalVisible.value = false
    resetCompleteRepairForm()
  } catch (error) {
    message.error('操作失败')
  }
}

const handleCompleteRepairCancel = () => {
  completeRepairModalVisible.value = false
  resetCompleteRepairForm()
}

const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件!')
    return false
  }
  const isLt5M = file.size / 1024 / 1024 < 5
  if (!isLt5M) {
    message.error('图片大小不能超过 5MB!')
    return false
  }
  return false // 阻止自动上传
}

const resetCompleteRepairForm = () => {
  Object.assign(completeRepairFormData, {
    result: 'success',
    summary: '',
    materials: '',
    repairImages: []
  })
}

// 生命周期
onMounted(() => {
  // 加载数据
  pagination.total = repairs.value.length
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
}
</style>
