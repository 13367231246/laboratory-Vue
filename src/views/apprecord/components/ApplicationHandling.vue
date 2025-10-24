<template>
  <div class="application-handling">
    <div class="filter-card">
      <div class="filter-section">
        <div class="filter-left">
          <a-select v-model:value="applicationStatusFilter" placeholder="申请状态筛选" allow-clear @change="handleFilterChange" class="type-filter">
            <a-select-option value="all">全部</a-select-option>
            <a-select-option value="pending">待审核</a-select-option>
            <a-select-option value="approved">已通过</a-select-option>
            <a-select-option value="rejected">已拒绝</a-select-option>
          </a-select>

          <a-input v-model:value="searchText" placeholder="搜索申请人或内容" allow-clear class="search-input">
            <template #prefix>
              <SearchOutlined />
            </template>
          </a-input>
        </div>

        <div class="filter-right">
          <a-button @click="handleRefresh" :loading="loading">
            <ReloadOutlined />
            刷新
          </a-button>
        </div>
      </div>
    </div>

    <!-- 申请处理列表 -->
    <div class="record-list-card">
      <a-table :columns="applicationColumns" :data-source="filteredApplications" :loading="loading" :scroll="{ x: 800 }" :pagination="pagination" row-key="id" @change="handleTableChange" size="small">
        <template #bodyCell="{ column, record }">
          <template v-if="column.key === 'status'">
            <a-tag :color="getApplicationStatusColor(record.status)">
              {{ getApplicationStatusText(record.status) }}
            </a-tag>
          </template>

          <template v-else-if="column.key === 'actions'">
            <a-space v-if="record.status === 'pending'">
              <a-button type="link" size="small" @click="viewApplicationDetail(record)">详情</a-button>
              <a-button type="link" size="small" @click="approveApplication(record)" style="color: #52c41a">通过</a-button>
              <a-button type="link" size="small" @click="rejectApplication(record)" style="color: #ff4d4f">拒绝</a-button>
            </a-space>
            <a-space v-else>
              <a-button type="link" size="small" @click="viewApplicationDetail(record)">详情</a-button>
            </a-space>
          </template>
        </template>
      </a-table>
    </div>

    <!-- 申请处理模态框 -->
    <a-modal v-model:open="applicationModalVisible" :title="applicationAction === 'approve' ? '通过申请' : '拒绝申请'" width="600px" @ok="handleApplicationAction" :confirm-loading="processingApplication">
      <a-form :model="applicationForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }" ref="applicationFormRef">
        <a-form-item label="申请信息" :span="24">
          <div class="application-info">
            <p><strong>申请人：</strong>{{ selectedApplication?.applicant }}</p>
            <p><strong>实验室：</strong>{{ selectedApplication?.labName }}</p>
            <p><strong>使用时间：</strong>{{ selectedApplication?.timeRange }}</p>
            <p><strong>使用目的：</strong>{{ selectedApplication?.purpose }}</p>
          </div>
        </a-form-item>
        <a-form-item label="处理意见" name="comment" :rules="[{ required: true, message: '请输入处理意见' }]">
          <a-textarea v-model:value="applicationForm.comment" placeholder="请输入处理意见" :rows="4" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { message } from 'ant-design-vue'
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons-vue'
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
const emit = defineEmits(['view-detail'])

// 响应式数据
const loading = ref(false)
const applicationStatusFilter = ref('all')
const searchText = ref('')
const applicationModalVisible = ref(false)
const selectedApplication = ref(null)
const applicationAction = ref('approve')
const processingApplication = ref(false)

// 申请处理表单
const applicationFormRef = ref()
const applicationForm = reactive({
  comment: ''
})

// 分页配置
const pagination = reactive({
  current: 1,
  pageSize: 10,
  total: 0,
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total, range) => `第 ${range[0]}-${range[1]} 条，共 ${total} 条`
})

// 模拟申请数据 - 只显示当前老师负责的实验室的申请
const applications = ref([
  {
    id: 1,
    type: 'lab',
    applicationType: 'course',
    applicant: '张三',
    phone: '13800138001',
    labId: 1,
    labName: '计算机实验室A',
    labLocation: '教学楼A座201',
    applyTime: '2024-01-15 09:30',
    timeRange: '2024-01-16 08:00 - 2024-01-16 10:00',
    participantCount: 25,
    purpose: 'Java编程课程教学',
    requiredEquipment: ['台式电脑', '投影仪'],
    specialRequirements: '需要网络连接',
    contactInfo: '13800138001',
    status: 'pending',
    remark: '课程教学需要'
  },
  {
    id: 2,
    type: 'lab',
    applicationType: 'personal',
    applicant: '李四',
    phone: '13800138002',
    labId: 2,
    labName: '物理实验室B',
    labLocation: '实验楼B座301',
    applyTime: '2024-01-15 14:20',
    timeRange: '2024-01-17 14:00 - 2024-01-17 16:00',
    participantCount: 5,
    purpose: '个人研究项目',
    requiredEquipment: ['实验台', '测量仪器'],
    specialRequirements: '需要安静环境',
    contactInfo: 'lisi@email.com',
    status: 'approved',
    remark: '研究项目需要'
  }
])

// 表格列配置
const applicationColumns = [
  {
    title: '申请人',
    dataIndex: 'applicant',
    key: 'applicant',
    width: 100,
    ellipsis: true
  },
  {
    title: '实验室',
    dataIndex: 'labName',
    key: 'labName',
    width: 120,
    ellipsis: true
  },
  {
    title: '使用时间',
    dataIndex: 'timeRange',
    key: 'timeRange',
    width: 200,
    ellipsis: true
  },
  {
    title: '申请状态',
    dataIndex: 'status',
    key: 'status',
    width: 100
  },
  {
    title: '操作',
    key: 'actions',
    width: 120,
    fixed: 'right'
  }
]

// 计算属性
const filteredApplications = computed(() => {
  let result = applications.value

  // 申请状态筛选
  if (applicationStatusFilter.value !== 'all') {
    result = result.filter((record) => record.status === applicationStatusFilter.value)
  }

  // 搜索筛选
  if (searchText.value) {
    const searchLower = searchText.value.toLowerCase()
    result = result.filter((record) => record.applicant.toLowerCase().includes(searchLower) || record.purpose.toLowerCase().includes(searchLower) || record.labName.toLowerCase().includes(searchLower))
  }

  return result
})

// 方法
const getApplicationStatusColor = (status) => {
  const colorMap = {
    pending: 'orange',
    approved: 'green',
    rejected: 'red'
  }
  return colorMap[status] || 'default'
}

const getApplicationStatusText = (status) => {
  const textMap = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return textMap[status] || '未知'
}

const handleFilterChange = () => {
  pagination.current = 1
}

const handleRefresh = async () => {
  loading.value = true
  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    message.success('数据刷新成功')
  } catch (error) {
    message.error('数据刷新失败')
  } finally {
    loading.value = false
  }
}

const handleTableChange = (pag, filters, sorter) => {
  pagination.current = pag.current
  pagination.pageSize = pag.pageSize
}

const viewApplicationDetail = (record) => {
  emit('view-detail', record)
}

const approveApplication = (record) => {
  selectedApplication.value = record
  applicationAction.value = 'approve'
  applicationForm.comment = ''
  applicationModalVisible.value = true
}

const rejectApplication = (record) => {
  selectedApplication.value = record
  applicationAction.value = 'reject'
  applicationForm.comment = ''
  applicationModalVisible.value = true
}

const handleApplicationAction = async () => {
  try {
    await applicationFormRef.value.validate()
    processingApplication.value = true

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // 更新申请状态
    const newStatus = applicationAction.value === 'approve' ? 'approved' : 'rejected'
    selectedApplication.value.status = newStatus

    message.success(applicationAction.value === 'approve' ? '申请已通过' : '申请已拒绝')
    applicationModalVisible.value = false
    applicationForm.comment = ''
  } catch (error) {
    message.error('操作失败')
  } finally {
    processingApplication.value = false
  }
}
</script>

<style scoped lang="scss">
.filter-card {
  padding: 16px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  @media (max-width: 768px) {
    padding: 0px;
    box-shadow: none;
  }
}

.filter-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
}

.filter-left {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}

.type-filter {
  width: 150px;
}

.search-input {
  width: 240px;
  min-width: 200px;
}

.filter-right {
  display: flex;
  gap: 12px;
}

.record-list-card {
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  @media (max-width: 768px) {
    padding: 0px;
    box-shadow: none;
  }
}

.application-info {
  background: #f5f5f5;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;

  p {
    margin: 4px 0;
    font-size: 14px;
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .filter-section {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .filter-left {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }

  .type-filter,
  .search-input {
    width: 100%;
    min-width: auto;
  }

  .filter-right {
    justify-content: center;
    flex-wrap: wrap;
  }
}
</style>
