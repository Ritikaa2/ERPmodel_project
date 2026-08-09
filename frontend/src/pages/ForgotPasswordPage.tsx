import React, { useState, useEffect } from 'react';
import { authService, ForgotPasswordResponse } from '../services/auth.service.js';
import {
  Mail,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  RefreshCw,
  Clock,
} from 'lucide-react';

interface ForgotPasswordPageProps {
  onNavigateToLogin: () => void;
}

type Step = 'REQUEST_OTP' | 'VERIFY_OTP' | 'NEW_PASSWORD' | 'SUCCESS';

export const ForgotPasswordPage: React.FC<ForgotPasswordPageProps> = ({ onNavigateToLogin }) => {
  const [step, setStep] = useState<Step>('REQUEST_OTP');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [apiError, setApiError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [emailData, setEmailData] = useState<ForgotPasswordResponse | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // OTP Countdown timer
  const [timer, setTimer] = useState<number>(60);
  const [canResend, setCanResend] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (step === 'VERIFY_OTP' && timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else if (timer === 0) {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [step, timer]);

  const validateEmail = (val: string): boolean => {
    if (!val.trim()) {
      setEmailError('Email is required');
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim())) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');

    if (!validateEmail(email)) return;

    setIsSubmitting(true);

    try {
      const res = await authService.forgotPassword(email.trim());
      setSuccessMessage(res.message);
      if (res.data) {
        setEmailData(res.data);
        if (res.data.otpCode) {
          setOtpCode(res.data.otpCode); // Pre-fill generated OTP for instant smooth testing!
        }
      }
      setStep('VERIFY_OTP');
      setTimer(60);
      setCanResend(false);
    } catch (err: any) {
      setApiError(err.message || 'Unable to process request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setOtpError('');

    if (!otpCode || otpCode.length !== 6) {
      setOtpError('Please enter a 6-digit OTP code');
      return;
    }

    setIsSubmitting(true);

    try {
      await authService.verifyOTP(email.trim(), otpCode.trim());
      setStep('NEW_PASSWORD');
    } catch (err: any) {
      setOtpError(err.message || 'Invalid or expired OTP code');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setPasswordError('');
    setConfirmError('');

    let isValid = true;

    if (!newPassword || newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmError('Please confirm your password');
      isValid = false;
    } else if (confirmPassword !== newPassword) {
      setConfirmError('Passwords do not match');
      isValid = false;
    }

    if (!isValid) return;

    setIsSubmitting(true);

    try {
      const msg = await authService.resetPasswordWithOTP(email.trim(), otpCode.trim(), newPassword);
      setSuccessMessage(msg || 'Password updated successfully!');
      setStep('SUCCESS');
    } catch (err: any) {
      setApiError(err.message || 'Failed to reset password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl p-8 border border-slate-200 dark:border-slate-800 relative overflow-hidden">
        
        {/* Top Back Link */}
        <button
          onClick={onNavigateToLogin}
          className="inline-flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 mb-6 transition group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Sign In</span>
        </button>

        {/* Header Icon */}
        <div className="mb-6">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 shadow-sm">
            <KeyRound className="w-6 h-6" />
          </div>

          {step === 'REQUEST_OTP' && (
            <>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Forgot password?</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Enter your registered business email address to receive a 6-digit OTP reset code via Nodemailer SMTP.
              </p>
            </>
          )}

          {step === 'VERIFY_OTP' && (
            <>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Enter OTP Code</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                We've sent a 6-digit OTP code to <span className="font-bold text-indigo-600 dark:text-indigo-400">{email}</span>.
              </p>
            </>
          )}

          {step === 'NEW_PASSWORD' && (
            <>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Set New Password</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Create a strong new password for your Mini ERP account.
              </p>
            </>
          )}

          {step === 'SUCCESS' && (
            <>
              <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Password Reset Complete</h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Your password has been successfully updated.
              </p>
            </>
          )}
        </div>

        {apiError && (
          <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>{apiError}</span>
          </div>
        )}

        {/* STEP 1: REQUEST OTP */}
        {step === 'REQUEST_OTP' && (
          <form onSubmit={handleRequestOTP} className="space-y-4" noValidate>
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
                      : 'border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-indigo-200'
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
                  <span>Dispatching OTP Email...</span>
                </>
              ) : (
                <span>Send 6-Digit OTP Code</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: VERIFY OTP CODE */}
        {step === 'VERIFY_OTP' && (
          <form onSubmit={handleVerifyOTP} className="space-y-4" noValidate>
            
            {/* Interactive OTP Inbox Card for testing */}
            {emailData?.otpCode && (
              <div className="p-3 bg-indigo-50/80 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 rounded-2xl text-xs space-y-1">
                <div className="flex items-center justify-between text-indigo-900 dark:text-indigo-300 font-bold">
                  <span>📩 Nodemailer Dispatch Notification</span>
                  <span className="bg-indigo-600 text-white text-[10px] px-2 py-0.5 rounded font-mono">OTP: {emailData.otpCode}</span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  OTP Code pre-filled into the field below for instant smooth testing.
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                6-Digit Verification OTP Code
              </label>
              <div className="relative">
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="849204"
                  className="w-full tracking-widest font-mono text-center font-black text-xl py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
                />
              </div>
              {otpError && (
                <p className="text-[11px] text-rose-500 mt-1 font-semibold">{otpError}</p>
              )}
            </div>

            {/* Resend OTP Timer */}
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Expires in: <strong className="font-bold">{timer}s</strong>
              </span>
              <button
                type="button"
                disabled={!canResend}
                onClick={handleRequestOTP}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 disabled:text-slate-400 hover:underline flex items-center gap-1"
              >
                <RefreshCw className="w-3 h-3" /> Resend OTP
              </button>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying OTP Code...</span>
                </>
              ) : (
                <span>Verify OTP & Continue</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 3: SET NEW PASSWORD */}
        {step === 'NEW_PASSWORD' && (
          <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {passwordError && (
                <p className="text-[11px] text-rose-500 mt-1 font-semibold">{passwordError}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Confirm New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password"
                  className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              {confirmError && (
                <p className="text-[11px] text-rose-500 mt-1 font-semibold">{confirmError}</p>
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
                  <span>Updating Password...</span>
                </>
              ) : (
                <span>Update Password</span>
              )}
            </button>
          </form>
        )}

        {/* STEP 4: SUCCESS */}
        {step === 'SUCCESS' && (
          <div className="p-5 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-center space-y-4 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-600 dark:text-emerald-300 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-200">Password Updated Successfully</h3>
              <p className="text-xs text-emerald-700 dark:text-emerald-300 leading-relaxed mt-1">
                You can now log in to your Mini ERP account using your new password.
              </p>
            </div>
            <button
              onClick={onNavigateToLogin}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition"
            >
              Sign In with New Password
            </button>
          </div>
        )}

        {/* Security Footer */}
        <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1.5 font-medium">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Nodemailer SMTP Dispatch • SSL Encrypted Security</span>
          </p>
        </div>

      </div>
    </div>
  );
};
