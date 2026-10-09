import React, { useState } from 'react';
import Modal from './Modal';
import { SIZE_CHART, recommendSize } from '../utils/sizeCalculator';
import { Ruler, Sparkles, CheckCircle, Info } from 'lucide-react';

const SizeGuideModal = ({ isOpen, onClose, initialMeasurements = null }) => {
  const [activeTab, setActiveTab] = useState('recommender'); // 'recommender' | 'chart' | 'illustrations'
  
  // Recommender Form State
  const [unit, setUnit] = useState(initialMeasurements?.unit || 'inches');
  const [chest, setChest] = useState(initialMeasurements?.chest || '');
  const [waist, setWaist] = useState(initialMeasurements?.waist || '');
  const [hip, setHip] = useState(initialMeasurements?.hip || '');
  const [fitPreference, setFitPreference] = useState('regular'); // 'slim' | 'regular' | 'relaxed'

  const recommendation = recommendSize({
    chest,
    waist,
    hip,
    unit,
    fitPreference
  });

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bespoke Size Guide & Smart Recommender" maxWidth="800px">
      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '0.75rem', marginBottom: '1.25rem' }}>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'recommender' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('recommender')}
        >
          <Sparkles size={16} /> Smart Size Recommender
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'chart' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('chart')}
        >
          <Ruler size={16} /> Inclusive Size Chart (XS - 3XL)
        </button>
        <button
          type="button"
          className={`btn btn-sm ${activeTab === 'illustrations' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('illustrations')}
        >
          Fit Illustrations & Gallery
        </button>
      </div>

      {/* Tab 1: Smart Size Recommender */}
      {activeTab === 'recommender' && (
        <div>
          <div style={{ background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Info size={18} color="var(--accent)" />
              <strong style={{ fontSize: '0.875rem' }}>Measurement-Driven Fit Algorithm</strong>
            </div>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Enter your actual tape body measurements and choose your silhouette ease. Our engine calculates proportion tolerances and recommends your ideal size.
            </p>
          </div>

          <div className="grid-2">
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                <label className="form-label">Measurement Unit</label>
                <div style={{ display: 'flex', gap: '0.25rem' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${unit === 'inches' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
                    onClick={() => setUnit('inches')}
                  >
                    Inches (")
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm ${unit === 'cm' ? 'btn-primary' : 'btn-secondary'}`}
                    style={{ padding: '0.2rem 0.5rem', fontSize: '0.75rem' }}
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

              <div className="form-group">
                <label className="form-label">Waist Circumference ({unit})</label>
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
                <label className="form-label">Hip Circumference ({unit})</label>
                <input
                  type="number"
                  step="0.5"
                  className="form-control"
                  placeholder={unit === 'inches' ? 'e.g. 40' : 'e.g. 102'}
                  value={hip}
                  onChange={(e) => setHip(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fit Preference</label>
                <select
                  className="form-control form-select"
                  value={fitPreference}
                  onChange={(e) => setFitPreference(e.target.value)}
                >
                  <option value="slim">Slim Fit (Snug contour, minimal ease)</option>
                  <option value="regular">Regular Fit (Classic balanced bespoke ease)</option>
                  <option value="relaxed">Relaxed Fit (Breezy comfort, generous drape)</option>
                </select>
              </div>
            </div>

            {/* Recommendation Result Card */}
            <div>
              {recommendation ? (
                <div style={{
                  background: 'linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%)',
                  border: '1px solid #fde68a',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.5rem',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center'
                }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--accent)',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.75rem',
                    fontWeight: 'bold',
                    boxShadow: '0 4px 12px rgba(180, 83, 9, 0.25)',
                    marginBottom: '1rem'
                  }}>
                    {recommendation.recommendedSize}
                  </div>

                  <h4 className="heading-serif" style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                    Recommended Size: {recommendation.recommendedSize}
                  </h4>
                  <span className="badge badge-amber" style={{ marginBottom: '1rem' }}>
                    {fitPreference.toUpperCase()} FIT
                  </span>

                  <p style={{ fontSize: '0.875rem', color: '#78350f', lineHeight: 1.5, marginBottom: '1rem' }}>
                    {recommendation.advice}
                  </p>

                  <div style={{
                    background: 'rgba(255, 255, 255, 0.7)',
                    border: '1px solid #fde68a',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.75rem',
                    fontSize: '0.75rem',
                    color: '#92400e',
                    width: '100%'
                  }}>
                    {recommendation.fitNote}
                  </div>
                </div>
              ) : (
                <div style={{
                  background: '#f8fafc',
                  border: '2px dashed var(--border)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '2rem 1.5rem',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  textAlign: 'center',
                  color: 'var(--text-muted)'
                }}>
                  <Ruler size={36} style={{ marginBottom: '0.75rem', opacity: 0.5 }} />
                  <p style={{ fontWeight: 600, fontSize: '0.925rem', marginBottom: '0.25rem' }}>
                    Enter your chest or bust measurement
                  </p>
                  <p style={{ fontSize: '0.8125rem' }}>
                    We'll calculate your recommended garment size and fit allowance instantly.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Inclusive Size Chart */}
      {activeTab === 'chart' && (
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Chest (Inches)</th>
                <th>Chest (CM)</th>
                <th>Waist (Inches)</th>
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
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-subtle)'
                    }}>
                      {entry.size}
                    </strong>
                    {recommendation?.recommendedSize === entry.size && (
                      <span className="badge badge-amber" style={{ marginLeft: '0.5rem', fontSize: '0.65rem' }}>
                        YOUR FIT
                      </span>
                    )}
                  </td>
                  <td>{entry.chestInches}"</td>
                  <td>{entry.chestCm} cm</td>
                  <td>{entry.waistInches}"</td>
                  <td>{entry.hipInches}"</td>
                  <td>{entry.shoulderInches}"</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Fit Illustrations & Real Garments Gallery */}
      {activeTab === 'illustrations' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem', maxHeight: '500px', overflowY: 'auto' }}>
          {SIZE_CHART.map((entry) => (
            <div key={entry.size} className="card" style={{ padding: '0.75rem', display: 'flex', flexDirection: 'column' }}>
              <img
                src={entry.exampleImage}
                alt={`Size ${entry.size} fit`}
                style={{
                  width: '100%',
                  height: '160px',
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '0.75rem'
                }}
              />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <span className="badge badge-amber">Size {entry.size}</span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Chest {entry.chestInches}"</span>
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-main)', lineHeight: 1.4, flex: 1 }}>
                {entry.exampleDescription}
              </p>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
        <button type="button" className="btn btn-secondary" onClick={onClose}>
          Close Guide
        </button>
      </div>
    </Modal>
  );
};

export default SizeGuideModal;
