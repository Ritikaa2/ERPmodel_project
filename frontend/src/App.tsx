import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { LoginPage } from './pages/LoginPage.js';
import { SignUpPage } from './pages/SignUpPage.js';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.js';
import { ResetPasswordPage } from './pages/ResetPasswordPage.js';
import { ProtectedRoute } from './components/common/ProtectedRoute.js';
import { Header } from './components/layout/Header.js';
import { Sidebar, TabName } from './components/layout/Sidebar.js';

// 10 Blueprint Module Views
import { AdminDashboardView } from './components/dashboard/AdminDashboardView.js';
import { SalesDashboardView } from './components/dashboard/SalesDashboardView.js';
import { WarehouseDashboardView } from './components/dashboard/WarehouseDashboardView.js';
import { CustomersModuleView } from './components/modules/CustomersModuleView.js';
import { ProductsModuleView } from './components/modules/ProductsModuleView.js';
import { StockMovementsView } from './components/modules/StockMovementsView.js';
import { SalesChallanWizardView } from './components/modules/SalesChallanWizardView.js';
import { ChallanListDetailView } from './components/modules/ChallanListDetailView.js';
import { ReportsAnalyticsView } from './components/modules/ReportsAnalyticsView.js';
import { UserManagementView } from './components/modules/UserManagementView.js';
import { ActivityLogsView } from './components/modules/ActivityLogsView.js';

import {
  ArrowRight,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  ChevronRight,
  FileText,
  LayoutDashboard,
  Moon,
  PlusCircle,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Sun,
  TrendingUp,
  UserCog,
  UserPlus,
  Users,
  WalletCards,
  Warehouse,
  X,
  Menu,
  FileSpreadsheet,
} from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type ScreenMode = 'landing' | 'login' | 'signup' | 'forgot-password' | 'reset-password' | 'dashboard';
type SectionId = 'home' | 'features' | 'modules' | 'about' | 'contact';

const navItems: { label: string; id: SectionId }[] = [
  { label: 'Home', id: 'home' },
  { label: 'Features', id: 'features' },
  { label: 'Modules', id: 'modules' },
  { label: 'About', id: 'about' },
  { label: 'Contact', id: 'contact' },
];

const liveSalesData = [
  { day: '01 May', sales: 12000 },
  { day: '05 May', sales: 18500 },
  { day: '09 May', sales: 25200 },
  { day: '13 May', sales: 21000 },
  { day: '17 May', sales: 36500 },
  { day: '21 May', sales: 31200 },
  { day: '25 May', sales: 42100 },
  { day: '29 May', sales: 45500 },
];

const bottomStats = [
  { value: '120+', label: 'Total Customers', icon: Users, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40' },
  { value: '85+', label: 'Total Products', icon: Boxes, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40' },
  { value: '2.45L+', label: 'Total Sales (This Month)', icon: WalletCards, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40' },
  { value: '18+', label: 'Today\'s Challans', icon: FileText, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40' },
  { value: '100%', label: 'Secure & Reliable', icon: ShieldCheck, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40' },
];

const mainModules = [
  {
    title: 'Customer Management',
    desc: 'Manage leads, customers, GSTIN details, follow-ups & CRM interactions.',
    icon: Users,
    color: 'text-blue-600 bg-blue-100 dark:bg-blue-950/50',
    id: 'crm',
  },
  {
    title: 'Inventory Management',
    desc: 'Track products, stock levels, warehouse locations & low-stock alerts.',
    icon: Boxes,
    color: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-950/50',
    id: 'inventory',
  },
  {
    title: 'Sales & Challans',
    desc: 'Create challans, invoices, auto stock deduction & track sales orders.',
    icon: FileSpreadsheet,
    color: 'text-indigo-600 bg-indigo-100 dark:bg-indigo-950/50',
    id: 'challans',
  },
  {
    title: 'Reports & Analytics',
    desc: 'Get real-time revenue insights, sales performance & inventory trends.',
    icon: BarChart3,
    color: 'text-amber-600 bg-amber-100 dark:bg-amber-950/50',
    id: 'reports',
  },
  {
    title: 'User & Role Management',
    desc: 'Secure access with roles (Admin, Sales, Warehouse, Accounts).',
    icon: UserCog,
    color: 'text-purple-600 bg-purple-100 dark:bg-purple-950/50',
    id: 'roles',
  },
];

const MainAppContent: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [screen, setScreen] = useState<ScreenMode>('landing');
  const [activeTab, setActiveTab] = useState<TabName>('Dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    if (isAuthenticated) {
      setScreen('dashboard');
    }
  }, [isAuthenticated]);

  const scrollToSection = (id: SectionId) => {
    setActiveSection(id);
    setMobileMenuOpen(false);
    if (screen !== 'landing') {
      setScreen('landing');
      setTimeout(() => {
        const el = document.getElementById(id);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderActiveModuleTabContent = () => {
    switch (activeTab) {
      case 'Dashboard':
        if (user?.role === 'ADMIN') return <AdminDashboardView onNavigateToTab={(t: any) => setActiveTab(t)} />;
        if (user?.role === 'SALES') return <SalesDashboardView onNavigateToTab={(t: any) => setActiveTab(t)} />;
        return <WarehouseDashboardView onNavigateToTab={(t: any) => setActiveTab(t)} />;

      case 'Customers':
        return <CustomersModuleView />;

      case 'Products':
        return <ProductsModuleView />;

      case 'Stock Movements':
        return <StockMovementsView />;

      case 'Challans':
        return <ChallanListDetailView onCreateClick={() => setActiveTab('Create Challan')} />;

      case 'Create Challan':
        return <SalesChallanWizardView onComplete={() => setActiveTab('Challans')} />;

      case 'Reports':
        return <ReportsAnalyticsView />;

      case 'Users':
        return <UserManagementView />;

      case 'Activity Logs':
        return <ActivityLogsView />;

      case 'Settings':
        return (
          <div className="p-6 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">System & Store Settings</h3>
            <p className="text-xs text-slate-500">Configure company GSTIN, email notifications, and MySQL database connection parameters.</p>
            <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-xl text-xs space-y-2 font-mono">
              <p>• Database Status: Connected to MySQL (Pool size: 10)</p>
              <p>• Nodemailer Transport: SMTP Active</p>
              <p>• Firebase Auth: Configured</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  if (screen === 'login') {
    return (
      <LoginPage
        onNavigateToForgotPassword={() => setScreen('forgot-password')}
        onNavigateToSignUp={() => setScreen('signup')}
        onLoginSuccess={() => setScreen('dashboard')}
      />
    );
  }

  if (screen === 'signup') {
    return (
      <SignUpPage
        onNavigateToLogin={() => setScreen('login')}
        onSignUpSuccess={() => setScreen('dashboard')}
      />
    );
  }

  if (screen === 'forgot-password') {
    return (
      <ForgotPasswordPage
        onNavigateToLogin={() => setScreen('login')}
      />
    );
  }

  if (screen === 'reset-password') {
    return (
      <ResetPasswordPage
        onNavigateToLogin={() => setScreen('login')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* AUTHENTICATED WORKSPACE WITH DEEP NAVY SIDEBAR */}
      {screen === 'dashboard' ? (
        <ProtectedRoute onNavigateToLogin={() => setScreen('login')}>
          <div className="flex min-h-screen w-full">
            
            {/* Left Deep Navy Sidebar matching Blueprint Image */}
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              userRole={user?.role}
              onLogout={() => {
                logout();
                setScreen('landing');
              }}
            />

            {/* Right Main Content Area matching Blueprint Image */}
            <div className="flex-1 flex flex-col min-w-0 bg-slate-50 dark:bg-[#07090e]">
              <Header
                darkMode={darkMode}
                setDarkMode={setDarkMode}
                onLogout={() => {
                  logout();
                  setScreen('landing');
                }}
              />

              <main className="flex-1 p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
                
                {/* User Role Welcome Bar */}
                <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-5 rounded-2xl shadow-md border border-slate-800 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-bold">Good day, {user?.name} 👋</h2>
                      <span className="px-2.5 py-0.5 text-[10px] font-extrabold rounded-md bg-indigo-500/30 border border-indigo-400/40 text-indigo-200">
                        {user?.role} ROLE
                      </span>
                    </div>
                    <p className="text-xs text-indigo-200">
                      {user?.role === 'ADMIN' && 'Full ERP Control: Role-based Access, Customers Directory, Products Catalog, Stock Movement Audit & Revenue Reports.'}
                      {user?.role === 'SALES' && 'Sales CRM Module: Manage Client Accounts, Follow-up Reminders & 4-Step Sales Challan Creation.'}
                      {user?.role === 'WAREHOUSE' && 'Warehouse Operations: Track Inventory Bays, Stock Movements Log & Low Stock Alerts.'}
                      {user?.role === 'ACCOUNTS' && 'Accounts & Billing: Process Sales Challan Receivables & PDF Export Invoices.'}
                    </p>
                  </div>
                </div>

                {/* Main Dynamic View Content */}
                {renderActiveModuleTabContent()}

              </main>

            </div>

          </div>
        </ProtectedRoute>
      ) : (
        /* LANDING PAGE DESIGN */
        <div className="w-full flex flex-col min-h-screen">
          
          <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-20">
                
                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => setScreen('landing')}
                >
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="font-extrabold text-xl text-slate-900 dark:text-white tracking-tight">
                      Mini ERP Portal
                    </span>
                    <span className="block text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold tracking-wide">
                      Smart Business Management
                    </span>
                  </div>
                </div>

                <div className="hidden md:flex items-center space-x-1 bg-slate-100/70 dark:bg-slate-800/70 p-1.5 rounded-full border border-slate-200/60 dark:border-slate-700">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`px-5 py-2 text-xs font-bold rounded-full transition ${
                        activeSection === item.id
                          ? 'text-white bg-indigo-600 shadow-sm'
                          : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                <div className="hidden md:flex items-center gap-2.5">
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title="Toggle Theme"
                  >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                  {isAuthenticated ? (
                    <button
                      onClick={() => setScreen('dashboard')}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-500/20 flex items-center gap-2"
                    >
                      <span>Open Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setScreen('signup')}
                        className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                      >
                        <UserPlus className="w-4 h-4 text-indigo-600" />
                        <span>Sign Up</span>
                      </button>

                      <button
                        onClick={() => setScreen('login')}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-500/25 flex items-center gap-2"
                      >
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                <div className="md:hidden flex items-center gap-2">
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 rounded-lg"
                  >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    className="p-2 text-slate-600 dark:text-slate-300 rounded-lg"
                  >
                    {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                  </button>
                </div>

              </div>
            </div>
          </nav>

          <main className="flex-1">
            <section id="home" className="pt-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                
                <div className="lg:col-span-5 space-y-6">
                  
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                    <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                    <span>Full Stack 10-Module Operations Portal</span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.15]">
                    Manage Your Business <br />
                    Smarter with <br />
                    <span className="relative inline-block text-indigo-600 dark:text-indigo-400">
                      Mini ERP Portal
                      <svg className="absolute -bottom-2 left-0 w-full h-3 text-indigo-400/40 pointer-events-none" viewBox="0 0 200 12" fill="none">
                        <path d="M2 10C50 2 150 2 198 10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                      </svg>
                    </span>
                  </h1>

                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    A complete wholesale/distribution management system with CRM, Inventory, Sales Challans & Role-based Access.
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      <UserCog className="w-4 h-4 text-indigo-600" />
                      <span>Role-Based Access</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      <TrendingUp className="w-4 h-4 text-emerald-600" />
                      <span>Real-time Analytics</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      <Boxes className="w-4 h-4 text-blue-600" />
                      <span>Stock Movement Logs</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
                      <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                      <span>Export Invoice PDF</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-3">
                    <button
                      onClick={() => setScreen('signup')}
                      className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-2"
                    >
                      <span>Get Started - Register</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setScreen('login')}
                      className="px-7 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs transition"
                    >
                      Sign In to Portal →
                    </button>
                  </div>

                </div>

                <div className="lg:col-span-7">
                  <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-800 text-slate-100 relative overflow-hidden">
                    <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-white">Good Morning, Admin 👋</p>
                          <p className="text-[10px] text-slate-400">Mini ERP Operations Workspace</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-indigo-300 font-bold">10 Modules Built</span>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                      <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                        <p className="text-[10px] font-medium text-slate-400">Total Customers</p>
                        <p className="text-lg font-black text-white">120</p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                        <p className="text-[10px] font-medium text-slate-400">Total Products</p>
                        <p className="text-lg font-black text-white">85</p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                        <p className="text-[10px] font-medium text-slate-400">Low Stock Items</p>
                        <p className="text-lg font-black text-amber-400">7</p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                        <p className="text-[10px] font-medium text-slate-400">Today's Sales</p>
                        <p className="text-lg font-black text-white">₹2,45,000</p>
                      </div>
                    </div>

                    <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                      <p className="text-xs font-bold text-white mb-2">Sales Overview Trend (This Month)</p>
                      <div className="h-36 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={liveSalesData}>
                            <CartesianGrid strokeDasharray="2 2" opacity={0.1} />
                            <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} dot={{ r: 3, fill: '#6366f1' }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>
                </div>

              </div>
            </section>

            <section id="features" className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    10 Core Modules Built Exactly to Blueprint
                  </h2>
                  <div className="w-12 h-1 bg-indigo-600 mx-auto mt-2 rounded-full"></div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {mainModules.map((m, idx) => {
                    const Icon = m.icon;
                    return (
                      <div
                        key={idx}
                        onClick={() => setScreen('login')}
                        className="bg-slate-50 dark:bg-slate-800/80 p-5 rounded-2xl border border-slate-200/70 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 hover:shadow-xl transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-transform group-hover:scale-110 ${m.color}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-2">{m.title}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{m.desc}</p>
                        </div>
                        <div className="mt-4 pt-3 border-t border-slate-200/60 dark:border-slate-700/60 flex justify-end">
                          <div className="w-7 h-7 rounded-full bg-indigo-600 text-white flex items-center justify-center group-hover:translate-x-1 transition-transform">
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </section>
          </main>

          <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-indigo-600" />
                <span className="font-bold text-slate-900 dark:text-white">Mini ERP Portal</span>
                <span>© 2026 Enterprise Operations Portal</span>
              </div>
              <div>
                <span>Deep Navy Sidebar Layout • MySQL & Express REST API</span>
              </div>
            </div>
          </footer>
        </div>
      )}

    </div>
  );
};

export function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

export default App;
