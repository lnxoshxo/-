import { Link } from 'react-router-dom';
import { SectionHeader } from '../components/SectionHeader';
import { exhibitModules, guidedNarrative } from '../data/expoContent';

export function HomePage() {
  return (
    <div className="space-y-10">
      <section className="grid gap-8 lg:grid-cols-[1.16fr_0.84fr] lg:items-stretch">
        <div className="glass-panel rounded-[32px] p-8 lg:p-12">
          <SectionHeader
            eyebrow="ENTER SIICSERVICE"
            title="走进上实服务"
            description="根据会议纪要重构展会展示内容，以公司介绍、党建引领、标杆案例、工作指引、法律法规、城市运营、数据驾驶舱和 AI 问答为主线，形成完整的现场讲解路径。"
          />
          <div className="flex flex-wrap gap-4">
            <Link className="rounded-full bg-cyan-400 px-6 py-4 text-base font-medium text-slate-950" to="/about">
              开始讲解
            </Link>
            <Link className="rounded-full border border-cyan-300/30 px-6 py-4 text-base font-medium text-cyan-100" to="/ai">
              进入 AI 问答
            </Link>
          </div>
        </div>
        <div className="glass-panel rounded-[32px] p-8">
          <div className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">Meeting Theme</div>
          <div className="mt-5 text-4xl font-semibold leading-tight">党建引领 智慧服务 民生共建</div>
          <p className="mt-5 text-base leading-8 text-slate-200/75">
            以党建为组织牵引，以智慧化为能力表达，以民生共建为价值落点，呈现上实服务从物业管理到城市空间服务的综合能力。
          </p>
        </div>
      </section>

      <section className="glass-panel rounded-[32px] p-8 lg:p-10">
        <div className="text-sm uppercase tracking-[0.3em] text-cyan-200/70">Guided Narrative</div>
        <div className="mt-3 text-3xl font-semibold">讲解结构</div>
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          {guidedNarrative.map((item) => (
            <div key={item.index} className="rounded-[28px] border border-white/10 bg-white/[0.04] p-5">
              <div className="text-3xl font-semibold text-cyan-100">{item.index}</div>
              <div className="mt-4 min-h-14 text-lg font-semibold leading-7 text-white">{item.title}</div>
              <div className="mt-3 text-sm leading-7 text-slate-300/75">{item.description}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {exhibitModules.map((item, index) => (
          <Link key={item.path} className="glass-panel rounded-[28px] p-6 transition hover:border-cyan-300/30 hover:bg-white/[0.04]" to={item.path}>
            <div className="flex items-center justify-between gap-3">
              <div className="rounded-full border border-cyan-300/20 px-3 py-1 text-xs text-cyan-100">{String(index + 1).padStart(2, '0')}</div>
              <div className="text-xs uppercase tracking-[0.24em] text-slate-400">Module</div>
            </div>
            <div className="mt-5 text-2xl font-semibold text-white">{item.title}</div>
            <p className="mt-3 text-sm leading-7 text-slate-300/75">{item.description}</p>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="glass-panel rounded-[28px] p-6">
          <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Service Projects</div>
          <div className="mt-3 text-2xl font-semibold">服务项目承接多业态运营</div>
          <p className="mt-3 text-sm leading-7 text-slate-300/75">从商办、园区到城市公共空间，突出标准化与精细化并行的服务能力。</p>
        </div>
        <div className="glass-panel rounded-[28px] p-6">
          <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Technology</div>
          <div className="mt-3 text-2xl font-semibold">AI、IoT 与数字平台联动</div>
          <p className="mt-3 text-sm leading-7 text-slate-300/75">以数据驾驶舱和 AI 问答提升展会互动体验，也展示智慧物业技术能力。</p>
        </div>
        <div className="glass-panel rounded-[28px] p-6">
          <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Future Vision</div>
          <div className="mt-3 text-2xl font-semibold">低碳、ESG 与未来社区</div>
          <p className="mt-3 text-sm leading-7 text-slate-300/75">将物业服务延展到绿色运营、可持续发展和未来城市空间服务方向。</p>
        </div>
      </section>
    </div>
  );
}
