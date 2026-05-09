type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
};

export function SectionHeader({ eyebrow, title, description }: SectionHeaderProps) {
  return (
    <div className="mb-8 max-w-3xl">
      <div className="mb-3 text-xs uppercase tracking-[0.35em] text-cyan-200/70">{eyebrow}</div>
      <h1 className="text-4xl font-semibold leading-tight lg:text-6xl">{title}</h1>
      <p className="mt-4 text-base leading-7 text-slate-200/75 lg:text-lg">{description}</p>
    </div>
  );
}
