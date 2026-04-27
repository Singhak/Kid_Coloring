import React, { useState, useRef, useEffect } from 'react';
import { Palette, LogIn, LogOut, Download, Crown, Undo2, Redo2, User as UserIcon, Settings, DollarSign } from 'lucide-react';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection'; // Import the avataaars collection
import { motion, AnimatePresence } from 'motion/react';

interface AppHeaderProps {
  user: any;
  isPro: boolean;
  isSubscribed: boolean; // Added
  handleLogin: () => void;
  handleLogout: () => void;
  downloadImage: () => void;
  undo: () => void;
  redo: () => void;
  historyIndex: number;
  historyLength: number;
  setShowUpgradeModal: (show: boolean) => void; // Added to open upgrade modal from header
  handleCancelSubscription: () => void; // Added
}

const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  isPro,
  isSubscribed, // Destructure
  handleLogin,
  handleLogout,
  downloadImage,
  undo,
  redo,
  historyIndex,
  historyLength,
  setShowUpgradeModal, // Destructure
  handleCancelSubscription, // Destructure
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined); // Initialize as undefined

  useEffect(() => {
    if (user?.uid && !user.photoURL) {
      // Generate avatar only if photoURL is not available
      const generateAndSetAvatar = async () => {
        try {
          const uri = createAvatar(avataaars, { seed: user.uid }).toDataUri();
          setAvatarUri(uri); // Set the resolved URI
        } catch (error) {
          console.error("Failed to generate DiceBear avatar:", error);
        }
      };
      generateAndSetAvatar();
    } else {
      setAvatarUri(undefined); // Clear avatar if photoURL is available or user logs out
    }
  }, [user?.uid, user?.photoURL]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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

        {user ? ( // If user is logged in, show profile menu
          <div className="relative flex items-center gap-2 sm:gap-3 ml-1 sm:ml-4">
            <button
              ref={buttonRef}
              onClick={() => setShowProfileMenu(!showProfileMenu)}
              className="flex items-center gap-2 sm:gap-3 p-1.5 sm:p-2 rounded-full hover:bg-[#F5F5F5] transition-all"
              title={user.displayName || 'User Profile'}
            >
              {user.photoURL ? (
                <img src={user.photoURL} alt="User Avatar" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
              ) : (
                <img src={avatarUri || '/profile.png'} alt="User Avatar" className="w-6 h-6 sm:w-8 sm:h-8 rounded-full" />
              )}
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  ref={menuRef}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-[#E6E6E6] z-50 overflow-hidden"
                >
                  <div className="p-3 border-b border-[#E6E6E6]">
                    <p className="text-sm font-bold text-[#2D3436] truncate">{user.displayName}</p>
                    <p className="text-xs text-[#A0A0A0]">{user.email}</p>
                  </div>
                  {isSubscribed && (
                    <button
                      onClick={() => {
                        handleCancelSubscription();
                        setShowProfileMenu(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[#2D3436] hover:bg-[#F5F5F5] transition-colors"
                    >
                      <Settings className="w-4 h-4" /> Manage Subscription
                    </button>
                  )}
                  {!isSubscribed && (
                    <button
                      onClick={() => {
                        setShowUpgradeModal(true);
                        setShowProfileMenu(false);
                      }}
                      className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[#6BCB77] hover:bg-[#F5F5F5] transition-colors"
                    >
                      <DollarSign className="w-4 h-4" /> Subscribe Now
                    </button>
                  )}
                  <button
                    onClick={() => {
                      handleLogout();
                      setShowProfileMenu(false);
                    }}
                    className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[#FF6B6B] hover:bg-[#FFF5F5] transition-colors"
                  >
                    <LogOut className="w-4 h-4" /> Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : ( // If user is not logged in, show login button
          <button
            onClick={handleLogin}
            className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-[#4D96FF] text-white font-bold rounded-full shadow-md hover:bg-[#3E54AC] transition-all active:scale-95 ml-1 sm:ml-4 text-xs sm:text-base"
          >
            <LogIn className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="hidden sm:inline">Login</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;