import { Router } from 'express';
import { 
  calculateMatch, 
  batchCalculateMatch, 
  getMatchReport 
} from '../services/MatchingService';

const router = Router();

router.get('/:candidateId/:jobId', (req, res) => {
  try {
    const { candidateId, jobId } = req.params;
    
    let report = getMatchReport(candidateId, jobId);
    
    if (!report) {
      report = calculateMatch(candidateId, jobId);
    }
    
    res.json({
      success: true,
      data: report
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取匹配报告失败'
    });
  }
});

router.post('/batch', (req, res) => {
  try {
    const { candidateIds, jobId } = req.body as { candidateIds: string[]; jobId: string };
    
    if (!candidateIds || !Array.isArray(candidateIds) || candidateIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: '请提供候选人ID列表'
      });
    }
    
    if (!jobId) {
      return res.status(400).json({
        success: false,
        error: '请提供岗位ID'
      });
    }
    
    const results = batchCalculateMatch(candidateIds, jobId);
    
    res.json({
      success: true,
      data: results,
      message: `成功计算 ${results.length} 位候选人的匹配度`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '批量计算匹配度失败'
    });
  }
});

export default router;
