import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import multer from 'multer';
import OpenAI from 'openai';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { previewDocumentChunks } from './services/chunking.js';
import { parseDocumentContent } from './services/document-parser.js';
import { answerQuestion } from './services/qa.js';
import { addCase, addDocument, addFaq, getCases, getDocuments, getFaqs, getHomeContent, getQaLogs, removeCase, removeDocument, removeFaq, updateCase, updateDocumentContent, updateDocumentStatus, updateFaq, updateHomeContent } from './services/store.js';

const app = express();
const upload = multer({ storage: multer.memoryStorage() });
const port = Number(process.env.BACKEND_PORT || 3001);
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const frontendDistDir = process.env.FRONTEND_DIST_DIR || path.resolve(currentDir, '../../frontend/dist');

app.use(cors());
app.use(express.json({ limit: '2mb' }));

const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'siicservice123';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'siicservice-admin-token';

function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  if (req.path === '/api/admin/login') {
    return next();
  }

  if (!req.path.startsWith('/api/admin')) {
    return next();
  }

  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '').trim();
  if (!token || token !== ADMIN_TOKEN) {
    return res.status(401).json({ message: '后台访问未授权' });
  }

  return next();
}

app.use(requireAdminAuth);

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'siicservice-backend' });
});

app.get('/api/content/home', (_req, res) => {
  res.json(getHomeContent());
});

app.get('/api/content/faqs', (_req, res) => {
  res.json({ items: getFaqs() });
});

app.get('/api/content/cases', (_req, res) => {
  res.json({ items: getCases() });
});

app.post('/api/admin/login', (req, res) => {
  const schema = z.object({
    username: z.string().min(1),
    password: z.string().min(1),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: '登录参数无效' });
  }

  if (parsed.data.username !== ADMIN_USERNAME || parsed.data.password !== ADMIN_PASSWORD) {
    return res.status(401).json({ message: '账号或密码错误' });
  }

  return res.json({ token: ADMIN_TOKEN, username: ADMIN_USERNAME });
});

app.post('/api/ask', async (req, res) => {
  const schema = z.object({
    question: z.string().min(2),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: '问题内容无效' });
  }

  try {
    const result = await answerQuestion(parsed.data.question);
    return res.json(result);
  } catch (error) {
    return res.status(500).json({
      message: error instanceof Error ? error.message : '问答服务异常',
    });
  }
});

app.get('/api/admin/documents', (_req, res) => {
  res.json({ items: getDocuments() });
});

app.get('/api/admin/documents/:id/chunks', (req, res) => {
  const document = getDocuments().find((item) => item.id === req.params.id);
  if (!document) {
    return res.status(404).json({ message: '文档不存在' });
  }

  return res.json({
    documentId: document.id,
    title: document.title,
    items: previewDocumentChunks(document),
  });
});

app.get('/api/admin/faqs', (_req, res) => {
  res.json({ items: getFaqs() });
});

app.get('/api/admin/cases', (_req, res) => {
  res.json({ items: getCases() });
});

app.get('/api/admin/qa-logs', (_req, res) => {
  res.json({ items: getQaLogs() });
});

app.get('/api/admin/model-health', async (_req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL;
  const model = process.env.OPENAI_CHAT_MODEL || 'gpt-4.1-mini';

  if (!apiKey) {
    return res.status(400).json({ ok: false, mode: 'demo', message: '未配置 OPENAI_API_KEY' });
  }

  try {
    const client = new OpenAI({ apiKey, baseURL });
    const completion = await client.chat.completions.create({
      model,
      temperature: 0,
      max_tokens: 16,
      messages: [
        { role: 'system', content: '你是一个连通性检测助手，只需简短回复。' },
        { role: 'user', content: '请回复：模型连通正常' },
      ],
    });

    return res.json({
      ok: true,
      mode: 'live',
      model,
      message: completion.choices[0]?.message?.content || '模型连通正常',
    });
  } catch (error) {
    return res.status(502).json({
      ok: false,
      mode: 'live',
      model,
      message: error instanceof Error ? error.message : '模型连通检查失败',
    });
  }
});

app.put('/api/admin/home-content', (req, res) => {
  const schema = z.object({
    heroTitle: z.string().min(2),
    heroSubtitle: z.string().min(2),
    ctas: z.array(
      z.object({
        label: z.string().min(1),
        href: z.string().min(1),
      }),
    ),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: '首页内容参数无效' });
  }

  return res.json(updateHomeContent(parsed.data));
});

app.post('/api/admin/faqs', (req, res) => {
  const schema = z.object({
    question: z.string().min(2),
    answer: z.string().min(2),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'FAQ 参数无效' });
  }

  return res.status(201).json(addFaq(parsed.data));
});

app.put('/api/admin/faqs/:id', (req, res) => {
  const schema = z.object({
    question: z.string().min(2),
    answer: z.string().min(2),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'FAQ 参数无效' });
  }

  const item = updateFaq(req.params.id, parsed.data);
  if (!item) {
    return res.status(404).json({ message: 'FAQ 不存在' });
  }

  return res.json(item);
});

app.delete('/api/admin/faqs/:id', (req, res) => {
  const removed = removeFaq(req.params.id);
  if (!removed) {
    return res.status(404).json({ message: 'FAQ 不存在' });
  }

  return res.json({ ok: true });
});

app.post('/api/admin/cases', (req, res) => {
  const schema = z.object({
    title: z.string().min(2),
    category: z.string().min(2),
    summary: z.string().min(2),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: '案例参数无效' });
  }

  return res.status(201).json(addCase(parsed.data));
});

app.put('/api/admin/cases/:id', (req, res) => {
  const schema = z.object({
    title: z.string().min(2),
    category: z.string().min(2),
    summary: z.string().min(2),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: '案例参数无效' });
  }

  const item = updateCase(req.params.id, parsed.data);
  if (!item) {
    return res.status(404).json({ message: '案例不存在' });
  }

  return res.json(item);
});

app.delete('/api/admin/cases/:id', (req, res) => {
  const removed = removeCase(req.params.id);
  if (!removed) {
    return res.status(404).json({ message: '案例不存在' });
  }

  return res.json({ ok: true });
});

app.delete('/api/admin/documents/:id', (req, res) => {
  const removed = removeDocument(req.params.id);
  if (!removed) {
    return res.status(404).json({ message: '文档不存在' });
  }

  return res.json({ ok: true });
});

app.post('/api/admin/documents/import', (req, res) => {
  const schema = z.object({
    title: z.string().min(2),
    content: z.string().min(20),
    source: z.string().min(2),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: '导入文档参数无效' });
  }

  const item = addDocument({
    title: parsed.data.title,
    content: parsed.data.content.trim(),
    source: parsed.data.source,
    status: 'ready',
  });

  return res.status(201).json({
    message: '文档正文已导入知识库',
    item,
  });
});

app.post('/api/admin/documents', upload.single('file'), (req, res) => {
  const title = req.body.title?.trim() || req.file?.originalname || '未命名文档';

  if (!req.file) {
    return res.status(400).json({ message: '请上传文档文件' });
  }

  const item = addDocument({
    title,
    content: '',
    source: req.file.originalname,
    status: 'processing',
  });

  setTimeout(async () => {
    try {
      const result = await parseDocumentContent({
        fileName: req.file!.originalname,
        mimeType: req.file!.mimetype,
        buffer: req.file!.buffer,
      });

      const current = getDocuments().find((entry) => entry.id === item.id);
      if (!current) {
        return;
      }

      void updateDocumentContent(item.id, {
        content: result.content || '当前文档未解析出可用正文内容。',
        source: `${current.source} | ${result.parser}`,
        status: 'ready',
      });
    } catch {
      void updateDocumentStatus(item.id, 'failed');
    }
  }, 1200);

  res.status(201).json({
    message: '已接收文档，后续将进入知识库处理流程',
    fileName: req.file.originalname,
    item,
  });
});

if (existsSync(frontendDistDir)) {
  app.use(express.static(frontendDistDir));
  app.get(/^\/(?!api).*/, (_req, res) => {
    res.sendFile(path.join(frontendDistDir, 'index.html'));
  });
}

app.listen(port, () => {
  console.log(`SIICSERVICE backend listening on ${port}`);
});
