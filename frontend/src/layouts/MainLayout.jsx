import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import FloatingWidgets from '../components/FloatingWidgets';
import SearchOverlay from '../components/SearchOverlay';
import MobileSideNav from '../components/MobileSideNav';
import Preloader from '../components/Preloader';

export default function MainLayout({ children }) {
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const location = useLocation();
  const headerRef = React.useRef(null);

  React.useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        const height = headerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--header-height', `${height}px`);
      }
    };
    updateHeaderHeight();
    const observer = new ResizeObserver(updateHeaderHeight);
    if (headerRef.current) {
      observer.observe(headerRef.current);
    }
    window.addEventListener('resize', updateHeaderHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeaderHeight);
    };
  }, []);

  const isCatalogueViewer =
    location.pathname.startsWith('/catalogue-view') ||
    location.pathname.startsWith('/catalogue-viewer');

  if (isCatalogueViewer) {
    return <main className="catalogue-viewer-standalone">{children}</main>;
  }

  return (
    <div className="d-flex flex-column min-vh-100">
      <Preloader />
      <header className="header taiton-header shadow-sm bg-white sticky-top" ref={headerRef}>
        <Header onOpenSearch={() => setIsSearchOpen(true)} />
        <Navbar
          isMobileNavOpen={isMobileNavOpen}
          onToggleMobileNav={() => setIsMobileNavOpen((prev) => !prev)}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          onCloseMobileNav={() => setIsMobileNavOpen(false)}
          onOpenSearch={() => setIsSearchOpen(true)}
        />
      </header>

      <main className="flex-grow-1">
        {children}
      </main>

      <Footer />

      <FloatingWidgets />

      <SearchOverlay
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />

      <MobileSideNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />
    </div>
  );
}
