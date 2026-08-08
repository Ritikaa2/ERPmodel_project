import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { GoogleIcon } from '../components/common/GoogleIcon.js';
import { authService } from '../services/auth.service.js';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  ShieldCheck,
  ShoppingCart,
  AlertCircle,
  Loader2,
  CheckCircle2,
  UserPlus,
} from 'lucide-react';

interface LoginPageProps {
  onNavigateToForgotPassword: () => void;
  onNavigateToSignUp: () => void;
  onLoginSuccess: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onNavigateToForgotPassword,
  onNavigateToSignUp,
  onLoginSuccess,
}) => {
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [apiError, setApiError] = useState('');
  const [googleNotice, setGoogleNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (val: string): boolean => {
    if (!val.trim()) {
      setEmailError('Email is required');
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val.trim())) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const validatePassword = (val: string): boolean => {
    if (!val) {
      setPasswordError('Password is required');
      return false;
    }
    setPasswordError('');
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setGoogleNotice('');

    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login(email.trim(), password, rememberMe);
      onLoginSuccess();
    } catch (err: any) {
      setApiError(err.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setApiError('');
    setGoogleNotice('');
    try {
      await authService.googleAuth();
    } catch (err: any) {
      setGoogleNotice(err.message || 'Google OAuth is not configured in backend environment.');
    }
  };

  const fillDemoAccount = (roleEmail: string, rolePass: string) => {
    setEmail(roleEmail);
    setPassword(rolePass);
    setEmailError('');
    setPasswordError('');
    setApiError('');
    setGoogleNotice('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-200 dark:border-slate-800">
        
        {/* LEFT COLUMN: Clean Matching Image & Minimal Branding (Desktop Only) */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950 p-8 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          {/* Logo & Brand Header */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-lg tracking-tight">Mini ERP Portal</h1>
                <p className="text-[11px] text-indigo-300">Smart Operations Hub</p>
              </div>
            </div>
          </div>

          {/* Clean Matching Generated ERP Graphic */}
          <div className="relative z-10 my-4 flex items-center justify-center">
            <img
              src="/erp_login_illustration.png"
              alt="Mini ERP Operations"
              className="w-full max-w-[240px] h-auto object-contain rounded-2xl shadow-md border border-white/10 hover:scale-105 transition-transform duration-300"
            />
          </div>

          {/* Minimal Text & Security Footer */}
          <div className="relative z-10 space-y-3">
            <h2 className="text-lg font-bold text-white leading-snug">
              Unified Enterprise Management
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Streamline inventory, customer CRM, sales challans & accounts securely.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 border-t border-white/10 pt-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Role-Based Security (Admin, Sales, Warehouse, Accounts)</span>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Clean & Simple Production Login Form */}
        <div className="lg:col-span-7 p-6 sm:p-10 flex flex-col justify-between">
          <div>
            {/* Header */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-3 lg:hidden">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <span className="font-extrabold text-slate-900 dark:text-white text-base">Mini ERP Portal</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Welcome back</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                Sign in to your Mini ERP account to continue.
              </p>
            </div>

            {/* Clean Quick Demo Role Selector */}
            <div className="mb-6 p-3.5 bg-indigo-50/70 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 rounded-2xl">
              <p className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Demo Roles (Click to fill credentials):
              </p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <button
                  type="button"
                  onClick={() => fillDemoAccount('admin@minierp.in', 'Admin@123')}
                  className="py-1.5 px-2 text-xs font-bold bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 rounded-xl border border-indigo-200 dark:border-slate-700 hover:bg-indigo-100 dark:hover:bg-slate-800 transition text-center shadow-2xs"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('sales@minierp.in', 'Sales@123')}
                  className="py-1.5 px-2 text-xs font-bold bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 rounded-xl border border-indigo-200 dark:border-slate-700 hover:bg-indigo-100 dark:hover:bg-slate-800 transition text-center shadow-2xs"
                >
                  Sales
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('warehouse@minierp.in', 'Warehouse@123')}
                  className="py-1.5 px-2 text-xs font-bold bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 rounded-xl border border-indigo-200 dark:border-slate-700 hover:bg-indigo-100 dark:hover:bg-slate-800 transition text-center shadow-2xs"
                >
                  Warehouse
                </button>
                <button
                  type="button"
                  onClick={() => fillDemoAccount('accounts@minierp.in', 'Accounts@123')}
                  className="py-1.5 px-2 text-xs font-bold bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 rounded-xl border border-indigo-200 dark:border-slate-700 hover:bg-indigo-100 dark:hover:bg-slate-800 transition text-center shadow-2xs"
                >
                  Accounts
                </button>
              </div>
            </div>

            {/* Error Notifications */}
            {apiError && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{apiError}</span>
              </div>
            )}

            {googleNotice && (
              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 rounded-xl text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span>{googleNotice}</span>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-4" noValidate>
              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (emailError) validateEmail(e.target.value);
                    }}
                    placeholder="admin@minierp.in"
                    className={`w-full pl-10 pr-3 py-2.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                      emailError
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-900/50'
                    }`}
                  />
                </div>
                {emailError && (
                  <p className="text-[11px] text-rose-500 mt-1 font-semibold">{emailError}</p>
                )}
              </div>

              {/* Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={onNavigateToForgotPassword}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 hover:underline"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (passwordError) validatePassword(e.target.value);
                    }}
                    placeholder="••••••••"
                    className={`w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
                      passwordError
                        ? 'border-rose-400 focus:ring-rose-200'
                        : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-200 dark:focus:ring-indigo-900/50'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {passwordError && (
                  <p className="text-[11px] text-rose-500 mt-1 font-semibold">{passwordError}</p>
                )}
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">Remember me</span>
                </label>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-sm font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign In</span>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-bold">OR</span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-2.5 px-4 bg-white dark:bg-slate-950 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-bold transition flex items-center justify-center gap-3 shadow-2xs"
            >
              <GoogleIcon className="w-4 h-4" />
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Sign Up Link Footer */}
          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-xs text-slate-500">
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={onNavigateToSignUp}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
              >
                <UserPlus className="w-3.5 h-3.5" /> Sign Up / Register
              </button>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
