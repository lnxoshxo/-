import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const highlights = ['党建引领', '智慧服务', '民生共建', 'AI 问答'];

export function IdlePage() {
  return (
    <section className="grid min-h-[72vh] gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <motion.div
        animate={{ opacity: [0.75, 1, 0.75], y: [-4, 0, -4] }}
        className="glass-panel rounded-[40px] px-10 py-16 lg:px-16"
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
      >
          <div className="text-xs uppercase tracking-[0.45em] text-cyan-200/70">WELCOME TO SIICSERVICE</div>
          <h1 className="mt-5 text-5xl font-semibold leading-tight lg:text-7xl">走进上实服务</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-200/75">
          党建引领、智慧服务、民生共建。点击进入，浏览公司介绍、标杆案例、工作指引、法律法规、城市运营、数据驾驶舱与 AI 问答。
          </p>
        <div className="mt-8 flex flex-wrap gap-3">
          {highlights.map((item) => (
            <div key={item} className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
              {item}
            </div>
          ))}
        </div>
        <div className="mt-10 flex justify-start">
          <Link className="rounded-full bg-cyan-400 px-8 py-4 text-lg font-medium text-slate-950" to="/">
            点击进入展厅
          </Link>
        </div>
      </motion.div>

      <div className="grid gap-4">
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5] }}
          className="glass-panel rounded-[32px] p-6"
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Current Showcase</div>
          <div className="mt-3 text-2xl font-semibold">会议纪要八大栏目完整呈现</div>
          <div className="mt-3 text-sm leading-6 text-slate-300/75">
            公司介绍、党建引领、标杆案例、工作指引、法律法规、城市运营、数据驾驶舱与 AI 问答形成完整讲解路径。
          </div>
        </motion.div>
        <motion.div
          animate={{ opacity: [0.6, 1, 0.6] }}
          className="glass-panel rounded-[32px] p-6"
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
        >
          <div className="text-sm uppercase tracking-[0.28em] text-cyan-200/70">Touch Interaction</div>
          <div className="mt-3 text-2xl font-semibold">支持固定问题与现场即时提问</div>
          <div className="mt-3 text-sm leading-6 text-slate-300/75">
            适配展会触摸一体机，支持固定 16 个高频问题和基于知识库的专业答复。
          </div>
        </motion.div>
      </div>
    </section>
  );
}
