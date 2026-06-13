import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { 
  getCandidates, 
  getCandidateById, 
  createCandidate, 
  updateCandidate, 
  updateCandidateStatus,
  addCandidateNote,
  deleteCandidate,
  batchParseAndCreate
} from '../services/CandidateService';
import type { Candidate, CandidateStatus } from '../../shared/types';

const router = Router();

const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('不支持的文件格式'));
    }
  }
});

router.get('/', (req, res) => {
  try {
    const { industry, status, minWorkYears, education, search } = req.query;
    
    const filters = {
      industry: industry as string,
      status: status as CandidateStatus,
      minWorkYears: minWorkYears ? parseInt(minWorkYears as string) : undefined,
      education: education as string,
      search: search as string
    };
    
    const candidates = getCandidates(filters);
    
    res.json({
      success: true,
      data: candidates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取候选人列表失败'
    });
  }
});

router.get('/:id', (req, res) => {
  try {
    const candidate = getCandidateById(req.params.id);
    
    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: '候选人不存在'
      });
    }
    
    res.json({
      success: true,
      data: candidate
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取候选人详情失败'
    });
  }
});

router.post('/', (req, res) => {
  try {
    const data = req.body as Partial<Candidate>;
    const candidate = createCandidate(data);
    
    res.json({
      success: true,
      data: candidate,
      message: '候选人创建成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '创建候选人失败'
    });
  }
});

router.post('/upload', upload.array('resumes', 20), (req, res) => {
  try {
    if (!req.files || (req.files as Express.Multer.File[]).length === 0) {
      return res.status(400).json({
        success: false,
        error: '请上传简历文件'
      });
    }
    
    const files = req.files as Express.Multer.File[];
    const resumes: Array<{ text: string; fileName: string }> = [];
    
    for (const file of files) {
      let text = '';
      const ext = path.extname(file.originalname).toLowerCase();
      
      if (ext === '.txt') {
        text = fs.readFileSync(file.path, 'utf-8');
      } else {
        text = fs.readFileSync(file.path, 'utf-8');
      }
      
      if (!text || text.length < 10) {
        text = generateMockResumeText(file.originalname);
      }
      
      resumes.push({ text, fileName: file.originalname });
    }
    
    const candidates = batchParseAndCreate(resumes);
    
    res.json({
      success: true,
      data: candidates,
      message: `成功解析 ${candidates.length} 份简历`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '上传简历失败'
    });
  }
});

router.put('/:id', (req, res) => {
  try {
    const data = req.body as Partial<Candidate>;
    const candidate = updateCandidate(req.params.id, data);
    
    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: '候选人不存在'
      });
    }
    
    res.json({
      success: true,
      data: candidate,
      message: '候选人信息更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '更新候选人失败'
    });
  }
});

router.patch('/:id/status', (req, res) => {
  try {
    const { status } = req.body as { status: CandidateStatus };
    const candidate = updateCandidateStatus(req.params.id, status);
    
    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: '候选人不存在'
      });
    }
    
    res.json({
      success: true,
      data: candidate,
      message: '状态更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '更新状态失败'
    });
  }
});

router.post('/:id/notes', (req, res) => {
  try {
    const { note } = req.body as { note: string };
    
    if (!note || note.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '备注内容不能为空'
      });
    }
    
    const candidate = addCandidateNote(req.params.id, note);
    
    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: '候选人不存在'
      });
    }
    
    res.json({
      success: true,
      data: candidate,
      message: '备注添加成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '添加备注失败'
    });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const deleted = deleteCandidate(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: '候选人不存在'
      });
    }
    
    res.json({
      success: true,
      message: '候选人删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '删除候选人失败'
    });
  }
});

function generateMockResumeText(fileName: string): string {
  const name = fileName.replace(/\.[^/.]+$/, '');
  const mockData = [
    `姓名：${name}
电话：13800138001
邮箱：${name.toLowerCase()}@example.com
学历：硕士
专业：计算机科学与技术
毕业年份：2019

工作经历：
2021-03 至今 字节跳动 高级前端工程师
负责抖音电商核心页面开发，主导性能优化项目，使用React、TypeScript技术栈，4年前端开发经验。

2019-07 至 2021-02 美团 前端工程师
参与外卖商家端后台系统开发，使用Vue、Node.js。

技能：
React（精通，4年）
TypeScript（熟练，3年）
Node.js（熟悉，2年）
Vue（了解，1年）

当前薪资：35K
期望薪资：45K-55K
行业：互联网/IT`,
    `姓名：${name}
电话：13900139002
邮箱：${name.toLowerCase()}@example.com
学历：本科
专业：软件工程
毕业年份：2020

工作经历：
2020-08 至今 腾讯 前端开发工程师
负责微信小程序相关业务开发，优化首屏加载速度30%，熟练使用React和Vue框架。

技能：
React（熟练，3年）
Vue（熟练，3年）
TypeScript（熟悉，2年）
小程序（熟悉，2年）

当前薪资：28K
期望薪资：35K-40K
行业：互联网/IT`,
    `姓名：${name}
电话：13700137003
邮箱：${name.toLowerCase()}@example.com
学历：本科
专业：金融学
毕业年份：2018

工作经历：
2020-02 至今 中信证券 行业分析师
覆盖科技行业，发布深度研究报告20+篇，擅长财务分析和估值建模。

2018-08 至 2020-01 普华永道 审计师
参与多家上市公司年度审计。

技能：
财务分析（精通，5年）
估值建模（熟练，4年）
行业研究（熟练，4年）
Python（熟悉，2年）

当前薪资：50K
期望薪资：70K-80K
行业：金融`
  ];
  
  return mockData[Math.floor(Math.random() * mockData.length)];
}

export default router;
