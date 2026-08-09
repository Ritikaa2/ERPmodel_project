import React from 'react';
import {
  LayoutDashboard,
  Users,
  Boxes,
  ArrowRightLeft,
  FileSpreadsheet,
  BarChart3,
  UserCog,
  History,
  Settings,
  ShoppingCart,
  LogOut,
  ChevronRight,
} from 'lucide-react';
import { UserRole } from '../../types';

export type TabName =
  | 'Dashboard'
  | 'Customers'
  | 'Products'
  | 'Stock Movements'
  | 'Challans'
  | 'Create Challan'
  | 'Reports'
  | 'Users'
  | 'Activity Logs'
  | 'Settings';

interface SidebarProps {
  activeTab: TabName;
  setActiveTab: (tab: TabName) => void;
  userRole?: UserRole;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  userRole = 'ADMIN',
  onLogout,
}) => {
  const sidebarItems: { label: TabName; icon: any; roleRequired?: UserRole[] }[] = [
    { label: 'Dashboard', icon: LayoutDashboard },
    { label: 'Customers', icon: Users },
    { label: 'Products', icon: Boxes },
    { label: 'Stock Movements', icon: ArrowRightLeft },
    { label: 'Challans', icon: FileSpreadsheet },
    { label: 'Reports', icon: BarChart3 },
    { label: 'Users', icon: UserCog, roleRequired: ['ADMIN'] },
    { label: 'Activity Logs', icon: History, roleRequired: ['ADMIN', 'SALES'] },
  ];

  return (
    <aside className="w-64 bg-[#141625] dark:bg-[#0a0c14] text-slate-300 flex flex-col justify-between h-screen sticky top-0 border-r border-slate-800 shrink-0 select-none shadow-xl z-30">
      
      {/* Top Branding Section matching Blueprint Image */}
      <div>
        <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
            <ShoppingCart className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-black text-white text-base tracking-tight leading-tight">
              Mini ERP
            </h1>
            <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-widest">
              Operations Portal
            </p>
          </div>
        </div>

        {/* Module Nav Items List matching Blueprint Image */}
        <nav className="p-3 space-y-1.5 mt-2">
          {sidebarItems.map((item) => {
            if (item.roleRequired && !item.roleRequired.includes(userRole)) {
              return null;
            }

            const Icon = item.icon;
            const isActive = activeTab === item.label || (activeTab === 'Create Challan' && item.label === 'Challans');

            return (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.label)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition duration-150 ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/25'
                    : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Footer & Logout */}
      <div className="p-4 border-t border-slate-800/80 space-y-2">
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-400 hover:bg-rose-950/40 hover:text-rose-300 transition"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>

        <div className="pt-2 text-center border-t border-slate-800/40">
          <p className="text-[10px] text-slate-500 font-medium">Enterprise ERP v1.0 • MySQL Active</p>
        </div>
      </div>

    </aside>
  );
};
