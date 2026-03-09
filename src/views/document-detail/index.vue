<template>
  <div class="document-detail-page">
    <a-spin :spinning="loading">
      <div v-if="detail" class="detail-card">
        <a-card :title="detail.title">
          <template #extra>
            <a-tag :color="getDocTypeColor(detail.docType || detail.doc_type)">{{ getDocTypeText(detail.docType || detail.doc_type) }}</a-tag>
            <span v-if="detail.version" class="version">v{{ detail.version }}</span>
            <span class="update-time">{{ formatTime(detail.updateTime || detail.createTime) }}</span>
          </template>
          <div class="content" v-html="contentHtml"></div>
        </a-card>
      </div>
      <a-empty v-else-if="!loading" description="文档不存在或未发布" />
    </a-spin>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getDocumentById } from '@/api/document'

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

const getDocTypeText = (type) => {
  const map = { protocol: '协议', manual: '手册', rule: '规则', other: '其他' }
  return map[type] || '文档'
}

const getDocTypeColor = (type) => {
  const map = { protocol: 'blue', manual: 'green', rule: 'orange', other: 'default' }
  return map[type] || 'default'
}

onMounted(() => {
  const id = route.params.id
  if (!id) {
    loading.value = false
    return
  }
  getDocumentById(id)
    .then((res) => {
      detail.value = res
    })
    .finally(() => {
      loading.value = false
    })
})
</script>

<style scoped>
.document-detail-page {
  padding: 16px 0;
}
.detail-card :deep(.ant-card-head) {
  flex-wrap: wrap;
}
.version {
  margin-left: 8px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}
.update-time {
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
