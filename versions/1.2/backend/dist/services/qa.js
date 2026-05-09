import OpenAI from 'openai';
import { rankChunks } from './chunking.js';
import { addQaLogRecord, getDocuments, updateQaLogRecord } from './store.js';
function tokenizeQuestion(value) {
    const tokens = new Set();
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
function searchKnowledge(question) {
    const documents = getDocuments();
    return rankChunks(question, documents).map((chunk) => ({
        chunkId: chunk.id,
        title: chunk.title,
        snippet: chunk.snippet,
    }));
}
export async function answerQuestion(question) {
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
            answer: `根据当前知识库，上实服务展会展示重点围绕公司介绍、党建引领、标杆案例、工作指引、法律法规、城市运营、数据驾驶舱与 AI 问答展开。当前系统处于演示模式，已为您匹配到 ${citations.length} 条相关资料，可用于现场讲解参考。`,
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
                content: '你是上实服务展厅系统中的企业讲解助手。你只能根据给定知识库片段回答，保持专业、稳健、正式；如果信息不足，明确说明当前知识库未检索到足够信息，不得编造。',
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
function buildRelatedQuestions(question) {
    const documents = getDocuments();
    const faqs = [
        { question: '上实服务展区本次主要展示哪些内容？', answer: '可进一步了解八大展示栏目和讲解主线。' },
        { question: '党建引领 智慧服务 民生共建如何理解？', answer: '可进一步了解党建、智慧化和民生服务的关系。' },
        { question: '数据驾驶舱适合展示哪些场景应用？', answer: '可进一步了解安全、巡检、工单和城市运营场景。' },
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
