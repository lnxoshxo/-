import { SectionHeader } from '../components/SectionHeader';

const items = [
  '围绕城市空间服务构建专业化物业管理能力。',
  '覆盖商办、园区、复合业态与公共服务场景。',
  '以数字化平台支撑服务质量、响应效率与运营透明度。',
];

export function AboutPage() {
  return (
    <section className="glass-panel rounded-[32px] p-8 lg:p-12">
      <SectionHeader
        eyebrow="ABOUT SIICSERVICE"
        title="以品质服务为根基，以数字能力拓展空间价值"
        description="上实服务持续构建覆盖多业态的服务体系，在标准化运营之上，叠加数字化、物联化与精细化能力，为客户提供长期稳定的服务价值。"
      />
      <div className="grid gap-4 lg:grid-cols-3">
        {items.map((item) => (
          <div key={item} className="rounded-[28px] border border-white/10 bg-white/5 p-6 text-slate-100/85">
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
