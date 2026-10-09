import React from 'react';
import { Link } from 'react-router-dom';
import { Scissors, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="notfound-page">
      <div className="container text-center py-5">
        <div className="notfound-icon-wrap">
          <Scissors size={48} />
        </div>
        <span className="section-tag">404 Error</span>
        <h1 className="notfound-title font-serif">Pattern Not Found</h1>
        <p className="notfound-desc">
          The page or custom fitting pattern you are looking for has been moved or does not exist.
        </p>
        <Link to="/" className="btn btn-primary btn-lg mt-4">
          <ArrowLeft size={18} />
          <span>Return to Atelier Home</span>
        </Link>
      </div>

      <style>{`
        .notfound-page {
          min-height: 70vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .notfound-icon-wrap {
          width: 80px;
          height: 80px;
          border-radius: var(--radius-full);
          background: var(--soft-blush);
          color: var(--deep-rose);
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem auto;
        }
        .notfound-title {
          font-size: 3rem;
          margin-bottom: 0.5rem;
        }
        .notfound-desc {
          font-size: 1.05rem;
          color: var(--text-muted);
          max-width: 480px;
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
