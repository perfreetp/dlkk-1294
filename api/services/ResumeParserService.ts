import type { Candidate, Skill, Experience, SkillLevel } from '../../shared/types';

const SKILL_KEYWORDS: Record<string, string[]> = {
  'React': ['react', 'react.js', 'reactjs'],
  'Vue': ['vue', 'vue.js', 'vuejs'],
  'TypeScript': ['typescript', 'ts'],
  'JavaScript': ['javascript', 'js'],
  'Node.js': ['node.js', 'nodejs', 'node'],
  'Python': ['python'],
  'Java': ['java'],
  'C++': ['c++', 'cpp'],
  'SQL': ['sql', 'mysql', 'postgresql'],
  'Spring Boot': ['spring boot', 'springboot'],
  'Redis': ['redis'],
  '数据分析': ['数据分析', 'data analysis'],
  '机器学习': ['机器学习', 'machine learning'],
  '产品设计': ['产品设计', 'product design'],
  'Axure': ['axure'],
  '用户研究': ['用户研究', 'user research'],
  '项目管理': ['项目管理', 'project management', 'pmp'],
  '财务分析': ['财务分析', 'financial analysis'],
  '估值建模': ['估值', '建模', 'valuation', 'modeling'],
  '行业研究': ['行业研究', 'industry research'],
  '品牌策划': ['品牌策划', 'brand planning'],
  '内容营销': ['内容营销', 'content marketing'],
  '社交媒体运营': ['社交媒体', 'social media', '小红书', '抖音'],
  '智能驾驶': ['智能驾驶', '自动驾驶', 'autonomous driving'],
  'ROS': ['ros'],
  '成本控制': ['成本控制', '成本管理'],
  '招投标': ['招投标', '招标', '投标'],
  '临床试验': ['临床试验', 'clinical trial'],
  '医学统计': ['医学统计', 'medical statistics']
};

const LEVEL_SCORES: Record<SkillLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  expert: 4
};

export function parseResumeText(text: string): Partial<Candidate> {
  const result: Partial<Candidate> = {};
  
  const nameMatch = text.match(/姓名[：:]\s*(\S+)/) || text.match(/^(\S{2,4})\s*$/m);
  if (nameMatch) result.name = nameMatch[1];
  
  const phoneMatch = text.match(/1[3-9]\d{9}/);
  if (phoneMatch) result.phone = phoneMatch[0];
  
  const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
  if (emailMatch) result.email = emailMatch[0];
  
  const educationMatch = text.match(/(博士|硕士|本科|大专|MBA)/);
  if (educationMatch) result.education = educationMatch[1];
  
  const yearMatch = text.match(/(\d{4})\s*年?\s*毕业/);
  if (yearMatch) {
    result.graduationYear = parseInt(yearMatch[1]);
    result.totalWorkYears = new Date().getFullYear() - result.graduationYear;
  }
  
  const salaryMatch = text.match(/(当前|期望).*?(\d+[KkW万])/);
  if (salaryMatch) {
    if (salaryMatch[1] === '当前') result.currentSalary = salaryMatch[2];
    else result.expectedSalary = salaryMatch[2];
  }
  
  const industryKeywords = ['互联网', 'IT', '金融', '银行', '证券', '制造', '汽车', '医疗', '医药', '教育', '零售', '电商', '房地产', '能源'];
  for (const keyword of industryKeywords) {
    if (text.includes(keyword)) {
      if (keyword === '互联网' || keyword === 'IT') result.industry = '互联网/IT';
      else if (keyword === '金融' || keyword === '银行' || keyword === '证券') result.industry = '金融';
      else if (keyword === '制造' || keyword === '汽车') result.industry = keyword === '汽车' ? '汽车' : '制造业';
      else if (keyword === '医疗' || keyword === '医药') result.industry = '医疗健康';
      else if (keyword === '教育') result.industry = '教育';
      else if (keyword === '零售' || keyword === '电商') result.industry = '零售电商';
      else if (keyword === '房地产') result.industry = '房地产';
      else if (keyword === '能源') result.industry = '能源';
      break;
    }
  }
  
  result.skills = extractSkills(text);
  result.experiences = extractExperiences(text);
  
  return result;
}

export function extractSkills(text: string): Skill[] {
  const skills: Skill[] = [];
  const lowerText = text.toLowerCase();
  
  for (const [skillName, keywords] of Object.entries(SKILL_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword.toLowerCase())) {
        const years = extractSkillYears(text, skillName);
        const level = determineSkillLevel(years, text, skillName);
        skills.push({ name: skillName, level, years });
        break;
      }
    }
  }
  
  return skills;
}

function extractSkillYears(text: string, skillName: string): number {
  const patterns = [
    new RegExp(`${skillName}[^\\d]{0,10}(\\d+)\\s*年`, 'i'),
    new RegExp(`(\\d+)\\s*年.*?${skillName}`, 'i')
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return Math.min(parseInt(match[1]), 15);
  }
  
  return 1;
}

function determineSkillLevel(years: number, text: string, skillName: string): SkillLevel {
  const contextPattern = new RegExp(`(${skillName}[^。]{0,50})`, 'i');
  const match = text.match(contextPattern);
  const context = match ? match[1] : '';
  
  if (context.includes('专家') || context.includes('精通') || years >= 5) return 'expert';
  if (context.includes('资深') || context.includes('高级') || years >= 3) return 'advanced';
  if (context.includes('熟悉') || years >= 1) return 'intermediate';
  return 'beginner';
}

function extractExperiences(text: string): Experience[] {
  const experiences: Experience[] = [];
  const expPattern = /(\d{4}[年/-]\d{0,2})\s*[至到-]\s*(\d{4}[年/-]\d{0,2}|至今|现在)[^。]{0,10}?([\u4e00-\u9fa5A-Za-z]{2,20})[^。]{0,10}?([\u4e00-\u9fa5A-Za-z]{2,20})/g;
  
  let match;
  while ((match = expPattern.exec(text)) !== null && experiences.length < 3) {
    experiences.push({
      company: match[3],
      position: match[4],
      startDate: match[1],
      endDate: match[2],
      description: ''
    });
  }
  
  return experiences;
}

export function matchSkills(candidateSkills: Skill[], requiredSkills: Array<{skill: string, weight: number, minYears?: number, required: boolean}>): { score: number; matched: string[]; missing: Array<{name: string; impact: 'high' | 'medium' | 'low'}> } {
  let totalWeight = 0;
  let earnedWeight = 0;
  const matched: string[] = [];
  const missing: Array<{name: string; impact: 'high' | 'medium' | 'low'}> = [];
  
  const candidateSkillMap = new Map(candidateSkills.map(s => [s.name.toLowerCase(), s]));
  
  for (const req of requiredSkills) {
    totalWeight += req.weight;
    const candidateSkill = candidateSkillMap.get(req.skill.toLowerCase());
    
    if (candidateSkill) {
      matched.push(req.skill);
      let skillScore = req.weight;
      
      if (req.minYears && candidateSkill.years < req.minYears) {
        skillScore = req.weight * (candidateSkill.years / req.minYears) * 0.8;
      }
      
      const levelMultiplier = LEVEL_SCORES[candidateSkill.level] / 4;
      skillScore *= levelMultiplier;
      
      earnedWeight += skillScore;
    } else {
      missing.push({
        name: req.skill,
        impact: req.required ? 'high' : 'medium'
      });
    }
  }
  
  const score = totalWeight > 0 ? Math.round((earnedWeight / totalWeight) * 100) : 0;
  
  return { score, matched, missing };
}
