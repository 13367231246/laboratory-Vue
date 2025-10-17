<template>
  <div class="lab-application-page">
    <a-card title="申请信息" class="application-form-card">
      <a-form ref="formRef" :model="formData" :rules="formRules" @finish="handleSubmit">
        <a-form-item label="申请类型" name="applicationType">
          <a-radio-group v-model:value="formData.applicationType" @change="handleApplicationTypeChange">
            <a-radio value="lab">申请实验室</a-radio>
            <a-radio value="equipment">申请设备</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="使用类型" name="usageType">
          <a-radio-group v-model:value="formData.usageType">
            <a-radio value="personal">个人使用</a-radio>
            <a-radio value="course">课程使用</a-radio>
          </a-radio-group>
        </a-form-item>

        <!-- 申请实验室时的表单 -->
        <template v-if="formData.applicationType === 'lab'">
          <a-form-item label="选择实验室" name="labId">
            <a-select v-model:value="formData.labId" placeholder="请选择要申请的实验室" show-search :filter-option="filterOption" @change="handleLabChange">
              <a-select-option v-for="lab in availableLabs" :key="lab.id" :value="lab.id" :disabled="lab.status !== 0">
                {{ lab.name }} - {{ lab.location }}
                <a-tag :color="getLabStatusColor(lab.status)" size="small">
                  {{ getLabStatusText(lab.status) }}
                </a-tag>
              </a-select-option>
            </a-select>
          </a-form-item>
        </template>

        <!-- 申请设备时的表单 -->
        <template v-if="formData.applicationType === 'equipment'">
          <a-form-item label="选择设备" name="equipmentId">
            <a-select v-model:value="formData.equipmentId" placeholder="请选择要申请的设备" show-search :filter-option="filterEquipmentOption" @change="handleEquipmentChange">
              <a-select-option v-for="equipment in availableEquipment" :key="equipment.id" :value="equipment.id" :disabled="equipment.status !== 0">
                {{ equipment.name }} - {{ equipment.model }}
                <a-tag :color="getEquipmentStatusColor(equipment.status)" size="small">
                  {{ getEquipmentStatusText(equipment.status) }}
                </a-tag>
              </a-select-option>
            </a-select>
          </a-form-item>
        </template>

        <a-form-item label="使用目的" name="purpose">
          <a-textarea v-model:value="formData.purpose" :placeholder="formData.applicationType === 'lab' ? '请详细描述使用实验室的目的和内容' : '请详细描述使用设备的目的和内容'" :rows="3" />
        </a-form-item>

        <a-form-item label="使用时间" name="timeRange">
          <a-range-picker v-model:value="formData.timeRange" show-time format="YYYY-MM-DD HH:mm" :disabled-date="disabledDate" :disabled-time="disabledTime" />
        </a-form-item>

        <a-form-item :label="formData.applicationType === 'lab' ? '预计人数' : '借用数量'" name="participantCount">
          <a-input-number v-model:value="formData.participantCount" :min="1" :max="formData.applicationType === 'lab' ? selectedLab?.capacity || 50 : selectedEquipment?.quantity || 10" />
        </a-form-item>

        <a-form-item v-if="formData.applicationType === 'lab'" label="所需设备" name="requiredEquipment">
          <a-select v-model:value="formData.requiredEquipment" mode="multiple" placeholder="选择需要的设备（可选）" :options="equipmentOptions" />
        </a-form-item>

        <a-form-item label="特殊要求" name="specialRequirements">
          <a-textarea v-model:value="formData.specialRequirements" placeholder="如有特殊要求请在此说明" :rows="2" />
        </a-form-item>

        <a-form-item label="联系方式" name="contactInfo">
          <a-input v-model:value="formData.contactInfo" placeholder="请输入联系电话或邮箱" />
        </a-form-item>

        <a-space>
          <a-button type="primary" html-type="submit" :loading="submitting"> 提交申请 </a-button>
          <a-button @click="handleReset">重置</a-button>
          <a-button @click="handlePreview">预览申请</a-button>
        </a-space>
      </a-form>
    </a-card>

    <!-- 实验室信息卡片 -->
    <a-card v-if="formData.applicationType === 'lab' && selectedLab" title="实验室信息" class="lab-info-card">
      <div class="lab-info">
        <a-descriptions :column="1" size="small">
          <a-descriptions-item label="实验室名称">
            {{ selectedLab.name }}
          </a-descriptions-item>
          <a-descriptions-item label="位置">
            {{ selectedLab.location }}
          </a-descriptions-item>
          <a-descriptions-item label="容量"> {{ selectedLab.capacity }} 人 </a-descriptions-item>
          <a-descriptions-item label="当前状态">
            <a-tag :color="getLabStatusColor(selectedLab.status)">
              {{ getLabStatusText(selectedLab.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="负责人">
            {{ selectedLab.manager }}
          </a-descriptions-item>
          <a-descriptions-item label="联系电话">
            {{ selectedLab.phone }}
          </a-descriptions-item>
        </a-descriptions>

        <a-divider />

        <div class="equipment-list">
          <h4>可用设备</h4>
          <a-list :data-source="selectedLab.equipment" size="small" :pagination="false">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>{{ item.name }}</template>
                  <template #description>
                    <a-tag :color="getEquipmentStatusColor(item.status)" size="small">
                      {{ getEquipmentStatusText(item.status) }}
                    </a-tag>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </div>
      </div>
    </a-card>

    <!-- 设备信息卡片 -->
    <a-card v-if="formData.applicationType === 'equipment' && selectedEquipment" title="设备信息" class="equipment-info-card">
      <div class="equipment-info">
        <a-descriptions :column="1" size="small">
          <a-descriptions-item label="设备名称">
            {{ selectedEquipment.name }}
          </a-descriptions-item>
          <a-descriptions-item label="型号">
            {{ selectedEquipment.model }}
          </a-descriptions-item>
          <a-descriptions-item label="可用数量"> {{ selectedEquipment.quantity }} 台 </a-descriptions-item>
          <a-descriptions-item label="当前状态">
            <a-tag :color="getEquipmentStatusColor(selectedEquipment.status)">
              {{ getEquipmentStatusText(selectedEquipment.status) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="存放位置">
            {{ selectedEquipment.location }}
          </a-descriptions-item>
          <a-descriptions-item label="负责人">
            {{ selectedEquipment.manager }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-card>

    <!-- 申请须知 -->
    <a-card title="申请须知" class="notice-card">
      <a-list size="small" :data-source="notices">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #title>{{ item.title }}</template>
              <template #description>{{ item.content }}</template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </a-card>

    <!-- 申请预览模态框 -->
    <a-modal v-model:open="previewVisible" title="申请预览" width="800px" :footer="null">
      <div class="preview-content" v-if="(formData.applicationType === 'lab' && formData.labId) || (formData.applicationType === 'equipment' && formData.equipmentId)">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="申请类型">
            {{ formData.applicationType === 'lab' ? '申请实验室' : '申请设备' }}
          </a-descriptions-item>
          <a-descriptions-item label="使用类型">
            {{ formData.usageType === 'personal' ? '个人使用' : '课程使用' }}
          </a-descriptions-item>
          <a-descriptions-item v-if="formData.applicationType === 'lab'" label="实验室">
            {{ selectedLab?.name }}
          </a-descriptions-item>
          <a-descriptions-item v-if="formData.applicationType === 'equipment'" label="设备"> {{ selectedEquipment?.name }} ({{ selectedEquipment?.model }}) </a-descriptions-item>
          <a-descriptions-item label="使用目的" :span="2">
            {{ formData.purpose }}
          </a-descriptions-item>
          <a-descriptions-item label="使用时间">
            {{ formatTimeRange(formData.timeRange) }}
          </a-descriptions-item>
          <a-descriptions-item :label="formData.applicationType === 'lab' ? '预计人数' : '借用数量'"> {{ formData.participantCount }} {{ formData.applicationType === 'lab' ? '人' : '台' }} </a-descriptions-item>
          <a-descriptions-item v-if="formData.applicationType === 'lab'" label="所需设备" :span="2">
            {{ formData.requiredEquipment?.join(', ') || '无' }}
          </a-descriptions-item>
          <a-descriptions-item label="特殊要求" :span="2">
            {{ formData.specialRequirements || '无' }}
          </a-descriptions-item>
          <a-descriptions-item label="联系方式">
            {{ formData.contactInfo }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

const router = useRouter()

// 响应式数据
const formRef = ref()
const submitting = ref(false)
const previewVisible = ref(false)

// 表单数据
const formData = reactive({
  applicationType: 'lab',
  usageType: 'personal',
  labId: undefined,
  equipmentId: undefined,
  purpose: '',
  timeRange: [],
  participantCount: 1,
  requiredEquipment: [],
  specialRequirements: '',
  contactInfo: ''
})

// 表单验证规则
const formRules = {
  applicationType: [{ required: true, message: '请选择申请类型', trigger: 'change' }],
  usageType: [{ required: true, message: '请选择使用类型', trigger: 'change' }],
  labId: [{ required: true, message: '请选择实验室', trigger: 'change' }],
  equipmentId: [{ required: true, message: '请选择设备', trigger: 'change' }],
  purpose: [{ required: true, message: '请填写使用目的', trigger: 'blur' }],
  timeRange: [{ required: true, message: '请选择使用时间', trigger: 'change' }],
  participantCount: [{ required: true, message: '请填写数量', trigger: 'blur' }],
  contactInfo: [{ required: true, message: '请填写联系方式', trigger: 'blur' }]
}

// 可用实验室数据
const availableLabs = ref([
  {
    id: 1,
    name: '计算机实验室A',
    location: '教学楼A座201',
    capacity: 40,
    status: 0,
    manager: '张老师',
    phone: '13800138001',
    equipment: [
      { name: '台式电脑', status: 0 },
      { name: '投影仪', status: 0 },
      { name: '网络设备', status: 0 }
    ]
  },
  {
    id: 2,
    name: '物理实验室B',
    location: '实验楼B座301',
    capacity: 30,
    status: 0,
    manager: '李老师',
    phone: '13800138002',
    equipment: [
      { name: '实验台', status: 0 },
      { name: '测量仪器', status: 0 },
      { name: '电源设备', status: 0 }
    ]
  },
  {
    id: 3,
    name: '化学实验室C',
    location: '实验楼C座101',
    capacity: 25,
    status: 1,
    manager: '王老师',
    phone: '13800138003',
    equipment: [
      { name: '实验台', status: 0 },
      { name: '通风设备', status: 0 },
      { name: '安全设备', status: 0 }
    ]
  }
])

// 可用设备数据
const availableEquipment = ref([
  {
    id: 1,
    name: '笔记本电脑',
    model: 'Dell Latitude 5520',
    status: 0,
    quantity: 5,
    location: '计算机实验室A',
    manager: '张老师'
  },
  {
    id: 2,
    name: '投影仪',
    model: 'Epson CB-X41',
    status: 0,
    quantity: 3,
    location: '计算机实验室A',
    manager: '张老师'
  },
  {
    id: 3,
    name: '示波器',
    model: 'Tektronix TBS1000',
    status: 0,
    quantity: 2,
    location: '物理实验室B',
    manager: '李老师'
  },
  {
    id: 4,
    name: '万用表',
    model: 'Fluke 115',
    status: 1,
    quantity: 8,
    location: '物理实验室B',
    manager: '李老师'
  },
  {
    id: 5,
    name: '显微镜',
    model: 'Olympus CX23',
    status: 0,
    quantity: 4,
    location: '化学实验室C',
    manager: '王老师'
  }
])

// 设备选项
const equipmentOptions = ref([
  { label: '台式电脑', value: 'desktop' },
  { label: '投影仪', value: 'projector' },
  { label: '网络设备', value: 'network' },
  { label: '实验台', value: 'experiment_table' },
  { label: '测量仪器', value: 'measurement' },
  { label: '电源设备', value: 'power' }
])

// 申请须知
const notices = ref([
  {
    title: '申请时间',
    content: '请提前至少24小时提交申请'
  },
  {
    title: '使用规范',
    content: '使用期间请遵守实验室规章制度'
  },
  {
    title: '设备使用',
    content: '使用设备前请仔细阅读使用说明'
  },
  {
    title: '清洁要求',
    content: '使用完毕后请保持实验室整洁'
  }
])

// 计算属性
const selectedLab = computed(() => {
  return availableLabs.value.find((lab) => lab.id === formData.labId)
})

const selectedEquipment = computed(() => {
  return availableEquipment.value.find((equipment) => equipment.id === formData.equipmentId)
})

// 方法
const filterOption = (input, option) => {
  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

const filterEquipmentOption = (input, option) => {
  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

const handleApplicationTypeChange = () => {
  // 清空选择
  formData.labId = undefined
  formData.equipmentId = undefined
  formData.requiredEquipment = []
}

const handleLabChange = (value) => {
  // 清空设备选择
  formData.requiredEquipment = []
}

const handleEquipmentChange = (value) => {
  // 设备选择变化时的处理
}

const disabledDate = (current) => {
  // 禁用过去的日期
  return current && current < dayjs().startOf('day')
}

const disabledTime = (current, type) => {
  if (type === 'start') {
    // 开始时间不能早于当前时间
    const now = dayjs()
    if (current && current.isSame(now, 'day')) {
      return {
        disabledHours: () => Array.from({ length: now.hour() }, (_, i) => i),
        disabledMinutes: () => Array.from({ length: now.minute() + 1 }, (_, i) => i)
      }
    }
  }
  return {}
}

const getLabStatusColor = (status) => {
  const colorMap = {
    0: 'green', // 正常且空闲
    1: 'blue', // 使用中
    2: 'orange' // 需要处理
  }
  return colorMap[status] || 'default'
}

const getLabStatusText = (status) => {
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

const formatTimeRange = (timeRange) => {
  if (!timeRange || timeRange.length !== 2) return ''
  return `${timeRange[0].format('YYYY-MM-DD HH:mm')} 至 ${timeRange[1].format('YYYY-MM-DD HH:mm')}`
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 2000))

    message.success('申请提交成功！')
    router.push('/')
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}

const handleReset = () => {
  formRef.value.resetFields()
}

const handlePreview = () => {
  if (formData.applicationType === 'lab' && !formData.labId) {
    message.warning('请先选择实验室')
    return
  }
  if (formData.applicationType === 'equipment' && !formData.equipmentId) {
    message.warning('请先选择设备')
    return
  }
  previewVisible.value = true
}

// 生命周期
onMounted(() => {
  // 加载数据
})
</script>

<style scoped lang="scss">
.lab-application-page {
  margin-top: 10px;
}
.lab-info {
  margin-bottom: 16px;
}

.equipment-list h4 {
  margin-bottom: 12px;
  color: #333;
}

.preview-content {
  padding: 16px 0;
}

@media (max-width: 768px) {
}
</style>
