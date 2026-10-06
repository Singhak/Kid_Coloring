import React, { useState } from 'react';
import { X, Download, Link2, Check } from 'lucide-react';

interface ShareModalProps {
  imageUrl: string;
  fileName: string;
  onClose: () => void;
}

const SITE_URL = 'https://coloro.in';
const TEXT = 'Look at my coloring masterpiece made with Coloro! 🎨';

export default function ShareModal({ imageUrl, fileName, onClose }: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const text = encodeURIComponent(TEXT);
  const url = encodeURIComponent(SITE_URL);

  const download = () => {
    const a = document.createElement('a');
    a.href = imageUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${TEXT} ${SITE_URL}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  // Social sites can't receive an image from a link, so the image is downloaded first
  // and the user attaches it in the opened tab.
  const targets = [
    { name: 'WhatsApp', emoji: '💬', color: '#25D366', href: `https://wa.me/?text=${text}%20${url}` },
    { name: 'Facebook', emoji: '📘', color: '#1877F2', href: `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}` },
    { name: 'X / Twitter', emoji: '🐦', color: '#111111', href: `https://twitter.com/intent/tweet?text=${text}&url=${url}` },
    { name: 'Telegram', emoji: '✈️', color: '#26A5E4', href: `https://t.me/share/url?url=${url}&text=${text}` },
    { name: 'Instagram', emoji: '📸', color: '#E1306C', href: 'https://www.instagram.com/', downloadFirst: true },
  ];

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display font-black text-lg text-[#2D3436]">Share your creation</h3>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-full hover:bg-gray-100 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <img src={imageUrl} alt="Your creation" className="w-full max-h-52 object-contain rounded-2xl border border-gray-200 mb-4 bg-white" />

        <div className="grid grid-cols-2 gap-2">
          {targets.map((t) => (
            <a
              key={t.name}
              href={t.href}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => t.downloadFirst && download()}
              className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-white font-bold text-sm hover:brightness-110 active:scale-95 transition"
              style={{ background: t.color }}
            >
              <span>{t.emoji}</span> {t.name}
            </a>
          ))}
          <button
            onClick={copyLink}
            className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-gray-100 text-[#2D3436] font-bold text-sm hover:bg-gray-200 active:scale-95 transition cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4" /> : <Link2 className="w-4 h-4" />} {copied ? 'Copied!' : 'Copy link'}
          </button>
        </div>

        <button
          onClick={download}
          className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border-2 border-dashed border-gray-300 text-[#2D3436] font-bold text-sm hover:bg-gray-50 cursor-pointer"
        >
          <Download className="w-4 h-4" /> Download image to attach
        </button>
      </div>
    </div>
  );
}
