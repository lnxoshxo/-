import { SectionHeader } from '../components/SectionHeader';
import { benchmarkCases } from '../data/expoContent';

export function CasesPage() {
  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="BENCHMARK CASES"
        title="标杆案例：7S、荣誉与项目实践"
        description="根据会议纪要，将案例展示重点调整为 7S 管理、荣誉成果和典型项目实践，让观众同时看到管理方法、成果背书与场景落地。"
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {benchmarkCases.map((item) => (
          <div key={item.title} className="glass-panel rounded-[28px] p-6">
            <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">{item.tag}</div>
            <div className="mt-3 text-2xl font-semibold">{item.title}</div>
            <p className="mt-3 text-slate-200/75">{item.description}</p>
          </div>
        ))}
      </div>
      <div className="glass-panel rounded-[32px] p-8 lg:p-10">
        <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Showcase Method</div>
        <div className="mt-3 text-3xl font-semibold">用“方法 + 成果 + 场景”组织案例讲解</div>
        <p className="mt-4 text-base leading-8 text-slate-300/80">
          建议现场讲解时先用 7S 解释项目现场管理方法，再用荣誉成果增强可信度，最后落到典型项目和服务场景，使案例页更符合展会展示逻辑。
        </p>
      </div>
    </section>
  );
}
