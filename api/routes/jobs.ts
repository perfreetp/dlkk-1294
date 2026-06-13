import { Router } from 'express';
import { 
  getJobs, 
  getJobById, 
  createJob, 
  updateJob, 
  deleteJob,
  getMatchedCandidates
} from '../services/JobService';
import type { Job } from '../../shared/types';

const router = Router();

router.get('/', (req, res) => {
  try {
    const { industry, search } = req.query;
    
    const filters = {
      industry: industry as string,
      search: search as string
    };
    
    const jobs = getJobs(filters);
    
    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取岗位列表失败'
    });
  }
});

router.get('/:id', (req, res) => {
  try {
    const job = getJobById(req.params.id);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: '岗位不存在'
      });
    }
    
    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取岗位详情失败'
    });
  }
});

router.get('/:id/matched-candidates', (req, res) => {
  try {
    const { minScore } = req.query;
    const min = minScore ? parseInt(minScore as string) : 60;
    
    const candidates = getMatchedCandidates(req.params.id, min);
    
    res.json({
      success: true,
      data: candidates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取匹配候选人失败'
    });
  }
});

router.post('/', (req, res) => {
  try {
    const data = req.body as Omit<Job, 'id' | 'createdAt' | 'updatedAt'>;
    const job = createJob(data);
    
    res.json({
      success: true,
      data: job,
      message: '岗位创建成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '创建岗位失败'
    });
  }
});

router.put('/:id', (req, res) => {
  try {
    const data = req.body as Partial<Job>;
    const job = updateJob(req.params.id, data);
    
    if (!job) {
      return res.status(404).json({
        success: false,
        error: '岗位不存在'
      });
    }
    
    res.json({
      success: true,
      data: job,
      message: '岗位更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '更新岗位失败'
    });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const deleted = deleteJob(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: '岗位不存在'
      });
    }
    
    res.json({
      success: true,
      message: '岗位删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '删除岗位失败'
    });
  }
});

export default router;
