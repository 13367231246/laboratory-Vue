<template>
  <div class="notice-detail-page">
    <a-spin :spinning="loading">
      <div v-if="detail" class="detail-card">
        <a-card :title="detail.title">
          <template #extra>
            <a-tag :color="getNoticeTypeColor(detail.type)">{{ getNoticeTypeText(detail.type) }}</a-tag>
            <span class="publish-time">{{ formatTime(detail.publishTime || detail.createTime) }}</span>
          </template>
          <div class="content" v-html="contentHtml"></div>
        </a-card>
      </div>
      <a-empty v-else-if="!loading" description="公告不存在或已下线" />
    </a-spin>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getNoticeById } from '@/api/document'

const route = useRoute()
const loading = ref(true)
const detail = ref(null)

const contentHtml = computed(() => {
  if (!detail.value?.content) return ''
  const text = detail.value.content
  return text.replace(/\n/g, '<br/>')
})

const formatTime = (val) => {
  if (!val) return ''
  const s = String(val)
  if (s.length >= 16) return s.slice(0, 16).replace('T', ' ')
  return s
}

const getNoticeTypeText = (type) => {
  const map = { system: '系统公告', lab: '实验室公告', academic: '学术公告', other: '其他' }
  return map[type] || '公告'
}

const getNoticeTypeColor = (type) => {
  const map = { system: 'blue', lab: 'green', academic: 'purple', other: 'default' }
  return map[type] || 'default'
}

onMounted(() => {
  const id = route.params.id
  if (!id) {
    loading.value = false
    return
  }
  getNoticeById(id)
    .then((res) => {
      detail.value = res
    })
    .finally(() => {
      loading.value = false
    })
})
</script>

<style scoped>
.notice-detail-page {
  padding: 16px 0;
}
.detail-card :deep(.ant-card-head) {
  flex-wrap: wrap;
}
.publish-time {
  margin-left: 8px;
  color: rgba(0, 0, 0, 0.45);
  font-size: 12px;
}
.content {
  line-height: 1.6;
  white-space: pre-wrap;
  word-break: break-word;
}
.content :deep(br) {
  display: block;
  content: '';
}
</style>
