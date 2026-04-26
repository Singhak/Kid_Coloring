import React from 'react';
import { Palette, LogIn, LogOut, Download, Crown, Undo2, Redo2 } from 'lucide-react';

interface AppHeaderProps {
  user: any;
  isPro: boolean;
  handleLogin: () => void;
  handleLogout: () => void;
  downloadImage: () => void;
  undo: () => void;
  redo: () => void;
  historyIndex: number;
  historyLength: number;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  isPro,
  handleLogin,
  handleLogout,
  downloadImage,
  undo,
  redo,
  historyIndex,
  historyLength,
}) => {
  return (
    <header className="p-3 md:p-6 flex items-center justify-between bg-white border-b-2 border-[#E6E6E6] shadow-sm shrink-0">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#FF6B6B] to-[#FFD93D] rounded-lg sm:rounded-xl flex items-center justify-center shadow-lg transform -rotate-6">
          <Palette className="text-white w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <h1 className="text-lg sm:text-2xl font-black tracking-tight text-[#2D3436]">
          Kid<span className="text-[#FF6B6B]">Color</span>
        </h1>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        {user ? (
          <div className="flex items-center gap-2 sm:gap-3 mr-1 sm:mr-4">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-[#2D3436]">{user.displayName}</span>
              <span className="text-[10px] font-black text-[#FFD93D] flex items-center gap-1 uppercase tracking-wider">
                <Crown className="w-3 h-3" /> Magic Explorer
              </span>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 sm:p-2 rounded-full hover:bg-[#FFF5F5] text-[#FF6B6B] transition-all"
              title="Logout"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#4D96FF] text-white font-bold rounded-full shadow-md hover:bg-[#3E54AC] transition-all active:scale-95 mr-1 sm:mr-4 text-xs sm:text-base"
          >
            <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Login</span>
          </button>
        )}

        <button
          onClick={undo}
          disabled={historyIndex <= 0}
          className="p-1.5 sm:p-2 rounded-full hover:bg-[#F5F5F5] disabled:opacity-30 transition-all active:scale-95"
          title="Undo"
        >
          <Undo2 className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <button
          onClick={redo}
          disabled={historyIndex >= historyLength - 1}
          className="p-1.5 sm:p-2 rounded-full hover:bg-[#F5F5F5] disabled:opacity-30 transition-all active:scale-95"
          title="Redo"
        >
          <Redo2 className="w-5 h-5 sm:w-6 sm:h-6" />
        </button>
        <div className="w-px h-5 sm:h-6 bg-[#E6E6E6] mx-1 sm:mx-2" />
        <button
          onClick={downloadImage}
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

export default AppHeader;