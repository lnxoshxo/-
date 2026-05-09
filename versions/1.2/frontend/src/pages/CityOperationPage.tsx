import { SectionHeader } from '../components/SectionHeader';
import { cityOperations } from '../data/expoContent';

export function CityOperationPage() {
  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-[32px] p-8 lg:p-12">
        <SectionHeader
          eyebrow="CITY OPERATION"
          title="城市运营：以北外滩场景展示精细化治理能力"
          description="会议纪要明确提出城市运营和北外滩，本页将物业服务能力延展到城市公共空间，强调秩序、环境、设施、事件和民生服务协同。"
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {cityOperations.map((item) => (
            <div key={item.title} className="rounded-[28px] border border-white/10 bg-white/5 p-6">
              <div className="text-2xl font-semibold text-white">{item.title}</div>
              <p className="mt-4 text-sm leading-7 text-slate-300/80">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        {['城市界面', '公共秩序', '应急协同'].map((item) => (
          <div key={item} className="glass-panel rounded-[28px] p-7">
            <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Operation Scene</div>
            <div className="mt-3 text-3xl font-semibold">{item}</div>
            <p className="mt-4 text-sm leading-7 text-slate-300/80">通过标准化队伍、数字化调度和现场闭环，支撑城市公共空间持续稳定运行。</p>
          </div>
        ))}
      </div>
    </section>
  );
}
