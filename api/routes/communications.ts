import { Router } from 'express';
import { 
  getCommunications, 
  getCommunicationById, 
  createCommunication, 
  updateCommunication, 
  deleteCommunication,
  getCommunicationStats
} from '../services/CommunicationService';
import type { CommunicationRecord } from '../../shared/types';

const router = Router();

router.get('/', (req, res) => {
  try {
    const { candidateId, type, createdBy } = req.query;
    
    const filters = {
      candidateId: candidateId as string,
      type: type as string,
      createdBy: createdBy as string
    };
    
    const communications = getCommunications(filters);
    
    res.json({
      success: true,
      data: communications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取沟通记录失败'
    });
  }
});

router.get('/stats', (req, res) => {
  try {
    const stats = getCommunicationStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取统计数据失败'
    });
  }
});

router.get('/:id', (req, res) => {
  try {
    const communication = getCommunicationById(req.params.id);
    
    if (!communication) {
      return res.status(404).json({
        success: false,
        error: '沟通记录不存在'
      });
    }
    
    res.json({
      success: true,
      data: communication
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取沟通记录失败'
    });
  }
});

router.post('/', (req, res) => {
  try {
    const data = req.body as Omit<CommunicationRecord, 'id' | 'createdAt'>;
    
    if (!data.candidateId || !data.content) {
      return res.status(400).json({
        success: false,
        error: '候选人和内容不能为空'
      });
    }
    
    const communication = createCommunication(data);
    
    res.json({
      success: true,
      data: communication,
      message: '沟通记录创建成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '创建沟通记录失败'
    });
  }
});

router.put('/:id', (req, res) => {
  try {
    const { content } = req.body as { content: string };
    
    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '内容不能为空'
      });
    }
    
    const communication = updateCommunication(req.params.id, content);
    
    if (!communication) {
      return res.status(404).json({
        success: false,
        error: '沟通记录不存在'
      });
    }
    
    res.json({
      success: true,
      data: communication,
      message: '沟通记录更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '更新沟通记录失败'
    });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const deleted = deleteCommunication(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: '沟通记录不存在'
      });
    }
    
    res.json({
      success: true,
      message: '沟通记录删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '删除沟通记录失败'
    });
  }
});

export default router;
