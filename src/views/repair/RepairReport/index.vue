<template>
  <div class="repair-report-page">
    <a-card title="报修信息" class="repair-form-card">
      <a-form ref="formRef" :model="formData" :rules="formRules" @finish="handleSubmit">
        <a-form-item label="报修对象" name="targetType">
          <a-radio-group v-model:value="formData.targetType" @change="handleTargetTypeChange">
            <a-radio value="laboratory">实验室</a-radio>
            <a-radio value="equipment">设备</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="实验室" name="laboratoryId">
          <a-select v-model:value="formData.laboratoryId" placeholder="请选择实验室" show-search :filter-option="filterOption" @change="handleLabChange" :loading="labsLoading">
            <a-select-option v-for="lab in labs" :key="lab.id" :value="lab.id" :label="`${lab.labName || ''} ${lab.location || ''}`" :disabled="lab.status !== 1"> {{ lab.labName }} - {{ lab.location }} </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="故障设备" name="equipmentId" v-if="formData.targetType === 'equipment'">
          <a-select v-model:value="formData.equipmentId" placeholder="请选择故障设备" show-search :filter-option="filterOption" :loading="equipmentLoading" :disabled="!formData.laboratoryId">
            <a-select-option v-for="equipment in availableEquipment" :key="equipment.id" :value="equipment.id" :label="equipment.equipmentName || equipment.name || ''">
              {{ equipment.equipmentName || equipment.name }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="问题类型" name="issueType">
          <a-radio-group v-model:value="formData.issueType">
            <a-radio value="clean">清洁</a-radio>
            <a-radio value="repair">维修</a-radio>
            <a-radio value="accident">事故</a-radio>
            <a-radio value="other">其他</a-radio>
          </a-radio-group>
        </a-form-item>

        <a-form-item label="问题描述" name="description">
          <a-textarea v-model:value="formData.description" placeholder="请详细描述问题" :rows="4" />
        </a-form-item>

        <!-- 故障图片：暂不接入，先注释掉 -->
        <!--
        <a-form-item label="故障照片" name="photos">
          <a-upload v-model:file-list="formData.photos" list-type="picture-card" :before-upload="beforeUpload" :max-count="5" accept="image/*">
            <div v-if="formData.photos.length < 5">
              <PlusOutlined />
              <div style="margin-top: 8px">上传照片</div>
            </div>
          </a-upload>
        </a-form-item>
        -->

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
            {{ selectedLab.labName || selectedLab.name }}
          </a-descriptions-item>
          <a-descriptions-item label="位置">
            {{ selectedLab.location }}
          </a-descriptions-item>
          <a-descriptions-item label="负责人">
            {{ selectedLab.manager || selectedLab.managerName || selectedLab.teacherName || '' }}
          </a-descriptions-item>
          <a-descriptions-item label="联系电话">
            {{ selectedLab.phone || selectedLab.managerPhone || '' }}
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
      <div class="preview-content" v-if="formData.laboratoryId">
        <a-descriptions :column="2" bordered>
          <a-descriptions-item label="报修对象">
            {{ formData.targetType === 'equipment' ? '设备' : '实验室' }}
          </a-descriptions-item>
          <a-descriptions-item label="实验室">
            {{ selectedLab?.labName }}
          </a-descriptions-item>
          <a-descriptions-item v-if="formData.targetType === 'equipment'" label="故障设备">
            {{ selectedEquipment?.equipmentName || selectedEquipment?.name }}
          </a-descriptions-item>
          <a-descriptions-item label="问题类型">
            {{ getIssueTypeText(formData.issueType) }}
          </a-descriptions-item>
          <a-descriptions-item label="问题描述" :span="2">
            {{ formData.description }}
          </a-descriptions-item>
        </a-descriptions>
      </div>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { message } from 'ant-design-vue'
import { listAvailable, getEquipmentByLaboratoryId } from '@/api/laboratory'
import { applyMaintenance } from '@/api/maintenance'

const router = useRouter()
const route = useRoute()

// 响应式数据
const formRef = ref()
const submitting = ref(false)
const previewVisible = ref(false)

// 表单数据
const formData = reactive({
  targetType: 'equipment',
  laboratoryId: undefined,
  equipmentId: undefined,
  issueType: 'repair',
  description: ''
  // photos: []
})

// 表单验证规则
const formRules = {
  targetType: [{ required: true, message: '请选择报修对象', trigger: 'change' }],
  laboratoryId: [{ required: true, message: '请选择实验室', trigger: 'change' }],
  equipmentId: [
    {
      validator: (_, value) => {
        if (formData.targetType === 'equipment' && !value) {
          return Promise.reject('请选择故障设备')
        }
        return Promise.resolve()
      },
      trigger: 'change'
    }
  ],
  issueType: [{ required: true, message: '请选择问题类型', trigger: 'change' }],
  description: [{ required: true, message: '请填写问题描述', trigger: 'blur' }]
}

// 实验室数据
const labs = ref([])
const labsLoading = ref(false)
const equipmentLoading = ref(false)
const equipmentList = ref([])

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
  return labs.value.find((lab) => lab.id === formData.laboratoryId)
})

const availableEquipment = computed(() => {
  return equipmentList.value
})

const selectedEquipment = computed(() => {
  return availableEquipment.value.find((eq) => eq.id === formData.equipmentId)
})

// 方法
const filterOption = (input, option) => {
  const text = (option.label ?? option.children ?? '').toString().toLowerCase()
  return text.indexOf((input || '').toLowerCase()) >= 0
}

const getIssueTypeText = (type) => {
  const map = {
    clean: '清洁',
    repair: '维修',
    accident: '事故',
    other: '其他'
  }
  return map[type] || '未知'
}

const handleTargetTypeChange = () => {
  formData.equipmentId = undefined
}

const handleLabChange = () => {
  const id = formData.laboratoryId
  if (!id) return

  formData.equipmentId = undefined
  equipmentList.value = []

  equipmentLoading.value = true
  getEquipmentByLaboratoryId(id)
    .then((list) => {
      const arr = Array.isArray(list) ? list : (list?.items ?? list?.records ?? list?.list ?? [])
      equipmentList.value = arr || []
    })
    .finally(() => {
      equipmentLoading.value = false
    })
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
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitting.value = true
  const lab = selectedLab.value
  const eq = selectedEquipment.value
  const payload = {
    laboratoryId: formData.laboratoryId,
    equipmentId: formData.targetType === 'equipment' ? formData.equipmentId : null,
    labNumber: lab?.labNumber ?? lab?.lab_number ?? null,
    labName: lab?.labName ?? lab?.name ?? null,
    location: lab?.location ?? null,
    equipmentName: formData.targetType === 'equipment' ? (eq?.equipmentName ?? eq?.name ?? eq?.equipment_name ?? null) : null,
    equipmentType: formData.targetType === 'equipment' ? (eq?.equipmentType ?? eq?.type ?? eq?.equipment_type ?? null) : null,
    equipmentModel: formData.targetType === 'equipment' ? (eq?.equipmentModel ?? eq?.model ?? eq?.equipment_model ?? null) : null,
    assetNumber: formData.targetType === 'equipment' ? (eq?.assetNumber ?? eq?.serialNumber ?? eq?.asset_number ?? null) : null,
    issueType: formData.issueType,
    description: formData.description
    // photos: ''
  }

  applyMaintenance(payload)
    .then(() => {
      message.success('报修提交成功！')
      formRef.value.resetFields()
    })
    .finally(() => {
      submitting.value = false
    })
}

const handleReset = () => {
  formRef.value.resetFields()
}

const handlePreview = () => {
  if (!formData.laboratoryId) {
    message.warning('请先选择实验室')
    return
  }
  previewVisible.value = true
}

// 生命周期
onMounted(() => {
  labsLoading.value = true
  listAvailable()
    .then((data) => {
      const list = Array.isArray(data) ? data : (data?.items ?? data?.records ?? data?.list ?? [])
      labs.value = list || []
    })
    .finally(() => {
      labsLoading.value = false
    })

  if (route.query.labId) {
    formData.laboratoryId = parseInt(route.query.labId, 10)
    handleLabChange()
  }
  if (route.query.equipmentId) {
    formData.targetType = 'equipment'
    formData.equipmentId = parseInt(route.query.equipmentId, 10)
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
