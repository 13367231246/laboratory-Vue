import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useApplicationStore = defineStore('application', () => {
  // 申请数据
  const applications = ref([
    {
      id: 1,
      type: 'lab', // lab, equipment
      labId: 1,
      labName: '计算机实验室A',
      equipmentId: null,
      equipmentName: null,
      applicant: '张老师',
      applicantId: 1,
      applicantType: 'teacher', // teacher, student
      purpose: '课程教学',
      courseName: '数据结构与算法',
      studentCount: 35,
      startTime: '2024-01-20 08:00:00',
      endTime: '2024-01-20 10:00:00',
      duration: 2, // 小时
      status: 'approved', // pending, approved, rejected, in_use, completed, cancelled
      applyTime: '2024-01-15 14:30:00',
      reviewTime: '2024-01-16 09:15:00',
      reviewer: '李老师',
      reviewerId: 2,
      reviewComment: '申请合理，同意使用',
      actualStartTime: null,
      actualEndTime: null,
      usageStatus: null, // normal, early_complete, overtime
      statusReport: null,
      statusImages: [],
      satisfaction: null,
      satisfactionComment: null
    },
    {
      id: 2,
      type: 'equipment',
      labId: 2,
      labName: '物理实验室B',
      equipmentId: 7,
      equipmentName: '测量仪器',
      applicant: '李同学',
      applicantId: 3,
      applicantType: 'student',
      purpose: '实验研究',
      courseName: null,
      studentCount: 1,
      startTime: '2024-01-18 14:00:00',
      endTime: '2024-01-18 16:00:00',
      duration: 2,
      status: 'in_use',
      applyTime: '2024-01-17 10:20:00',
      reviewTime: '2024-01-17 15:30:00',
      reviewer: '王老师',
      reviewerId: 3,
      reviewComment: '同意使用，注意设备安全',
      actualStartTime: '2024-01-18 14:05:00',
      actualEndTime: null,
      usageStatus: null,
      statusReport: null,
      statusImages: [],
      satisfaction: null,
      satisfactionComment: null
    },
    {
      id: 3,
      type: 'lab',
      labId: 3,
      labName: '化学实验室C',
      equipmentId: null,
      equipmentName: null,
      applicant: '王同学',
      applicantId: 4,
      applicantType: 'student',
      purpose: '课程实验',
      courseName: '有机化学实验',
      studentCount: 20,
      startTime: '2024-01-19 09:00:00',
      endTime: '2024-01-19 12:00:00',
      duration: 3,
      status: 'pending',
      applyTime: '2024-01-18 16:45:00',
      reviewTime: null,
      reviewer: null,
      reviewerId: null,
      reviewComment: null,
      actualStartTime: null,
      actualEndTime: null,
      usageStatus: null,
      statusReport: null,
      statusImages: [],
      satisfaction: null,
      satisfactionComment: null
    },
    {
      id: 4,
      type: 'lab',
      labId: 4,
      labName: '生物实验室D',
      equipmentId: null,
      equipmentName: null,
      applicant: '赵老师',
      applicantId: 5,
      applicantType: 'teacher',
      purpose: '科研项目',
      courseName: null,
      studentCount: 5,
      startTime: '2024-01-17 08:00:00',
      endTime: '2024-01-17 18:00:00',
      duration: 10,
      status: 'completed',
      applyTime: '2024-01-16 09:15:00',
      reviewTime: '2024-01-16 14:20:00',
      reviewer: '李老师',
      reviewerId: 2,
      reviewComment: '同意使用，注意实验室安全',
      actualStartTime: '2024-01-17 08:10:00',
      actualEndTime: '2024-01-17 17:45:00',
      usageStatus: 'normal',
      statusReport: '实验顺利完成，设备状态良好',
      statusImages: [
        { url: 'https://via.placeholder.com/300x200?text=实验完成', name: 'experiment_complete.jpg' }
      ],
      satisfaction: 5,
      satisfactionComment: '实验室环境很好，设备齐全'
    },
    {
      id: 5,
      type: 'equipment',
      labId: 1,
      labName: '计算机实验室A',
      equipmentId: 2,
      equipmentName: '投影仪',
      applicant: '钱同学',
      applicantId: 6,
      applicantType: 'student',
      purpose: '课程展示',
      courseName: '软件工程',
      studentCount: 1,
      startTime: '2024-01-21 10:00:00',
      endTime: '2024-01-21 12:00:00',
      duration: 2,
      status: 'rejected',
      applyTime: '2024-01-20 14:30:00',
      reviewTime: '2024-01-20 16:45:00',
      reviewer: '张老师',
      reviewerId: 1,
      reviewComment: '设备已预约，请选择其他时间',
      actualStartTime: null,
      actualEndTime: null,
      usageStatus: null,
      statusReport: null,
      statusImages: [],
      satisfaction: null,
      satisfactionComment: null
    }
  ])

  // 计算属性
  const pendingApplications = computed(() => applications.value.filter(app => app.status === 'pending'))
  const approvedApplications = computed(() => applications.value.filter(app => app.status === 'approved'))
  const rejectedApplications = computed(() => applications.value.filter(app => app.status === 'rejected'))
  const inUseApplications = computed(() => applications.value.filter(app => app.status === 'in_use'))
  const completedApplications = computed(() => applications.value.filter(app => app.status === 'completed'))
  const totalApplications = computed(() => applications.value.length)
  const monthlyApplications = computed(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    return applications.value.filter(app => {
      const applyDate = new Date(app.applyTime)
      return applyDate.getMonth() === currentMonth && applyDate.getFullYear() === currentYear
    }).length
  })

  // 统计数据
  const stats = computed(() => ({
    pending: pendingApplications.value.length,
    approved: approvedApplications.value.length,
    rejected: rejectedApplications.value.length,
    inUse: inUseApplications.value.length,
    completed: completedApplications.value.length,
    monthly: monthlyApplications.value
  }))

  // 根据ID获取申请记录
  const getApplicationById = (id) => {
    return applications.value.find(app => app.id === id)
  }

  // 根据申请人ID获取申请记录
  const getApplicationsByApplicantId = (applicantId) => {
    return applications.value.filter(app => app.applicantId === applicantId)
  }

  // 根据实验室ID获取申请记录
  const getApplicationsByLabId = (labId) => {
    return applications.value.filter(app => app.labId === labId)
  }

  // 根据状态筛选申请记录
  const filterApplicationsByStatus = (status) => {
    if (status === undefined || status === null) return applications.value
    return applications.value.filter(app => app.status === status)
  }

  // 根据类型筛选申请记录
  const filterApplicationsByType = (type) => {
    if (!type) return applications.value
    return applications.value.filter(app => app.type === type)
  }

  // 搜索申请记录
  const searchApplications = (keyword) => {
    if (!keyword) return applications.value
    return applications.value.filter(app =>
      app.labName.toLowerCase().includes(keyword.toLowerCase()) ||
      app.equipmentName?.toLowerCase().includes(keyword.toLowerCase()) ||
      app.applicant.toLowerCase().includes(keyword.toLowerCase()) ||
      app.purpose.toLowerCase().includes(keyword.toLowerCase()) ||
      app.courseName?.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  // 添加申请记录
  const addApplication = (applicationData) => {
    const newApplication = {
      id: Date.now(),
      ...applicationData,
      status: 'pending',
      applyTime: new Date().toLocaleString(),
      reviewTime: null,
      reviewer: null,
      reviewerId: null,
      reviewComment: null,
      actualStartTime: null,
      actualEndTime: null,
      usageStatus: null,
      statusReport: null,
      statusImages: [],
      satisfaction: null,
      satisfactionComment: null
    }
    applications.value.push(newApplication)
    return newApplication
  }

  // 更新申请记录
  const updateApplication = (id, applicationData) => {
    const index = applications.value.findIndex(app => app.id === id)
    if (index !== -1) {
      applications.value[index] = { ...applications.value[index], ...applicationData }
      return applications.value[index]
    }
    return null
  }

  // 审核申请
  const reviewApplication = (id, reviewData) => {
    const application = getApplicationById(id)
    if (application && application.status === 'pending') {
      application.status = reviewData.status
      application.reviewTime = new Date().toLocaleString()
      application.reviewer = reviewData.reviewer
      application.reviewerId = reviewData.reviewerId
      application.reviewComment = reviewData.comment
      
      return application
    }
    return null
  }

  // 开始使用
  const startUsage = (id) => {
    const application = getApplicationById(id)
    if (application && application.status === 'approved') {
      application.status = 'in_use'
      application.actualStartTime = new Date().toLocaleString()
      return application
    }
    return null
  }

  // 完成使用
  const completeUsage = (id, usageData) => {
    const application = getApplicationById(id)
    if (application && application.status === 'in_use') {
      application.status = 'completed'
      application.actualEndTime = new Date().toLocaleString()
      application.usageStatus = usageData.status
      application.statusReport = usageData.report
      application.statusImages = usageData.images || []
      
      return application
    }
    return null
  }

  // 取消申请
  const cancelApplication = (id, reason) => {
    const application = getApplicationById(id)
    if (application && ['pending', 'approved'].includes(application.status)) {
      application.status = 'cancelled'
      application.reviewComment = reason
      return application
    }
    return null
  }

  // 提交满意度评价
  const submitSatisfaction = (id, satisfactionData) => {
    const application = getApplicationById(id)
    if (application && application.status === 'completed') {
      application.satisfaction = satisfactionData.rating
      application.satisfactionComment = satisfactionData.comment
      return application
    }
    return null
  }

  // 删除申请记录
  const deleteApplication = (id) => {
    const index = applications.value.findIndex(app => app.id === id)
    if (index !== -1) {
      applications.value.splice(index, 1)
      return true
    }
    return false
  }

  // 检查时间冲突
  const checkTimeConflict = (labId, startTime, endTime, excludeId = null) => {
    const start = new Date(startTime)
    const end = new Date(endTime)
    
    return applications.value.some(app => {
      if (app.id === excludeId) return false
      if (app.labId !== labId) return false
      if (!['approved', 'in_use'].includes(app.status)) return false
      
      const appStart = new Date(app.startTime)
      const appEnd = new Date(app.endTime)
      
      return (start < appEnd && end > appStart)
    })
  }

  return {
    applications,
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    inUseApplications,
    completedApplications,
    totalApplications,
    monthlyApplications,
    stats,
    getApplicationById,
    getApplicationsByApplicantId,
    getApplicationsByLabId,
    filterApplicationsByStatus,
    filterApplicationsByType,
    searchApplications,
    addApplication,
    updateApplication,
    reviewApplication,
    startUsage,
    completeUsage,
    cancelApplication,
    submitSatisfaction,
    deleteApplication,
    checkTimeConflict
  }
})
