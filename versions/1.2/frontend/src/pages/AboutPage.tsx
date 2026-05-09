import { SectionHeader } from '../components/SectionHeader';
import { companyHighlights } from '../data/expoContent';

export function AboutPage() {
  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-[32px] p-8 lg:p-12">
        <SectionHeader
          eyebrow="COMPANY PROFILE"
          title="公司介绍：走进上实服务"
          description="围绕会议纪要中的“走进上实服务”，本页用于建立观众对企业定位、服务体系、数字化能力和城市空间服务价值的第一认知。"
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {companyHighlights.map((item) => (
            <div key={item.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <div className="text-xl font-semibold text-cyan-100">{item.title}</div>
              <p className="mt-3 text-sm leading-7 text-slate-300/80">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-4 lg:grid-cols-[0.92fr_1.08fr]">
        <div className="glass-panel rounded-[28px] p-8">
          <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Positioning</div>
          <div className="mt-3 text-3xl font-semibold">从物业服务到城市空间运营</div>
          <p className="mt-4 text-sm leading-7 text-slate-300/80">
            展示口径应避免只讲单点功能，而要讲清上实服务在多业态空间中提供专业运营、标准执行、客户服务和数字协同的综合价值。
          </p>
        </div>
        <div className="glass-panel rounded-[28px] p-8">
          <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Narrative</div>
          <div className="mt-3 text-3xl font-semibold">先讲品牌，再讲能力，最后讲未来</div>
          <p className="mt-4 text-sm leading-7 text-slate-300/80">
            现场讲解建议先完成品牌与集团概况铺垫，再进入服务项目、科技创新和未来展望，使观众在较短时间内形成完整判断。
          </p>
        </div>
      </div>
    </section>
  );
}
