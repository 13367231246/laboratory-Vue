<template>
  <div class="review-details-page">
    <a-card class="filters-card">
      <div class="filters">
        <a-select v-model:value="labFilter" placeholder="选择实验室" allow-clear class="filter-select">
          <a-select-option v-for="lab in labOptions" :key="lab.id" :value="lab.id">{{ lab.name }}</a-select-option>
        </a-select>
        <a-button type="primary" @click="handleSearch" :loading="loading">查询</a-button>
        <a-button @click="handleReset" :loading="loading">重置</a-button>
      </div>
    </a-card>

    <a-card class="list-card">
      <a-list :data-source="pagedReviews" :loading="loading" :pagination="false">
        <template #renderItem="{ item }">
          <a-list-item class="review-item">
            <a-list-item-meta>
              <template #avatar>
                <a-avatar style="background-color: #1890ff">{{ item.userName?.charAt(0) || '用' }}</a-avatar>
              </template>
              <template #title>
                <div class="review-header">
                  <div class="review-user">
                    <span class="user-name">{{ item.userName }}</span>
                    <a-tag color="blue" class="lab-tag">{{ item.labName }}</a-tag>
                  </div>
                  <div class="review-rating-time">
                    <a-rate :value="item.rating" disabled allow-half class="rating" />
                    <span class="time">{{ item.createTime }}</span>
                  </div>
                </div>
              </template>
              <template #description>
                <div class="review-content">{{ item.comment }}</div>
              </template>
            </a-list-item-meta>
          </a-list-item>
        </template>
      </a-list>

      <div class="pagination-wrapper">
        <a-pagination :current="pagination.current" :pageSize="pagination.pageSize" :total="filteredReviews.length" :showSizeChanger="true" :showQuickJumper="true" @change="handlePageChange" @showSizeChange="handlePageSizeChange" />
      </div>
    </a-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'

const loading = ref(false)
const labFilter = ref()

const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true
})

const labOptions = ref([
  { id: 1, name: '计算机实验室A' },
  { id: 2, name: '物理实验室B' },
  { id: 3, name: '化学实验室C' }
])

const reviews = ref([
  { id: 1, labId: 1, labName: '计算机实验室A', userName: '张同学', rating: 5, comment: '环境很好，设备齐全。', createTime: '2024-01-15 16:30' },
  { id: 2, labId: 2, labName: '物理实验室B', userName: '李同学', rating: 4, comment: '整体不错，温度略低。', createTime: '2024-01-14 15:20' },
  { id: 3, labId: 3, labName: '化学实验室C', userName: '王同学', rating: 5, comment: '设备新，指导专业。', createTime: '2024-01-13 14:10' }
])

const filteredReviews = computed(() => {
  let list = reviews.value
  if (labFilter.value) {
    list = list.filter((r) => r.labId === labFilter.value)
  }
  return list
})

const pagedReviews = computed(() => {
  const start = (pagination.current - 1) * pagination.pageSize
  const end = start + pagination.pageSize
  return filteredReviews.value.slice(start, end)
})

function handleSearch() {}
function handleReset() {
  labFilter.value = undefined
}

function handlePageChange(page) {
  pagination.current = page
}

function handlePageSizeChange(current, size) {
  pagination.pageSize = size
  pagination.current = 1
}

onMounted(() => {
  pagination.total = reviews.value.length
})
</script>

<style scoped>
.review-details-page {
  margin-top: 10px;
}

.filters-card,
.list-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.filters {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.filter-select {
  width: 220px;
  min-width: 180px;
}

.review-item {
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 8px;
}

.user-name {
  font-weight: 600;
  color: #333;
}

.lab-tag {
  margin-left: 4px;
}

.review-rating-time {
  display: flex;
  align-items: center;
  gap: 8px;
}

.rating {
  font-size: 14px;
}

.time {
  color: #999;
  font-size: 12px;
}

.review-content {
  margin-top: 8px;
  color: #555;
  line-height: 1.6;
}

.pagination-wrapper {
  margin-top: 12px;
  text-align: right;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }

  .filter-select {
    width: 100%;
    min-width: auto;
  }

  .review-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 6px;
  }

  .pagination-wrapper {
    text-align: center;
  }
}
</style>
