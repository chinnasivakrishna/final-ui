import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import GoogleLoginModal from './components/GoogleLoginModal';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import AboutPage from './pages/AboutPage';
import OperationsPage from './pages/OperationsPage';
import CataloguesPage from './pages/CataloguesPage';
import CatalogueViewerPage from './pages/CatalogueViewerPage';
import ProductsPage from './pages/ProductsPage';
import ProductListPage from './pages/ProductListPage';
import ProductDetailPage from './pages/ProductDetailPage';
import ProductCategoryPage from './pages/ProductCategoryPage';
import ExploreSpacesPage from './pages/ExploreSpacesPage';
import ContactPage from './pages/ContactPage';
import ExperienceCenterPage from './pages/ExperienceCenterPage';
import AwardsPage from './pages/AwardsPage';
import EventsPage from './pages/EventsPage';
import BlogsPage from './pages/BlogsPage';
import BlogDetailPage from './pages/BlogDetailPage';
import ComingSoonPage from './pages/ComingSoonPage';
import CareersPage from './pages/CareersPage';
import VideosPage from './pages/VideosPage';
import OurTeamPage from './pages/OurTeamPage';
import ProfilePage from './pages/ProfilePage';

function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (hash) {
      const element = document.querySelector(hash);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }
    window.scrollTo(0, 0);
  }, [pathname, hash]);

  return null;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ScrollToTop />
        <GoogleLoginModal />
        <MainLayout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/index.html" element={<HomePage />} />

            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile.html" element={<ProfilePage />} />
            <Route path="/cart" element={<Navigate to="/profile?tab=cart" replace />} />
            <Route path="/wishlist" element={<Navigate to="/profile?tab=wishlist" replace />} />
            <Route path="/recently-viewed" element={<Navigate to="/profile?tab=recently-viewed" replace />} />

          <Route path="/about" element={<AboutPage />} />
          <Route path="/about.html" element={<AboutPage />} />
          <Route path="/about-us" element={<AboutPage />} />
          <Route path="/about-us.html" element={<AboutPage />} />

          <Route path="/operations" element={<OperationsPage />} />
          <Route path="/operations.html" element={<OperationsPage />} />

          <Route path="/catalogues" element={<CataloguesPage />} />
          <Route path="/catalogues.html" element={<CataloguesPage />} />
          <Route path="/catalogue" element={<CataloguesPage />} />
          <Route path="/catalogue.html" element={<CataloguesPage />} />

          <Route path="/catalogue-view" element={<CatalogueViewerPage />} />
          <Route path="/catalogue-view.html" element={<CatalogueViewerPage />} />
          <Route path="/catalogue-viewer" element={<CatalogueViewerPage />} />
          <Route path="/catalogue-viewer.html" element={<CatalogueViewerPage />} />

          <Route path="/explore-spaces" element={<ExploreSpacesPage />} />
          <Route path="/explore-spaces.html" element={<ExploreSpacesPage />} />

          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products.html" element={<ProductsPage />} />

          <Route path="/product-category" element={<ProductCategoryPage />} />
          <Route path="/product-category.html" element={<ProductCategoryPage />} />

          <Route
            path="/product-glass-hardware"
            element={<ProductCategoryPage categoryKey="cat-glass" />}
          />
          <Route
            path="/product-glass-hardware.html"
            element={<ProductCategoryPage categoryKey="cat-glass" />}
          />

          <Route
            path="/product-sliding-systems"
            element={<ProductCategoryPage categoryKey="cat-sliding" />}
          />
          <Route
            path="/product-sliding-systems.html"
            element={<ProductCategoryPage categoryKey="cat-sliding" />}
          />

          <Route
            path="/product-automatic-doors"
            element={<ProductCategoryPage categoryKey="cat-doors" />}
          />
          <Route
            path="/product-automatic-doors.html"
            element={<ProductCategoryPage categoryKey="cat-doors" />}
          />

          <Route
            path="/product-digital-locks"
            element={<ProductCategoryPage categoryKey="cat-locks" />}
          />
          <Route
            path="/product-digital-locks.html"
            element={<ProductCategoryPage categoryKey="cat-locks" />}
          />

          <Route path="/product-list" element={<ProductListPage />} />
          <Route path="/product-list.html" element={<ProductListPage />} />

          <Route path="/product-detail" element={<ProductDetailPage />} />
          <Route path="/product-detail.html" element={<ProductDetailPage />} />

          <Route path="/experience-center" element={<ExperienceCenterPage />} />
          <Route path="/experience-center.html" element={<ExperienceCenterPage />} />

          <Route path="/operations-logistics" element={<OperationsPage />} />

          <Route path="/awards" element={<AwardsPage />} />
          <Route path="/awards.html" element={<AwardsPage />} />
          <Route path="/awards-achievements" element={<AwardsPage />} />
          <Route path="/awards-achievements.html" element={<AwardsPage />} />

          <Route path="/exhibitions-events" element={<EventsPage />} />
          <Route path="/exhibitions-events.html" element={<EventsPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/events.html" element={<EventsPage />} />

          <Route path="/blogs" element={<ComingSoonPage title="Blogs & Articles" />} />
          <Route path="/blogs.html" element={<ComingSoonPage title="Blogs & Articles" />} />
          <Route path="/articles" element={<ComingSoonPage title="Blogs & Articles" />} />
          <Route path="/articles.html" element={<ComingSoonPage title="Blogs & Articles" />} />
          <Route path="/blogs-preview" element={<BlogsPage />} />
          <Route path="/coming-soon" element={<ComingSoonPage />} />
          <Route path="/blog-detail" element={<BlogDetailPage />} />
          <Route path="/blog-detail.html" element={<BlogDetailPage />} />
          <Route path="/blog-preview" element={<BlogDetailPage />} />

          <Route path="/videos" element={<VideosPage />} />
          <Route path="/videos.html" element={<VideosPage />} />

          <Route path="/careers" element={<CareersPage />} />
          <Route path="/careers.html" element={<CareersPage />} />

          <Route path="/our-team" element={<OurTeamPage />} />
          <Route path="/our-team.html" element={<OurTeamPage />} />
          <Route path="/team" element={<OurTeamPage />} />
          <Route path="/team.html" element={<OurTeamPage />} />

          <Route path="/contact" element={<ContactPage />} />
          <Route path="/contact.html" element={<ContactPage />} />
          <Route path="/contact-us" element={<ContactPage />} />
          <Route path="/contact-us.html" element={<ContactPage />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </MainLayout>
    </AuthProvider>
  </BrowserRouter>
  );
}
