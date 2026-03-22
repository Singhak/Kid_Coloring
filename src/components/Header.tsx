/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Palette, LogIn, LogOut, Download, Crown } from 'lucide-react';

interface HeaderProps {
  user: any;
  isPro: boolean;
  onLogin: () => void;
  onLogout: () => void;
  onDownload: () => void;
  onUpgrade: () => void;
}

const Header: React.FC<HeaderProps> = ({ user, isPro, onLogin, onLogout, onDownload, onUpgrade }) => {
  return (
    <header className="flex items-center justify-between p-4 sm:p-6 bg-white border-b border-[#E6E6E6] shadow-sm sticky top-0 z-50">
      <div className="flex items-center gap-2 sm:gap-4">
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#FF6B6B] via-[#4D96FF] to-[#6BCB77] rounded-2xl flex items-center justify-center shadow-lg rotate-3 transform hover:rotate-0 transition-transform">
          <Palette className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
        </div>
        <div>
          <h1 className="text-xl sm:text-3xl font-black text-[#2D3436] tracking-tighter uppercase italic leading-none">Magic Color</h1>
          <p className="text-[10px] sm:text-xs font-bold text-[#A0A0A0] uppercase tracking-widest mt-0.5">Kids' AI Art Studio</p>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3 bg-[#F5F5F5] p-1 sm:p-1.5 rounded-full pr-3 sm:pr-4 border border-[#E6E6E6]">
            <img 
              src={user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`} 
              alt={user.displayName || 'User'} 
              className="w-7 h-7 sm:w-9 sm:h-9 rounded-full border-2 border-white shadow-sm"
            />
            <div className="hidden sm:block">
              <p className="text-xs font-black text-[#2D3436] leading-none truncate max-w-[100px]">{user.displayName}</p>
              <p className="text-[10px] font-bold text-[#A0A0A0] uppercase tracking-tighter">{isPro ? 'Pro Artist' : 'Free Artist'}</p>
            </div>
            <button 
              onClick={onLogout}
              className="p-1.5 sm:p-2 hover:bg-white rounded-full transition-colors group"
              title="Logout"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 text-[#A0A0A0] group-hover:text-[#FF6B6B]" />
            </button>
          </div>
        ) : (
          <button 
            onClick={onLogin}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-5 py-2 sm:py-2.5 bg-[#4D96FF] hover:bg-[#3E54AC] text-white font-black rounded-full shadow-lg transition-all active:scale-95 text-xs sm:text-base uppercase tracking-tight"
          >
            <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Login</span>
          </button>
        )}

        <button 
          onClick={onDownload}
          className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 text-white font-bold rounded-full shadow-md transition-all active:scale-95 text-xs sm:text-base ${isPro ? 'bg-[#6BCB77] hover:bg-[#5BB366]' : 'bg-[#A0A0A0] hover:bg-[#808080]'}`}
        >
          <Download className="w-4 h-4 sm:w-5 sm:h-5" />
          <span className="hidden sm:inline">Save</span>
          {!isPro && <Crown className="w-3 h-3 ml-0.5 sm:ml-1" />}
        </button>
      </div>
    </header>
  );
};

export default Header;
