import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useRepairStore = defineStore('repair', () => {
  // 报修数据
  const repairs = ref([
    {
      id: 1,
      repairType: 'equipment', // equipment, environment, safety
      labId: 1,
      labName: '计算机实验室A',
      equipmentId: 1,
      equipmentName: '台式电脑',
      description: '电脑无法开机，电源指示灯不亮，可能是电源故障',
      urgency: 'high', // low, medium, high, critical
      status: 0, // 0-等待维修, 1-维修中, 2-完成维修
      reporter: '张同学',
      reporterId: 2,
      contactInfo: '13800138002',
      reportTime: '2024-01-15 14:30:00',
      expectedTime: '2024-01-16 18:00:00',
      images: [
        { url: 'https://via.placeholder.com/300x200?text=故障照片1', name: 'fault1.jpg' },
        { url: 'https://via.placeholder.com/300x200?text=故障照片2', name: 'fault2.jpg' }
      ],
      repairRecords: [],
      assignedRepairer: null,
      repairStartTime: null,
      repairEndTime: null,
      repairResult: null,
      repairSummary: null,
      repairMaterials: null,
      repairImages: []
    },
    {
      id: 2,
      repairType: 'environment',
      labId: 2,
      labName: '物理实验室B',
      equipmentId: null,
      equipmentName: '空调设备',
      description: '空调制冷效果差，温度降不下来，影响实验环境',
      urgency: 'medium',
      status: 1,
      reporter: '李老师',
      reporterId: 1,
      contactInfo: '13800138001',
      reportTime: '2024-01-14 10:20:00',
      expectedTime: '2024-01-15 17:00:00',
      images: [
        { url: 'https://via.placeholder.com/300x200?text=空调故障', name: 'ac_fault.jpg' }
      ],
      repairRecords: [
        {
          id: 1,
          title: '开始维修',
          description: '检查空调制冷系统，发现制冷剂不足',
          operator: '王师傅',
          operatorId: 4,
          time: '2024-01-14 15:30:00',
          status: 'completed'
        }
      ],
      assignedRepairer: '王师傅',
      repairStartTime: '2024-01-14 15:30:00',
      repairEndTime: null,
      repairResult: null,
      repairSummary: null,
      repairMaterials: null,
      repairImages: []
    },
    {
      id: 3,
      repairType: 'equipment',
      labId: 3,
      labName: '化学实验室C',
      equipmentId: 12,
      equipmentName: '通风设备',
      description: '通风设备噪音过大，影响正常使用，需要检查风扇',
      urgency: 'low',
      status: 2,
      reporter: '王同学',
      reporterId: 3,
      contactInfo: '13800138003',
      reportTime: '2024-01-13 16:45:00',
      expectedTime: '2024-01-14 18:00:00',
      images: [],
      repairRecords: [
        {
          id: 1,
          title: '开始维修',
          description: '检查通风设备，发现风扇轴承磨损',
          operator: '赵师傅',
          operatorId: 5,
          time: '2024-01-13 17:00:00',
          status: 'completed'
        },
        {
          id: 2,
          title: '完成维修',
          description: '更换风扇轴承，测试运行正常',
          operator: '赵师傅',
          operatorId: 5,
          time: '2024-01-13 18:30:00',
          status: 'completed'
        }
      ],
      assignedRepairer: '赵师傅',
      repairStartTime: '2024-01-13 17:00:00',
      repairEndTime: '2024-01-13 18:30:00',
      repairResult: 'success',
      repairSummary: '更换风扇轴承，设备运行正常',
      repairMaterials: '风扇轴承 x1, 润滑油 x1',
      repairImages: [
        { url: 'https://via.placeholder.com/300x200?text=维修完成', name: 'repair_complete.jpg' }
      ]
    },
    {
      id: 4,
      repairType: 'safety',
      labId: 4,
      labName: '生物实验室D',
      equipmentId: null,
      equipmentName: '安全设备',
      description: '实验室门锁损坏，存在安全隐患',
      urgency: 'critical',
      status: 0,
      reporter: '赵同学',
      reporterId: 6,
      contactInfo: '13800138006',
      reportTime: '2024-01-16 09:15:00',
      expectedTime: '2024-01-16 12:00:00',
      images: [
        { url: 'https://via.placeholder.com/300x200?text=门锁损坏', name: 'door_lock.jpg' }
      ],
      repairRecords: [],
      assignedRepairer: null,
      repairStartTime: null,
      repairEndTime: null,
      repairResult: null,
      repairSummary: null,
      repairMaterials: null,
      repairImages: []
    }
  ])

  // 维修人员数据
  const repairers = ref([
    { id: 4, name: '王师傅', phone: '13800138004', specialty: '空调维修', status: 'available' },
    { id: 5, name: '赵师傅', phone: '13800138005', specialty: '设备维修', status: 'available' },
    { id: 6, name: '钱师傅', phone: '13800138006', specialty: '安全设备', status: 'busy' },
    { id: 7, name: '孙师傅', phone: '13800138007', specialty: '网络设备', status: 'available' }
  ])

  // 计算属性
  const pendingRepairs = computed(() => repairs.value.filter(repair => repair.status === 0))
  const repairingRepairs = computed(() => repairs.value.filter(repair => repair.status === 1))
  const completedRepairs = computed(() => repairs.value.filter(repair => repair.status === 2))
  const totalRepairs = computed(() => repairs.value.length)
  const monthlyRepairs = computed(() => {
    const currentMonth = new Date().getMonth()
    const currentYear = new Date().getFullYear()
    return repairs.value.filter(repair => {
      const repairDate = new Date(repair.reportTime)
      return repairDate.getMonth() === currentMonth && repairDate.getFullYear() === currentYear
    }).length
  })

  // 统计数据
  const stats = computed(() => ({
    pending: pendingRepairs.value.length,
    repairing: repairingRepairs.value.length,
    completed: completedRepairs.value.length,
    monthly: monthlyRepairs.value
  }))

  // 根据ID获取报修记录
  const getRepairById = (id) => {
    return repairs.value.find(repair => repair.id === id)
  }

  // 根据实验室ID获取报修记录
  const getRepairsByLabId = (labId) => {
    return repairs.value.filter(repair => repair.labId === labId)
  }

  // 根据状态筛选报修记录
  const filterRepairsByStatus = (status) => {
    if (status === undefined || status === null) return repairs.value
    return repairs.value.filter(repair => repair.status === status)
  }

  // 根据紧急程度筛选报修记录
  const filterRepairsByUrgency = (urgency) => {
    if (!urgency) return repairs.value
    return repairs.value.filter(repair => repair.urgency === urgency)
  }

  // 搜索报修记录
  const searchRepairs = (keyword) => {
    if (!keyword) return repairs.value
    return repairs.value.filter(repair =>
      repair.labName.toLowerCase().includes(keyword.toLowerCase()) ||
      repair.equipmentName?.toLowerCase().includes(keyword.toLowerCase()) ||
      repair.reporter.toLowerCase().includes(keyword.toLowerCase()) ||
      repair.description.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  // 添加报修记录
  const addRepair = (repairData) => {
    const newRepair = {
      id: Date.now(),
      ...repairData,
      status: 0,
      repairRecords: [],
      assignedRepairer: null,
      repairStartTime: null,
      repairEndTime: null,
      repairResult: null,
      repairSummary: null,
      repairMaterials: null,
      repairImages: []
    }
    repairs.value.push(newRepair)
    return newRepair
  }

  // 更新报修记录
  const updateRepair = (id, repairData) => {
    const index = repairs.value.findIndex(repair => repair.id === id)
    if (index !== -1) {
      repairs.value[index] = { ...repairs.value[index], ...repairData }
      return repairs.value[index]
    }
    return null
  }

  // 开始维修
  const startRepair = (id, repairData) => {
    const repair = getRepairById(id)
    if (repair && repair.status === 0) {
      repair.status = 1
      repair.assignedRepairer = repairData.repairer
      repair.repairStartTime = new Date().toLocaleString()
      
      // 添加维修记录
      const repairRecord = {
        id: Date.now(),
        title: '开始维修',
        description: repairData.solution,
        operator: repairData.repairer,
        operatorId: repairData.repairerId,
        time: new Date().toLocaleString(),
        status: 'completed'
      }
      repair.repairRecords.push(repairRecord)
      
      return repair
    }
    return null
  }

  // 完成维修
  const completeRepair = (id, repairData) => {
    const repair = getRepairById(id)
    if (repair && repair.status === 1) {
      repair.status = 2
      repair.repairEndTime = new Date().toLocaleString()
      repair.repairResult = repairData.result
      repair.repairSummary = repairData.summary
      repair.repairMaterials = repairData.materials
      repair.repairImages = repairData.repairImages || []
      
      // 添加维修记录
      const repairRecord = {
        id: Date.now(),
        title: '完成维修',
        description: repairData.summary,
        operator: repair.assignedRepairer,
        operatorId: repairData.repairerId,
        time: new Date().toLocaleString(),
        status: 'completed'
      }
      repair.repairRecords.push(repairRecord)
      
      return repair
    }
    return null
  }

  // 删除报修记录
  const deleteRepair = (id) => {
    const index = repairs.value.findIndex(repair => repair.id === id)
    if (index !== -1) {
      repairs.value.splice(index, 1)
      return true
    }
    return false
  }

  // 获取维修人员
  const getRepairers = () => {
    return repairers.value
  }

  // 获取可用维修人员
  const getAvailableRepairers = () => {
    return repairers.value.filter(repairer => repairer.status === 'available')
  }

  return {
    repairs,
    repairers,
    pendingRepairs,
    repairingRepairs,
    completedRepairs,
    totalRepairs,
    monthlyRepairs,
    stats,
    getRepairById,
    getRepairsByLabId,
    filterRepairsByStatus,
    filterRepairsByUrgency,
    searchRepairs,
    addRepair,
    updateRepair,
    startRepair,
    completeRepair,
    deleteRepair,
    getRepairers,
    getAvailableRepairers
  }
})
