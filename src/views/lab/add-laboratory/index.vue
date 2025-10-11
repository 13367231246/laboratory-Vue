<template>
  <div class="form-card">
    <a-form ref="formRef" :model="formData" :rules="formRules" :label-col="{ span: 4 }" :wrapper-col="{ span: 20 }" @finish="handleSubmit">
      <a-row :gutter="24">
        <a-col :xs="24" :lg="12">
          <a-form-item label="实验室名称" name="name">
            <a-input v-model:value="formData.name" placeholder="请输入实验室名称" />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :lg="12">
          <a-form-item label="位置" name="location">
            <a-input v-model:value="formData.location" placeholder="请输入实验室位置" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :xs="24" :lg="12">
          <a-form-item label="容量" name="capacity">
            <a-input-number v-model:value="formData.capacity" :min="1" :max="200" placeholder="请输入实验室容量" />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :lg="12">
          <a-form-item label="负责人" name="manager">
            <a-input v-model:value="formData.manager" placeholder="请输入负责人姓名" />
          </a-form-item>
        </a-col>
      </a-row>

      <a-row :gutter="24">
        <a-col :xs="24" :lg="12">
          <a-form-item label="联系电话" name="phone">
            <a-input v-model:value="formData.phone" placeholder="请输入联系电话" />
          </a-form-item>
        </a-col>
        <a-col :xs="24" :lg="12">
          <a-form-item label="状态" name="status">
            <a-select v-model:value="formData.status" placeholder="请选择状态">
              <a-select-option :value="0">正常且空闲</a-select-option>
              <a-select-option :value="1">使用中</a-select-option>
              <a-select-option :value="2">需要处理</a-select-option>
            </a-select>
          </a-form-item>
        </a-col>
      </a-row>

      <a-form-item label="描述" name="description">
        <a-textarea v-model:value="formData.description" :rows="4" placeholder="请输入实验室描述" />
      </a-form-item>

      <a-form-item label="设备信息" name="equipment">
        <div class="equipment-section">
          <div class="equipment-header">
            <h4>设备列表</h4>
            <a-button type="dashed" @click="addEquipment">
              <PlusOutlined />
              添加设备
            </a-button>
          </div>

          <div v-if="formData.equipment.length === 0" class="empty-equipment">
            <a-empty description="暂无设备信息" />
          </div>

          <div v-else class="equipment-list">
            <div v-for="(equipment, index) in formData.equipment" :key="index" class="equipment-item">
              <a-row :gutter="16">
                <a-col :xs="24" :sm="8">
                  <a-input v-model:value="equipment.name" placeholder="设备名称" />
                </a-col>
                <a-col :xs="24" :sm="6">
                  <a-input v-model:value="equipment.model" placeholder="型号" />
                </a-col>
                <a-col :xs="24" :sm="6">
                  <a-input v-model:value="equipment.serialNumber" placeholder="序列号" />
                </a-col>
                <a-col :xs="24" :sm="4">
                  <a-space>
                    <a-select v-model:value="equipment.status">
                      <a-select-option :value="0">正常</a-select-option>
                      <a-select-option :value="1">使用中</a-select-option>
                      <a-select-option :value="2">异常</a-select-option>
                    </a-select>
                    <a-button type="text" danger @click="removeEquipment(index)">
                      <DeleteOutlined />
                    </a-button>
                  </a-space>
                </a-col>
              </a-row>
            </div>
          </div>
        </div>
      </a-form-item>

      <a-form-item>
        <a-space>
          <a-button type="primary" html-type="submit" :loading="loading">
            <SaveOutlined />
            保存
          </a-button>
          <a-button @click="goBack"> 取消 </a-button>
          <a-button @click="resetForm">
            <ReloadOutlined />
            重置
          </a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { SaveOutlined, PlusOutlined, DeleteOutlined, ReloadOutlined } from '@ant-design/icons-vue'

const router = useRouter()
const formRef = ref()
const loading = ref(false)

// 表单数据
const formData = reactive({
  name: '',
  location: '',
  capacity: undefined,
  manager: '',
  phone: '',
  status: 0,
  description: '',
  equipment: []
})

// 表单验证规则
const formRules = {
  name: [{ required: true, message: '请输入实验室名称', trigger: 'blur' }],
  location: [{ required: true, message: '请输入实验室位置', trigger: 'blur' }],
  capacity: [{ required: true, message: '请输入实验室容量', trigger: 'blur' }],
  manager: [{ required: true, message: '请输入负责人姓名', trigger: 'blur' }],
  phone: [
    { required: true, message: '请输入联系电话', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ]
}

// 方法
const goBack = () => {
  router.go(-1)
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000))

    message.success('实验室添加成功')
    router.push('/lab-management')
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    loading.value = false
  }
}

const resetForm = () => {
  formRef.value.resetFields()
  formData.equipment = []
}

const addEquipment = () => {
  formData.equipment.push({
    name: '',
    model: '',
    serialNumber: '',
    status: 0
  })
}

const removeEquipment = (index) => {
  formData.equipment.splice(index, 1)
}
</script>

<style scoped lang="scss">
.form-card {
  margin-top: 10px;
}

.equipment-section {
  border: 1px solid #f0f0f0;
  border-radius: 6px;
  padding: 16px;
  background: #fafafa;
}

.equipment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.equipment-header h4 {
  margin: 0;
  color: #333;
}

.empty-equipment {
  text-align: center;
  padding: 20px;
}

.equipment-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.equipment-item {
  background: white;
  padding: 12px;
  border-radius: 4px;
  border: 1px solid #e8e8e8;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .equipment-header {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }

  .equipment-item .ant-row {
    flex-direction: column;
  }

  .equipment-item .ant-col {
    margin-bottom: 8px;
  }
}
</style>
