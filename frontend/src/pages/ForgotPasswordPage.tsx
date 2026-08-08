import React, { useState } from 'react';
import { authService, ForgotPasswordResponse } from '../services/auth.service.js';
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle, KeyRound, ExternalLink, ShieldCheck, Copy, Check } from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigateToLogin: () => void;
  onNavigateToResetToken?: (token: string) => void;
}

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({
  onNavigateToLogin,
  onNavigateToResetToken,
}) => {
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [emailData, setEmailData] = useState<ForgotPasswordResponse | null>(null);
  const [apiError, setApiError] = useState('');
  const [copied, setCopied] = useState(false);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');
    setEmailData(null);

    if (!validateEmail(email)) {
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await authService.forgotPassword(email.trim());
      setSuccessMessage(res.message || 'If an account exists for this email, a password reset link has been sent.');
      if (res.data) {
        setEmailData(res.data);
      }
    } catch (err: any) {
      setApiError(err.message || 'Unable to process request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        
        {/* Top Back to Login */}
        <button
          onClick={onNavigateToLogin}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 mb-6 transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Sign In</span>
        </button>

        {/* Title */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-sm">
            <KeyRound className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Forgot password?</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Enter your registered business email address to receive password reset instructions.
          </p>
        </div>

        {/* Success Card with Interactive Reset Link Preview */}
        {successMessage ? (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">Email Sent Successfully</h3>
              </div>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed">
                {successMessage}
              </p>
            </div>

            {/* Registered Email Reset Link Simulated Inbox Card */}
            {emailData?.resetToken && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white">Simulated Reset Link Email</span>
                  </div>
                  <span className="text-[10px] bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold px-2 py-0.5 rounded">
                    Sent to {emailData.emailSentTo}
                  </span>
                </div>

                <div className="p-2.5 bg-white dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-[11px] text-slate-600 dark:text-slate-300 flex items-center justify-between gap-2 overflow-hidden">
                  <span className="truncate">{emailData.resetLink}</span>
                  <button
                    onClick={() => copyToClipboard(emailData.resetLink || '')}
                    className="p-1 text-slate-400 hover:text-indigo-600 shrink-0"
                    title="Copy Link"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>

                {onNavigateToResetToken && (
                  <button
                    onClick={() => onNavigateToResetToken(emailData.resetToken!)}
                    className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
                  >
                    <span>Open Reset Password Page</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}

            <button
              onClick={onNavigateToLogin}
              className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition"
            >
              Return to Sign In
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {apiError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Registered Business Email
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
                  className={`w-full pl-10 pr-3 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl border text-sm transition focus:outline-none focus:ring-2 ${
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Reset Link...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>
          </form>
        )}

        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Secure Password Recovery • Non-Enumerating Protection</span>
          </p>
        </div>

      </div>
    </div>
  );
};
