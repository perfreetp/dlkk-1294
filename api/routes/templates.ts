import { Router } from 'express';
import { 
  getTemplates, 
  getTemplateById, 
  createTemplate, 
  updateTemplate, 
  deleteTemplate,
  getTemplateVariables
} from '../services/TemplateService';
import { previewTemplate } from '../services/ExportService';
import type { Template } from '../../shared/types';

const router = Router();

router.get('/', (req, res) => {
  try {
    const { clientName, search } = req.query;
    
    const filters = {
      clientName: clientName as string,
      search: search as string
    };
    
    const templates = getTemplates(filters);
    
    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取模板列表失败'
    });
  }
});

router.get('/variables', (req, res) => {
  try {
    const { content } = req.query;
    
    if (!content) {
      return res.status(400).json({
        success: false,
        error: '请提供模板内容'
      });
    }
    
    const variables = getTemplateVariables(content as string);
    
    res.json({
      success: true,
      data: variables
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '解析模板变量失败'
    });
  }
});

router.get('/:id', (req, res) => {
  try {
    const template = getTemplateById(req.params.id);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: '模板不存在'
      });
    }
    
    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '获取模板详情失败'
    });
  }
});

router.get('/:id/preview/:candidateId', (req, res) => {
  try {
    const { id, candidateId } = req.params;
    
    const result = previewTemplate(id, candidateId);
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      });
    }
    
    res.json({
      success: true,
      data: result.content
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '预览模板失败'
    });
  }
});

router.post('/', (req, res) => {
  try {
    const data = req.body as Omit<Template, 'id' | 'createdAt' | 'updatedAt'>;
    
    if (!data.name || !data.content) {
      return res.status(400).json({
        success: false,
        error: '模板名称和内容不能为空'
      });
    }
    
    const template = createTemplate(data);
    
    res.json({
      success: true,
      data: template,
      message: '模板创建成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '创建模板失败'
    });
  }
});

router.put('/:id', (req, res) => {
  try {
    const data = req.body as Partial<Template>;
    const template = updateTemplate(req.params.id, data);
    
    if (!template) {
      return res.status(404).json({
        success: false,
        error: '模板不存在'
      });
    }
    
    res.json({
      success: true,
      data: template,
      message: '模板更新成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '更新模板失败'
    });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const deleted = deleteTemplate(req.params.id);
    
    if (!deleted) {
      return res.status(404).json({
        success: false,
        error: '模板不存在'
      });
    }
    
    res.json({
      success: true,
      message: '模板删除成功'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : '删除模板失败'
    });
  }
});

export default router;
