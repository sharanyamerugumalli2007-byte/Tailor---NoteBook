import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export default function Layout() {
  return (
    <div className="site-wrapper">
      <Navbar />
      <div className="main-content-area">
        <Outlet />
      </div>
      <Footer />
      <style>{`
        .site-wrapper {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .main-content-area {
          flex: 1;
        }
      `}</style>
    </div>
  );
}
