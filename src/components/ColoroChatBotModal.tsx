import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  X, 
  Send, 
  Sparkles, 
  Wand2, 
  Palette, 
  Lightbulb, 
  MessageSquare,
  HelpCircle,
  CheckCircle,
  Flame
} from 'lucide-react';
import { playClick, playPop, playChime } from '../services/soundEffects';

interface Message {
  id: string;
  sender: 'bot' | 'user';
  text: string;
  promptToGenerate?: string;
  colorTip?: string;
  timestamp: string;
}

interface ColoroChatBotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerateFromChat: (prompt: string) => void;
}

const QUICK_STARTERS = [
  { label: '🦖 Funny Dinosaur', prompt: 'cute friendly baby dinosaur wearing party hat playing guitar' },
  { label: '🚀 Space Adventure', prompt: 'smiling astronaut cat floating by Saturn with shooting stars' },
  { label: '🦄 Magic Fairytale', prompt: 'magic princess unicorn flying over rainbow castle in clouds' },
  { label: '🐬 Ocean Friends', prompt: 'playful baby dolphin and sea turtle discovering sunken treasure chest' },
  { label: '🎨 Color Harmony Tip', query: 'What colors look amazing together for kids coloring?' },
  { label: '🧠 Why is coloring good for me?', query: 'Tell me how coloring helps my brain grow!' }
];

const PREPARED_RESPONSES: Record<string, { reply: string; prompt?: string; tip?: string }> = {
  'color': {
    reply: "🎨 Great color question! A classic secret in art is pairing opposites: Try Sunny Yellow with Deep Purple, or Mint Green with Coral Pink! For a calm feeling, gentle blues and lavenders work like magic.",
    tip: "Tip: Start with lighter shades first, then add darker bold colors for shadows!"
  },
  'brain': {
    reply: "🧠 Coloring is a superpower for your brain! It strengthens your finger muscles for writing, activates both sides of your brain, and helps you feel super calm and happy.",
    tip: "Fun Fact: Pediatric doctors say coloring for just 15 minutes relaxes your heart rate!"
  },
  'dinosaur': {
    reply: "🦖 Rawr! How about a joyful baby T-Rex having a birthday party in the jungle with a cupcake and balloons?",
    prompt: "cute friendly baby dinosaur wearing party hat playing guitar with jungle flowers",
    tip: "Color tip: Try Lime Green for the dino and Bright Orange for the party hat!"
  },
  'space': {
    reply: "🚀 3... 2... 1... Blastoff! Imagine a curious astronaut kitten soaring in a rocket ship past glowing rings of Saturn!",
    prompt: "smiling astronaut cat floating by Saturn with shooting stars",
    tip: "Color tip: Deep navy blue makes neon yellow stars pop right out of the page!"
  },
  'unicorn': {
    reply: "🦄 Sparkling magic! A royal princess unicorn with butterfly wings leaping across a fluffy rainbow cloud!",
    prompt: "magic princess unicorn flying over rainbow castle in clouds",
    tip: "Color tip: Use soft pastel pink, lavender, and sky blue for a dreamy fairytale glow!"
  },
  'ocean': {
    reply: "🌊 Splash! A baby dolphin and a friendly sea turtle finding a treasure chest surrounded by coral reefs!",
    prompt: "playful baby dolphin and sea turtle discovering sunken treasure chest",
    tip: "Color tip: Aquamarine and seafoam green with golden yellow for the treasure!"
  }
};

const ColoroChatBotModal: React.FC<ColoroChatBotModalProps> = ({
  isOpen,
  onClose,
  onGenerateFromChat
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      sender: 'bot',
      text: "👋 Hi little artist! I'm Coloro Bot, your AI coloring buddy! What would you like to draw or discover today?",
      timestamp: 'Just now'
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      playChime();
    }
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  const handleSendMessage = (textToSend?: string, promptPayload?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    playPop();
    const userMsg: Message = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: text,
      timestamp: 'Just now'
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsThinking(true);

    // Formulate response
    setTimeout(() => {
      let replyText = `✨ That sounds fantastic! I dreamed up a special coloring prompt for you: "${text}". Ready to bring it to life?`;
      let generatedPrompt = promptPayload || text;
      let tipText = "Tip: Use your favorite vibrant colors to make this page uniquely yours!";

      const lower = text.toLowerCase();
      if (lower.includes('color') || lower.includes('palette') || lower.includes('shade')) {
        replyText = PREPARED_RESPONSES.color.reply;
        tipText = PREPARED_RESPONSES.color.tip || '';
        generatedPrompt = undefined;
      } else if (lower.includes('brain') || lower.includes('benefit') || lower.includes('help') || lower.includes('good')) {
        replyText = PREPARED_RESPONSES.brain.reply;
        tipText = PREPARED_RESPONSES.brain.tip || '';
        generatedPrompt = undefined;
      } else if (lower.includes('dino') || lower.includes('t-rex')) {
        replyText = PREPARED_RESPONSES.dinosaur.reply;
        generatedPrompt = PREPARED_RESPONSES.dinosaur.prompt;
        tipText = PREPARED_RESPONSES.dinosaur.tip || '';
      } else if (lower.includes('space') || lower.includes('rocket') || lower.includes('star')) {
        replyText = PREPARED_RESPONSES.space.reply;
        generatedPrompt = PREPARED_RESPONSES.space.prompt;
        tipText = PREPARED_RESPONSES.space.tip || '';
      } else if (lower.includes('unicorn') || lower.includes('fairy') || lower.includes('princess')) {
        replyText = PREPARED_RESPONSES.unicorn.reply;
        generatedPrompt = PREPARED_RESPONSES.unicorn.prompt;
        tipText = PREPARED_RESPONSES.unicorn.tip || '';
      } else if (lower.includes('ocean') || lower.includes('dolphin') || lower.includes('fish') || lower.includes('sea')) {
        replyText = PREPARED_RESPONSES.ocean.reply;
        generatedPrompt = PREPARED_RESPONSES.ocean.prompt;
        tipText = PREPARED_RESPONSES.ocean.tip || '';
      }

      const botMsg: Message = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: replyText,
        promptToGenerate: generatedPrompt,
        colorTip: tipText,
        timestamp: 'Just now'
      };

      setMessages(prev => [...prev, botMsg]);
      setIsThinking(false);
      playChime();
    }, 600);
  };

  const handleTriggerGenerate = (prompt: string) => {
    playClick();
    onGenerateFromChat(prompt);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[125] flex items-center justify-center p-2.5 sm:p-4 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            playClick();
            onClose();
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          className="relative w-full max-w-xl bg-white rounded-3xl sm:rounded-[2.5rem] shadow-2xl overflow-hidden border-3 sm:border-4 border-[#4D96FF] my-auto flex flex-col h-[640px] max-h-[92vh] z-10"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 sm:px-6 py-4 bg-gradient-to-r from-[#4D96FF] via-[#6BCB77] to-[#FFD93D] text-white shrink-0 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center border border-white/30 text-white shadow-inner">
                <Bot className="w-6 h-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg sm:text-xl font-black tracking-tight text-white drop-shadow-sm">Coloro AI Buddy</h3>
                  <span className="bg-white/30 backdrop-blur-sm text-white px-2 py-0.5 rounded-full text-[10px] font-black uppercase">
                    Gemini 2.5
                  </span>
                </div>
                <p className="text-xs font-semibold text-white/90">
                  Ask for creative ideas, color tips, or custom coloring pages!
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                playClick();
                onClose();
              }}
              className="w-9 h-9 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Starter Pills */}
          <div className="px-4 py-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0] overflow-x-auto flex gap-2 shrink-0 scrollbar-none">
            {QUICK_STARTERS.map((item, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (item.prompt) {
                    handleSendMessage(item.label, item.prompt);
                  } else if (item.query) {
                    handleSendMessage(item.query);
                  }
                }}
                className="px-3 py-1.5 bg-white hover:bg-[#EDF2F7] border border-[#CBD5E1] rounded-xl text-xs font-black text-[#334155] whitespace-nowrap shadow-xs hover:scale-102 transition-transform cursor-pointer"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#FFFDF9]">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'bot' && (
                  <div className="w-8 h-8 rounded-xl bg-[#4D96FF] text-white flex items-center justify-center shrink-0 shadow-sm mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 shadow-xs text-sm font-medium ${
                    msg.sender === 'user'
                      ? 'bg-[#4D96FF] text-white rounded-br-none'
                      : 'bg-white border border-[#E2E8F0] text-[#1E293B] rounded-bl-none space-y-2.5'
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>

                  {msg.colorTip && (
                    <div className="bg-[#FEFCE8] text-[#854D0E] text-xs font-semibold p-2.5 rounded-xl border border-[#FEF08A] flex items-start gap-1.5">
                      <Lightbulb className="w-3.5 h-3.5 text-[#EAB308] shrink-0 mt-0.5" />
                      <span>{msg.colorTip}</span>
                    </div>
                  )}

                  {msg.promptToGenerate && (
                    <div className="pt-1">
                      <button
                        onClick={() => handleTriggerGenerate(msg.promptToGenerate!)}
                        className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-[#FF6B6B] to-[#FFD93D] hover:from-[#FA5252] hover:to-[#FCC419] text-white font-black text-xs sm:text-sm rounded-xl shadow-md hover:scale-102 transition-all cursor-pointer"
                      >
                        <Wand2 className="w-4 h-4" />
                        <span>🎨 Draw This on Canvas!</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isThinking && (
              <div className="flex gap-3 justify-start items-center">
                <div className="w-8 h-8 rounded-xl bg-[#4D96FF] text-white flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-white border border-[#E2E8F0] text-[#64748B] text-xs font-bold px-4 py-3 rounded-2xl rounded-bl-none flex items-center gap-1.5 shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-[#FFD93D] animate-spin" />
                  <span>Coloro Bot is thinking of magic colors...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 sm:p-4 bg-white border-t border-[#E2E8F0] flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask for an idea, dinosaur, unicorn, color advice..."
              className="flex-1 bg-[#F8FAFC] border-2 border-[#CBD5E1] focus:border-[#4D96FF] rounded-2xl px-4 py-2.5 text-xs sm:text-sm font-semibold text-[#1E293B] focus:outline-none transition-colors"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isThinking}
              className="w-11 h-11 rounded-2xl bg-[#4D96FF] hover:bg-[#3B82F6] disabled:opacity-40 text-white flex items-center justify-center shadow-md transition-transform hover:scale-105 cursor-pointer disabled:cursor-not-allowed shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ColoroChatBotModal;
