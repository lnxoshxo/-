import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginAdmin } from '../lib/api';
import { SectionHeader } from '../components/SectionHeader';

const STORAGE_KEY = 'siicservice_admin_token';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('siicservice123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await loginAdmin({ username, password });
      localStorage.setItem(STORAGE_KEY, result.token);
      navigate('/admin');
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败');
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-2xl py-12">
      <div className="glass-panel rounded-[32px] p-8 lg:p-12">
        <SectionHeader
          eyebrow="ADMIN ACCESS"
          title="后台登录"
          description="进入内容与知识库管理后台。当前为演示版简易鉴权，后续可切换为正式账号体系。"
        />
        <form className="space-y-4" onSubmit={onSubmit}>
          <label className="block text-sm text-slate-300/80">
            用户名
            <input className="mt-2 w-full rounded-[16px] border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" value={username} onChange={(event) => setUsername(event.target.value)} />
          </label>
          <label className="block text-sm text-slate-300/80">
            密码
            <input className="mt-2 w-full rounded-[16px] border border-white/10 bg-white/5 px-4 py-3 text-white outline-none" type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error ? <div className="rounded-[16px] border border-rose-300/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">{error}</div> : null}
          <button className="rounded-full bg-cyan-400 px-6 py-4 text-base font-medium text-slate-950" disabled={loading} type="submit">
            {loading ? '登录中...' : '进入后台'}
          </button>
        </form>
      </div>
    </section>
  );
}

export function hasAdminToken() {
  return Boolean(localStorage.getItem(STORAGE_KEY));
}
