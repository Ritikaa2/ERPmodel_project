import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { GoogleIcon } from '../components/common/GoogleIcon.js';
import { authService } from '../services/auth.service.js';
import { UserRole } from '../types/auth.types.js';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  User,
  Phone,
  ShieldCheck,
  ShoppingCart,
  AlertCircle,
  Loader2,
  CheckCircle2,
  ArrowLeft,
  UserCheck,
} from 'lucide-react';

interface SignUpPageProps {
  onNavigateToLogin: () => void;
  onSignUpSuccess: () => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({
  onNavigateToLogin,
  onSignUpSuccess,
}) => {
  const { register, googleLogin } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [role, setRole] = useState<UserRole>('SALES');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmError, setConfirmError] = useState('');
  const [apiError, setApiError] = useState('');
  const [googleNotice, setGoogleNotice] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const validate = (): boolean => {
    let isValid = true;

    if (!name.trim() || name.trim().length < 2) {
      setNameError('Full name must be at least 2 characters');
      isValid = false;
    } else {
      setNameError('');
    }

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setEmailError('Please enter a valid business email address');
      isValid = false;
    } else {
      setEmailError('');
    }

    if (phone && !/^[6-9]\d{9}$/.test(phone.replace(/\s+/g, ''))) {
      setPhoneError('Please enter a valid 10-digit Indian mobile number');
      isValid = false;
    } else {
      setPhoneError('');
    }

    if (!password || password.length < 6) {
      setPasswordError('Password must be at least 6 characters');
      isValid = false;
    } else {
      setPasswordError('');
    }

    if (!confirmPassword) {
      setConfirmError('Please confirm your password');
      isValid = false;
    } else if (confirmPassword !== password) {
      setConfirmError('Passwords do not match');
      isValid = false;
    } else {
      setConfirmError('');
    }

    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setGoogleNotice('');

    if (!validate()) return;

    setIsSubmitting(true);

    try {
      await register({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        password,
        confirmPassword,
      });
      onSignUpSuccess();
    } catch (err: any) {
      setApiError(err.message || 'Registration failed. Please check details and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setApiError('');
    setGoogleNotice('');
    setIsGoogleSubmitting(true);
    try {
      await googleLogin();
      onSignUpSuccess();
    } catch (err: any) {
      setGoogleNotice(err.message || 'Google Sign-In encountered an issue.');
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  const fillDemoSignUp = (selectedRole: UserRole) => {
    const randomId = Math.floor(100 + Math.random() * 900);
    setName(`New ${selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()} Staff`);
    setEmail(`${selectedRole.toLowerCase()}${randomId}@minierp.in`);
    setPhone('9876543210');
    setRole(selectedRole);
    setPassword('Pass@123');
    setConfirmPassword('Pass@123');
    setNameError('');
    setEmailError('');
    setPhoneError('');
    setPasswordError('');
    setConfirmError('');
    setApiError('');
    setGoogleNotice('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl w-full bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 border border-slate-200 dark:border-slate-800">
        
        {/* LEFT PANEL: Graphic & Information */}
        <div className="hidden lg:flex lg:col-span-5 bg-gradient-to-b from-indigo-950 via-slate-900 to-indigo-950 p-8 flex-col justify-between text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/30 text-white">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h1 className="font-extrabold text-lg tracking-tight">Mini ERP Portal</h1>
                <p className="text-[11px] text-indigo-300">Account Registration</p>
              </div>
            </div>
          </div>

          <div className="relative z-10 my-4 flex items-center justify-center">
            <img
              src="/erp_login_illustration.png"
              alt="Mini ERP Account Creation"
              className="w-full max-w-[220px] h-auto object-contain rounded-2xl shadow-md border border-white/10"
            />
          </div>

          <div className="relative z-10 space-y-3">
            <h2 className="text-lg font-bold text-white leading-snug">
              Join Your Business ERP Network
            </h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              Create an employee account with Role-Based Access permissions for Admin, Sales, Warehouse, or Accounts.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 border-t border-white/10 pt-3">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Strict Role-Based Access Control Enabled</span>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Sign Up Form */}
        <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Create an Account</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">
                  Fill in your details to register a new user account.
                </p>
              </div>
              <button
                onClick={onNavigateToLogin}
                className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
              </button>
            </div>

            {/* Quick Preset Buttons */}
            <div className="mb-4 p-3 bg-indigo-50/70 dark:bg-slate-800/80 border border-indigo-100 dark:border-slate-700 rounded-2xl">
              <p className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 mb-1.5 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" /> Quick Fill Demo Data by Role:
              </p>
              <div className="grid grid-cols-4 gap-1.5">
                {(['ADMIN', 'SALES', 'WAREHOUSE', 'ACCOUNTS'] as UserRole[]).map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => fillDemoSignUp(r)}
                    className="py-1 px-2 text-[11px] font-bold bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 rounded-lg border border-indigo-200 dark:border-slate-700 hover:bg-indigo-100 dark:hover:bg-slate-800 transition text-center shadow-2xs"
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {apiError && (
              <div className="mb-4 p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-rose-700 dark:text-rose-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            {googleNotice && (
              <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-300 rounded-xl text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{googleNotice}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
              
              {/* Full Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Full Name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Rajesh Sharma"
                      className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {nameError && <p className="text-[11px] text-rose-500 mt-0.5 font-medium">{nameError}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Assign Role
                  </label>
                  <div className="relative">
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      className="w-full px-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-bold"
                    >
                      <option value="ADMIN">ADMIN (Full Access)</option>
                      <option value="SALES">SALES (CRM & Challans)</option>
                      <option value="WAREHOUSE">WAREHOUSE (Stock Control)</option>
                      <option value="ACCOUNTS">ACCOUNTS (Receivables)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Email & Mobile */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Business Email
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Mail className="w-4 h-4" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="user@minierp.in"
                      className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {emailError && <p className="text-[11px] text-rose-500 mt-0.5 font-medium">{emailError}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Mobile Number (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Phone className="w-4 h-4" />
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="9820012345"
                      className="w-full pl-9 pr-3 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {phoneError && <p className="text-[11px] text-rose-500 mt-0.5 font-medium">{phoneError}</p>}
                </div>
              </div>

              {/* Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Min 6 chars"
                      className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                  {passwordError && <p className="text-[11px] text-rose-500 mt-0.5 font-medium">{passwordError}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter password"
                      className="w-full pl-9 pr-8 py-2 bg-white dark:bg-slate-950 text-slate-900 dark:text-white rounded-xl border border-slate-300 dark:border-slate-700 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  {confirmError && <p className="text-[11px] text-rose-500 mt-0.5 font-medium">{confirmError}</p>}
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Register Account</span>
                )}
              </button>
            </form>

            <div className="relative my-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-white dark:bg-slate-900 px-3 text-slate-400 font-bold">OR</span>
              </div>
            </div>

            <button
              type="button"
              disabled={isGoogleSubmitting}
              onClick={handleGoogleLogin}
              className="w-full py-2 px-4 bg-white dark:bg-slate-950 hover:bg-slate-50 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-2xs"
            >
              {isGoogleSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span>Connecting to Google...</span>
                </>
              ) : (
                <>
                  <GoogleIcon className="w-4 h-4" />
                  <span>Continue with Google</span>
                </>
              )}
            </button>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <p className="text-[11px] text-slate-500">
              Already have an account?{' '}
              <button
                type="button"
                onClick={onNavigateToLogin}
                className="font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Sign In
              </button>
            </p>
          </div>
        </div>

      </div>
    </div>
  );
};
