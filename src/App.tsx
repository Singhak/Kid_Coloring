import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import LandingPage from './components/LandingPage';
import { tracker } from './services/tracker';

// Code-split ColoringStudio so the landing page loads at lightning speed
const ColoringStudio = lazy(() => import('./ColoringStudio'));

type AppRoute = 'landing' | 'app';

export default function App() {
  const [route, setRoute] = useState<AppRoute>(() => {
    if (typeof window === 'undefined') return 'landing';

    const pathname = window.location.pathname.toLowerCase();
    const search = window.location.search;
    const hash = window.location.hash.toLowerCase();
    const params = new URLSearchParams(search);

    // 1. Direct hit to /app or /app/*
    if (pathname.startsWith('/app')) {
      return 'app';
    }

    // 2. Backward compatibility for legacy /category/xyz URLs -> redirect to /app?category=xyz
    if (pathname.startsWith('/category/')) {
      const cat = pathname.replace('/category/', '').replace(/\/$/, '');
      try {
        window.history.replaceState(null, '', `/app?category=${cat}`);
      } catch (e) {}
      return 'app';
    }

    // 3. Backward compatibility for Pinterest direct query/hash links:
    //    e.g. https://coloro.in/?category=alphabet or https://coloro.in/#category=space
    if (
      params.get('category') ||
      params.get('cat') ||
      hash.startsWith('#category=') ||
      hash.startsWith('#cat=') ||
      hash === '#pinterest-studio' ||
      params.get('tool') === 'pinterest-studio'
    ) {
      try {
        window.history.replaceState(null, '', `/app${window.location.search}${window.location.hash}`);
      } catch (e) {}
      return 'app';
    }

    // 4. Default root https://coloro.in/ -> Landing Page
    return 'landing';
  });

  // Preload ColoringStudio bundle in the background after landing page has rendered
  useEffect(() => {
    if (route === 'landing') {
      const prefetchTimer = setTimeout(() => {
        import('./ColoringStudio');
      }, 1200);
      return () => clearTimeout(prefetchTimer);
    }
  }, [route]);

  // Listen for browser Back/Forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const pathname = window.location.pathname.toLowerCase();
      if (pathname.startsWith('/app')) {
        setRoute('app');
        tracker.pageView(window.location.pathname + window.location.search, 'Coloro Digital Art Studio');
      } else {
        setRoute('landing');
        tracker.pageView('/', 'Coloro Magic AI Coloring Book | Home');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Smooth Client-Side Router Navigation without Hard Page Reload
  const navigateTo = useCallback((targetUrl: string) => {
    try {
      window.history.pushState(null, '', targetUrl);
    } catch (e) {}

    if (targetUrl.startsWith('/app')) {
      setRoute('app');
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
      tracker.pageView(targetUrl, 'Coloro Digital Art Studio');
    } else {
      setRoute('landing');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      tracker.pageView('/', 'Coloro Magic AI Coloring Book | Home');
    }
  }, []);

  if (route === 'landing') {
    return (
      <LandingPage
        onLaunchApp={(category) => {
          if (category) {
            navigateTo(`/app?category=${encodeURIComponent(category)}`);
          } else {
            navigateTo('/app');
          }
        }}
        onOpenPricing={() => {
          navigateTo('/app#pricing');
        }}
      />
    );
  }

  return (
    <Suspense
      fallback={
        <div className="h-[100dvh] w-screen bg-[#FFFDF9] flex flex-col items-center justify-center gap-4">
          <div className="w-14 h-14 border-4 border-[#FFD93D] border-t-[#FF595E] rounded-full animate-spin" />
          <p className="font-bold text-sm text-[#8C5B00] animate-pulse">Launching Coloro Studio...</p>
        </div>
      }
    >
      <ColoringStudio
        onNavigateHome={() => {
          navigateTo('/');
        }}
      />
    </Suspense>
  );
}
