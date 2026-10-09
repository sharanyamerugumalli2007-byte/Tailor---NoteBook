import React, { useState } from 'react';
import { SIZE_CHART, recommendSize } from '../../utils/sizeCalculator';
import { Ruler, Sparkles, Info, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SizeGuidePage = () => {
  const [unit, setUnit] = useState('inches');
  const [chest, setChest] = useState('');
  const [waist, setWaist] = useState('');
  const [hip, setHip] = useState('');
  const [fitPreference, setFitPreference] = useState('regular');

  const recommendation = recommendSize({
    chest,
    waist,
    hip,
    unit,
    fitPreference
  });

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <span className="badge badge-amber" style={{ marginBottom: '0.5rem' }}>
          Inclusive Tailoring Chart
        </span>
        <h2 className="heading-serif" style={{ fontSize: '2.2rem', color: 'var(--primary)' }}>
          Size Guide & Smart Recommender
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', maxWidth: '650px', margin: '0.5rem auto 0' }}>
          Explore precise standard dimensions from XS to 3XL+, view fit illustrations, or let our mathematical engine recommend your perfect bespoke fit.
        </p>
      </div>

      {/* Smart Size Recommender Engine Box */}
      <div className="card" style={{ marginBottom: '2.5rem', backgroundColor: '#fffdf7', border: '1.5px solid #fde68a' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.25rem' }}>
          <Sparkles size={22} color="var(--accent)" />
          <h3 className="heading-serif" style={{ fontSize: '1.3rem' }}>
            Smart Fit Recommender
          </h3>
        </div>

        <div className="grid-2" style={{ gap: '2rem' }}>
          {/* Inputs */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <label className="form-label" style={{ marginBottom: 0 }}>Measurement Unit</label>
              <div style={{ display: 'flex', gap: '0.35rem' }}>
                <button
                  type="button"
                  className={`btn btn-sm ${unit === 'inches' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setUnit('inches')}
                >
                  Inches (")
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${unit === 'cm' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setUnit('cm')}
                >
                  Centimeters (cm)
                </button>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Chest / Bust Circumference ({unit}) *</label>
              <input
                type="number"
                step="0.5"
                className="form-control"
                placeholder={unit === 'inches' ? 'e.g. 38' : 'e.g. 96'}
                value={chest}
                onChange={(e) => setChest(e.target.value)}
              />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Waist ({unit})</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-control"
                  placeholder={unit === 'inches' ? 'e.g. 32' : 'e.g. 81'}
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Hip ({unit})</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-control"
                  placeholder={unit === 'inches' ? 'e.g. 40' : 'e.g. 102'}
                  value={hip}
                  onChange={(e) => setHip(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Silhouette & Fit Preference *</label>
              <select
                className="form-control form-select"
                value={fitPreference}
                onChange={(e) => setFitPreference(e.target.value)}
              >
                <option value="slim">Slim Fit (Snug contours, minimal 0.5" ease)</option>
                <option value="regular">Regular Fit (Classic balanced bespoke 1.5" ease)</option>
                <option value="relaxed">Relaxed Fit (Breezy comfort, generous 3.0" ease)</option>
              </select>
            </div>
          </div>

          {/* Results Box */}
          <div>
            {recommendation ? (
              <div style={{
                background: '#ffffff',
                border: '1px solid #fde68a',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                boxShadow: 'var(--shadow-sm)'
              }}>
                <div style={{
                  width: '72px',
                  height: '72px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent)',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '2rem',
                  fontWeight: 800,
                  marginBottom: '1rem',
                  boxShadow: '0 4px 16px rgba(180, 83, 9, 0.3)'
                }}>
                  {recommendation.recommendedSize}
                </div>

                <h3 className="heading-serif" style={{ fontSize: '1.4rem', marginBottom: '0.25rem' }}>
                  Optimal Size: {recommendation.recommendedSize}
                </h3>
                <span className="badge badge-amber" style={{ marginBottom: '1rem' }}>
                  {fitPreference.toUpperCase()} FIT
                </span>

                <p style={{ fontSize: '0.9rem', color: '#78350f', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                  {recommendation.advice}
                </p>

                <div style={{
                  background: '#f8fafc',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  marginBottom: '1.25rem',
                  width: '100%'
                }}>
                  {recommendation.fitNote}
                </div>

                <Link to="/customer/catalog" className="btn btn-primary btn-sm">
                  Browse Garments in Size {recommendation.recommendedSize} &rarr;
                </Link>
              </div>
            ) : (
              <div style={{
                height: '100%',
                border: '2px dashed #fde68a',
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '2rem',
                textAlign: 'center',
                color: 'var(--text-muted)'
              }}>
                <Ruler size={44} style={{ opacity: 0.4, marginBottom: '1rem' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                  Enter your chest measurement on the left
                </h4>
                <p style={{ fontSize: '0.8125rem', maxWidth: '300px' }}>
                  Our algorithm will determine your recommended size and tailored drape allowance instantly.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Complete Size Chart */}
      <div className="card" style={{ marginBottom: '2.5rem' }}>
        <h3 className="heading-serif" style={{ fontSize: '1.3rem', marginBottom: '1rem' }}>
          Comprehensive Size Dimensions
        </h3>

        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Chest (Inches)</th>
                <th>Chest (CM)</th>
                <th>Waist (Inches)</th>
                <th>Waist (CM)</th>
                <th>Hip (Inches)</th>
                <th>Shoulder</th>
              </tr>
            </thead>
            <tbody>
              {SIZE_CHART.map((entry) => (
                <tr key={entry.size} style={{
                  backgroundColor: recommendation?.recommendedSize === entry.size ? '#fef3c7' : 'inherit'
                }}>
                  <td>
                    <strong style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: 'var(--bg-subtle)'
                    }}>
                      {entry.size}
                    </strong>
                    {recommendation?.recommendedSize === entry.size && (
                      <span className="badge badge-amber" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>
                        YOUR MATCH
                      </span>
                    )}
                  </td>
                  <td>{entry.chestInches}"</td>
                  <td>{entry.chestCm} cm</td>
                  <td>{entry.waistInches}"</td>
                  <td>{entry.waistCm} cm</td>
                  <td>{entry.hipInches}"</td>
                  <td>{entry.shoulderInches}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Fit Illustrations & Diversity Showcase */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 className="heading-serif" style={{ fontSize: '1.3rem', marginBottom: '0.5rem' }}>
          Garment Fit Illustrations & Gallery
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.25rem' }}>
          Visual representation of how our garments look on diverse body builds across all inclusive sizes.
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {SIZE_CHART.map((entry) => (
            <div key={entry.size} className="card" style={{ padding: '0.85rem' }}>
              <img
                src={entry.exampleImage}
                alt={`Model wearing size ${entry.size}`}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '0.75rem'
                }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <span className="badge badge-amber">Size {entry.size}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chest {entry.chestInches}"</span>
              </div>
              <p style={{ fontSize: '0.8125rem', color: 'var(--text-main)', lineHeight: 1.4 }}>
                {entry.exampleDescription}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SizeGuidePage;
