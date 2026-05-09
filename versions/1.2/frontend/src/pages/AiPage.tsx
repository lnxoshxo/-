import { FormEvent, useState } from 'react';
import { askQuestion } from '../lib/api';
import { SectionHeader } from '../components/SectionHeader';
import { aiQuickQuestions } from '../data/expoContent';

export function AiPage() {
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string>('');
  const [citations, setCitations] = useState<Array<{ chunkId?: string; title: string; snippet: string }>>([]);
  const [relatedQuestions, setRelatedQuestions] = useState<Array<{ question: string; answer: string }>>([]);
  const [error, setError] = useState('');

  function submitPreset(item: { question: string; answer: string }) {
    setQuestion(item.question);
    setError('');
    setAnswer(item.answer);
    setCitations([]);
    setRelatedQuestions(aiQuickQuestions.filter((entry) => entry.question !== item.question).slice(0, 3));
  }

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
          title="AI 问答：固定 16 个展会高频问题"
          description="按照会议纪要要求，预置 10-20 个现场高频问题。本页固定展示 16 个问题，覆盖公司介绍、党建引领、标杆案例、工作指引、法律法规、城市运营和数据驾驶舱。"
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
            <div className="text-sm text-slate-300/70">点击固定问题可快速生成会议纪要口径答复，手动输入仍可调用知识库问答。</div>
          </div>
        </form>
        <div className="mt-8">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
            <div>
              <div className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">Fixed Questions</div>
              <div className="mt-2 text-2xl font-semibold text-white">会议纪要固定问题</div>
            </div>
            <div className="rounded-full border border-cyan-300/20 px-4 py-2 text-sm text-cyan-100">16 个问题</div>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
          {aiQuickQuestions.map((item, index) => (
            <button
              key={item.question}
              className="min-h-24 rounded-[22px] border border-white/10 bg-white/[0.03] px-5 py-4 text-left text-sm leading-6 text-slate-100/85 transition hover:border-cyan-300/30 hover:bg-white/[0.07] hover:text-white"
              onClick={() => submitPreset(item)}
              type="button"
            >
              <span className="mr-3 rounded-full border border-cyan-300/20 px-3 py-1 text-xs text-cyan-100">{String(index + 1).padStart(2, '0')}</span>
              {item.question}
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
            <div className="text-sm text-slate-300/70">固定问题或当前知识库生成</div>
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
