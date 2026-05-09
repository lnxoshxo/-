import { SectionHeader } from '../components/SectionHeader';

const metrics = [
  ['客户响应时效', '< 15 min'],
  ['重点设备在线率', '99.2%'],
  ['工单闭环率', '98.4%'],
  ['节能优化潜力', '12%'],
];

export function DataPage() {
  return (
    <section>
      <SectionHeader
        eyebrow="DATA COCKPIT"
        title="让服务过程可视，让运营结果可衡量"
        description="以数据驾驶舱方式展示服务质量、设备状态与运营效率，支撑管理透明化与持续优化。"
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map(([label, value]) => (
          <div key={label} className="glass-panel rounded-[28px] p-6">
            <div className="text-sm text-slate-300/70">{label}</div>
            <div className="mt-4 text-4xl font-semibold text-cyan-100">{value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
