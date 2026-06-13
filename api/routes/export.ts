import { Router } from 'express';
import { generateBriefing, getExportFilePath } from '../services/ExportService';
import fs from 'fs';
import path from 'path';

const router = Router();

router.post('/briefing', (req, res) => {
  try {
    const { candidateId, templateId, format } = req.body as { 
      candidateId: string; 
      templateId: string; 
      format?: 'pdf' | 'html' 
    };
    
    if (!candidateId || !templateId) {
      return res.status(400).json({
        success: false,
        error: '候选人和模板ID不能为空'
      });
    }
    
    const result = generateBriefing(candidateId, templateId, format || 'pdf');
    
    if (!result.success || !result.filePath) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
    
    const fileName = path.basename(result.filePath);
    
    res.json({
      success: true,
      data: {
        fileName,
        downloadUrl: `/api/export/download/${fileName}`
      },
      message: '简报生成成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '生成简报失败'
    });
  }
});

router.get('/download/:fileName', (req, res) => {
  try {
    const { fileName } = req.params;
    const filePath = getExportFilePath(fileName);
    
    if (!filePath) {
      return res.status(404).json({
        success: false,
        error: '文件不存在'
      });
    }
    
    const stat = fs.statSync(filePath);
    res.setHeader('Content-Length', stat.size);
    
    if (fileName.endsWith('.pdf')) {
      res.setHeader('Content-Type', 'application/pdf');
    } else {
      res.setHeader('Content-Type', 'text/html; charset=utf-8');
    }
    
    res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
    
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '下载文件失败'
    });
  }
});

export default router;
