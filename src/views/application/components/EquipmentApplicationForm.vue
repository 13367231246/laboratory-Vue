<template>
  <div class="equipment-application-section">
    <div class="section-title">设备申请信息</div>

    <a-row :gutter="16">
      <a-col :xs="24" :sm="24" :md="12">
        <a-form-item label="所在实验室" name="labId">
          <a-select v-model:value="formData.labId" placeholder="请选择设备所在实验室" show-search :filter-option="filterOption" @change="onLabChange" :loading="labsLoading">
            <a-select-option v-for="lab in availableLabs" :key="lab.id" :value="lab.id" :label="`${lab.labName || ''} ${lab.location || ''}`" :disabled="lab.status !== 1">
              {{ lab.labName }} - {{ lab.location }}
              <a-tag :color="getLabStatusColor(lab.status)" size="small">
                {{ getLabStatusText(lab.status) }}
              </a-tag>
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-col>

      <a-col :xs="24" :sm="24" :md="12">
        <a-form-item label="申请设备" name="equipmentId">
          <a-select v-model:value="formData.equipmentId" placeholder="请先选择实验室，再选择设备" show-search :filter-option="filterEquipmentOption" @change="onEquipmentChange" :disabled="!formData.labId" :loading="equipmentLoading">
            <a-select-option v-for="equipment in availableEquipment" :key="equipment.id" :value="equipment.id" :label="equipment.equipmentName || equipment.name || ''" :disabled="(equipment.count ?? equipment.quantity ?? 0) <= 0">
              {{ equipment.equipmentName || equipment.name }}
              <span v-if="equipment.count != null" class="eq-count">可用 {{ equipment.count }}</span>
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
    </a-row>

    <a-row :gutter="16">
      <a-col :xs="24" :sm="24" :md="12">
        <a-form-item label="借用数量" name="participantCount">
          <a-input-number v-model:value="formData.participantCount" :min="1" :max="quantityMax" style="width: 100%" />
        </a-form-item>
      </a-col>

      <a-col :xs="24" :sm="24" :md="12">
        <a-form-item label="使用时间" name="timeRange">
          <a-range-picker v-model:value="formData.timeRange" show-time format="YYYY-MM-DD HH:mm" :disabled-date="disabledDate" :disabled-time="disabledTime" style="width: 100%" />
        </a-form-item>
      </a-col>
    </a-row>

    <a-form-item label="使用目的" name="purpose">
      <a-textarea v-model:value="formData.purpose" placeholder="请输入设备使用目的" :rows="3" />
    </a-form-item>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  formData: { type: Object, required: true },
  availableLabs: { type: Array, default: () => [] },
  labsLoading: { type: Boolean, default: false },
  availableEquipment: { type: Array, default: () => [] },
  equipmentLoading: { type: Boolean, default: false },
  filterOption: { type: Function, required: true },
  filterEquipmentOption: { type: Function, required: true },
  onLabChange: { type: Function, required: true },
  onEquipmentChange: { type: Function, required: true },
  getLabStatusColor: { type: Function, required: true },
  getLabStatusText: { type: Function, required: true },
  getEquipmentStatusColor: { type: Function, required: true },
  getEquipmentStatusText: { type: Function, required: true },
  disabledDate: { type: Function, required: true },
  disabledTime: { type: Function, required: true }
})

const selectedEquipment = computed(() => {
  return (props.availableEquipment || []).find((e) => e.id === props.formData.equipmentId)
})

const quantityMax = computed(() => {
  const equipment = selectedEquipment.value
  if (!equipment) return 1

  // Check multiple possible field names for quantity
  const count = equipment.count ?? equipment.quantity ?? equipment.availableCount ?? equipment.stock
  return count != null && count > 0 ? count : 1
})
</script>

<style scoped lang="scss">
.equipment-application-section {
  padding: 12px 12px 4px;
  margin: 8px 0 12px;
  background: #fafcff;
  border: 1px dashed rgba(24, 144, 255, 0.35);
  border-radius: 8px;
}

.section-title {
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.85);
  margin-bottom: 10px;
}

.eq-count {
  margin-left: 8px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}
</style>
