import React, { useState } from 'react';
import { authService } from '../services/auth.service.js';
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';

interface ResetPasswordPageProps {
  token?: string;
  onNavigateToLogin: () => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({
  token = 'demo-reset-token',
  onNavigateToLogin,
}) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = (): boolean => {
    let isValid = true;

    if (!newPassword) {
      setPasswordError('New password is required');
      isValid = false;
    } else if (newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (!confirmPassword) {
      setConfirmError('Please confirm your new password');
      isValid = false;
    } else if (confirmPassword !== newPassword) {
      setConfirmError('Password confirmation does not match');
      isValid = false;
    } else {
      setConfirmError('');
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setSuccessMessage('');

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      const msg = await authService.resetPassword(token, newPassword);
      setSuccessMessage(msg || 'Password updated successfully! You can now sign in.');
    } catch (err: any) {
      setApiError(err.message || 'Invalid or expired password reset link.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 border border-slate-200 dark:border-slate-700">
        
        <div className="mb-6">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reset Password</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Create a new strong password for your account.
          </p>
        </div>

        {successMessage ? (
          <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-xl text-center">
            <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-emerald-900 dark:text-emerald-200 mb-1">Password Reset Complete</h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed mb-4">
              {successMessage}
            </p>
            <button
              onClick={onNavigateToLogin}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg transition"
            >
              Sign In with New Password
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {apiError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            {/* New Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className={`w-full pl-9 pr-10 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg border text-sm transition focus:outline-none focus:ring-2 ${
                    passwordError
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-200'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{passwordError}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className={`w-full pl-9 pr-10 py-2.5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white rounded-lg border text-sm transition focus:outline-none focus:ring-2 ${
                    confirmError
                      ? 'border-rose-400 focus:ring-rose-200'
                      : 'border-slate-300 dark:border-slate-600 focus:border-indigo-500 focus:ring-indigo-200'
                  }`}
                />
              </div>
              {confirmError && (
                <p className="text-[11px] text-rose-500 mt-1 font-medium">{confirmError}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Reset Password</span>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
