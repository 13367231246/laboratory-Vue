import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useSatisfactionStore = defineStore('satisfaction', () => {
  // 满意度评价数据
  const satisfactions = ref([
    {
      id: 1,
      type: 'lab', // lab, equipment, service
      labId: 4,
      labName: '生物实验室D',
      equipmentId: null,
      equipmentName: null,
      applicationId: 4,
      applicant: '赵老师',
      applicantId: 5,
      applicantType: 'teacher',
      rating: 5, // 1-5分
      comment: '实验室环境很好，设备齐全，管理规范',
      categories: {
        environment: 5, // 环境设施
        equipment: 5,   // 设备质量
        service: 5,     // 服务质量
        management: 5   // 管理水平
      },
      submitTime: '2024-01-17 18:00:00',
      status: 'submitted', // submitted, reviewed, archived
      reviewer: null,
      reviewTime: null,
      reviewComment: null,
      images: []
    },
    {
      id: 2,
      type: 'equipment',
      labId: 2,
      labName: '物理实验室B',
      equipmentId: 7,
      equipmentName: '测量仪器',
      applicationId: 2,
      applicant: '李同学',
      applicantId: 3,
      applicantType: 'student',
      rating: 4,
      comment: '设备性能良好，但使用说明不够详细',
      categories: {
        environment: 4,
        equipment: 4,
        service: 3,
        management: 4
      },
      submitTime: '2024-01-18 16:30:00',
      status: 'submitted',
      reviewer: null,
      reviewTime: null,
      reviewComment: null,
      images: []
    },
    {
      id: 3,
      type: 'service',
      labId: 3,
      labName: '化学实验室C',
      equipmentId: null,
      equipmentName: null,
      applicationId: null,
      applicant: '王同学',
      applicantId: 4,
      applicantType: 'student',
      rating: 3,
      comment: '维修服务响应较慢，希望改进',
      categories: {
        environment: 3,
        equipment: 3,
        service: 2,
        management: 3
      },
      submitTime: '2024-01-16 14:20:00',
      status: 'reviewed',
      reviewer: '李老师',
      reviewTime: '2024-01-17 09:15:00',
      reviewComment: '已收到反馈，将改进维修服务流程',
      images: []
    },
    {
      id: 4,
      type: 'lab',
      labId: 1,
      labName: '计算机实验室A',
      equipmentId: null,
      equipmentName: null,
      applicationId: 1,
      applicant: '张老师',
      applicantId: 1,
      applicantType: 'teacher',
      rating: 5,
      comment: '实验室管理非常规范，设备维护及时',
      categories: {
        environment: 5,
        equipment: 5,
        service: 5,
        management: 5
      },
      submitTime: '2024-01-20 10:30:00',
      status: 'submitted',
      reviewer: null,
      reviewTime: null,
      reviewComment: null,
      images: []
    }
  ])

  // 满意度统计
  const satisfactionStats = ref({
    total: 0,
    average: 0,
    distribution: {
      5: 0, // 5分
      4: 0, // 4分
      3: 0, // 3分
      2: 0, // 2分
      1: 0  // 1分
    },
    categories: {
      environment: 0,
      equipment: 0,
      service: 0,
      management: 0
    },
    monthly: 0,
    byType: {
      lab: 0,
      equipment: 0,
      service: 0
    }
  })

  // 计算属性
  const totalSatisfactions = computed(() => satisfactions.value.length)
  const averageRating = computed(() => {
    if (satisfactions.value.length === 0) return 0
    const sum = satisfactions.value.reduce((acc, item) => acc + item.rating, 0)
    return Math.round((sum / satisfactions.value.length) * 10) / 10
  })

  const ratingDistribution = computed(() => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    satisfactions.value.forEach(item => {
      distribution[item.rating]++
    })
    return distribution
  })

  const categoryAverages = computed(() => {
    const categories = { environment: 0, equipment: 0, service: 0, management: 0 }
    const counts = { environment: 0, equipment: 0, service: 0, management: 0 }
    
    satisfactions.value.forEach(item => {
      Object.keys(categories).forEach(category => {
        if (item.categories[category]) {
          categories[category] += item.categories[category]
          counts[category]++
        }
      })
    })
    
    Object.keys(categories).forEach(category => {
      if (counts[category] > 0) {
        categories[category] = Math.round((categories[category] / counts[category]) * 10) / 10
      }
    })
    
    return categories
  })

  const monthlySatisfactions = computed(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    return satisfactions.value.filter(item => {
      const submitDate = new Date(item.submitTime)
      return submitDate.getMonth() === currentMonth && submitDate.getFullYear() === currentYear
    }).length
  })

  const typeDistribution = computed(() => {
    const distribution = { lab: 0, equipment: 0, service: 0 }
    satisfactions.value.forEach(item => {
      distribution[item.type]++
    })
    return distribution
  })

  // 统计数据
  const stats = computed(() => ({
    total: totalSatisfactions.value,
    average: averageRating.value,
    distribution: ratingDistribution.value,
    categories: categoryAverages.value,
    monthly: monthlySatisfactions.value,
    byType: typeDistribution.value
  }))

  // 根据ID获取满意度评价
  const getSatisfactionById = (id) => {
    return satisfactions.value.find(item => item.id === id)
  }

  // 根据申请人ID获取满意度评价
  const getSatisfactionsByApplicantId = (applicantId) => {
    return satisfactions.value.filter(item => item.applicantId === applicantId)
  }

  // 根据实验室ID获取满意度评价
  const getSatisfactionsByLabId = (labId) => {
    return satisfactions.value.filter(item => item.labId === labId)
  }

  // 根据类型筛选满意度评价
  const filterSatisfactionsByType = (type) => {
    if (!type) return satisfactions.value
    return satisfactions.value.filter(item => item.type === type)
  }

  // 根据评分筛选满意度评价
  const filterSatisfactionsByRating = (rating) => {
    if (rating === undefined || rating === null) return satisfactions.value
    return satisfactions.value.filter(item => item.rating === rating)
  }

  // 根据状态筛选满意度评价
  const filterSatisfactionsByStatus = (status) => {
    if (!status) return satisfactions.value
    return satisfactions.value.filter(item => item.status === status)
  }

  // 搜索满意度评价
  const searchSatisfactions = (keyword) => {
    if (!keyword) return satisfactions.value
    return satisfactions.value.filter(item =>
      item.labName.toLowerCase().includes(keyword.toLowerCase()) ||
      item.equipmentName?.toLowerCase().includes(keyword.toLowerCase()) ||
      item.applicant.toLowerCase().includes(keyword.toLowerCase()) ||
      item.comment.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  // 添加满意度评价
  const addSatisfaction = (satisfactionData) => {
    const newSatisfaction = {
      id: Date.now(),
      ...satisfactionData,
      submitTime: new Date().toLocaleString(),
      status: 'submitted',
      reviewer: null,
      reviewTime: null,
      reviewComment: null,
      images: satisfactionData.images || []
    }
    satisfactions.value.push(newSatisfaction)
    return newSatisfaction
  }

  // 更新满意度评价
  const updateSatisfaction = (id, satisfactionData) => {
    const index = satisfactions.value.findIndex(item => item.id === id)
    if (index !== -1) {
      satisfactions.value[index] = { ...satisfactions.value[index], ...satisfactionData }
      return satisfactions.value[index]
    }
    return null
  }

  // 审核满意度评价
  const reviewSatisfaction = (id, reviewData) => {
    const satisfaction = getSatisfactionById(id)
    if (satisfaction && satisfaction.status === 'submitted') {
      satisfaction.status = 'reviewed'
      satisfaction.reviewer = reviewData.reviewer
      satisfaction.reviewTime = new Date().toLocaleString()
      satisfaction.reviewComment = reviewData.comment
      return satisfaction
    }
    return null
  }

  // 归档满意度评价
  const archiveSatisfaction = (id) => {
    const satisfaction = getSatisfactionById(id)
    if (satisfaction) {
      satisfaction.status = 'archived'
      return satisfaction
    }
    return null
  }

  // 删除满意度评价
  const deleteSatisfaction = (id) => {
    const index = satisfactions.value.findIndex(item => item.id === id)
    if (index !== -1) {
      satisfactions.value.splice(index, 1)
      return true
    }
    return false
  }

  // 获取满意度趋势数据
  const getSatisfactionTrend = (months = 6) => {
    const trend = []
    const now = new Date()
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const month = date.getMonth()
      const year = date.getFullYear()
      
      const monthSatisfactions = satisfactions.value.filter(item => {
        const submitDate = new Date(item.submitTime)
        return submitDate.getMonth() === month && submitDate.getFullYear() === year
      })
      
      const average = monthSatisfactions.length > 0 
        ? Math.round((monthSatisfactions.reduce((acc, item) => acc + item.rating, 0) / monthSatisfactions.length) * 10) / 10
        : 0
      
      trend.push({
        month: `${year}-${String(month + 1).padStart(2, '0')}`,
        count: monthSatisfactions.length,
        average: average
      })
    }
    
    return trend
  }

  // 获取满意度分析报告
  const getSatisfactionReport = () => {
    const total = satisfactions.value.length
    if (total === 0) return null
    
    const average = averageRating.value
    const distribution = ratingDistribution.value
    const categories = categoryAverages.value
    
    // 计算满意度百分比
    const satisfactionRate = Math.round(((distribution[5] + distribution[4]) / total) * 100)
    
    // 找出最需要改进的方面
    const minCategory = Object.keys(categories).reduce((min, key) => 
      categories[key] < categories[min] ? key : min
    )
    
    return {
      total,
      average,
      satisfactionRate,
      distribution,
      categories,
      minCategory,
      trend: getSatisfactionTrend()
    }
  }

  return {
    satisfactions,
    satisfactionStats,
    totalSatisfactions,
    averageRating,
    ratingDistribution,
    categoryAverages,
    monthlySatisfactions,
    typeDistribution,
    stats,
    getSatisfactionById,
    getSatisfactionsByApplicantId,
    getSatisfactionsByLabId,
    filterSatisfactionsByType,
    filterSatisfactionsByRating,
    filterSatisfactionsByStatus,
    searchSatisfactions,
    addSatisfaction,
    updateSatisfaction,
    reviewSatisfaction,
    archiveSatisfaction,
    deleteSatisfaction,
    getSatisfactionTrend,
    getSatisfactionReport
  }
})
