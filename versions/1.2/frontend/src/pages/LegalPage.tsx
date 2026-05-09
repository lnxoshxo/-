import { SectionHeader } from '../components/SectionHeader';
import { legalGuides } from '../data/expoContent';

export function LegalPage() {
  return (
    <section className="space-y-6">
      <SectionHeader
        eyebrow="LEGAL COMPLIANCE"
        title="法律法规：把合规能力纳入展会展示"
        description="围绕物业管理高频法律风险，展示上实服务在资金、收费、装修、审计等场景中的规范运营意识和风控能力。"
      />
      <div className="grid gap-4 lg:grid-cols-4">
        {legalGuides.map((item) => (
          <div key={item.title} className="glass-panel rounded-[28px] p-6">
            <div className="text-xl font-semibold text-cyan-100">{item.title}</div>
            <p className="mt-4 text-sm leading-7 text-slate-300/80">{item.description}</p>
          </div>
        ))}
      </div>
      <div className="glass-panel rounded-[32px] p-8 lg:p-10">
        <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Risk Control</div>
        <div className="mt-3 text-3xl font-semibold">合规不是后台材料，而是服务可信度的一部分</div>
        <p className="mt-4 max-w-4xl text-base leading-8 text-slate-300/80">
          法律法规板块适合与 AI 问答结合：观众可以围绕物业收费、公共收益、维修资金、装修管理等问题即时提问，系统用结构化口径辅助讲解。
        </p>
      </div>
    </section>
  );
}
