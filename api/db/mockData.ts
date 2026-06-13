import { db, generateId } from './index';
import type { Candidate, Job, CommunicationRecord, Template, Skill, Experience } from '../../shared/types';

const mockCandidates: Omit<Candidate, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: '张明远',
    phone: '13800138001',
    email: 'zhangmy@example.com',
    education: '硕士',
    major: '计算机科学与技术',
    graduationYear: 2019,
    totalWorkYears: 5,
    industry: '互联网/IT',
    skills: [
      { name: 'React', level: 'expert', years: 4 },
      { name: 'TypeScript', level: 'advanced', years: 3 },
      { name: 'Node.js', level: 'intermediate', years: 2 },
      { name: 'Vue', level: 'beginner', years: 1 }
    ] as Skill[],
    experiences: [
      { company: '字节跳动', position: '高级前端工程师', startDate: '2021-03', endDate: '至今', description: '负责抖音电商核心页面开发，主导性能优化项目' },
      { company: '美团', position: '前端工程师', startDate: '2019-07', endDate: '2021-02', description: '参与外卖商家端后台系统开发' }
    ] as Experience[],
    currentSalary: '35K',
    expectedSalary: '45K-55K',
    status: 'recommended',
    consultantNotes: '候选人技术扎实，沟通流畅，对电商业务有深入理解。期望薪资略高但匹配度好。',
    recommendationReason: '5年前端经验，字节背景，React技术栈完全匹配，有大型电商项目经验。',
    resumeUrl: ''
  },
  {
    name: '李思琪',
    phone: '13900139002',
    email: 'lisq@example.com',
    education: '本科',
    major: '软件工程',
    graduationYear: 2020,
    totalWorkYears: 4,
    industry: '互联网/IT',
    skills: [
      { name: 'React', level: 'advanced', years: 3 },
      { name: 'Vue', level: 'advanced', years: 3 },
      { name: 'TypeScript', level: 'intermediate', years: 2 },
      { name: '小程序', level: 'intermediate', years: 2 }
    ] as Skill[],
    experiences: [
      { company: '腾讯', position: '前端开发工程师', startDate: '2020-08', endDate: '至今', description: '负责微信小程序相关业务开发，优化首屏加载速度30%' }
    ] as Experience[],
    currentSalary: '28K',
    expectedSalary: '35K-40K',
    status: 'interview',
    consultantNotes: '面试表现良好，技术广度不错。需要进一步考察深度。',
    recommendationReason: '腾讯背景，双框架精通，小程序经验丰富。',
    resumeUrl: ''
  },
  {
    name: '王浩然',
    phone: '13700137003',
    email: 'wanghr@example.com',
    education: '本科',
    major: '信息管理',
    graduationYear: 2018,
    totalWorkYears: 6,
    industry: '金融',
    skills: [
      { name: 'Java', level: 'expert', years: 5 },
      { name: 'Spring Boot', level: 'advanced', years: 4 },
      { name: 'MySQL', level: 'advanced', years: 4 },
      { name: 'Redis', level: 'intermediate', years: 3 }
    ] as Skill[],
    experiences: [
      { company: '招商银行', position: '高级Java工程师', startDate: '2019-06', endDate: '至今', description: '负责核心交易系统开发，处理日均百万级交易' },
      { company: '某金融科技公司', position: 'Java工程师', startDate: '2018-07', endDate: '2019-05', description: '参与信贷系统后端开发' }
    ] as Experience[],
    currentSalary: '40K',
    expectedSalary: '50K-60K',
    status: 'pending',
    consultantNotes: '金融行业经验丰富，技术稳定。',
    recommendationReason: '',
    resumeUrl: ''
  },
  {
    name: '陈雨萱',
    phone: '13600136004',
    email: 'chenyx@example.com',
    education: '硕士',
    major: '统计学',
    graduationYear: 2021,
    totalWorkYears: 3,
    industry: '互联网/IT',
    skills: [
      { name: 'Python', level: 'advanced', years: 3 },
      { name: 'SQL', level: 'advanced', years: 3 },
      { name: '机器学习', level: 'intermediate', years: 2 },
      { name: 'Tableau', level: 'intermediate', years: 2 }
    ] as Skill[],
    experiences: [
      { company: '阿里巴巴', position: '数据分析师', startDate: '2021-08', endDate: '至今', description: '负责用户增长数据分析，搭建数据看板，输出策略建议' }
    ] as Experience[],
    currentSalary: '30K',
    expectedSalary: '40K-45K',
    status: 'hired',
    consultantNotes: '已成功入职，客户反馈良好。',
    recommendationReason: '统计专业背景，阿里数据分析经验，沟通能力强。',
    resumeUrl: ''
  },
  {
    name: '刘子轩',
    phone: '13500135005',
    email: 'liuzx@example.com',
    education: '本科',
    major: '市场营销',
    graduationYear: 2017,
    totalWorkYears: 7,
    industry: '零售电商',
    skills: [
      { name: '产品设计', level: 'expert', years: 5 },
      { name: 'Axure', level: 'expert', years: 5 },
      { name: '用户研究', level: 'advanced', years: 4 },
      { name: '数据分析', level: 'intermediate', years: 3 }
    ] as Skill[],
    experiences: [
      { company: '京东', position: '高级产品经理', startDate: '2020-01', endDate: '至今', description: '负责京东APP首页产品设计，DAU提升15%' },
      { company: '唯品会', position: '产品经理', startDate: '2017-09', endDate: '2019-12', description: '负责特卖频道产品迭代' }
    ] as Experience[],
    currentSalary: '45K',
    expectedSalary: '60K-70K',
    status: 'interview',
    consultantNotes: '产品思维清晰，有成功案例。',
    recommendationReason: '7年电商产品经验，京东背景，主导过DAU过千万产品。',
    resumeUrl: ''
  },
  {
    name: '赵雅琳',
    phone: '13400134006',
    email: 'zhaoyl@example.com',
    education: '本科',
    major: '人力资源',
    graduationYear: 2019,
    totalWorkYears: 5,
    industry: '互联网/IT',
    skills: [
      { name: '招聘', level: 'expert', years: 5 },
      { name: '面试技巧', level: 'expert', years: 4 },
      { name: '人才Mapping', level: 'advanced', years: 3 },
      { name: '薪酬谈判', level: 'advanced', years: 3 }
    ] as Skill[],
    experiences: [
      { company: '小米', position: 'HRBP', startDate: '2021-05', endDate: '至今', description: '负责研发线招聘，年交付100+岗位' }
    ] as Experience[],
    currentSalary: '25K',
    expectedSalary: '30K-35K',
    status: 'rejected',
    consultantNotes: '候选人背景不错，但目标岗位需要猎头经验，内部HR经验为主。',
    recommendationReason: '',
    resumeUrl: ''
  },
  {
    name: '孙伟强',
    phone: '13300133007',
    email: 'sunwq@example.com',
    education: '本科',
    major: '机械工程',
    graduationYear: 2016,
    totalWorkYears: 8,
    industry: '制造业',
    skills: [
      { name: 'SolidWorks', level: 'expert', years: 7 },
      { name: 'AutoCAD', level: 'expert', years: 7 },
      { name: '工艺设计', level: 'advanced', years: 5 },
      { name: '质量管理', level: 'intermediate', years: 4 }
    ] as Skill[],
    experiences: [
      { company: '比亚迪', position: '高级结构工程师', startDate: '2019-03', endDate: '至今', description: '负责新能源汽车零部件结构设计' }
    ] as Experience[],
    currentSalary: '32K',
    expectedSalary: '40K-45K',
    status: 'pending',
    consultantNotes: '',
    recommendationReason: '',
    resumeUrl: ''
  },
  {
    name: '周晓彤',
    phone: '13200132008',
    email: 'zhouxt@example.com',
    education: '硕士',
    major: '生物医学工程',
    graduationYear: 2020,
    totalWorkYears: 4,
    industry: '医疗健康',
    skills: [
      { name: '临床试验', level: 'advanced', years: 3 },
      { name: '数据分析', level: 'advanced', years: 3 },
      { name: '医学统计', level: 'intermediate', years: 2 },
      { name: 'SPSS', level: 'intermediate', years: 2 }
    ] as Skill[],
    experiences: [
      { company: '恒瑞医药', position: '临床研究专员', startDate: '2020-09', endDate: '至今', description: '负责新药临床试验项目管理' }
    ] as Experience[],
    currentSalary: '22K',
    expectedSalary: '28K-32K',
    status: 'pending',
    consultantNotes: '',
    recommendationReason: '',
    resumeUrl: ''
  },
  {
    name: '吴俊杰',
    phone: '13100131009',
    email: 'wujj@example.com',
    education: '本科',
    major: '金融学',
    graduationYear: 2018,
    totalWorkYears: 6,
    industry: '金融',
    skills: [
      { name: '财务分析', level: 'expert', years: 5 },
      { name: '估值建模', level: 'advanced', years: 4 },
      { name: '行业研究', level: 'advanced', years: 4 },
      { name: 'Python', level: 'intermediate', years: 2 }
    ] as Skill[],
    experiences: [
      { company: '中信证券', position: '行业分析师', startDate: '2020-02', endDate: '至今', description: '覆盖科技行业，发布深度研究报告20+篇' },
      { company: '普华永道', position: '审计师', startDate: '2018-08', endDate: '2020-01', description: '参与多家上市公司年度审计' }
    ] as Experience[],
    currentSalary: '50K',
    expectedSalary: '70K-80K',
    status: 'recommended',
    consultantNotes: '财务功底扎实，有买方对接经验。',
    recommendationReason: '四大+券商背景，财务分析能力强，覆盖行业与目标岗位匹配。',
    resumeUrl: ''
  },
  {
    name: '郑梦琪',
    phone: '13000130010',
    email: 'zhengmq@example.com',
    education: '硕士',
    major: '教育学',
    graduationYear: 2021,
    totalWorkYears: 3,
    industry: '教育',
    skills: [
      { name: '课程设计', level: 'advanced', years: 3 },
      { name: '教学管理', level: 'advanced', years: 3 },
      { name: '用户运营', level: 'intermediate', years: 2 },
      { name: '数据分析', level: 'beginner', years: 1 }
    ] as Skill[],
    experiences: [
      { company: '新东方在线', position: '课程产品经理', startDate: '2021-07', endDate: '至今', description: '负责K12英语产品线，续费率提升20%' }
    ] as Experience[],
    currentSalary: '25K',
    expectedSalary: '32K-38K',
    status: 'pending',
    consultantNotes: '',
    recommendationReason: '',
    resumeUrl: ''
  },
  {
    name: '黄志强',
    phone: '15800158011',
    email: 'huangzq@example.com',
    education: '本科',
    major: '土木工程',
    graduationYear: 2015,
    totalWorkYears: 9,
    industry: '房地产',
    skills: [
      { name: '项目管理', level: 'expert', years: 6 },
      { name: '成本控制', level: 'advanced', years: 5 },
      { name: '招投标', level: 'advanced', years: 5 },
      { name: '工程预决算', level: 'intermediate', years: 4 }
    ] as Skill[],
    experiences: [
      { company: '万科', position: '项目经理', startDate: '2019-04', endDate: '至今', description: '负责多个住宅项目全程管理，单项目货值50亿' }
    ] as Experience[],
    currentSalary: '40K',
    expectedSalary: '55K-65K',
    status: 'interview',
    consultantNotes: '甲方经验丰富，沟通能力强。',
    recommendationReason: '9年地产经验，万科背景，有大项目管理经验。',
    resumeUrl: ''
  },
  {
    name: '林诗涵',
    phone: '15900159012',
    email: 'linsh@example.com',
    education: '本科',
    major: '广告学',
    graduationYear: 2019,
    totalWorkYears: 5,
    industry: '零售电商',
    skills: [
      { name: '品牌策划', level: 'advanced', years: 4 },
      { name: '内容营销', level: 'advanced', years: 4 },
      { name: '社交媒体运营', level: 'expert', years: 5 },
      { name: '数据分析', level: 'intermediate', years: 2 }
    ] as Skill[],
    experiences: [
      { company: '完美日记', position: '品牌营销经理', startDate: '2021-06', endDate: '至今', description: '负责小红书等内容平台营销，爆款单品打造' }
    ] as Experience[],
    currentSalary: '28K',
    expectedSalary: '35K-40K',
    status: 'pending',
    consultantNotes: '',
    recommendationReason: '',
    resumeUrl: ''
  },
  {
    name: '何嘉铭',
    phone: '16000160013',
    email: 'hejm@example.com',
    education: '硕士',
    major: '车辆工程',
    graduationYear: 2020,
    totalWorkYears: 4,
    industry: '汽车',
    skills: [
      { name: '智能驾驶', level: 'advanced', years: 3 },
      { name: 'C++', level: 'advanced', years: 3 },
      { name: 'Python', level: 'intermediate', years: 2 },
      { name: 'ROS', level: 'intermediate', years: 2 }
    ] as Skill[],
    experiences: [
      { company: '蔚来汽车', position: '自动驾驶算法工程师', startDate: '2020-09', endDate: '至今', description: '参与L4级自动驾驶感知算法开发' }
    ] as Experience[],
    currentSalary: '38K',
    expectedSalary: '50K-60K',
    status: 'recommended',
    consultantNotes: '技术背景好，智能驾驶赛道热门。',
    recommendationReason: '车辆工程硕士，蔚来自动驾驶经验，技术方向高度匹配。',
    resumeUrl: ''
  },
  {
    name: '郭雅婷',
    phone: '16100161014',
    email: 'guoyt@example.com',
    education: '本科',
    major: '能源与动力工程',
    graduationYear: 2018,
    totalWorkYears: 6,
    industry: '能源',
    skills: [
      { name: '新能源项目开发', level: 'advanced', years: 4 },
      { name: '项目管理', level: 'advanced', years: 4 },
      { name: '技术经济分析', level: 'intermediate', years: 3 },
      { name: '政策研究', level: 'intermediate', years: 3 }
    ] as Skill[],
    experiences: [
      { company: '隆基绿能', position: '项目经理', startDate: '2020-03', endDate: '至今', description: '负责光伏电站项目开发，累计装机100MW' }
    ] as Experience[],
    currentSalary: '30K',
    expectedSalary: '40K-45K',
    status: 'pending',
    consultantNotes: '',
    recommendationReason: '',
    resumeUrl: ''
  },
  {
    name: '罗俊辉',
    phone: '16200162015',
    email: 'luojh@example.com',
    education: 'MBA',
    major: '工商管理',
    graduationYear: 2016,
    totalWorkYears: 10,
    industry: '互联网/IT',
    skills: [
      { name: '团队管理', level: 'expert', years: 6 },
      { name: '产品规划', level: 'expert', years: 7 },
      { name: '商业分析', level: 'advanced', years: 5 },
      { name: '战略规划', level: 'advanced', years: 4 }
    ] as Skill[],
    experiences: [
      { company: '快手', position: '产品总监', startDate: '2020-01', endDate: '至今', description: '负责电商产品部，管理50人团队，GMV年增长200%' },
      { company: '百度', position: '高级产品经理', startDate: '2016-07', endDate: '2019-12', description: '负责搜索产品优化' }
    ] as Experience[],
    currentSalary: '80K',
    expectedSalary: '120K-150K',
    status: 'hired',
    consultantNotes: '已成功入职，担任产品VP。',
    recommendationReason: '10年互联网产品经验，快手电商产品负责人，MBA背景，管理经验丰富。',
    resumeUrl: ''
  }
];

const mockJobs: Array<Omit<Job, 'id' | 'createdAt' | 'updatedAt'> & { requirements: Array<{skill: string, required: boolean, weight: number, minYears?: number}> }> = [
  {
    title: '高级前端工程师',
    department: '技术部',
    industry: '互联网/IT',
    salaryRange: '35K-55K',
    location: '北京',
    minWorkYears: 3,
    educationRequirement: '本科',
    description: '负责公司核心产品的前端开发工作，参与技术选型和架构设计。',
    responsibilities: [
      '负责Web端产品的前端架构设计与开发',
      '推动前端工程化建设和性能优化',
      '参与产品需求评审和技术方案设计',
      '指导初级工程师，提升团队技术水平'
    ],
    requirements: [
      { skill: 'React', required: true, weight: 30, minYears: 3 },
      { skill: 'TypeScript', required: true, weight: 20, minYears: 2 },
      { skill: 'Node.js', required: false, weight: 15, minYears: 1 },
      { skill: 'Vue', required: false, weight: 10 },
      { skill: '小程序', required: false, weight: 10 }
    ]
  },
  {
    title: '数据分析师',
    department: '数据部',
    industry: '互联网/IT',
    salaryRange: '25K-40K',
    location: '上海',
    minWorkYears: 2,
    educationRequirement: '本科',
    description: '负责业务数据分析，输出数据洞察和策略建议，驱动业务增长。',
    responsibilities: [
      '搭建业务数据看板，监控核心指标',
      '深入分析用户行为数据，输出增长策略',
      '配合产品、运营团队完成专题分析',
      '建设数据指标体系和分析方法论'
    ],
    requirements: [
      { skill: 'SQL', required: true, weight: 30, minYears: 2 },
      { skill: 'Python', required: true, weight: 25, minYears: 2 },
      { skill: '数据分析', required: true, weight: 20, minYears: 2 },
      { skill: '机器学习', required: false, weight: 15 },
      { skill: 'Tableau', required: false, weight: 10 }
    ]
  },
  {
    title: '高级产品经理',
    department: '产品部',
    industry: '零售电商',
    salaryRange: '40K-60K',
    location: '杭州',
    minWorkYears: 5,
    educationRequirement: '本科',
    description: '负责电商核心产品模块的规划和设计，推动产品迭代和用户体验优化。',
    responsibilities: [
      '负责电商核心交易链路产品设计',
      '进行用户研究和竞品分析，输出产品规划',
      '协调研发、设计、运营团队推动产品落地',
      '跟踪产品数据，持续优化产品体验'
    ],
    requirements: [
      { skill: '产品设计', required: true, weight: 30, minYears: 5 },
      { skill: 'Axure', required: true, weight: 20, minYears: 3 },
      { skill: '用户研究', required: true, weight: 20, minYears: 3 },
      { skill: '数据分析', required: true, weight: 20, minYears: 2 },
      { skill: '项目管理', required: false, weight: 10 }
    ]
  },
  {
    title: 'Java后端开发工程师',
    department: '技术部',
    industry: '金融',
    salaryRange: '35K-50K',
    location: '深圳',
    minWorkYears: 3,
    educationRequirement: '本科',
    description: '负责金融核心系统的后端开发，确保系统的稳定性和高性能。',
    responsibilities: [
      '负责金融交易系统的后端开发',
      '参与系统架构设计和性能优化',
      '编写高质量的代码和技术文档',
      '保障系统的稳定性和数据安全'
    ],
    requirements: [
      { skill: 'Java', required: true, weight: 35, minYears: 3 },
      { skill: 'Spring Boot', required: true, weight: 25, minYears: 3 },
      { skill: 'MySQL', required: true, weight: 20, minYears: 2 },
      { skill: 'Redis', required: true, weight: 15, minYears: 2 },
      { skill: '分布式系统', required: false, weight: 15 }
    ]
  },
  {
    title: '品牌营销经理',
    department: '市场部',
    industry: '零售电商',
    salaryRange: '25K-40K',
    location: '广州',
    minWorkYears: 3,
    educationRequirement: '本科',
    description: '负责品牌在社交媒体的营销推广，打造品牌影响力。',
    responsibilities: [
      '制定品牌营销策略和推广计划',
      '负责小红书、抖音等内容平台运营',
      '策划营销活动，提升品牌知名度',
      '分析营销数据，优化投放策略'
    ],
    requirements: [
      { skill: '社交媒体运营', required: true, weight: 30, minYears: 3 },
      { skill: '品牌策划', required: true, weight: 25, minYears: 3 },
      { skill: '内容营销', required: true, weight: 25, minYears: 3 },
      { skill: '数据分析', required: false, weight: 15, minYears: 1 }
    ]
  },
  {
    title: '自动驾驶算法工程师',
    department: '研发部',
    industry: '汽车',
    salaryRange: '40K-70K',
    location: '上海',
    minWorkYears: 3,
    educationRequirement: '硕士',
    description: '负责自动驾驶感知和决策算法的研发。',
    responsibilities: [
      '研发自动驾驶感知和决策算法',
      '优化算法在嵌入式平台的性能',
      '撰写技术专利和论文',
      '参与系统集成和测试'
    ],
    requirements: [
      { skill: 'C++', required: true, weight: 30, minYears: 3 },
      { skill: '智能驾驶', required: true, weight: 30, minYears: 2 },
      { skill: 'Python', required: true, weight: 20, minYears: 2 },
      { skill: 'ROS', required: false, weight: 15, minYears: 1 },
      { skill: '机器学习', required: false, weight: 15 }
    ]
  },
  {
    title: '行业分析师',
    department: '研究部',
    industry: '金融',
    salaryRange: '35K-55K',
    location: '北京',
    minWorkYears: 3,
    educationRequirement: '硕士',
    description: '负责科技行业研究，发布深度研究报告，为投资决策提供支持。',
    responsibilities: [
      '跟踪科技行业动态，建立行业数据库',
      '撰写行业和公司深度研究报告',
      '服务机构客户，提供路演和咨询',
      '参与投研项目，提供行业观点'
    ],
    requirements: [
      { skill: '财务分析', required: true, weight: 30, minYears: 3 },
      { skill: '行业研究', required: true, weight: 25, minYears: 3 },
      { skill: '估值建模', required: true, weight: 25, minYears: 2 },
      { skill: 'Python', required: false, weight: 15, minYears: 1 }
    ]
  },
  {
    title: '项目经理',
    department: '项目管理部',
    industry: '房地产',
    salaryRange: '30K-50K',
    location: '深圳',
    minWorkYears: 5,
    educationRequirement: '本科',
    description: '负责房地产项目的全流程管理，确保项目按时按质交付。',
    responsibilities: [
      '负责项目从开工到交付的全流程管理',
      '协调设计、工程、成本等各方资源',
      '控制项目进度、质量和成本',
      '处理项目中的各类问题和风险'
    ],
    requirements: [
      { skill: '项目管理', required: true, weight: 35, minYears: 5 },
      { skill: '成本控制', required: true, weight: 25, minYears: 3 },
      { skill: '招投标', required: true, weight: 20, minYears: 3 },
      { skill: '工程预决算', required: false, weight: 15, minYears: 2 }
    ]
  }
];

const mockTemplates: Omit<Template, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: '互联网公司通用模板',
    clientName: '通用',
    content: `<h2>{{候选人姓名}} - 推荐报告</h2>
<h3>基本信息</h3>
<ul>
<li>学历：{{学历}}</li>
<li>工作年限：{{工作年限}}年</li>
<li>当前薪资：{{当前薪资}}</li>
<li>期望薪资：{{期望薪资}}</li>
<li>所在行业：{{行业}}</li>
</ul>

<h3>核心技能</h3>
<p>{{核心技能}}</p>

<h3>主要经历</h3>
<p>{{主要经历}}</p>

<h3>匹配度分析</h3>
<p>综合匹配得分：<strong>{{匹配分}}</strong>分</p>
<p>{{匹配摘要}}</p>

<h3>推荐理由</h3>
<p>{{推荐理由}}</p>

<h3>顾问备注</h3>
<p>{{顾问备注}}</p>`,
    variables: ['候选人姓名', '学历', '工作年限', '当前薪资', '期望薪资', '行业', '核心技能', '主要经历', '匹配分', '匹配摘要', '推荐理由', '顾问备注']
  },
  {
    name: '金融行业专属模板',
    clientName: '金融客户',
    content: `<h2>{{候选人姓名}} - 金融人才推荐</h2>
<div style="background: #f0f7ff; padding: 15px; border-left: 4px solid #1e3a5f;">
<strong>金融背景验证</strong>：该候选人具备{{工作年限}}年金融行业经验，符合贵司人才标准。
</div>

<h3>个人概况</h3>
<table>
<tr><td>学历</td><td>{{学历}} - {{专业}}</td></tr>
<tr><td>工作年限</td><td>{{工作年限}}年</td></tr>
<tr><td>当前薪资</td><td>{{当前薪资}}</td></tr>
<tr><td>期望薪资</td><td>{{期望薪资}}</td></tr>
</table>

<h3>专业技能</h3>
<p>{{核心技能}}</p>

<h3>从业经历</h3>
<p>{{主要经历}}</p>

<h3>岗位匹配度</h3>
<p>匹配得分：{{匹配分}}/100</p>
<h4>缺失经历提示</h4>
<p>{{缺失经历}}</p>
<h4>面试建议</h4>
<p>{{面试追问点}}</p>

<h3>顾问推荐意见</h3>
<p>{{推荐理由}}</p>

<p style="text-align: right; color: #666; margin-top: 30px;">
推荐顾问：{{顾问姓名}}<br>
{{推荐日期}}
</p>`,
    variables: ['候选人姓名', '工作年限', '学历', '专业', '当前薪资', '期望薪资', '核心技能', '主要经历', '匹配分', '缺失经历', '面试追问点', '推荐理由', '顾问姓名', '推荐日期']
  },
  {
    name: '科技公司简洁模板',
    clientName: '科技客户A',
    content: `<h1>{{候选人姓名}}</h1>
<p class="sub">{{工作年限}}年 · {{学历}} · {{行业}}</p>

<h2>技术栈</h2>
<p>{{核心技能}}</p>

<h2>工作经历</h2>
<p>{{主要经历}}</p>

<h2>匹配评估</h2>
<p>综合评分：{{匹配分}}</p>
<p>{{匹配摘要}}</p>

<h2>推荐理由</h2>
<blockquote>{{推荐理由}}</blockquote>`,
    variables: ['候选人姓名', '工作年限', '学历', '行业', '核心技能', '主要经历', '匹配分', '匹配摘要', '推荐理由']
  },
  {
    name: '高管推荐模板',
    clientName: '高端客户',
    content: `<div style="text-align: center; border-bottom: 2px solid #1e3a5f; padding-bottom: 20px;">
<h1>高级人才推荐报告</h1>
<p style="color: #666;">CONFIDENTIAL - 保密文件</p>
</div>

<h2 style="color: #1e3a5f; margin-top: 30px;">候选人：{{候选人姓名}}</h2>

<table style="width: 100%; margin-top: 20px;">
<tr>
<td style="width: 50%;">
<strong>背景概览</strong>
<ul>
<li>学历：{{学历}}</li>
<li>专业：{{专业}}</li>
<li>工作年限：{{工作年限}}年</li>
<li>管理经验：{{管理经验}}年</li>
</ul>
</td>
<td style="width: 50%;">
<strong>薪酬期望</strong>
<ul>
<li>当前薪资：{{当前薪资}}</li>
<li>期望薪资：{{期望薪资}}</li>
<li>求职状态：{{求职状态}}</li>
</ul>
</td>
</tr>
</table>

<h3>核心能力</h3>
<p>{{核心技能}}</p>

<h3>职业亮点</h3>
<p>{{主要经历}}</p>

<h3>匹配评估</h3>
<div style="font-size: 24px; color: #1e3a5f;">匹配得分：{{匹配分}}/100</div>
<p>{{匹配摘要}}</p>

<h3>风险提示</h3>
<p>{{缺失经历}}</p>

<h3>顾问综合评价</h3>
<p style="font-style: italic;">{{推荐理由}}</p>

<div style="margin-top: 40px; text-align: center; color: #999; font-size: 12px;">
本报告由专业顾问团队制作，仅供客户内部参考使用
</div>`,
    variables: ['候选人姓名', '学历', '专业', '工作年限', '管理经验', '当前薪资', '期望薪资', '求职状态', '核心技能', '主要经历', '匹配分', '匹配摘要', '缺失经历', '推荐理由']
  },
  {
    name: '标准面试评估表',
    clientName: '通用',
    content: `<h2>面试评估表 - {{候选人姓名}}</h2>
<p>应聘岗位：{{目标岗位}}</p>

<h3>一、基本信息</h3>
<table>
<tr><td>学历背景</td><td>{{学历}} - {{专业}}</td></tr>
<tr><td>工作经验</td><td>{{工作年限}}年</td></tr>
<tr><td>行业背景</td><td>{{行业}}</td></tr>
</table>

<h3>二、技能评估</h3>
<p><strong>核心技能：</strong>{{核心技能}}</p>
<p><strong>匹配度得分：</strong>{{匹配分}}分</p>

<h3>三、面试重点追问</h3>
<ol>
{{面试追问点}}
</ol>

<h3>四、风险提示</h3>
<p>{{缺失经历}}</p>

<h3>五、顾问意见</h3>
<p>{{推荐理由}}</p>

<h3>六、面试记录</h3>
<p style="border: 1px dashed #ccc; padding: 20px; min-height: 100px;">
面试官填写区域...
</p>`,
    variables: ['候选人姓名', '目标岗位', '学历', '专业', '工作年限', '行业', '核心技能', '匹配分', '面试追问点', '缺失经历', '推荐理由']
  }
];

const mockCommunications: Array<Omit<CommunicationRecord, 'id' | 'createdAt'> & { createdAt: string }> = [
  { candidateId: '', type: 'note', content: '初步联系，候选人对岗位兴趣浓厚，约定下周二电话沟通。', createdBy: '李顾问', createdAt: '2026-06-10 10:30:00' },
  { candidateId: '', type: 'call', content: '电话沟通顺畅，候选人了解岗位要求，同意参加面试。当前薪资35K，期望45-55K。', createdBy: '李顾问', createdAt: '2026-06-11 15:20:00' },
  { candidateId: '', type: 'email', content: '已发送岗位JD和公司介绍，候选人回复确认收到。', createdBy: '李顾问', createdAt: '2026-06-11 17:00:00' },
  { candidateId: '', type: 'interview', content: '第一轮面试通过，面试官评价技术扎实，沟通良好。安排下周三复试。', createdBy: '李顾问', createdAt: '2026-06-13 14:00:00' },
  { candidateId: '', type: 'note', content: '候选人薪资期望较高，需要与客户沟通是否有调整空间。', createdBy: '王顾问', createdAt: '2026-06-09 11:00:00' },
  { candidateId: '', type: 'call', content: '候选人目前在职，看机会比较谨慎，需要更多了解客户公司背景。', createdBy: '王顾问', createdAt: '2026-06-10 16:30:00' },
  { candidateId: '', type: 'interview', content: '面试表现良好，技术深度足够，已安排客户二面。', createdBy: '王顾问', createdAt: '2026-06-12 10:00:00' },
  { candidateId: '', type: 'note', content: '金融行业经验丰富，但目标岗位需要互联网背景，匹配度一般。', createdBy: '张顾问', createdAt: '2026-06-08 09:30:00' },
  { candidateId: '', type: 'note', content: '已成功推荐入职，客户反馈良好，后续跟进3个月保证期。', createdBy: '李顾问', createdAt: '2026-05-15 10:00:00' },
  { candidateId: '', type: 'interview', content: '面试通过，薪资谈判中。候选人期望60K，客户预算55K，正在协调。', createdBy: '王顾问', createdAt: '2026-06-12 17:30:00' },
  { candidateId: '', type: 'note', content: '候选人不考虑乙方工作，婉拒。', createdBy: '张顾问', createdAt: '2026-06-07 14:00:00' },
  { candidateId: '', type: 'call', content: '初步沟通，候选人对自动驾驶方向很感兴趣，愿意进一步了解。', createdBy: '李顾问', createdAt: '2026-06-13 11:00:00' },
  { candidateId: '', type: 'note', content: '已成功推荐入职产品VP岗位，完成close。', createdBy: '王顾问', createdAt: '2026-04-20 09:00:00' },
  { candidateId: '', type: 'call', content: '电话沟通中，候选人提到有其他offer在谈，需要加快推进。', createdBy: '李顾问', createdAt: '2026-06-13 16:00:00' },
  { candidateId: '', type: 'note', content: '候选人有创业经验，综合素质不错，值得重点推荐。', createdBy: '张顾问', createdAt: '2026-06-11 09:30:00' },
  { candidateId: '', type: 'email', content: '已发送推荐报告，等待客户反馈。', createdBy: '王顾问', createdAt: '2026-06-12 11:30:00' },
  { candidateId: '', type: 'interview', content: '二面通过，客户发offer中。', createdBy: '李顾问', createdAt: '2026-06-13 18:00:00' },
  { candidateId: '', type: 'note', content: '面试表现一般，技术深度不够，暂不推荐。', createdBy: '张顾问', createdAt: '2026-06-10 15:00:00' },
  { candidateId: '', type: 'call', content: '候选人接受offer，预计下月初入职。', createdBy: '王顾问', createdAt: '2026-06-11 14:00:00' },
  { candidateId: '', type: 'note', content: '已发送offer，候选人表示需要考虑一周。', createdBy: '李顾问', createdAt: '2026-06-09 16:30:00' }
];

export function seedMockData() {
  const candidateCount = db.prepare('SELECT COUNT(*) as count FROM candidates').get() as { count: number };
  if (candidateCount.count > 0) return;

  const insertCandidate = db.prepare(`
    INSERT INTO candidates (id, name, phone, email, education, major, graduation_year, total_work_years, industry, skills_json, experiences_json, current_salary, expected_salary, status, consultant_notes, recommendation_reason, resume_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const candidateIds: string[] = [];
  mockCandidates.forEach(candidate => {
    const id = generateId();
    candidateIds.push(id);
    insertCandidate.run(
      id,
      candidate.name,
      candidate.phone,
      candidate.email,
      candidate.education,
      candidate.major,
      candidate.graduationYear,
      candidate.totalWorkYears,
      candidate.industry,
      JSON.stringify(candidate.skills),
      JSON.stringify(candidate.experiences),
      candidate.currentSalary,
      candidate.expectedSalary,
      candidate.status,
      candidate.consultantNotes,
      candidate.recommendationReason,
      candidate.resumeUrl
    );
  });

  const insertJob = db.prepare(`
    INSERT INTO jobs (id, title, department, industry, salary_range, location, min_work_years, education_requirement, description, responsibilities_json)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const insertJobRequirement = db.prepare(`
    INSERT INTO job_requirements (id, job_id, skill, required, weight, min_years)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  mockJobs.forEach(job => {
    const jobId = generateId();
    insertJob.run(
      jobId,
      job.title,
      job.department,
      job.industry,
      job.salaryRange,
      job.location,
      job.minWorkYears,
      job.educationRequirement,
      job.description,
      JSON.stringify(job.responsibilities)
    );

    job.requirements.forEach(req => {
      insertJobRequirement.run(
        generateId(),
        jobId,
        req.skill,
        req.required ? 1 : 0,
        req.weight,
        req.minYears || null
      );
    });
  });

  const insertTemplate = db.prepare(`
    INSERT INTO templates (id, name, client_name, content, variables_json)
    VALUES (?, ?, ?, ?, ?)
  `);

  mockTemplates.forEach(template => {
    insertTemplate.run(
      generateId(),
      template.name,
      template.clientName,
      template.content,
      JSON.stringify(template.variables)
    );
  });

  const insertCommunication = db.prepare(`
    INSERT INTO communications (id, candidate_id, type, content, created_by, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  mockCommunications.forEach((comm, index) => {
    const candidateId = candidateIds[index % candidateIds.length];
    insertCommunication.run(
      generateId(),
      candidateId,
      comm.type,
      comm.content,
      comm.createdBy,
      comm.createdAt
    );
  });
}
