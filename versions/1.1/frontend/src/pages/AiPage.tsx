import { FormEvent, useState } from 'react';
import { askQuestion } from '../lib/api';
import { SectionHeader } from '../components/SectionHeader';
import { QuickQuestion, quickQuestions } from '../data/quickQuestions';

type AnswerFeedItem = {
  id: string;
  question: string;
  answer: string;
  mode: 'quick' | 'knowledge';
  basis: string[];
  citations?: Array<{ chunkId?: string; title: string; snippet: string }>;
  relatedQuestions?: Array<{ question: string; answer: string }>;
};

function waitForMockAnswer() {
  return new Promise((resolve) => {
    window.setTimeout(resolve, 260);
  });
}

export function AiPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeQuestionId, setActiveQuestionId] = useState('');
  const [answerFeed, setAnswerFeed] = useState<AnswerFeedItem[]>([]);
  const [error, setError] = useState('');

  async function submitQuickQuestion(item: QuickQuestion) {
    setQuestion(item.question);
    setActiveQuestionId(item.id);
    setLoading(true);
    setError('');

    await waitForMockAnswer();

    setAnswerFeed((current) => [
      {
        id: `${item.id}-${Date.now()}`,
        question: item.question,
        answer: item.answer,
        mode: 'quick',
        basis: item.basis,
      },
      ...current,
    ]);
    setLoading(false);
  }

  async function submit(value: string) {
    const trimmedQuestion = value.trim();
    if (!trimmedQuestion) {
      return;
    }

    const quickQuestion = quickQuestions.find((item) => item.question === trimmedQuestion);
    if (quickQuestion) {
      await submitQuickQuestion(quickQuestion);
      return;
    }

    setLoading(true);
    setError('');
    setActiveQuestionId('');
    try {
      const data = await askQuestion(trimmedQuestion);
      setAnswerFeed((current) => [
        {
          id: `custom-${Date.now()}`,
          question: trimmedQuestion,
          answer: data.answer,
          mode: 'knowledge',
          basis: data.citations.length > 0 ? data.citations.map((item) => item.title) : ['当前知识库'],
          citations: data.citations,
          relatedQuestions: data.relatedQuestions || [],
        },
        ...current,
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : '提问失败');
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    await submit(question);
  }

  const hasResult = Boolean(error || answerFeed.length > 0);

  return (
    <section className="grid gap-6 xl:grid-cols-[0.98fr_1.02fr]">
      <div className="glass-panel rounded-[32px] p-8 lg:p-12">
        <SectionHeader
          eyebrow="AI CONCIERGE"
          title="30 个上实服务展会快速提问，点击即生成专业答复"
          description="围绕上实服务智慧物业、园区运营、数字平台、AI 知识库与合规风控等真实业务语境，打造适合展会现场演示的高阶问答入口。"
        />
        <form className="space-y-5" onSubmit={onSubmit}>
          <textarea
            className="min-h-36 w-full rounded-[28px] border border-cyan-300/20 bg-slate-950/50 p-6 text-lg leading-8 text-white outline-none transition focus:border-cyan-300/40"
            placeholder="请输入您希望了解的问题"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
          />
          <div className="flex flex-wrap items-center gap-4">
            <button className="rounded-full bg-cyan-400 px-8 py-4 text-base font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70" disabled={loading} type="submit">
              {loading ? '正在分析...' : '开始提问'}
            </button>
            <div className="text-sm text-slate-300/70">点击下方题目会自动填入对话框，并在右侧生成瀑布流式 AI 专业答复。</div>
          </div>
        </form>
        <div className="mt-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">Quick Questions</div>
              <div className="mt-2 text-2xl font-semibold text-white">快速提问模块</div>
            </div>
            <div className="rounded-full border border-cyan-300/20 px-4 py-2 text-sm text-cyan-100">30 题全部展示</div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {quickQuestions.map((item, index) => (
              <button
                key={item.id}
                className={`group min-h-24 rounded-[22px] border p-4 text-left transition ${
                  activeQuestionId === item.id
                    ? 'border-cyan-300/50 bg-cyan-300/10 shadow-[0_0_24px_rgba(66,217,255,0.16)]'
                    : 'border-white/10 bg-white/[0.03] hover:border-cyan-300/30 hover:bg-white/[0.07]'
                }`}
                onClick={() => void submitQuickQuestion(item)}
                type="button"
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-full border border-cyan-300/20 px-3 py-1 text-xs text-cyan-100">{String(index + 1).padStart(2, '0')}</span>
                  <span className="text-xs text-slate-300/60 transition group-hover:text-cyan-100">{item.category}</span>
                </div>
                <div className="mt-3 text-sm font-medium leading-6 text-slate-100/90">{item.question}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-[32px] p-8 lg:sticky lg:top-6 lg:max-h-[calc(100vh-48px)] lg:overflow-hidden lg:p-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">Answer</div>
            <div className="mt-2 text-2xl font-semibold text-white">专业答复会话框</div>
          </div>
          <div className={`rounded-full px-4 py-2 text-sm ${loading ? 'bg-amber-400/10 text-amber-200' : hasResult ? 'bg-emerald-400/10 text-emerald-200' : 'bg-white/5 text-slate-300/70'}`}>
            {loading ? '生成中' : hasResult ? '已生成' : '待提问'}
          </div>
        </div>
        <div className="mt-6 h-[calc(100vh-220px)] min-h-[620px] space-y-4 overflow-y-auto pr-2">
          {loading ? (
            <div className="rounded-[28px] border border-amber-300/20 bg-amber-300/10 p-6 text-amber-100 shadow-[0_16px_60px_rgba(0,0,0,0.22)]">
              AI 正在结合上实服务业务语境生成专业答复...
            </div>
          ) : null}
          {error ? <div className="rounded-[28px] border border-rose-300/20 bg-rose-400/10 p-6 text-rose-100">{error}</div> : null}
          {answerFeed.length === 0 && !loading && !error ? (
            <div className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,32,54,0.92),rgba(8,13,24,0.92))] p-8 text-slate-300/75 shadow-[0_16px_60px_rgba(0,0,0,0.22)]">
              左侧 30 个题目已全部展示。点击任意题目后，问题会进入对话框，右侧将以瀑布流形式展示 AI 专业答复。
            </div>
          ) : null}
          {answerFeed.map((item) => (
            <article key={item.id} className="rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,32,54,0.94),rgba(8,13,24,0.94))] p-6 shadow-[0_16px_60px_rgba(0,0,0,0.22)]">
              <div className="rounded-[22px] border border-cyan-300/15 bg-cyan-300/10 p-4">
                <div className="text-xs uppercase tracking-[0.28em] text-cyan-100/70">Visitor Question</div>
                <div className="mt-2 text-base font-semibold leading-7 text-white">{item.question}</div>
              </div>
              <div className="mt-5 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
                <div>
                  <div className="text-xs uppercase tracking-[0.28em] text-cyan-200/70">AI Answer</div>
                  <div className="mt-1 text-lg font-semibold text-white">上实服务专业答复</div>
                </div>
                <div className="rounded-full border border-cyan-300/20 px-3 py-1 text-xs text-cyan-100">
                  {item.mode === 'quick' ? '模拟问答' : '知识库问答'}
                </div>
              </div>
              <div className="mt-5 whitespace-pre-wrap text-base leading-8 text-slate-100/90 lg:text-lg">{item.answer}</div>
              <div className="mt-5 flex flex-wrap gap-2">
                {item.basis.map((basis) => (
                  <span key={`${item.id}-${basis}`} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-200/75">
                    依据：{basis}
                  </span>
                ))}
              </div>
              {item.citations && item.citations.length > 0 ? (
                <div className="mt-5 space-y-3">
                  {item.citations.map((citation, index) => (
                    <div key={`${item.id}-${citation.chunkId || index}`} className="rounded-[20px] border border-white/10 bg-white/5 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="text-sm font-medium leading-6 text-cyan-100">{citation.title}</div>
                        <div className="rounded-full border border-cyan-300/20 px-3 py-1 text-xs text-cyan-100">{citation.chunkId || `source-${index + 1}`}</div>
                      </div>
                      <div className="mt-2 text-sm leading-7 text-slate-300/80">{citation.snippet}</div>
                    </div>
                  ))}
                </div>
              ) : null}
              {item.relatedQuestions && item.relatedQuestions.length > 0 ? (
                <div className="mt-5 grid gap-2">
                  {item.relatedQuestions.map((related) => (
                    <button
                      key={`${item.id}-${related.question}`}
                      className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3 text-left text-sm leading-6 text-slate-200/80 transition hover:border-cyan-300/25 hover:bg-white/10"
                      onClick={() => {
                        setQuestion(related.question);
                        void submit(related.question);
                      }}
                      type="button"
                    >
                      延展：{related.question}
                    </button>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
