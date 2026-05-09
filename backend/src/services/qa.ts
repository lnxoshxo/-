import OpenAI from 'openai';
import { rankChunks } from './chunking';
import { addQaLogRecord, getDocuments, updateQaLogRecord } from './store';

type Citation = {
  chunkId: string;
  title: string;
  snippet: string;
};

type RelatedQuestion = {
  question: string;
  answer: string;
};

function tokenizeQuestion(value: string) {
  const tokens = new Set<string>();
  const normalized = value.toLowerCase();

  for (const match of normalized.matchAll(/[\p{Script=Han}]{2,}|[\p{L}\p{N}]{2,}/gu)) {
    const part = match[0];
    tokens.add(part);

    if (/^[\p{Script=Han}]+$/u.test(part)) {
      for (let index = 0; index < part.length - 1; index += 1) {
        tokens.add(part.slice(index, index + 2));
      }
    }
  }

  return [...tokens];
}

function searchKnowledge(question: string): Citation[] {
  const documents = getDocuments();

  return rankChunks(question, documents).map((chunk) => ({
    chunkId: chunk.id,
    title: chunk.title,
    snippet: chunk.snippet,
  }));
}

export async function answerQuestion(question: string) {
  const pendingLog = addQaLogRecord(question, 'processing');
  const citations = searchKnowledge(question);
  const relatedQuestions = buildRelatedQuestions(question);

  if (citations.length === 0) {
    const result = {
      answer: '当前知识库未检索到足够信息，请联系现场顾问进一步了解。',
      citations: [],
      relatedQuestions,
    };
    updateQaLogRecord(pendingLog.id, {
      status: 'not_found',
      answer: result.answer,
      citations: result.citations,
      relatedQuestions: result.relatedQuestions,
    });
    return result;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const baseURL = process.env.OPENAI_BASE_URL;
  const model = process.env.OPENAI_CHAT_MODEL || 'gpt-4.1-mini';

  if (!apiKey) {
    const result = {
      answer: `根据当前知识库，上实服务重点围绕智慧物业、园区运营、设备运维、客户服务与数字平台建设持续提升服务质量。当前系统处于演示模式，已为您匹配到 ${citations.length} 条相关资料。`,
      citations,
      relatedQuestions,
    };
    updateQaLogRecord(pendingLog.id, {
      status: 'answered_demo',
      answer: result.answer,
      citations: result.citations,
      relatedQuestions: result.relatedQuestions,
    });
    return result;
  }

  const client = new OpenAI({ apiKey, baseURL });
  const context = citations.map((item, index) => `${index + 1}. ${item.title}: ${item.snippet}`).join('\n');

  const completion = await client.chat.completions.create({
    model,
    temperature: 0.3,
    messages: [
      {
        role: 'system',
        content:
          '你是上实服务展厅系统中的企业讲解助手。你只能根据给定知识库片段回答，保持专业、稳健、正式；如果信息不足，明确说明当前知识库未检索到足够信息，不得编造。',
      },
      {
        role: 'user',
        content: `用户问题：${question}\n\n知识库片段：\n${context}`,
      },
    ],
  });

  const result = {
    answer: completion.choices[0]?.message?.content ?? '当前知识库未检索到足够信息，请联系现场顾问进一步了解。',
    citations,
    relatedQuestions,
  };

  updateQaLogRecord(pendingLog.id, {
    status: 'answered',
    answer: result.answer,
    citations: result.citations,
    relatedQuestions: result.relatedQuestions,
  });

  return result;
}

function buildRelatedQuestions(question: string): RelatedQuestion[] {
  const documents = getDocuments();
  const faqs = [
    { question: '上实服务的核心优势是什么？', answer: '可进一步了解企业的服务能力、数字平台与多业态管理经验。' },
    { question: 'AI 在物业场景中可以发挥什么作用？', answer: '可进一步了解知识问答、运营辅助与数据分析能力。' },
    { question: '系统支持哪些智慧物业场景？', answer: '可进一步了解园区、商办、设备运维和客户服务场景。' },
  ];

  const tokens = tokenizeQuestion(question);
  const scored = faqs.map((item) => {
    const haystack = `${item.question} ${item.answer} ${documents.map((doc) => doc.title).join(' ')}`.toLowerCase();
    const score = tokens.reduce((total, token) => total + (haystack.includes(token) ? 1 : 0), 0);
    return { ...item, score };
  });

  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(({ question: q, answer }) => ({ question: q, answer }));
}
