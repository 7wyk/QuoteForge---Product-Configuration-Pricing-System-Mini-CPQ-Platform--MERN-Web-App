import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Zap, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    const result = await login(data.email, data.password);
    setIsLoading(false);
    if (result?.success === false) {
      setError(result.message);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      {/* Background gradient orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-brand-800/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-brand-900/30 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-brand-600 rounded-2xl flex items-center justify-center shadow-lg shadow-brand-900/50">
            <Zap size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white">QuoteForge</h1>
            <p className="text-slate-500 text-xs">CPQ Platform</p>
          </div>
        </div>

        <div className="card p-6 shadow-2xl">
          <h2 className="text-lg font-semibold text-white mb-1">Welcome back</h2>
          <p className="text-slate-400 text-sm mb-6">Sign in to your account to continue</p>

          {error && (
            <div className="mb-4 px-4 py-3 bg-rose-900/30 border border-rose-700/50 rounded-lg text-sm text-rose-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input
                id="email"
                type="email"
                className="input-field"
                placeholder="you@company.com"
                {...register('email', { required: 'Email is required' })}
              />
              {errors.email && <p className="text-xs text-rose-400 mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  className="input-field pr-10"
                  placeholder="••••••••"
                  {...register('password', { required: 'Password is required' })}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-xs text-rose-400 mt-1">{errors.password.message}</p>}
            </div>

            <button
              id="login-btn"
              type="submit"
              disabled={isLoading}
              className="btn-primary w-full justify-center py-2.5 mt-2"
            >
              {isLoading ? <Spinner size="sm" /> : <LogIn size={16} />}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo credentials hint */}
          <div className="mt-5 p-3 bg-surface rounded-lg border border-surface-border">
            <p className="text-xs font-semibold text-slate-400 mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-slate-500">
              <p>🔐 Admin: <span className="text-slate-400">admin@quoteforge.com / Admin@123</span></p>
              <p>💼 Sales: <span className="text-slate-400">sales@quoteforge.com / Sales@123</span></p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
