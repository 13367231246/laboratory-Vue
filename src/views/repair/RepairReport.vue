<template>
  <div class="repair-report-page">
    <a-card title="报修信息" class="repair-form-card">
      <a-form ref="formRef" :model="formData" :rules="formRules" @finish="handleSubmit">
        <a-form-item label="报修类型" name="repairType">
          <a-radio-group v-model:value="formData.repairType">
            <a-radio value="equipment">设备故障</a-radio>
            <a-radio value="environment">环境问题</a-radio>
            <a-radio value="safety">安全问题</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="实验室" name="labId">
          <a-select v-model:value="formData.labId" placeholder="请选择实验室" show-search :filter-option="filterOption" @change="handleLabChange">
            <a-select-option v-for="lab in labs" :key="lab.id" :value="lab.id"> {{ lab.name }} - {{ lab.location }} </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="故障设备" name="equipmentId" v-if="formData.repairType === 'equipment'">
          <a-select v-model:value="formData.equipmentId" placeholder="请选择故障设备" show-search :filter-option="filterOption">
            <a-select-option v-for="equipment in availableEquipment" :key="equipment.id" :value="equipment.id"> {{ equipment.name }} - {{ equipment.model }} </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="故障描述" name="description">
          <a-textarea v-model:value="formData.description" placeholder="请详细描述故障现象和问题" :rows="4" />
        </a-form-item>

        <a-form-item label="紧急程度" name="urgency">
          <a-radio-group v-model:value="formData.urgency">
            <a-radio value="low">低 - 不影响正常使用</a-radio>
            <a-radio value="medium">中 - 影响部分功能</a-radio>
            <a-radio value="high">高 - 严重影响使用</a-radio>
            <a-radio value="critical">紧急 - 存在安全隐患</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="故障照片" name="images">
          <a-upload v-model:file-list="formData.images" list-type="picture-card" :before-upload="beforeUpload" :max-count="5" accept="image/*">
            <div v-if="formData.images.length < 5">
              <PlusOutlined />
              <div style="margin-top: 8px">上传照片</div>
            </div>
          </a-upload>
        </a-form-item>

        <a-form-item label="联系方式" name="contactInfo">
          <a-input v-model:value="formData.contactInfo" placeholder="请输入联系电话或邮箱" />
        </a-form-item>

        <a-form-item label="期望处理时间" name="expectedTime">
          <a-date-picker v-model:value="formData.expectedTime" show-time format="YYYY-MM-DD HH:mm" :disabled-date="disabledDate" />
        </a-form-item>

        <a-space>
          <a-button type="primary" html-type="submit" :loading="submitting"> 提交报修 </a-button>
          <a-button @click="handleReset">重置</a-button>
          <a-button @click="handlePreview">预览报修</a-button>
        </a-space>
      </a-form>
    </a-card>

    <a-card title="实验室信息" class="lab-info-card" v-if="selectedLab">
      <div class="lab-info">
        <a-descriptions :column="1" size="small">
          <a-descriptions-item label="实验室名称">
            {{ selectedLab.name }}
          </a-descriptions-item>
          <a-descriptions-item label="位置">
            {{ selectedLab.location }}
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
          <h4>设备列表</h4>
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

    <!-- 报修须知 -->
    <a-card title="报修须知" class="notice-card">
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

    <!-- 紧急联系方式 -->
    <a-card title="紧急联系方式" class="emergency-card">
      <a-list size="small" :data-source="emergencyContacts">
        <template #renderItem="{ item }">
          <a-list-item>
            <a-list-item-meta>
              <template #title>{{ item.name }}</template>
              <template #description>
                <a :href="`tel:${item.phone}`">{{ item.phone }}</a>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>
    </a-card>

    <!-- 报修预览模态框 -->
    <a-modal v-model:open="previewVisible" title="报修预览" width="800px" :footer="null">
      <div class="preview-content" v-if="formData.labId">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="报修类型">
            {{ getRepairTypeText(formData.repairType) }}
          </a-descriptions-item>
          <a-descriptions-item label="实验室">
            {{ selectedLab?.name }}
          </a-descriptions-item>
          <a-descriptions-item label="故障设备" v-if="formData.equipmentId">
            {{ selectedEquipment?.name }}
          </a-descriptions-item>
          <a-descriptions-item label="紧急程度">
            <a-tag :color="getUrgencyColor(formData.urgency)">
              {{ getUrgencyText(formData.urgency) }}
            </a-tag>
          </a-descriptions-item>
          <a-descriptions-item label="故障描述" :span="2">
            {{ formData.description }}
          </a-descriptions-item>
          <a-descriptions-item label="联系方式">
            {{ formData.contactInfo }}
          </a-descriptions-item>
          <a-descriptions-item label="期望处理时间">
            {{ formData.expectedTime?.format('YYYY-MM-DD HH:mm') || '无' }}
          </a-descriptions-item>
        </a-descriptions>

        <div v-if="formData.images.length > 0" class="preview-images">
          <h4>故障照片</h4>
          <a-image-preview-group>
            <a-image v-for="(image, index) in formData.images" :key="index" :src="image.url || image.thumbUrl" :width="100" :height="100" style="margin-right: 8px; margin-bottom: 8px" />
          </a-image-preview-group>
        </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { PlusOutlined } from '@ant-design/icons-vue'
import dayjs from 'dayjs'

const router = useRouter()

// 响应式数据
const formRef = ref()
const submitting = ref(false)
const previewVisible = ref(false)

// 表单数据
const formData = reactive({
  repairType: 'equipment',
  labId: undefined,
  equipmentId: undefined,
  description: '',
  urgency: 'medium',
  images: [],
  contactInfo: '',
  expectedTime: undefined
})

// 表单验证规则
const formRules = {
  repairType: [{ required: true, message: '请选择报修类型', trigger: 'change' }],
  labId: [{ required: true, message: '请选择实验室', trigger: 'change' }],
  equipmentId: [{ required: true, message: '请选择故障设备', trigger: 'change' }],
  description: [{ required: true, message: '请填写故障描述', trigger: 'blur' }],
  urgency: [{ required: true, message: '请选择紧急程度', trigger: 'change' }],
  contactInfo: [{ required: true, message: '请填写联系方式', trigger: 'blur' }]
}

// 实验室数据
const labs = ref([
  {
    id: 1,
    name: '计算机实验室A',
    location: '教学楼A座201',
    manager: '张老师',
    phone: '13800138001',
    equipment: [
      { id: 1, name: '台式电脑', model: 'Dell OptiPlex', status: 0 },
      { id: 2, name: '投影仪', model: 'Epson CB-X41', status: 0 },
      { id: 3, name: '网络设备', model: 'Cisco Switch', status: 0 }
    ]
  },
  {
    id: 2,
    name: '物理实验室B',
    location: '实验楼B座301',
    manager: '李老师',
    phone: '13800138002',
    equipment: [
      { id: 4, name: '实验台', model: 'Lab Table Pro', status: 0 },
      { id: 5, name: '测量仪器', model: 'Digital Multimeter', status: 0 },
      { id: 6, name: '电源设备', model: 'Power Supply Unit', status: 0 }
    ]
  }
])

// 报修须知
const notices = ref([
  {
    title: '报修流程',
    content: '提交报修后，管理员会在24小时内响应'
  },
  {
    title: '照片要求',
    content: '请提供清晰的故障照片，便于快速定位问题'
  },
  {
    title: '紧急情况',
    content: '如遇紧急安全问题，请立即联系相关负责人'
  },
  {
    title: '维修进度',
    content: '可通过系统查看维修进度和状态更新'
  }
])

// 紧急联系方式
const emergencyContacts = ref([
  {
    name: '实验室管理员',
    phone: '13800138000'
  },
  {
    name: '安全负责人',
    phone: '13800138001'
  },
  {
    name: '技术支持',
    phone: '13800138002'
  }
])

// 计算属性
const selectedLab = computed(() => {
  return labs.value.find((lab) => lab.id === formData.labId)
})

const availableEquipment = computed(() => {
  return selectedLab.value?.equipment || []
})

const selectedEquipment = computed(() => {
  return availableEquipment.value.find((eq) => eq.id === formData.equipmentId)
})

// 方法
const filterOption = (input, option) => {
  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

const handleLabChange = (value) => {
  // 清空设备选择
  formData.equipmentId = undefined
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

const disabledDate = (current) => {
  // 禁用过去的日期
  return current && current < dayjs().startOf('day')
}

const getRepairTypeText = (type) => {
  const typeMap = {
    equipment: '设备故障',
    environment: '环境问题',
    safety: '安全问题'
  }
  return typeMap[type] || '未知'
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

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 2000))

    message.success('报修提交成功！')
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
  if (!formData.labId) {
    message.warning('请先选择实验室')
    return
  }
  previewVisible.value = true
}

// 生命周期
onMounted(() => {
  // 加载数据
  // 检查是否有从申请记录页面传递的参数
  const route = useRouter().currentRoute.value
  if (route.query.labId) {
    formData.labId = parseInt(route.query.labId)
    formData.contactInfo = route.query.applicant || ''
  }
})
</script>

<style scoped>
.repair-form-card,
.lab-info-card,
.notice-card,
.emergency-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
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

.preview-images {
  margin-top: 16px;
}

.preview-images h4 {
  margin-bottom: 12px;
  color: #333;
}

/* 移动端适配 - 768px以下 */
@media (max-width: 768px) {
  .repair-form-card {
    margin-bottom: 16px;
  }

  .repair-info-card {
    margin-bottom: 16px;
  }

  .form-actions {
    flex-direction: column;
    gap: 8px;
  }

  .form-actions .ant-btn {
    width: 100%;
  }
}
</style>
