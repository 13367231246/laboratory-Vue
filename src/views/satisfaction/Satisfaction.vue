<template>
  <div class="satisfaction-page">
    <a-row :gutter="24">
      <!-- 评价表单 -->
      <a-col :xs="24" :lg="16">
        <a-card title="使用评价" class="satisfaction-form-card">
          <a-form ref="formRef" :model="formData" :rules="formRules" :label-col="{ xs: 24, sm: 6 }" :wrapper-col="{ xs: 24, sm: 18 }" @finish="handleSubmit">
            <a-form-item label="实验室" name="labId">
              <a-select v-model:value="formData.labId" placeholder="请选择使用过的实验室" show-search :filter-option="filterOption" @change="handleLabChange">
                <a-select-option v-for="lab in usedLabs" :key="lab.id" :value="lab.id"> {{ lab.name }} - {{ lab.location }} </a-select-option>
              </a-select>
            </a-form-item>

            <a-form-item label="使用时间" name="usageTime">
              <a-range-picker v-model:value="formData.usageTime" format="YYYY-MM-DD HH:mm" style="width: 100%" disabled />
            </a-form-item>

            <a-form-item label="整体满意度" name="overallSatisfaction">
              <a-rate v-model:value="formData.overallSatisfaction" :count="5" allow-half :tooltips="['很不满意', '不满意', '一般', '满意', '很满意']" />
            </a-form-item>

            <a-form-item label="环境评价">
              <a-row :gutter="16">
                <a-col :span="12">
                  <div class="rating-item">
                    <span>清洁度</span>
                    <a-form-item-rest>
                      <a-rate v-model:value="formData.environmentRating.cleanliness" />
                    </a-form-item-rest>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="rating-item">
                    <span>温度</span>
                    <a-form-item-rest>
                      <a-rate v-model:value="formData.environmentRating.temperature" />
                    </a-form-item-rest>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="rating-item">
                    <span>照明</span>
                    <a-form-item-rest>
                      <a-rate v-model:value="formData.environmentRating.lighting" />
                    </a-form-item-rest>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="rating-item">
                    <span>噪音</span>
                    <a-form-item-rest>
                      <a-rate v-model:value="formData.environmentRating.noise" />
                    </a-form-item-rest>
                  </div>
                </a-col>
              </a-row>
            </a-form-item>

            <a-form-item label="设备评价">
              <a-row :gutter="16">
                <a-col :span="12">
                  <div class="rating-item">
                    <span>设备完好性</span>
                    <a-form-item-rest>
                      <a-rate v-model:value="formData.equipmentRating.condition" />
                    </a-form-item-rest>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="rating-item">
                    <span>设备性能</span>
                    <a-form-item-rest>
                      <a-rate v-model:value="formData.equipmentRating.performance" />
                    </a-form-item-rest>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="rating-item">
                    <span>设备数量</span>
                    <a-form-item-rest>
                      <a-rate v-model:value="formData.equipmentRating.quantity" />
                    </a-form-item-rest>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="rating-item">
                    <span>设备易用性</span>
                    <a-form-item-rest>
                      <a-rate v-model:value="formData.equipmentRating.usability" />
                    </a-form-item-rest>
                  </div>
                </a-col>
              </a-row>
            </a-form-item>

            <a-form-item label="服务评价">
              <a-row :gutter="16">
                <a-col :span="12">
                  <div class="rating-item">
                    <span>申请流程</span>
                    <a-form-item-rest>
                      <a-rate v-model:value="formData.serviceRating.application" />
                    </a-form-item-rest>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="rating-item">
                    <span>响应速度</span>
                    <a-form-item-rest>
                      <a-rate v-model:value="formData.serviceRating.response" />
                    </a-form-item-rest>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="rating-item">
                    <span>技术支持</span>
                    <a-form-item-rest>
                      <a-rate v-model:value="formData.serviceRating.support" />
                    </a-form-item-rest>
                  </div>
                </a-col>
                <a-col :span="12">
                  <div class="rating-item">
                    <span>问题解决</span>
                    <a-form-item-rest>
                      <a-rate v-model:value="formData.serviceRating.problemSolving" />
                    </a-form-item-rest>
                  </div>
                </a-col>
              </a-row>
            </a-form-item>

            <a-form-item label="改进建议" name="suggestions">
              <a-textarea v-model:value="formData.suggestions" placeholder="请提出您的改进建议和意见" :rows="4" />
            </a-form-item>

            <a-form-item label="推荐意愿" name="recommendation">
              <a-radio-group v-model:value="formData.recommendation">
                <a-radio value="high">非常愿意推荐</a-radio>
                <a-radio value="medium">愿意推荐</a-radio>
                <a-radio value="low">不太愿意推荐</a-radio>
                <a-radio value="none">不愿意推荐</a-radio>
              </a-radio-group>
            </a-form-item>

            <a-space>
              <a-button type="primary" html-type="submit" :loading="submitting"> 提交评价 </a-button>
              <a-button @click="handleReset">重置</a-button>
            </a-space>
          </a-form>
        </a-card>
      </a-col>

      <!-- 评价统计 -->
      <a-col :xs="24" :lg="8">
        <a-card title="评价统计" class="stats-card">
          <div class="stats-content">
            <a-statistic title="平均满意度" :value="stats.averageSatisfaction" :precision="1" suffix="分" :value-style="{ color: '#3f8600' }" />

            <a-divider />

            <div class="rating-breakdown">
              <h4>评分分布</h4>
              <div class="rating-bar" v-for="(item, index) in ratingBreakdown" :key="index">
                <span class="rating-label">{{ item.label }}</span>
                <a-progress :percent="item.percentage" :stroke-color="item.color" :show-info="false" />
                <span class="rating-count">{{ item.count }}人</span>
              </div>
            </div>
          </div>
        </a-card>

        <!-- 最近评价 -->
        <a-card title="最近评价" class="recent-reviews-card">
          <a-list :data-source="recentReviews" :pagination="false" size="small">
            <template #renderItem="{ item }">
              <a-list-item>
                <a-list-item-meta>
                  <template #title>
                    <div class="review-header">
                      <span>{{ item.labName }}</span>
                      <a-rate :value="item.rating" disabled size="small" />
                    </div>
                  </template>
                  <template #description>
                    <div class="review-content">
                      <p>{{ item.comment }}</p>
                      <div class="review-meta">
                        <span>{{ item.userName }}</span>
                        <span>{{ item.createTime }}</span>
                      </div>
                    </div>
                  </template>
                </a-list-item-meta>
              </a-list-item>
            </template>
          </a-list>
        </a-card>
      </a-col>
    </a-row>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import dayjs from 'dayjs'

const router = useRouter()

// 响应式数据
const formRef = ref()
const submitting = ref(false)
const previewVisible = ref(false)

// 表单数据
const formData = reactive({
  labId: undefined,
  usageTime: [],
  overallSatisfaction: 0,
  environmentRating: {
    cleanliness: 0,
    temperature: 0,
    lighting: 0,
    noise: 0
  },
  equipmentRating: {
    condition: 0,
    performance: 0,
    quantity: 0,
    usability: 0
  },
  serviceRating: {
    application: 0,
    response: 0,
    support: 0,
    problemSolving: 0
  },
  suggestions: '',
  recommendation: 'medium'
})

// 表单验证规则
const formRules = {
  labId: [{ required: true, message: '请选择实验室', trigger: 'change' }],
  overallSatisfaction: [{ required: true, message: '请进行整体满意度评价', trigger: 'change' }]
}

// 使用过的实验室数据
const usedLabs = ref([
  {
    id: 1,
    name: '计算机实验室A',
    location: '教学楼A座201',
    usageTime: [dayjs().subtract(1, 'day').hour(9), dayjs().subtract(1, 'day').hour(11)]
  },
  {
    id: 2,
    name: '物理实验室B',
    location: '实验楼B座301',
    usageTime: [dayjs().subtract(2, 'day').hour(14), dayjs().subtract(2, 'day').hour(16)]
  }
])

// 统计数据
const stats = ref({
  averageSatisfaction: 4.2
})

// 评分分布
const ratingBreakdown = ref([
  { label: '5分', percentage: 60, count: 120, color: '#52c41a' },
  { label: '4分', percentage: 25, count: 50, color: '#1890ff' },
  { label: '3分', percentage: 10, count: 20, color: '#faad14' },
  { label: '2分', percentage: 3, count: 6, color: '#ff7875' },
  { label: '1分', percentage: 2, count: 4, color: '#ff4d4f' }
])

// 最近评价
const recentReviews = ref([
  {
    labName: '计算机实验室A',
    rating: 5,
    comment: '环境很好，设备齐全，使用体验很棒！',
    userName: '张同学',
    createTime: '2024-01-15 16:30'
  },
  {
    labName: '物理实验室B',
    rating: 4,
    comment: '整体不错，但温度有点低，希望能调节一下。',
    userName: '李同学',
    createTime: '2024-01-14 15:20'
  },
  {
    labName: '化学实验室C',
    rating: 5,
    comment: '设备很新，老师指导很专业，学到了很多。',
    userName: '王同学',
    createTime: '2024-01-13 14:10'
  }
])

// 方法
const filterOption = (input, option) => {
  return option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
}

const handleLabChange = (value) => {
  const lab = usedLabs.value.find((l) => l.id === value)
  if (lab) {
    formData.usageTime = lab.usageTime
  }
}

const handleSubmit = async () => {
  try {
    await formRef.value.validate()
    submitting.value = true

    // 模拟API调用
    await new Promise((resolve) => setTimeout(resolve, 2000))

    message.success('评价提交成功！感谢您的反馈')
    router.push('/')
  } catch (error) {
    console.error('表单验证失败:', error)
  } finally {
    submitting.value = false
  }
}

const handleReset = () => {
  formRef.value.resetFields()
  // 重置评分
  formData.overallSatisfaction = 0
  Object.keys(formData.environmentRating).forEach((key) => {
    formData.environmentRating[key] = 0
  })
  Object.keys(formData.equipmentRating).forEach((key) => {
    formData.equipmentRating[key] = 0
  })
  Object.keys(formData.serviceRating).forEach((key) => {
    formData.serviceRating[key] = 0
  })
}

// 生命周期
onMounted(() => {
  // 加载数据
})
</script>

<style scoped>
.satisfaction-page {
  margin-top: 10px;
}

.satisfaction-form-card,
.stats-card,
.recent-reviews-card {
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
}

.rating-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.rating-item span {
  font-size: 14px;
  color: #333;
  min-width: 60px;
}

.stats-content {
  text-align: center;
}

.rating-breakdown {
  margin-top: 20px;
}

.rating-breakdown h4 {
  margin-bottom: 16px;
  color: #333;
}

.rating-bar {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  gap: 12px;
}

.rating-label {
  min-width: 40px;
  font-size: 14px;
  color: #666;
}

.rating-count {
  min-width: 40px;
  font-size: 12px;
  color: #999;
  text-align: right;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.review-content p {
  margin: 8px 0;
  color: #666;
  line-height: 1.5;
}

.review-meta {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #999;
}

/* 移动端适配 - 768px以下 */
@media (max-width: 768px) {
  .satisfaction-form-card {
    margin-bottom: 16px;
  }

  .satisfaction-info-card {
    margin-bottom: 16px;
  }

  .rating-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 4px;
  }

  .rating-grid {
    grid-template-columns: 1fr;
    gap: 12px;
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
