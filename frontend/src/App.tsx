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
  CheckCircle2,
  Zap,
  Globe,
  Layers,
  Clock,
  ChevronUp,
  Calculator,
  ArrowUpRight,
  Database,
  Activity,
  Award,
  Lock,
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
type SectionId = 'home' | 'features' | 'modules' | 'calculator' | 'about' | 'contact';

const navItems: { label: string; id: SectionId }[] = [
  { label: 'Home', id: 'home' },
  { label: 'Features', id: 'features' },
  { label: 'Modules', id: 'modules' },
  { label: 'ROI Calculator', id: 'calculator' },
  { label: 'About', id: 'about' },
];

// Data Sets for Hero Chart Simulation
const salesDatasets = {
  '7D': [
    { day: 'Mon', sales: 18000, orders: 42 },
    { day: 'Tue', sales: 24000, orders: 58 },
    { day: 'Wed', sales: 21000, orders: 51 },
    { day: 'Thu', sales: 32000, orders: 74 },
    { day: 'Fri', sales: 29000, orders: 68 },
    { day: 'Sat', sales: 41000, orders: 92 },
    { day: 'Sun', sales: 45500, orders: 104 },
  ],
  '30D': [
    { day: '01 May', sales: 12000, orders: 28 },
    { day: '05 May', sales: 18500, orders: 40 },
    { day: '09 May', sales: 25200, orders: 62 },
    { day: '13 May', sales: 21000, orders: 48 },
    { day: '17 May', sales: 36500, orders: 85 },
    { day: '21 May', sales: 31200, orders: 71 },
    { day: '25 May', sales: 42100, orders: 98 },
    { day: '29 May', sales: 48500, orders: 112 },
  ],
  '90D': [
    { day: 'Mar', sales: 180000, orders: 420 },
    { day: 'Apr', sales: 240000, orders: 580 },
    { day: 'May', sales: 310000, orders: 750 },
    { day: 'Jun', sales: 420000, orders: 980 },
  ],
};

const clientLogos = [
  { name: 'Apex Logistics', rating: '4.9/5', tag: 'Distribution' },
  { name: 'Nexus Wholesale', rating: '5.0/5', tag: 'FMCG Supply' },
  { name: 'Zenith Global', rating: '4.8/5', tag: 'Import/Export' },
  { name: 'Vanguard Retail', rating: '4.9/5', tag: 'Multi-Store' },
  { name: 'Hyperion Express', rating: '5.0/5', tag: 'Warehousing' },
  { name: 'Starlight Trade', rating: '4.7/5', tag: 'Pharma Retail' },
];

const mainModules = [
  {
    title: 'Customer Management (CRM)',
    desc: '360° lead tracking, client ledgers, GSTIN verification & credit term tracking.',
    icon: Users,
    color: 'from-blue-500 to-cyan-500',
    lightBg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
    category: 'CRM & Sales',
  },
  {
    title: 'Inventory & Warehousing',
    desc: 'Multi-bin stock tracking, SKU variants, auto reorder triggers & batch control.',
    icon: Boxes,
    color: 'from-emerald-500 to-teal-500',
    lightBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
    category: 'Operations',
  },
  {
    title: 'Sales & Delivery Challans',
    desc: '4-step wizard for instant dispatch note creation, stock locks & PDF invoices.',
    icon: FileSpreadsheet,
    color: 'from-indigo-500 to-purple-500',
    lightBg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400',
    category: 'CRM & Sales',
  },
  {
    title: 'Real-time Analytics',
    desc: 'Executive summaries, gross margin calculators, top customer reports & heatmaps.',
    icon: BarChart3,
    color: 'from-amber-500 to-orange-500',
    lightBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
    category: 'Analytics',
  },
  {
    title: 'RBAC Access Control',
    desc: 'Granular role profiles (Admin, Sales, Warehouse, Accounts) with security logs.',
    icon: UserCog,
    color: 'from-purple-500 to-pink-500',
    lightBg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
    category: 'Security',
  },
  {
    title: 'Stock Movements Audit',
    desc: 'Audit trails for every stock in/out event with user signatures and time stamps.',
    icon: Warehouse,
    color: 'from-rose-500 to-red-500',
    lightBg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400',
    category: 'Operations',
  },
];

const MainAppContent: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [screen, setScreen] = useState<ScreenMode>('landing');
  const [activeTab, setActiveTab] = useState<TabName>('Dashboard');
  const [darkMode, setDarkMode] = useState(true);
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Landing Page Interactive State
  const [chartRange, setChartRange] = useState<'7D' | '30D' | '90D'>('30D');
  const [moduleFilter, setModuleFilter] = useState<'All' | 'CRM & Sales' | 'Operations' | 'Analytics' | 'Security'>('All');
  const [activeFeatureTab, setActiveFeatureTab] = useState<'crm' | 'warehouse' | 'challan' | 'security'>('crm');

  // ROI Calculator State
  const [monthlyOrders, setMonthlyOrders] = useState<number>(350);
  const [teamSize, setTeamSize] = useState<number>(12);

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

  const filteredModules = moduleFilter === 'All' 
    ? mainModules 
    : mainModules.filter(m => m.category === moduleFilter);

  const estimatedHoursSaved = Math.round((monthlyOrders * 0.25) + (teamSize * 8));
  const estimatedMoneySaved = Math.round(estimatedHoursSaved * 450);

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
    <div className="min-h-screen bg-slate-50 dark:bg-[#07090e] text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* AUTHENTICATED WORKSPACE WITH DEEP NAVY SIDEBAR */}
      {screen === 'dashboard' ? (
        <ProtectedRoute onNavigateToLogin={() => setScreen('login')}>
          <div className="flex min-h-screen w-full">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={setActiveTab}
              userRole={user?.role}
              onLogout={() => {
                logout();
                setScreen('landing');
              }}
            />

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

                {renderActiveModuleTabContent()}
              </main>
            </div>
          </div>
        </ProtectedRoute>
      ) : (
        /* PREMIUM HIGH-CONVERSION LANDING PAGE DESIGN */
        <div className="w-full flex flex-col min-h-screen relative overflow-hidden">
          
          {/* Ambient Lighting Gradients */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/20 to-pink-500/10 blur-[120px] pointer-events-none rounded-full" />
          <div className="absolute top-[800px] -right-40 w-96 h-96 bg-blue-600/15 blur-[100px] pointer-events-none rounded-full" />
          
          {/* Glassmorphic Navbar */}
          <nav className="bg-white/80 dark:bg-[#090d16]/80 backdrop-blur-xl sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800/80 transition-all">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-20">
                
                {/* Brand Logo */}
                <div
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => setScreen('landing')}
                >
                  <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="font-black text-xl text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
                      Mini ERP <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-bold">PRO</span>
                    </span>
                    <span className="block text-[11px] text-slate-500 dark:text-slate-400 font-medium tracking-wide">
                      Enterprise Suite v2.4
                    </span>
                  </div>
                </div>

                {/* Navigation Links */}
                <div className="hidden md:flex items-center space-x-1 bg-slate-100/80 dark:bg-slate-800/60 backdrop-blur-md p-1.5 rounded-full border border-slate-200/80 dark:border-slate-700/80">
                  {navItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => scrollToSection(item.id)}
                      className={`px-5 py-2 text-xs font-bold rounded-full transition-all ${
                        activeSection === item.id
                          ? 'text-white bg-indigo-600 shadow-md shadow-indigo-600/20'
                          : 'text-slate-600 dark:text-slate-300 hover:text-indigo-600 dark:hover:text-indigo-400'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Actions */}
                <div className="hidden md:flex items-center gap-3">
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2.5 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition"
                    title="Toggle Dark/Light Mode"
                  >
                    {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                  </button>
                  
                  {isAuthenticated ? (
                    <button
                      onClick={() => setScreen('dashboard')}
                      className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 group"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={() => setScreen('signup')}
                        className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                      >
                        <UserPlus className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                        <span>Register</span>
                      </button>

                      <button
                        onClick={() => setScreen('login')}
                        className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 flex items-center gap-2 group"
                      >
                        <span>Sign In</span>
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                      </button>
                    </>
                  )}
                </div>

                {/* Mobile Menu Toggle */}
                <div className="md:hidden flex items-center gap-2">
                  <button
                    onClick={() => setDarkMode(!darkMode)}
                    className="p-2 text-slate-500 dark:text-slate-400 rounded-lg"
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

            {/* Mobile Dropdown */}
            {mobileMenuOpen && (
              <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-4 space-y-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="block w-full text-left px-4 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-slate-800 rounded-xl"
                  >
                    {item.label}
                  </button>
                ))}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex flex-col gap-2">
                  <button
                    onClick={() => { setMobileMenuOpen(false); setScreen('login'); }}
                    className="w-full py-2.5 bg-indigo-600 text-white text-xs font-bold rounded-xl"
                  >
                    Sign In to Portal
                  </button>
                </div>
              </div>
            )}
          </nav>

          <main className="flex-1">
            
            {/* HERO SECTION */}
            <section id="home" className="pt-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                
                {/* Hero Left Content */}
                <div className="lg:col-span-5 space-y-6">
                  
                  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-bold">
                    <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
                    <span>Next-Gen Enterprise Wholesale ERP</span>
                  </div>

                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                    Unify Sales, <br />
                    Inventory & CRM in <br />
                    <span className="relative inline-block text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">
                      One Smart Portal
                    </span>
                  </h1>

                  <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                    Designed for high-growth distributors & wholesalers. Real-time stock sync, multi-role access control, auto sales challans, and dynamic GST compliance.
                  </p>

                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs">
                      <UserCog className="w-4 h-4 text-indigo-500" />
                      <span>Role-Based RBAC</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs">
                      <TrendingUp className="w-4 h-4 text-emerald-500" />
                      <span>Live Revenue Metrics</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs">
                      <Boxes className="w-4 h-4 text-cyan-500" />
                      <span>Batch Stock Audit</span>
                    </div>
                    <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-xs">
                      <FileSpreadsheet className="w-4 h-4 text-amber-500" />
                      <span>1-Click Invoice PDF</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 pt-4">
                    <button
                      onClick={() => setScreen('signup')}
                      className="px-8 py-4 bg-gradient-to-r from-indigo-600 via-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-sm font-extrabold rounded-2xl shadow-xl shadow-indigo-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-3 group"
                    >
                      <span>Start 14-Day Free Trial</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button
                      onClick={() => setScreen('login')}
                      className="px-7 py-4 bg-white/80 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 text-sm font-bold rounded-2xl border border-slate-200/80 dark:border-slate-700 shadow-sm transition flex items-center gap-2"
                    >
                      <span>Launch Interactive Demo</span>
                      <ArrowUpRight className="w-4 h-4 text-slate-400" />
                    </button>
                  </div>

                  <div className="flex items-center gap-6 pt-2 text-xs text-slate-500 dark:text-slate-400">
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> No credit card required</span>
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-emerald-500" /> Instant Setup</span>
                  </div>

                </div>

                {/* Hero Right Dashboard Interactive Simulation */}
                <div className="lg:col-span-7">
                  <div className="relative group">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000"></div>
                    
                    <div className="relative bg-slate-900 rounded-3xl p-5 sm:p-7 shadow-2xl border border-slate-800 text-slate-100 overflow-hidden">
                      
                      {/* Top Header Controls */}
                      <div className="flex items-center justify-between pb-5 border-b border-slate-800/80 mb-5">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
                            <Building2 className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-white flex items-center gap-2">
                              Enterprise Command Center
                              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                            </p>
                            <p className="text-[11px] text-slate-400">Real-time Stock & Revenue Engine</p>
                          </div>
                        </div>

                        {/* Interactive Range Switcher */}
                        <div className="flex items-center gap-1 bg-slate-800/80 p-1 rounded-xl border border-slate-700/60">
                          {(['7D', '30D', '90D'] as const).map((range) => (
                            <button
                              key={range}
                              onClick={() => setChartRange(range)}
                              className={`px-3 py-1 text-[11px] font-bold rounded-lg transition-all ${
                                chartRange === range
                                  ? 'bg-indigo-600 text-white shadow-sm'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {range}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Stat Cards Row */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
                        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-indigo-500/50 transition">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Clients</p>
                          <p className="text-xl font-black text-white mt-1">1,248</p>
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
                            <ChevronUp className="w-3 h-3" /> +14% this month
                          </span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-indigo-500/50 transition">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Catalog SKUs</p>
                          <p className="text-xl font-black text-white mt-1">8,420</p>
                          <span className="text-[10px] text-slate-400 font-medium mt-0.5 block">Across 4 Warehouses</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-amber-500/50 transition">
                          <p className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Low Stock Alerts</p>
                          <p className="text-xl font-black text-amber-400 mt-1">12 Items</p>
                          <span className="text-[10px] text-amber-300/80 font-medium mt-0.5 block">Action Required</span>
                        </div>

                        <div className="p-3.5 rounded-2xl bg-slate-800/60 border border-slate-700/60 hover:border-indigo-500/50 transition">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Sales ({chartRange})</p>
                          <p className="text-xl font-black text-indigo-400 mt-1">
                            ₹{chartRange === '7D' ? '2.18L' : chartRange === '30D' ? '24.5L' : '1.15Cr'}
                          </p>
                          <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5 mt-0.5">
                            <ChevronUp className="w-3 h-3" /> +22.4% vs prev
                          </span>
                        </div>
                      </div>

                      {/* Interactive Recharts Area */}
                      <div className="bg-slate-800/40 p-4 rounded-2xl border border-slate-800/80 relative">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs font-bold text-white flex items-center gap-2">
                            <Activity className="w-4 h-4 text-indigo-400" /> Revenue & Order Volume Trend
                          </p>
                          <span className="text-[10px] font-mono text-slate-400">Updated 2m ago</span>
                        </div>
                        <div className="h-44 w-full">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={salesDatasets[chartRange]}>
                              <defs>
                                <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                                </linearGradient>
                              </defs>
                              <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                              <XAxis dataKey="day" stroke="#64748b" fontSize={10} tickLine={false} />
                              <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                              <Tooltip 
                                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', fontSize: '12px' }}
                              />
                              <Area type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

              </div>
            </section>

            {/* MARQUEE CLIENTS / TRUSTED COMPANIES WITH HOVER GLOW */}
            <section className="py-10 bg-white/40 dark:bg-slate-900/40 border-y border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <p className="text-center text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-6">
                  Trusted by 500+ Leading Wholesalers & Distributors Across India
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                  {clientLogos.map((client, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all duration-300 text-center group cursor-pointer"
                    >
                      <p className="font-extrabold text-sm text-slate-800 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                        {client.name}
                      </p>
                      <div className="flex items-center justify-center gap-2 mt-1">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">{client.tag}</span>
                        <span className="text-[10px] font-bold text-amber-500">★ {client.rating}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* INTERACTIVE MODULE SHOWCASE SECTION */}
            <section id="modules" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 text-xs font-extrabold tracking-wider uppercase">
                  Complete Architecture
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                  10 Modules Built for Enterprise Scale
                </h2>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Select a category to filter through core platform capabilities:
                </p>

                {/* Filter Category Chips */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
                  {(['All', 'CRM & Sales', 'Operations', 'Analytics', 'Security'] as const).map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setModuleFilter(cat)}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                        moduleFilter === cat
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                          : 'bg-white dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Module Grid Cards with Hover Glow */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredModules.map((m, idx) => {
                  const Icon = m.icon;
                  return (
                    <div
                      key={idx}
                      onClick={() => setScreen('login')}
                      className="group relative bg-white dark:bg-slate-900/90 p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 hover:border-indigo-500/50 hover:shadow-2xl transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
                    >
                      {/* Top Accent Gradient on Hover */}
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${m.color} opacity-0 group-hover:opacity-100 transition-opacity`} />

                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${m.lightBg}`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700">
                            {m.category}
                          </span>
                        </div>

                        <h3 className="font-extrabold text-slate-900 dark:text-white text-base mb-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                          {m.title}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {m.desc}
                        </p>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        <span>Launch Module Preview</span>
                        <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-slate-800 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition-all">
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

            </section>

            {/* TABBED FEATURE DEEP-DIVE SHOWCASE */}
            <section id="features" className="py-20 bg-white/60 dark:bg-slate-900/60 border-y border-slate-200/80 dark:border-slate-800/80">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                    Engineered for Wholesale Excellence
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
                    Click through the tabs to explore specialized operational workflows:
                  </p>
                </div>

                {/* Tabs */}
                <div className="flex justify-center mb-8 border-b border-slate-200 dark:border-slate-800">
                  <div className="flex gap-4 sm:gap-8 overflow-x-auto pb-2">
                    {[
                      { id: 'crm', label: 'CRM & Accounts', icon: Users },
                      { id: 'warehouse', label: 'Warehouse & Bays', icon: Warehouse },
                      { id: 'challan', label: 'Sales Challan Wizard', icon: FileSpreadsheet },
                      { id: 'security', label: 'Role Permissions', icon: ShieldCheck },
                    ].map((tab) => {
                      const TabIcon = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          onClick={() => setActiveFeatureTab(tab.id as any)}
                          className={`flex items-center gap-2 pb-3 text-xs sm:text-sm font-bold border-b-2 transition-all whitespace-nowrap ${
                            activeFeatureTab === tab.id
                              ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                              : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                          }`}
                        >
                          <TabIcon className="w-4 h-4" />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Tab Content Display */}
                <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  <div className="lg:col-span-5 space-y-4">
                    {activeFeatureTab === 'crm' && (
                      <>
                        <span className="px-2.5 py-1 rounded-md bg-blue-500/20 text-blue-300 text-[10px] font-mono font-bold">MODULE 01 • CRM</span>
                        <h3 className="text-2xl font-bold text-white">Full Customer Lifecycle & Credit Limits</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Track customer GSTIN status, individual payment credit terms, outstanding balances, and historical order trends in one central view.
                        </p>
                        <ul className="space-y-2 text-xs text-slate-300">
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Auto GSTIN state code parsing</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Automated overdue payment reminders</li>
                        </ul>
                      </>
                    )}

                    {activeFeatureTab === 'warehouse' && (
                      <>
                        <span className="px-2.5 py-1 rounded-md bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold">MODULE 02 • WAREHOUSE</span>
                        <h3 className="text-2xl font-bold text-white">Multi-Location Stock & Low Stock Triggers</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Assign products to distinct warehouse bays (Aisle 1, Shelf B). Set automated reorder thresholds so you never run out of top sellers.
                        </p>
                        <ul className="space-y-2 text-xs text-slate-300">
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Real-time stock reservation on order creation</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Physical audit signature logs</li>
                        </ul>
                      </>
                    )}

                    {activeFeatureTab === 'challan' && (
                      <>
                        <span className="px-2.5 py-1 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-mono font-bold">MODULE 03 • SALES</span>
                        <h3 className="text-2xl font-bold text-white">4-Step Guided Sales Challan Wizard</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Step-by-step order builder: Select Customer → Add Line Items with Tax Calculation → Review Stock → Issue Instant Challan & PDF Invoice.
                        </p>
                        <ul className="space-y-2 text-xs text-slate-300">
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Auto stock deduction upon issue</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Print-ready GST Tax Invoices</li>
                        </ul>
                      </>
                    )}

                    {activeFeatureTab === 'security' && (
                      <>
                        <span className="px-2.5 py-1 rounded-md bg-purple-500/20 text-purple-300 text-[10px] font-mono font-bold">MODULE 04 • SECURITY</span>
                        <h3 className="text-2xl font-bold text-white">Role-Based Access Control (RBAC)</h3>
                        <p className="text-xs text-slate-300 leading-relaxed">
                          Ensure sales agents only see their leads, warehouse staff manage inventory bays, and financial statements remain restricted to Admins & Accounts.
                        </p>
                        <ul className="space-y-2 text-xs text-slate-300">
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Firebase Authentication & JWT Security</li>
                          <li className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" /> Complete IP & Timestamp Activity Logs</li>
                        </ul>
                      </>
                    )}

                    <button
                      onClick={() => setScreen('login')}
                      className="pt-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
                    >
                      <span>Explore this workflow live</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Visual Screen Mockup */}
                  <div className="lg:col-span-7 bg-slate-950 p-4 rounded-2xl border border-slate-800 font-mono text-xs space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-red-500" />
                        <div className="w-3 h-3 rounded-full bg-amber-500" />
                        <div className="w-3 h-3 rounded-full bg-emerald-500" />
                        <span className="text-[10px] text-slate-500 ml-2">mini-erp-system // {activeFeatureTab}_view.ts</span>
                      </div>
                      <span className="text-[10px] text-indigo-400">STATUS: 200 OK</span>
                    </div>

                    <div className="p-3 bg-slate-900 rounded-xl space-y-2 text-[11px] text-slate-300">
                      <p className="text-indigo-400">// Configured API Rest Endpoint Payload</p>
                      <p>GET /api/v1/{activeFeatureTab}/summary?tenantId=9402</p>
                      <p className="text-slate-500">{"{"}</p>
                      <p className="pl-4 text-emerald-400">"status": "success",</p>
                      <p className="pl-4 text-emerald-400">"activeUsers": 24,</p>
                      <p className="pl-4 text-emerald-400">"module": "{activeFeatureTab.toUpperCase()}",</p>
                      <p className="pl-4 text-emerald-400">"healthCheck": "100% Operational"</p>
                      <p className="text-slate-500">{"}"}</p>
                    </div>
                  </div>

                </div>

              </div>
            </section>

            {/* LIVE ROI / SAVINGS CALCULATOR SECTION */}
            <section id="calculator" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="bg-gradient-to-tr from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl">
                
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  
                  <div className="lg:col-span-6 space-y-6">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-400/30">
                      <Calculator className="w-4 h-4 text-indigo-400" />
                      <span>Interactive ROI Estimator</span>
                    </div>

                    <h2 className="text-3xl font-black tracking-tight text-white">
                      Calculate Your Monthly Operational Savings
                    </h2>

                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Adjust your order volume and team size to see how much manual work Mini ERP Portal eliminates.
                    </p>

                    {/* Sliders */}
                    <div className="space-y-6 pt-2">
                      <div>
                        <div className="flex justify-between text-xs font-bold mb-2">
                          <span className="text-slate-300">Monthly Challans / Orders:</span>
                          <span className="text-indigo-400 font-mono text-sm">{monthlyOrders} Orders</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="2000"
                          step="50"
                          value={monthlyOrders}
                          onChange={(e) => setMonthlyOrders(Number(e.target.value))}
                          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>

                      <div>
                        <div className="flex justify-between text-xs font-bold mb-2">
                          <span className="text-slate-300">Team Members (Sales & Warehouse):</span>
                          <span className="text-indigo-400 font-mono text-sm">{teamSize} Users</span>
                        </div>
                        <input
                          type="range"
                          min="2"
                          max="100"
                          step="1"
                          value={teamSize}
                          onChange={(e) => setTeamSize(Number(e.target.value))}
                          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Result Box */}
                  <div className="lg:col-span-6">
                    <div className="bg-slate-900/90 p-8 rounded-3xl border border-indigo-500/30 text-center space-y-6 relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none" />

                      <p className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                        Estimated Monthly Impact
                      </p>

                      <div className="space-y-1">
                        <p className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-300">
                          ₹{estimatedMoneySaved.toLocaleString('en-IN')}
                        </p>
                        <p className="text-xs text-emerald-400 font-semibold">Cost Savings per month</p>
                      </div>

                      <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-black text-white">{estimatedHoursSaved} hrs</p>
                          <p className="text-[11px] text-slate-400">Time Saved / Mo</p>
                        </div>
                        <div>
                          <p className="text-2xl font-black text-white">99.8%</p>
                          <p className="text-[11px] text-slate-400">Billing Accuracy</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setScreen('signup')}
                        className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-2xl shadow-lg transition"
                      >
                        Claim Your Efficiency Boost Now →
                      </button>
                    </div>
                  </div>

                </div>

              </div>
            </section>

          </main>

          {/* PREMIUM FOOTER */}
          <footer className="bg-white dark:bg-[#05070c] border-t border-slate-200 dark:border-slate-800/80 pt-12 pb-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-200 dark:border-slate-800">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
                      <ShoppingCart className="w-4 h-4" />
                    </div>
                    <span className="font-extrabold text-base text-slate-900 dark:text-white">Mini ERP Portal</span>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Next-generation wholesale distribution system powered by MySQL, Express & React.
                  </p>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Modules</p>
                  <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                    <li className="hover:text-indigo-500 cursor-pointer" onClick={() => setScreen('login')}>Customer CRM</li>
                    <li className="hover:text-indigo-500 cursor-pointer" onClick={() => setScreen('login')}>Stock Movements</li>
                    <li className="hover:text-indigo-500 cursor-pointer" onClick={() => setScreen('login')}>Sales Challans</li>
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">Security & Compliance</p>
                  <ul className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
                    <li>256-Bit SSL Encryption</li>
                    <li>GSTIN Tax Compliant</li>
                    <li>Role Based RBAC</li>
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">System Status</p>
                  <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1 text-xs">
                    <p className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" /> All Systems Operational
                    </p>
                    <p className="text-[10px] text-slate-500">Latency: 24ms (MySQL Pool)</p>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
                <p>© 2026 Enterprise Operations Portal. All rights reserved.</p>
                <div className="flex items-center gap-4">
                  <span className="hover:text-indigo-500 cursor-pointer">Privacy Policy</span>
                  <span>•</span>
                  <span className="hover:text-indigo-500 cursor-pointer">Terms of Service</span>
                </div>
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
