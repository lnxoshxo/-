import { SectionHeader } from '../components/SectionHeader';
import { dashboardMetrics, scenarioApplications } from '../data/expoContent';

export function DataPage() {
  return (
    <section>
      <SectionHeader
        eyebrow="DATA COCKPIT"
        title="数据驾驶舱：以场景应用呈现运营能力"
        description="会议纪要要求突出数据驾驶舱和场景应用，本页将安全生产、标准巡检、城市运营、工单协同和设备监测统一纳入可视化展示。"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {dashboardMetrics.map(([label, value]) => (
          <div key={label} className="glass-panel rounded-[28px] p-6">
            <div className="text-sm text-slate-300/70">{label}</div>
            <div className="mt-4 text-4xl font-semibold text-cyan-100">{value}</div>
          </div>
        ))}
      </div>
      <div className="mt-6 glass-panel rounded-[32px] p-8 lg:p-10">
        <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Scenario Applications</div>
        <div className="mt-3 text-3xl font-semibold">六类场景应用</div>
        <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {scenarioApplications.map((item) => (
            <div key={item} className="rounded-[22px] border border-white/10 bg-white/5 px-5 py-4 text-slate-100/85">
              {item}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
