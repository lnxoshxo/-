import { FormEvent, useState } from 'react';
import { useEffect } from 'react';
import { askQuestion, fetchFaqs } from '../lib/api';
import { SectionHeader } from '../components/SectionHeader';

export function AiPage() {
  const [presets, setPresets] = useState<string[]>([]);
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string>('');
  const [citations, setCitations] = useState<Array<{ chunkId?: string; title: string; snippet: string }>>([]);
  const [relatedQuestions, setRelatedQuestions] = useState<Array<{ question: string; answer: string }>>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    void fetchFaqs()
      .then((items) => setPresets(items.map((item) => item.question)))
      .catch(() =>
        setPresets(['上实服务的核心优势是什么？', '系统支持哪些智慧物业场景？', '如何通过 AI 提升物业运营效率？']),
      );
  }, []);

  async function submit(value: string) {
    if (!value.trim()) {
      return;
    }

    setLoading(true);
    setError('');
    try {
      const data = await askQuestion(value);
      setAnswer(data.answer);
      setCitations(data.citations);
      setRelatedQuestions(data.relatedQuestions || []);
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

  const hasResult = Boolean(error || answer);

  return (
    <section className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
      <div className="glass-panel rounded-[32px] p-8 lg:p-12">
        <SectionHeader
          eyebrow="AI CONCIERGE"
          title="现场提问，即时获得基于知识库的专业答复"
          description="系统将优先检索企业知识库，再结合 AI 生成可用于展会讲解的专业化回复。"
        />
        <form className="space-y-5" onSubmit={onSubmit}>
          <textarea
            className="min-h-48 w-full rounded-[28px] border border-cyan-300/20 bg-slate-950/50 p-6 text-lg leading-8 text-white outline-none transition focus:border-cyan-300/40"
            placeholder="请输入您希望了解的问题"
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
          />
          <div className="flex flex-wrap items-center gap-4">
            <button className="rounded-full bg-cyan-400 px-8 py-4 text-base font-medium text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70" disabled={loading} type="submit">
              {loading ? '正在分析...' : '开始提问'}
            </button>
            <div className="text-sm text-slate-300/70">适合展会现场快速演示，也支持法规、案例和服务能力类问题。</div>
          </div>
        </form>
        <div className="mt-8">
          <div className="mb-3 text-sm uppercase tracking-[0.3em] text-cyan-200/70">快速提问</div>
          <div className="flex flex-wrap gap-3">
          {presets.map((item) => (
            <button
              key={item}
              className="min-h-14 rounded-[20px] border border-white/10 px-5 py-3 text-left text-sm leading-6 text-slate-100/80 transition hover:border-cyan-300/30 hover:bg-white/5 hover:text-white"
              onClick={() => {
                setQuestion(item);
                void submit(item);
              }}
              type="button"
            >
              {item}
            </button>
          ))}
          </div>
        </div>
      </div>

      <div className="glass-panel rounded-[32px] p-8 lg:p-12">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">Answer</div>
            <div className="mt-2 text-2xl font-semibold text-white">智能答复结果</div>
          </div>
          <div className={`rounded-full px-4 py-2 text-sm ${loading ? 'bg-amber-400/10 text-amber-200' : hasResult ? 'bg-emerald-400/10 text-emerald-200' : 'bg-white/5 text-slate-300/70'}`}>
            {loading ? '生成中' : hasResult ? '已生成' : '待提问'}
          </div>
        </div>
        <div className="mt-6 rounded-[28px] border border-white/10 bg-[linear-gradient(180deg,rgba(18,32,54,0.92),rgba(8,13,24,0.92))] p-6 shadow-[0_16px_60px_rgba(0,0,0,0.22)]">
          <div className="mb-4 flex items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="text-sm text-slate-300/70">基于当前知识库生成</div>
            <div className="rounded-full border border-cyan-300/20 px-3 py-1 text-xs text-cyan-100">专业答复</div>
          </div>
          <div className="min-h-56 whitespace-pre-wrap text-base leading-8 text-slate-100/90 lg:text-lg">
            {error ? error : answer || '请在左侧输入问题，系统将展示基于知识库生成的回答。'}
          </div>
        </div>
        <div className="mt-8 text-sm uppercase tracking-[0.3em] text-cyan-200/70">Citations</div>
        <div className="mt-4 space-y-3">
          {citations.length === 0 ? (
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-slate-300/70">回答完成后将显示引用来源。</div>
          ) : (
            citations.map((item, index) => (
              <div key={`${item.chunkId || item.title}-${index}`} className="rounded-[24px] border border-white/10 bg-white/5 p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="font-medium leading-7 text-cyan-100">{item.title}</div>
                  <div className="rounded-full border border-cyan-300/20 px-3 py-1 text-xs text-cyan-100">{item.chunkId || `source-${index + 1}`}</div>
                </div>
                <div className="mt-3 text-sm leading-7 text-slate-300/80">{item.snippet}</div>
              </div>
            ))
          )}
        </div>
        <div className="mt-8 text-sm uppercase tracking-[0.3em] text-cyan-200/70">Related Questions</div>
        <div className="mt-4 grid gap-3">
          {relatedQuestions.length === 0 ? (
            <div className="rounded-[24px] border border-white/10 bg-white/5 p-5 text-slate-300/70">提问后将展示相关延展问题。</div>
          ) : (
            relatedQuestions.map((item) => (
              <button
                key={item.question}
                className="block min-h-20 w-full rounded-[24px] border border-white/10 bg-white/5 p-5 text-left transition hover:border-cyan-300/25 hover:bg-white/10"
                onClick={() => {
                  setQuestion(item.question);
                  void submit(item.question);
                }}
                type="button"
              >
                <div className="font-medium leading-7 text-cyan-100">{item.question}</div>
                <div className="mt-2 text-sm leading-7 text-slate-300/80">{item.answer}</div>
              </button>
            ))
          )}
        </div>
      </div>
    </section>
  );
}
