export function DownloadsPage() {
  const files = [
    {
      name: '完整版项目压缩包',
      file: '/siicservice-expo-ai-system.zip',
      description: '包含当前工作区全部内容，体积较大，适合完整备份。',
    },
    {
      name: '精简版源码压缩包',
      file: '/siicservice-expo-ai-system-lite.zip',
      description: '仅包含前后端源码、文档与配置，适合交付、分享和下载。',
    },
  ];

  return (
    <section className="space-y-6">
      <div className="glass-panel rounded-[32px] p-8 lg:p-12">
        <div className="text-sm uppercase tracking-[0.35em] text-cyan-200/70">Downloads</div>
        <h1 className="mt-4 text-4xl font-semibold leading-tight lg:text-6xl">项目文件下载页</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-slate-200/75 lg:text-lg">
          这里提供当前项目的完整压缩包和精简源码包。点击下方按钮即可直接下载。
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {files.map((item) => (
          <div key={item.file} className="glass-panel rounded-[28px] p-8">
            <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">ZIP Package</div>
            <div className="mt-3 text-2xl font-semibold text-white">{item.name}</div>
            <div className="mt-4 text-sm leading-7 text-slate-300/80">{item.description}</div>
            <div className="mt-4 rounded-[20px] border border-white/10 bg-white/5 px-4 py-4 text-sm text-slate-300/80">{item.file}</div>
            <a
              className="mt-6 inline-flex min-h-12 items-center rounded-full bg-cyan-400 px-6 py-3 text-base font-medium text-slate-950 transition hover:bg-cyan-300"
              href={item.file}
            >
              立即下载
            </a>
          </div>
        ))}
      </div>
    </section>
  );
}
