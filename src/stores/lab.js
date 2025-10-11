import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useLabStore = defineStore('lab', () => {
  // 实验室数据
  const labs = ref([
    {
      id: 1,
      name: '计算机实验室A',
      location: '教学楼A座201',
      capacity: 40,
      status: 0, // 0-正常且空闲, 1-使用中, 2-需要处理
      manager: '张老师',
      phone: '13800138001',
      email: 'zhang@university.edu',
      description: '主要用于计算机课程教学，配备40台高性能电脑',
      equipmentCount: 45,
      equipment: [
        { id: 1, name: '台式电脑', model: 'Dell OptiPlex 7090', status: 0, serialNumber: 'PC001', purchaseDate: '2023-01-15' },
        { id: 2, name: '投影仪', model: 'Epson CB-X41', status: 0, serialNumber: 'PJ001', purchaseDate: '2023-02-20' },
        { id: 3, name: '网络设备', model: 'Cisco Catalyst 2960', status: 0, serialNumber: 'NW001', purchaseDate: '2023-01-10' },
        { id: 4, name: '打印机', model: 'HP LaserJet Pro', status: 0, serialNumber: 'PR001', purchaseDate: '2023-03-05' },
        { id: 5, name: '扫描仪', model: 'Canon CanoScan', status: 0, serialNumber: 'SC001', purchaseDate: '2023-03-10' }
      ],
      createTime: '2023-01-01 09:00:00',
      updateTime: '2024-01-15 14:30:00'
    },
    {
      id: 2,
      name: '物理实验室B',
      location: '实验楼B座301',
      capacity: 30,
      status: 1,
      manager: '李老师',
      phone: '13800138002',
      email: 'li@university.edu',
      description: '物理实验教学专用，配备各种测量仪器',
      equipmentCount: 38,
      equipment: [
        { id: 6, name: '实验台', model: 'Lab Table Pro 2000', status: 0, serialNumber: 'TB001', purchaseDate: '2023-02-01' },
        { id: 7, name: '测量仪器', model: 'Digital Multimeter DM-100', status: 0, serialNumber: 'MM001', purchaseDate: '2023-02-15' },
        { id: 8, name: '电源设备', model: 'Power Supply Unit PS-500', status: 0, serialNumber: 'PS001', purchaseDate: '2023-02-20' },
        { id: 9, name: '示波器', model: 'Tektronix TBS1000', status: 0, serialNumber: 'OS001', purchaseDate: '2023-03-01' },
        { id: 10, name: '信号发生器', model: 'Rigol DG1022Z', status: 0, serialNumber: 'SG001', purchaseDate: '2023-03-05' }
      ],
      createTime: '2023-02-01 09:00:00',
      updateTime: '2024-01-14 10:20:00'
    },
    {
      id: 3,
      name: '化学实验室C',
      location: '实验楼C座101',
      capacity: 25,
      status: 2,
      manager: '王老师',
      phone: '13800138003',
      email: 'wang@university.edu',
      description: '化学实验教学专用，配备通风设备和安全设施',
      equipmentCount: 32,
      equipment: [
        { id: 11, name: '实验台', model: 'Chem Table CT-3000', status: 0, serialNumber: 'CT001', purchaseDate: '2023-03-01' },
        { id: 12, name: '通风设备', model: 'Ventilation System VS-500', status: 2, serialNumber: 'VS001', purchaseDate: '2023-03-10' },
        { id: 13, name: '安全设备', model: 'Safety Equipment SE-100', status: 0, serialNumber: 'SE001', purchaseDate: '2023-03-15' },
        { id: 14, name: '分析天平', model: 'Analytical Balance AB-200', status: 0, serialNumber: 'AB001', purchaseDate: '2023-03-20' },
        { id: 15, name: '离心机', model: 'Centrifuge CF-1000', status: 0, serialNumber: 'CF001', purchaseDate: '2023-03-25' }
      ],
      createTime: '2023-03-01 09:00:00',
      updateTime: '2024-01-13 16:45:00'
    },
    {
      id: 4,
      name: '生物实验室D',
      location: '实验楼D座201',
      capacity: 20,
      status: 0,
      manager: '赵老师',
      phone: '13800138004',
      email: 'zhao@university.edu',
      description: '生物实验教学专用，配备显微镜和培养设备',
      equipmentCount: 28,
      equipment: [
        { id: 16, name: '显微镜', model: 'Olympus BX53', status: 0, serialNumber: 'MC001', purchaseDate: '2023-04-01' },
        { id: 17, name: '培养箱', model: 'Incubator IC-200', status: 0, serialNumber: 'IC001', purchaseDate: '2023-04-05' },
        { id: 18, name: '离心机', model: 'Centrifuge CF-2000', status: 0, serialNumber: 'CF002', purchaseDate: '2023-04-10' },
        { id: 19, name: 'PCR仪', model: 'PCR Machine PM-100', status: 0, serialNumber: 'PM001', purchaseDate: '2023-04-15' },
        { id: 20, name: '电泳仪', model: 'Electrophoresis EP-300', status: 0, serialNumber: 'EP001', purchaseDate: '2023-04-20' }
      ],
      createTime: '2023-04-01 09:00:00',
      updateTime: '2024-01-12 11:30:00'
    }
  ])

  // 计算属性
  const availableLabs = computed(() => labs.value.filter(lab => lab.status === 0))
  const usingLabs = computed(() => labs.value.filter(lab => lab.status === 1))
  const pendingLabs = computed(() => labs.value.filter(lab => lab.status === 2))
  const totalLabs = computed(() => labs.value.length)
  const totalEquipment = computed(() => labs.value.reduce((sum, lab) => sum + lab.equipmentCount, 0))

  // 统计数据
  const stats = computed(() => ({
    totalLabs: totalLabs.value,
    availableLabs: availableLabs.value.length,
    usingLabs: usingLabs.value.length,
    pendingLabs: pendingLabs.value.length,
    totalEquipment: totalEquipment.value
  }))

  // 根据ID获取实验室
  const getLabById = (id) => {
    return labs.value.find(lab => lab.id === id)
  }

  // 根据名称搜索实验室
  const searchLabs = (keyword) => {
    if (!keyword) return labs.value
    return labs.value.filter(lab => 
      lab.name.toLowerCase().includes(keyword.toLowerCase()) ||
      lab.location.toLowerCase().includes(keyword.toLowerCase()) ||
      lab.manager.toLowerCase().includes(keyword.toLowerCase())
    )
  }

  // 根据状态筛选实验室
  const filterLabsByStatus = (status) => {
    if (status === undefined || status === null) return labs.value
    return labs.value.filter(lab => lab.status === status)
  }

  // 根据负责人筛选实验室
  const filterLabsByManager = (manager) => {
    if (!manager) return labs.value
    return labs.value.filter(lab => lab.manager === manager)
  }

  // 添加实验室
  const addLab = (labData) => {
    const newLab = {
      id: Date.now(),
      ...labData,
      equipmentCount: labData.equipment?.length || 0,
      createTime: new Date().toLocaleString(),
      updateTime: new Date().toLocaleString()
    }
    labs.value.push(newLab)
    return newLab
  }

  // 更新实验室
  const updateLab = (id, labData) => {
    const index = labs.value.findIndex(lab => lab.id === id)
    if (index !== -1) {
      labs.value[index] = {
        ...labs.value[index],
        ...labData,
        updateTime: new Date().toLocaleString()
      }
      return labs.value[index]
    }
    return null
  }

  // 删除实验室
  const deleteLab = (id) => {
    const index = labs.value.findIndex(lab => lab.id === id)
    if (index !== -1) {
      labs.value.splice(index, 1)
      return true
    }
    return false
  }

  // 更新实验室状态
  const updateLabStatus = (id, status) => {
    const lab = getLabById(id)
    if (lab) {
      lab.status = status
      lab.updateTime = new Date().toLocaleString()
      return true
    }
    return false
  }

  // 添加设备
  const addEquipment = (labId, equipmentData) => {
    const lab = getLabById(labId)
    if (lab) {
      const newEquipment = {
        id: Date.now(),
        ...equipmentData,
        purchaseDate: new Date().toISOString().split('T')[0]
      }
      lab.equipment.push(newEquipment)
      lab.equipmentCount = lab.equipment.length
      lab.updateTime = new Date().toLocaleString()
      return newEquipment
    }
    return null
  }

  // 更新设备
  const updateEquipment = (labId, equipmentId, equipmentData) => {
    const lab = getLabById(labId)
    if (lab) {
      const equipment = lab.equipment.find(eq => eq.id === equipmentId)
      if (equipment) {
        Object.assign(equipment, equipmentData)
        lab.updateTime = new Date().toLocaleString()
        return equipment
      }
    }
    return null
  }

  // 删除设备
  const deleteEquipment = (labId, equipmentId) => {
    const lab = getLabById(labId)
    if (lab) {
      const index = lab.equipment.findIndex(eq => eq.id === equipmentId)
      if (index !== -1) {
        lab.equipment.splice(index, 1)
        lab.equipmentCount = lab.equipment.length
        lab.updateTime = new Date().toLocaleString()
        return true
      }
    }
    return false
  }

  return {
    labs,
    availableLabs,
    usingLabs,
    pendingLabs,
    totalLabs,
    totalEquipment,
    stats,
    getLabById,
    searchLabs,
    filterLabsByStatus,
    filterLabsByManager,
    addLab,
    updateLab,
    deleteLab,
    updateLabStatus,
    addEquipment,
    updateEquipment,
    deleteEquipment
  }
})
