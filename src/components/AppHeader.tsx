import React, { useState, useRef, useEffect } from 'react';
import { 
  Palette, 
  LogIn, 
  LogOut, 
  Download, 
  Crown, 
  Undo2, 
  Redo2, 
  Settings, 
  Sparkles,
  Volume2, 
  VolumeX, 
  LayoutGrid, 
  Paintbrush,
  Camera,
  Hash
} from 'lucide-react';
import { createAvatar } from '@dicebear/core';
import { avataaars } from '@dicebear/collection';
import { motion, AnimatePresence } from 'motion/react';
import { isSoundEnabled, toggleSound, playClick, playSwish, playFanfare } from '../services/soundEffects';

interface AppHeaderProps {
  user: any;
  isPro: boolean;
  isSubscribed: boolean;
  trialEndDate?: Date | null;
  showTemplates: boolean;
  setShowTemplates: (show: boolean) => void;
  handleLogin: () => void;
  handleLogout: () => void;
  downloadImage: () => void;
  undo: () => void;
  redo: () => void;
  historyIndex: number;
  historyLength: number;
  setShowUpgradeModal: (show: boolean) => void;
  handleCancelSubscription: () => void;
  onOpenPhotoArt?: () => void;
  isColorByNumber?: boolean;
  onToggleColorByNumber?: () => void;
  onOpenPricingPage?: () => void;
}

const AppHeader: React.FC<AppHeaderProps> = ({
  user,
  isPro,
  isSubscribed,
  trialEndDate,
  showTemplates,
  setShowTemplates,
  handleLogin,
  handleLogout,
  downloadImage,
  undo,
  redo,
  historyIndex,
  historyLength,
  setShowUpgradeModal,
  handleCancelSubscription,
  onOpenPhotoArt,
  isColorByNumber = false,
  onToggleColorByNumber,
  onOpenPricingPage
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundEnabled());
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [avatarUri, setAvatarUri] = useState<string | undefined>(undefined);

  const now = new Date();
  const isTrialActive = trialEndDate && trialEndDate.getTime() > now.getTime();
  const daysRemaining = trialEndDate ? Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)) : 0;

  useEffect(() => {
    if (user?.uid && !user.photoURL) {
      const generateAndSetAvatar = async () => {
        try {
          const uri = createAvatar(avataaars, { seed: user.uid }).toDataUri();
          setAvatarUri(uri);
        } catch (error) {
          console.error("Failed to generate DiceBear avatar:", error);
        }
      };
      generateAndSetAvatar();
    } else {
      setAvatarUri(undefined);
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

  const handleToggleSound = () => {
    const newState = toggleSound();
    setSoundOn(newState);
  };

  const handleUndo = () => {
    playSwish();
    undo();
  };

  const handleRedo = () => {
    playSwish();
    redo();
  };

  const handleSave = () => {
    playFanfare();
    downloadImage();
  };

  return (
    <header className="px-3 py-1.5 sm:px-6 sm:py-2 flex items-center justify-between bg-white/95 backdrop-blur-md border-b-2 border-[#EBE8DC] shadow-xs shrink-0 z-30">
      {/* Brand & Mode Switcher */}
      <div className="flex items-center gap-2 sm:gap-4">
        <button
          onClick={() => {
            playClick();
            setShowTemplates(true);
          }}
          className="flex items-center gap-2 sm:gap-2.5 group cursor-pointer focus:outline-none"
        >
          <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-tr from-[#FF6B6B] via-[#FFD93D] to-[#4D96FF] rounded-2xl flex items-center justify-center shadow-md transform -rotate-3 group-hover:rotate-6 transition-transform">
            <Palette className="text-white w-5 h-5 sm:w-6 sm:h-6 drop-shadow-sm" />
          </div>
          <div className="text-left">
            <span className="text-xl sm:text-2xl font-black tracking-tight text-[#2D3436] font-display flex items-center">
              Kid<span className="text-[#FF6B6B]">Color</span>
              <span className="text-xs font-bold px-1.5 py-0.5 ml-1.5 bg-[#FFD93D]/30 text-[#E67E22] rounded-full hidden sm:inline-block">
                ✨ Magic Studio
              </span>
            </span>
          </div>
        </button>

        {/* Gallery vs Canvas Toggle */}
        <div className="hidden md:flex items-center p-1 bg-[#F4F1DE]/60 rounded-2xl border border-[#E6E2D3] ml-2">
          <button
            onClick={() => {
              playClick();
              setShowTemplates(true);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              showTemplates 
                ? 'bg-white text-[#2D3436] shadow-sm' 
                : 'text-[#888] hover:text-[#2D3436]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5 text-[#4D96FF]" />
            <span>Library</span>
          </button>
          <button
            onClick={() => {
              playClick();
              setShowTemplates(false);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              !showTemplates 
                ? 'bg-white text-[#2D3436] shadow-sm' 
                : 'text-[#888] hover:text-[#2D3436]'
            }`}
          >
            <Paintbrush className="w-3.5 h-3.5 text-[#FF6B6B]" />
            <span>Coloring Canvas</span>
          </button>
        </div>

        {/* Why VIP / Compare Plans Quick Button */}
        {onOpenPricingPage && (
          <button
            onClick={() => {
              playClick();
              onOpenPricingPage();
            }}
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-[#FFF9E6] hover:bg-[#FFF2B2] text-[#8C5B00] border border-[#FFD93D] rounded-xl font-black text-xs transition-all cursor-pointer active:scale-95"
            title="See all Free vs VIP Superpower features"
          >
            <Crown className="w-3.5 h-3.5 text-[#FF9F43] fill-current" />
            <span>Why VIP?</span>
          </button>
        )}

        {/* Top Quick Actions: Photo to Art & Numbers */}
        {onOpenPhotoArt && (
          <button
            onClick={() => {
              playClick();
              onOpenPhotoArt();
            }}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-[#F0FDF4] hover:bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] rounded-xl text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-2xs"
            title="Convert your real photos into coloring pages"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Photo Art</span>
            {!isPro && <Crown className="w-2.5 h-2.5 text-[#EAB308] fill-current" />}
          </button>
        )}
      </div>

      {/* Action Controls Cluster */}
      <div className="flex items-center gap-1.5 sm:gap-2.5">
        {/* Undo / Redo (Only active on Canvas) */}
        {!showTemplates && (
          <div className="flex items-center bg-[#F7F5EC] p-1 rounded-2xl border border-[#E9E5D6] shadow-inner">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 sm:p-2 rounded-xl hover:bg-white disabled:opacity-25 transition-all text-[#2D3436] active:scale-90 cursor-pointer"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="w-px h-4 bg-[#E0DCBC] mx-0.5" />
            <button
              onClick={handleRedo}
              disabled={historyIndex >= historyLength - 1}
              className="p-1.5 sm:p-2 rounded-xl hover:bg-white disabled:opacity-25 transition-all text-[#2D3436] active:scale-90 cursor-pointer"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        )}

        {/* Sound FX Toggle */}
        <button
          onClick={handleToggleSound}
          className={`p-2 rounded-2xl border transition-all text-xs font-bold active:scale-90 cursor-pointer ${
            soundOn 
              ? 'bg-[#EBF7FF] border-[#B9E0FF] text-[#0984E3] hover:bg-[#DDF0FF]' 
              : 'bg-[#F5F5F5] border-[#E0E0E0] text-[#A0A0A0] hover:bg-[#EBEBEB]'
          }`}
          title={soundOn ? 'Sound FX: ON' : 'Sound FX: Muted'}
        >
          {soundOn ? <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" /> : <VolumeX className="w-4 h-4 sm:w-5 sm:h-5" />}
        </button>

        {/* Save Masterpiece Button */}
        <button
          onClick={handleSave}
          className={`btn-bubbly flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 rounded-2xl font-black text-xs sm:text-sm tracking-wide text-white transition-all shadow-md active:scale-95 cursor-pointer ${
            isPro 
              ? 'bg-gradient-to-r from-[#6BCB77] to-[#4EBA5C] hover:brightness-105' 
              : 'bg-gradient-to-r from-[#FF9F43] to-[#EE5253] animate-shimmer'
          }`}
        >
          <Download className="w-4 h-4 sm:w-4.5 sm:h-4.5 drop-shadow-sm" />
          <span>Save Art</span>
          {!isPro && (
            <span className="flex items-center gap-0.5 bg-yellow-300 text-yellow-900 text-[10px] font-black px-1.5 py-0.5 rounded-full shadow-sm ml-0.5">
              <Crown className="w-2.5 h-2.5 fill-current" />
              VIP
            </span>
          )}
        </button>

        {/* User Profile / Login */}
        {user ? (
          <div className="relative flex items-center ml-1 sm:ml-2">
            <button
              ref={buttonRef}
              onClick={() => {
                playClick();
                setShowProfileMenu(!showProfileMenu);
              }}
              className="flex items-center gap-1.5 p-1 rounded-2xl hover:bg-[#F5F3E9] border border-transparent hover:border-[#E5E1D0] transition-all cursor-pointer"
              title={user.displayName || 'User Profile'}
            >
              <div className="relative">
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover ring-2 ring-[#FFD93D]" />
                ) : (
                  <img src={avatarUri || '/profile.png'} alt="Avatar" className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover ring-2 ring-[#FFD93D]" />
                )}
                {isPro && (
                  <div className="absolute -bottom-1 -right-1 bg-[#FFD93D] text-[#8C5B00] rounded-full p-0.5 shadow-sm border border-white">
                    <Crown className="w-2.5 h-2.5 fill-current" />
                  </div>
                )}
              </div>
            </button>

            <AnimatePresence>
              {showProfileMenu && (
                <motion.div
                  ref={menuRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute top-full right-0 mt-2 w-56 bg-white rounded-3xl shadow-xl border-2 border-[#EBE8DC] z-50 overflow-hidden p-2"
                >
                  <div className="p-3 bg-[#FAF8EF] rounded-2xl mb-2">
                    <p className="text-sm font-black text-[#2D3436] truncate">{user.displayName || 'Little Artist'}</p>
                    <p className="text-xs text-[#888] truncate">{user.email}</p>
                    {isTrialActive && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-[#FFF2B2] text-[#8C5B00] text-[11px] font-bold rounded-lg">
                        ✨ Trial: {daysRemaining} days left
                      </span>
                    )}
                    {isSubscribed && (
                      <span className="inline-block mt-2 px-2 py-0.5 bg-[#D4EDDA] text-[#155724] text-[11px] font-bold rounded-lg">
                        👑 Magic Explorer Active
                      </span>
                    )}
                  </div>

                  {!isSubscribed && (
                    <button
                      onClick={() => {
                        setShowUpgradeModal(true);
                        setShowProfileMenu(false);
                      }}
                      className="flex items-center gap-2.5 w-full px-3.5 py-2.5 text-sm font-bold text-[#D97706] hover:bg-[#FFFBEB] rounded-xl transition-colors mb-1 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-[#F59E0B]" /> 
                      Upgrade to Magic VIP
                    </button>
                  )}

                  {onOpenPricingPage && (
                    <button
                      onClick={() => {
                        onOpenPricingPage();
                        setShowProfileMenu(false);
                      }}
                      className="flex items-center gap-2.5 w-full px-3.5 py-2 text-xs font-bold text-[#555] hover:bg-[#F9F7EF] rounded-xl transition-colors mb-1 cursor-pointer"
                    >
                      <Crown className="w-3.5 h-3.5 text-[#FF9F43] fill-current" />
                      <span>Compare Free vs VIP</span>
                    </button>
                  )}

                  {isSubscribed && (
                    <button
                      onClick={() => {
                        handleCancelSubscription();
                        setShowProfileMenu(false);
                      }}
                      className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm font-semibold text-[#666] hover:bg-[#F5F5F5] rounded-xl transition-colors mb-1 cursor-pointer"
                    >
                      <Settings className="w-4 h-4 text-[#888]" /> Manage Subscription
                    </button>
                  )}

                  <button
                    onClick={() => {
                      handleLogout();
                      setShowProfileMenu(false);
                    }}
                    className="flex items-center gap-2.5 w-full px-3.5 py-2 text-sm font-bold text-[#FF6B6B] hover:bg-[#FFF5F5] rounded-xl transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <button
            onClick={handleLogin}
            className="btn-bubbly flex items-center gap-1.5 px-3.5 sm:px-4 py-2 bg-[#4D96FF] text-white font-bold rounded-2xl shadow-md hover:bg-[#3B82F6] transition-all active:scale-95 text-xs sm:text-sm ml-1 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Login</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default AppHeader;