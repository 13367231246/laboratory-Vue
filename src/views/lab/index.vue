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
        <a-input v-model:value="searchText" placeholder="根据名称和位置搜索" allow-clear class="search-input">
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
              <a-button type="link" @click="goToEquipmentDetails(record)"> 查看设备 </a-button>
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
                  <a-menu-item key="edit" @click="openEditLab(record)">
                    <EditOutlined />
                    编辑
                  </a-menu-item>
                  <a-menu-item key="detail" @click="openLabDetail(record)">
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

    <!-- 实验室详情弹窗 -->
    <a-modal v-model:open="detailVisible" title="实验室详情" width="800px" :footer="null">
      <LabDetail v-if="currentLab" :lab="currentLab" @edit-lab="openEditLab(currentLab)" @add-equipment="openAddEquipment" @edit-equipment="openEditEquipment" @delete-equipment="deleteEquipment" />
    </a-modal>

    <!-- 编辑实验室弹窗 -->
    <a-modal v-model:open="editLabVisible" title="编辑实验室" width="640px" @ok="saveLab" :confirm-loading="savingLab" ok-text="保存" cancel-text="取消">
      <a-form :model="labForm" :label-col="{ span: 5 }" :wrapper-col="{ span: 17 }" :rules="labRules" ref="labFormRef">
        <a-form-item label="实验室名称" name="name">
          <a-input v-model:value="labForm.name" placeholder="请输入实验室名称" />
        </a-form-item>
        <a-form-item label="位置" name="location">
          <a-input v-model:value="labForm.location" placeholder="请输入位置" />
        </a-form-item>
        <a-form-item label="容量" name="capacity">
          <a-input-number v-model:value="labForm.capacity" :min="1" :max="200" style="width: 100%" />
        </a-form-item>
        <a-form-item label="负责人" name="manager">
          <a-input v-model:value="labForm.manager" placeholder="请输入负责人" />
        </a-form-item>
        <a-form-item label="联系电话" name="phone">
          <a-input v-model:value="labForm.phone" placeholder="请输入联系电话" />
        </a-form-item>
        <a-form-item label="描述" name="description">
          <a-textarea v-model:value="labForm.description" :rows="3" placeholder="请输入描述" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 新增/编辑设备弹窗 -->
    <a-modal v-model:open="equipmentFormVisible" :title="equipmentEditing ? '编辑设备' : '新增设备'" width="520px" @ok="saveEquipment" :confirm-loading="savingEquipment" ok-text="保存" cancel-text="取消">
      <a-form :model="equipmentForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }" ref="equipmentFormRef" :rules="equipmentRules">
        <a-form-item label="设备名称" name="name">
          <a-input v-model:value="equipmentForm.name" placeholder="请输入设备名称" />
        </a-form-item>
        <a-form-item label="型号" name="model">
          <a-input v-model:value="equipmentForm.model" placeholder="请输入型号" />
        </a-form-item>
        <a-form-item label="序列号" name="serialNumber">
          <a-input v-model:value="equipmentForm.serialNumber" placeholder="请输入序列号" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined, ImportOutlined, ExportOutlined, SearchOutlined, ReloadOutlined, ExperimentOutlined, ClockCircleOutlined, ExclamationCircleOutlined, ToolOutlined, DownOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'
import LabDetail from './laboratory-details/index.vue'

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const loading = ref(false)
const searchText = ref('')
const statusFilter = ref(undefined)
const managerFilter = ref(undefined)
const equipmentModalVisible = ref(false)
const selectedLab = ref(null)
const detailVisible = ref(false)
const editLabVisible = ref(false)
const equipmentFormVisible = ref(false)
const currentLab = ref(null)
const equipmentEditing = ref(false)
const savingLab = ref(false)
const savingEquipment = ref(false)

// 表单模型
const labFormRef = ref()
const equipmentFormRef = ref()
const labForm = reactive({ id: null, name: '', location: '', capacity: undefined, manager: '', phone: '', description: '' })
const equipmentForm = reactive({ id: null, name: '', model: '', serialNumber: '' })

// 校验规则
const labRules = {
  name: [{ required: true, message: '请输入实验室名称', trigger: 'blur' }],
  location: [{ required: true, message: '请输入位置', trigger: 'blur' }],
  capacity: [{ required: true, type: 'number', message: '请输入容量', trigger: 'change' }],
  manager: [{ required: true, message: '请输入负责人', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号', trigger: 'blur' }
  ]
}

const equipmentRules = {
  name: [{ required: true, message: '请输入设备名称', trigger: 'blur' }],
  model: [{ required: true, message: '请输入型号', trigger: 'blur' }],
  serialNumber: [{ required: true, message: '请输入序列号', trigger: 'blur' }]
}

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
    capacity: 40, // 容量
    manager: '张老师', // 负责人
    phone: '13800138001', // 联系电话
    description: '主要用于计算机课程教学', // 描述
    equipmentCount: 45, // 设备数
    equipment: [
      { id: 1, name: '台式电脑', model: 'Dell OptiPlex', serialNumber: 'PC001' },
      { id: 2, name: '投影仪', model: 'Epson CB-X41', serialNumber: 'PJ001' },
      { id: 3, name: '网络设备', model: 'Cisco Switch', serialNumber: 'NW001' }
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

  // 仅显示当前老师负责的实验室
  if (userStore?.userInfo?.name) {
    result = result.filter((lab) => lab.manager === userStore.userInfo.name)
  }

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

const openLabDetail = (record) => {
  currentLab.value = JSON.parse(JSON.stringify(record))
  detailVisible.value = true
}

const openEditLab = (record) => {
  currentLab.value = record
  Object.assign(labForm, { id: record.id, name: record.name, location: record.location, capacity: record.capacity, manager: record.manager, phone: record.phone, description: record.description })
  editLabVisible.value = true
}

const saveLab = async () => {
  try {
    await labFormRef.value.validate()
    savingLab.value = true
    // 模拟更新
    const idx = labs.value.findIndex((l) => l.id === labForm.id)
    if (idx !== -1) {
      labs.value[idx] = { ...labs.value[idx], ...labForm }
      message.success('保存成功')
      editLabVisible.value = false
      // 同步详情
      if (currentLab.value && currentLab.value.id === labForm.id) {
        currentLab.value = JSON.parse(JSON.stringify(labs.value[idx]))
      }
    }
  } catch (e) {
    // 验证失败或异常
  } finally {
    savingLab.value = false
  }
}

const openAddEquipment = () => {
  equipmentEditing.value = false
  Object.assign(equipmentForm, { id: null, name: '', model: '', serialNumber: '' })
  equipmentFormVisible.value = true
}

const openEditEquipment = (item) => {
  equipmentEditing.value = true
  Object.assign(equipmentForm, item)
  equipmentFormVisible.value = true
}

const saveEquipment = async () => {
  try {
    await equipmentFormRef.value.validate()
    savingEquipment.value = true
    if (!currentLab.value) return
    const labIdx = labs.value.findIndex((l) => l.id === currentLab.value.id)
    if (labIdx === -1) return
    if (equipmentEditing.value) {
      const list = labs.value[labIdx].equipment || []
      const eqIdx = list.findIndex((e) => e.id === equipmentForm.id)
      if (eqIdx !== -1) {
        list[eqIdx] = { ...list[eqIdx], ...equipmentForm }
      }
    } else {
      const newId = Date.now()
      labs.value[labIdx].equipment = labs.value[labIdx].equipment || []
      labs.value[labIdx].equipment.push({ id: newId, ...equipmentForm })
      labs.value[labIdx].equipmentCount = labs.value[labIdx].equipment.length
    }
    // 同步当前详情
    currentLab.value = JSON.parse(JSON.stringify(labs.value[labIdx]))
    equipmentFormVisible.value = false
    message.success('保存成功')
  } finally {
    savingEquipment.value = false
  }
}

const deleteEquipment = async (id) => {
  if (!currentLab.value) return
  const labIdx = labs.value.findIndex((l) => l.id === currentLab.value.id)
  if (labIdx === -1) return
  labs.value[labIdx].equipment = (labs.value[labIdx].equipment || []).filter((e) => e.id !== id)
  labs.value[labIdx].equipmentCount = labs.value[labIdx].equipment.length
  currentLab.value = JSON.parse(JSON.stringify(labs.value[labIdx]))
  message.success('删除成功')
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

const goToEquipmentDetails = (record) => {
  router.push(`/equipment-details/${record.id}`)
}

// 设备相关交互改为详情页处理
// 生命周期
onMounted(() => {
  // 加载数据
  pagination.total = labs.value.length
})
</script>

<style scoped>
@import './index.scss';
</style>
