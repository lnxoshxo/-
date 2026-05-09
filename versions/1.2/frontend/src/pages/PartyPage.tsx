import { SectionHeader } from '../components/SectionHeader';
import { partyPillars } from '../data/expoContent';

export function PartyPage() {
  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-[32px] p-8 lg:p-12">
        <SectionHeader
          eyebrow="PARTY BUILDING"
          title="党建引领 智慧服务 民生共建"
          description="党建引领板块按照会议纪要主题呈现组织优势、智慧服务能力和民生场景价值，形成更有温度、更有高度的展会表达。"
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {partyPillars.map((item) => (
            <div key={item.title} className="rounded-[28px] border border-red-300/20 bg-red-400/10 p-6">
              <div className="text-2xl font-semibold text-red-100">{item.title}</div>
              <p className="mt-4 text-sm leading-7 text-slate-200/80">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="glass-panel rounded-[32px] p-8 lg:p-10">
        <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Display Logic</div>
        <div className="mt-3 text-3xl font-semibold">把组织优势转化为服务优势</div>
        <p className="mt-4 max-w-4xl text-base leading-8 text-slate-300/80">
          展示时建议用“党建引领一线响应、智慧平台提升效率、民生共建连接服务对象”的表达方式，将党建内容与物业服务现场结合起来，而不是作为孤立栏目展示。
        </p>
      </div>
    </section>
  );
}
