import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { LoginPage } from './pages/LoginPage.js';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage.js';
import { ResetPasswordPage } from './pages/ResetPasswordPage.js';
import { ProtectedRoute } from './components/common/ProtectedRoute.js';
import { Header } from './components/layout/Header.js';
import { UserRole } from './types/auth.types.js';
import {
  ArrowRight,
  BarChart3,
  Bell,
  Boxes,
  Building2,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  FileText,
  LayoutDashboard,
  Lock,
  LogOut,
  Menu,
  Moon,
  PackageCheck,
  PlusCircle,
  Search,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Sun,
  TrendingUp,
  Truck,
  UserCog,
  Users,
  WalletCards,
  Warehouse,
  X,
  AlertTriangle,
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

type ScreenMode = 'landing' | 'login' | 'forgot-password' | 'reset-password' | 'dashboard';
type SectionId = 'home' | 'features' | 'modules' | 'about' | 'contact';
type PreviewTab = 'Customers' | 'Inventory' | 'Sales Challans' | 'Reports';

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

const mockChallansList = [
  { id: 'CH-2026-0018', customer: 'Rahul Traders', amount: '₹45,000', status: 'DISPATCHED' },
  { id: 'CH-2026-0017', customer: 'ABC Retail Ltd', amount: '₹12,500', status: 'DELIVERED' },
  { id: 'CH-2026-0016', customer: 'Neha Distributors', amount: '₹18,200', status: 'PENDING' },
  { id: 'CH-2026-0015', customer: 'Kumar Stores', amount: '₹5,400', status: 'DRAFT' },
];

const mockLowStockItems = [
  { name: 'Copper Wire Roll', stock: 5 },
  { name: 'Wireless MCB Switch', stock: 3 },
  { name: 'Industrial Socket 16A', stock: 8 },
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
  const [activeTab, setActiveTab] = useState<PreviewTab>('Customers');
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState<SectionId>('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeMockNav, setActiveMockNav] = useState('Dashboard');

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

  const renderDashboardModuleContent = () => {
    switch (activeTab) {
      case 'Customers':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Customer CRM Directory</h3>
                <p className="text-xs text-slate-500">Manage client accounts, GSTIN, and CRM contacts.</p>
              </div>
              {user?.role !== 'WAREHOUSE' && (
                <button className="px-3.5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-sm">
                  <PlusCircle className="w-4 h-4" />
                  <span>Add Customer</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Company Name</th>
                    <th className="p-3">Contact Person</th>
                    <th className="p-3">Phone</th>
                    <th className="p-3">GSTIN</th>
                    <th className="p-3">City / State</th>
                    <th className="p-3">Type</th>
                    <th className="p-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Rahul Traders & Logistics</td>
                    <td className="p-3">Rahul Gupta</td>
                    <td className="p-3">+91 98200 12345</td>
                    <td className="p-3 font-mono text-[11px]">27AADCB2234M1Z2</td>
                    <td className="p-3">Mumbai, MH</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700">Wholesale</span></td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-semibold text-slate-900 dark:text-white">Metro Electronics India Pvt Ltd</td>
                    <td className="p-3">Suresh Kumar</td>
                    <td className="p-3">+91 98450 67890</td>
                    <td className="p-3 font-mono text-[11px]">29ABCDE1234F1Z5</td>
                    <td className="p-3">Bengaluru, KA</td>
                    <td className="p-3"><span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-100 text-purple-700">Distributor</span></td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                        ACTIVE
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'Inventory':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Inventory Catalog & Stock Control</h3>
                <p className="text-xs text-slate-500">Track stock levels, warehouse bay locations and reorder alerts.</p>
              </div>
              {(user?.role === 'ADMIN' || user?.role === 'WAREHOUSE') && (
                <button className="px-3.5 py-2 bg-emerald-600 text-white text-xs font-semibold rounded-lg hover:bg-emerald-700 transition flex items-center gap-1.5 shadow-sm">
                  <PlusCircle className="w-4 h-4" />
                  <span>Update Stock</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">SKU Code</th>
                    <th className="p-3">Product Name</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Unit Price</th>
                    <th className="p-3">Current Stock</th>
                    <th className="p-3">Location</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono font-semibold text-slate-900 dark:text-white">PRD-IND-001</td>
                    <td className="p-3 font-medium">Heavy Duty Copper Cable 100m</td>
                    <td className="p-3">Electrical</td>
                    <td className="p-3 font-semibold">₹4,500</td>
                    <td className="p-3">
                      <span className="font-bold text-emerald-600">45 Roll</span>
                    </td>
                    <td className="p-3">Bay-A1</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 bg-amber-50/30 dark:bg-amber-950/20">
                    <td className="p-3 font-mono font-semibold text-slate-900 dark:text-white">PRD-IND-002</td>
                    <td className="p-3 flex items-center gap-1.5">
                      <span className="font-medium">Industrial MCB Switch 32A</span>
                      <span className="px-1.5 py-0.2 text-[10px] bg-amber-100 text-amber-800 font-bold rounded flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" /> Low Stock Alert
                      </span>
                    </td>
                    <td className="p-3">Switchgear</td>
                    <td className="p-3 font-semibold">₹850</td>
                    <td className="p-3">
                      <span className="font-bold text-amber-600">8 Pcs</span>
                    </td>
                    <td className="p-3">Bay-B3</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'Sales Challans':
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Sales Delivery Challans</h3>
                <p className="text-xs text-slate-500">Create, dispatch and track goods delivery challans.</p>
              </div>
              {(user?.role === 'ADMIN' || user?.role === 'SALES') && (
                <button className="px-3.5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-lg hover:bg-indigo-700 transition flex items-center gap-1.5 shadow-sm">
                  <PlusCircle className="w-4 h-4" />
                  <span>Create Challan</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="p-3">Challan #</th>
                    <th className="p-3">Customer</th>
                    <th className="p-3">Total Amount</th>
                    <th className="p-3">Status</th>
                    <th className="p-3">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono font-semibold text-indigo-600 dark:text-indigo-400">CH-2026-001</td>
                    <td className="p-3">Rahul Traders & Logistics</td>
                    <td className="p-3 font-bold">₹45,000</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-700 rounded">
                        DISPATCHED
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">08 Aug 2026</td>
                  </tr>
                  <tr className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                    <td className="p-3 font-mono font-semibold text-indigo-600 dark:text-indigo-400">CH-2026-002</td>
                    <td className="p-3">Metro Electronics India Pvt Ltd</td>
                    <td className="p-3 font-bold">₹12,750</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-700 rounded">
                        PENDING_DISPATCH
                      </span>
                    </td>
                    <td className="p-3 text-slate-400">08 Aug 2026</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'Reports':
        return (
          <div className="space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Monthly Revenue & Sales Performance Analytics</h3>
            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={liveSalesData}>
                  <defs>
                    <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Sales']} />
                  <Area type="monotone" dataKey="sales" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#salesGrad)" />
                </AreaChart>
              </ResponsiveContainer>
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
        onLoginSuccess={() => setScreen('dashboard')}
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-800 dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* AUTHENTICATED HEADER OR LANDING NAVBAR */}
      {screen === 'dashboard' ? (
        <Header
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          onLogout={() => {
            logout();
            setScreen('landing');
          }}
        />
      ) : (
        /* POLISHED LANDING NAVBAR */
        <nav className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/80 dark:border-slate-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-20">
              
              {/* Brand Logo & Name */}
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

              {/* Navigation Items */}
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

              {/* Actions Right */}
              <div className="hidden md:flex items-center gap-3">
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
                  <button
                    onClick={() => setScreen('login')}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shadow-md shadow-indigo-500/25 flex items-center gap-2"
                  >
                    <span>Login</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
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
      )}

      {/* BODY CONTENT */}
      {screen === 'dashboard' ? (
        <ProtectedRoute onNavigateToLogin={() => setScreen('login')}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
            
            {/* User Welcome Banner */}
            <div className="mb-6 bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white p-6 rounded-2xl shadow-lg border border-indigo-500/20 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-xl font-bold">Good day, {user?.name} 👋</h2>
                  <span className="px-2.5 py-0.5 text-xs font-extrabold rounded-md bg-indigo-500/30 border border-indigo-400/40 text-indigo-200">
                    {user?.role} ROLE
                  </span>
                </div>
                <p className="text-xs text-indigo-200">
                  {user?.role === 'ADMIN' && 'Full ERP System Control: Manage Users, Customers CRM, Stock Inventory & Financial Analytics.'}
                  {user?.role === 'SALES' && 'Sales CRM Module: Manage Customer Directory, CRM Follow-ups & Create Delivery Challans.'}
                  {user?.role === 'WAREHOUSE' && 'Warehouse Control: Update Product Master Catalog, Warehouse Bay Locations & Low Stock Alerts.'}
                  {user?.role === 'ACCOUNTS' && 'Accounts & Finance: Track Challan Receivables & Revenue Performance Reports.'}
                </p>
              </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
              {bottomStats.map((m, idx) => {
                const Icon = m.icon;
                return (
                  <div key={idx} className="bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-xs flex items-center gap-3">
                    <div className={`p-2.5 rounded-lg ${m.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{m.label}</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white">{m.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Module Tabs & Workspace Panel */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
              <div className="border-b border-slate-200 dark:border-slate-700 px-4 pt-3 flex gap-2 overflow-x-auto bg-slate-50/50 dark:bg-slate-900/40">
                {(['Customers', 'Inventory', 'Sales Challans', 'Reports'] as PreviewTab[]).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition border-b-2 ${
                      activeTab === tab
                        ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border-indigo-600 dark:border-indigo-400 shadow-xs'
                        : 'text-slate-500 border-transparent hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              <div className="p-6">{renderDashboardModuleContent()}</div>
            </div>
          </div>
        </ProtectedRoute>
      ) : (
        /* STUNNING LANDING PAGE DESIGN MATCHING SPECIFICATION */
        <main className="flex-1">
          
          {/* HERO SECTION WITH DYNAMIC INTERACTIVE APP PREVIEW CARD */}
          <section id="home" className="pt-12 pb-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              
              {/* Left Hero Content */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Badge Pill */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold">
                  <Sparkles className="w-4 h-4 text-indigo-600 animate-pulse" />
                  <span>All-in-One Business Management Solution</span>
                </div>

                {/* Main Headline */}
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

                {/* Subtitle */}
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed font-normal">
                  A powerful ERP + CRM system to manage customers, inventory, sales, and operations — all in one place.
                </p>

                {/* 4 Key Feature Pill Chips */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <UserCog className="w-4 h-4 text-indigo-600" />
                    <span>Role Based Access</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span>Real-time Analytics</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <Boxes className="w-4 h-4 text-blue-600" />
                    <span>Inventory Control</span>
                  </div>
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200">
                    <FileSpreadsheet className="w-4 h-4 text-amber-600" />
                    <span>Sales Tracking</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-3">
                  <button
                    onClick={() => setScreen('login')}
                    className="px-7 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-2xl shadow-lg shadow-indigo-600/30 transition transform hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => scrollToSection('features')}
                    className="px-7 py-3.5 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-sm font-bold rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs transition"
                  >
                    View Features →
                  </button>
                </div>

              </div>

              {/* Right Hero: INTERACTIVE LIVE MOCKUP FRAME MATCHING REFERENCE UI */}
              <div className="lg:col-span-7">
                <div className="bg-slate-900 rounded-3xl p-4 sm:p-6 shadow-2xl border border-slate-800 text-slate-100 relative overflow-hidden">
                  
                  {/* Decorative glow circles */}
                  <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

                  {/* Header Mock Bar */}
                  <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-white">Good Morning, Admin 👋</p>
                        <p className="text-[10px] text-slate-400">Here's what's happening in your business today.</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">20 May, 2026</span>
                      <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center relative">
                        <Bell className="w-3.5 h-3.5 text-slate-300" />
                        <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-indigo-500"></span>
                      </div>
                    </div>
                  </div>

                  {/* Mock Stat Widgets Row */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-medium text-slate-400">Total Customers</p>
                        <span className="text-[10px] font-bold text-emerald-400">+12%</span>
                      </div>
                      <p className="text-lg font-black text-white">120</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-medium text-slate-400">Total Products</p>
                        <span className="text-[10px] font-bold text-emerald-400">+5%</span>
                      </div>
                      <p className="text-lg font-black text-white">85</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-medium text-slate-400">Low Stock Items</p>
                        <span className="text-[10px] font-bold text-rose-400">-3%</span>
                      </div>
                      <p className="text-lg font-black text-amber-400">7</p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-[10px] font-medium text-slate-400">Today's Sales</p>
                        <span className="text-[10px] font-bold text-emerald-400">+8%</span>
                      </div>
                      <p className="text-lg font-black text-white">₹2,45,000</p>
                    </div>
                  </div>

                  {/* Mock Analytics Chart & Side Lists */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                    
                    {/* Left: Recharts Live Curve */}
                    <div className="sm:col-span-7 bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs font-bold text-white">Sales Overview (This Month)</p>
                        <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">This Month</span>
                      </div>
                      <div className="h-36 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={liveSalesData}>
                            <CartesianGrid strokeDasharray="2 2" opacity={0.1} />
                            <Line type="monotone" dataKey="sales" stroke="#6366f1" strokeWidth={3} dot={{ r: 3, fill: '#6366f1' }} />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Right: Recent Challans & Low Stock */}
                    <div className="sm:col-span-5 space-y-3">
                      
                      {/* Recent Challans List */}
                      <div className="bg-slate-800/50 p-3 rounded-xl border border-slate-800">
                        <p className="text-[11px] font-bold text-white mb-2">Recent Challans</p>
                        <div className="space-y-1.5">
                          {mockChallansList.slice(0, 3).map((ch, i) => (
                            <div key={i} className="flex items-center justify-between text-[10px] py-1 border-b border-slate-800/60 last:border-none">
                              <div>
                                <span className="font-mono text-indigo-400 font-bold block">{ch.id}</span>
                                <span className="text-slate-400">{ch.customer}</span>
                              </div>
                              <span className="font-bold text-slate-200">{ch.amount}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Low Stock Widget */}
                      <div className="bg-slate-800/50 p-2.5 rounded-xl border border-slate-800">
                        <p className="text-[11px] font-bold text-rose-400 mb-1 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" /> Low Stock Alerts
                        </p>
                        <div className="space-y-1 text-[10px]">
                          {mockLowStockItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between text-slate-300">
                              <span>• {item.name}</span>
                              <span className="text-rose-400 font-bold">Stock: {item.stock}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                    </div>
                  </div>

                </div>
              </div>

            </div>
          </section>

          {/* SECTION 2: EVERYTHING YOU NEED ALL IN ONE PLACE */}
          <section id="features" className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200/80 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              <div className="text-center max-w-2xl mx-auto mb-12">
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                  Everything You Need, All in One Place
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

          {/* SECTION 3: BOTTOM STATS BAR MATCHING REFERENCE IMAGE */}
          <section className="py-10 bg-indigo-50/50 dark:bg-slate-950 border-t border-slate-200/80 dark:border-slate-800">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-6">
                {bottomStats.map((stat, i) => {
                  const Icon = stat.icon;
                  return (
                    <div key={i} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700 shadow-2xs">
                      <div className={`p-3 rounded-xl ${stat.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xl font-black text-slate-900 dark:text-white">{stat.value}</p>
                        <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400">{stat.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* SECTION 4: ABOUT / CASE STUDY OVERVIEW */}
          <section id="about" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-2xl relative overflow-hidden">
              <div className="max-w-3xl space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">Full Stack Developer Case Study</span>
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">Mini ERP + CRM Operations Portal</h2>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Engineered specifically for wholesale and distribution enterprises dealing with customers, products, stock levels, delivery challans, and multi-team collaboration across Admin, Sales, Warehouse, and Accounts.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-xs">
                  <span className="px-3 py-1 bg-slate-800 rounded-lg font-mono text-indigo-300">React.js + TS</span>
                  <span className="px-3 py-1 bg-slate-800 rounded-lg font-mono text-indigo-300">Node.js + Express</span>
                  <span className="px-3 py-1 bg-slate-800 rounded-lg font-mono text-indigo-300">MySQL Database</span>
                  <span className="px-3 py-1 bg-slate-800 rounded-lg font-mono text-indigo-300">JWT & RBAC Security</span>
                </div>
              </div>
            </div>
          </section>

        </main>
      )}

      {/* FOOTER */}
      <footer className="bg-white dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-indigo-600" />
            <span className="font-bold text-slate-900 dark:text-white">Mini ERP Portal</span>
            <span>© 2026 Enterprise Distribution Portal</span>
          </div>
          <div>
            <span>Production-Grade Architecture • 256-Bit SSL Encrypted</span>
          </div>
        </div>
      </footer>

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
