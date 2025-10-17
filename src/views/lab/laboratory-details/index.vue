<template>
  <div class="laboratory-details">
    <a-descriptions v-if="lab" bordered :column="2" size="small">
      <a-descriptions-item label="名称">{{ lab.name }}</a-descriptions-item>
      <a-descriptions-item label="位置">{{ lab.location }}</a-descriptions-item>
      <a-descriptions-item label="容量">{{ lab.capacity }}</a-descriptions-item>
      <a-descriptions-item label="负责人">{{ lab.manager }}</a-descriptions-item>
      <a-descriptions-item label="联系电话" :span="2">{{ lab.phone }}</a-descriptions-item>
      <a-descriptions-item label="描述" :span="2">{{ lab.description }}</a-descriptions-item>
    </a-descriptions>

    <div v-if="lab" class="equipment-header">
      <h3>设备列表</h3>
      <a-space>
        <a-button type="default" @click="onEditLab">编辑实验室</a-button>
        <a-button type="primary" @click="onAddEquipment">新增设备</a-button>
      </a-space>
    </div>

    <div v-if="lab && (!lab.equipment || lab.equipment.length === 0)" class="empty">
      <a-empty description="暂无设备" />
    </div>
    <a-list v-else-if="lab" :data-source="lab.equipment" :split="true" class="equipment-list">
      <template #renderItem="{ item }">
        <a-list-item>
          <a-list-item-meta :title="item.name" :description="`型号：${item.model}  序列号：${item.serialNumber}`" />
          <a-space>
            <a-button size="small" @click="onEditEquipment(item)">编辑</a-button>
            <a-popconfirm title="确定删除该设备吗？" ok-text="是" cancel-text="否" @confirm="onDeleteEquipment(item.id)">
              <a-button size="small" danger>删除</a-button>
            </a-popconfirm>
          </a-space>
        </a-list-item>
      </template>
    </a-list>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  lab: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['edit-lab', 'add-equipment', 'edit-equipment', 'delete-equipment'])

const onEditLab = () => emit('edit-lab')
const onAddEquipment = () => emit('add-equipment')
const onEditEquipment = (item) => emit('edit-equipment', item)
const onDeleteEquipment = (id) => emit('delete-equipment', id)
</script>

<style scoped>
.laboratory-details {
  width: 100%;
}

.equipment-header {
  margin-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.equipment-list {
  margin-top: 12px;
}
</style>
