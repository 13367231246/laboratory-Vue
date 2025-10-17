<template>
  <div class="equipment-detail-page">
    <a-card class="lab-card">
      <div class="lab-header">
        <h2>{{ lab?.name }}</h2>
      </div>
      <div class="lab-meta">
        <div class="meta-item"><span>位置：</span>{{ lab?.location }}</div>
        <div class="meta-item"><span>容量：</span>{{ lab?.capacity }}</div>
        <div class="meta-item"><span>负责人：</span>{{ lab?.manager }}</div>
        <div class="meta-item"><span>联系电话：</span>{{ lab?.phone }}</div>
      </div>
      <p class="lab-desc">{{ lab?.description }}</p>
    </a-card>

    <a-card title="设备列表" class="equipment-card">
      <div v-if="!lab || (lab.equipment && lab.equipment.length === 0)" class="empty">
        <a-empty description="暂无设备" />
      </div>
      <div v-else class="equipment-grid">
        <a-card v-for="item in lab.equipment" :key="item.id" class="equipment-item" hoverable>
          <div class="item-header">
            <h3>{{ item.name }}</h3>
          </div>
          <div class="item-meta">
            <div class="meta-row"><span>型号：</span>{{ item.model }}</div>
            <div class="meta-row"><span>序列号：</span>{{ item.serialNumber }}</div>
          </div>
        </a-card>
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const lab = ref(null)

const goBack = () => {
  router.back()
}

const loadData = async () => {
  loading.value = true
  try {
    // 模拟从上一页数据源获取，该示例用本地构造
    const id = parseInt(route.params.id)
    // 伪数据：可改为实际接口
    const fakeLabs = [
      {
        id: 1,
        name: '计算机实验室A',
        location: '教学楼A座201',
        capacity: 40,
        manager: '张老师',
        phone: '13800138001',
        description: '主要用于计算机课程教学',
        equipment: [
          { id: 1, name: '台式电脑', model: 'Dell OptiPlex', serialNumber: 'PC001' },
          { id: 2, name: '投影仪', model: 'Epson CB-X41', serialNumber: 'PJ001' }
        ]
      },
      {
        id: 2,
        name: '物理实验室B',
        location: '实验楼B座301',
        capacity: 30,
        manager: '李老师',
        phone: '13800138002',
        description: '物理实验教学专用',
        equipment: [
          { id: 4, name: '实验台', model: 'Lab Table Pro', serialNumber: 'TB001' },
          { id: 5, name: '测量仪器', model: 'Digital Multimeter', serialNumber: 'MM001' }
        ]
      },
      {
        id: 3,
        name: '化学实验室C',
        location: '实验楼C座101',
        capacity: 25,
        manager: '王老师',
        phone: '13800138003',
        description: '化学实验教学专用',
        equipment: [
          { id: 6, name: '实验台', model: 'Chem Table', serialNumber: 'CT001' },
          { id: 7, name: '通风设备', model: 'Ventilation System', serialNumber: 'VS001' }
        ]
      }
    ]

    lab.value = fakeLabs.find((l) => l.id === id) || null
    if (!lab.value) {
      message.error('未找到实验室数据')
    }
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>

<style scoped>
.equipment-detail-page {
  margin-top: 10px;
}

.lab-card {
  margin-bottom: 16px;
}

.lab-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.lab-meta {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
  margin-top: 8px;
}

.meta-item span {
  color: #666;
}

.lab-desc {
  margin-top: 8px;
  color: #666;
}

.equipment-card {
  border-radius: 8px;
}

.equipment-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
  gap: 16px;
}

.equipment-item .item-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.item-meta {
  margin-top: 8px;
  color: #555;
}

.meta-row span {
  color: #888;
}

/* 移动端优化 */
@media (max-width: 768px) {
  .equipment-grid {
    grid-template-columns: 1fr;
  }
}
</style>
