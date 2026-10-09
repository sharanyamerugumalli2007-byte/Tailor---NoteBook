import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ruler, Sparkles, CheckCircle2, Scissors, Info, ArrowRight } from 'lucide-react';

export default function SizeGuide() {
  const [unit, setUnit] = useState('in'); // 'in' or 'cm'
  const [calcBust, setCalcBust] = useState('');
  const [calcWaist, setCalcWaist] = useState('');
  const [fitPreference, setFitPreference] = useState('Custom Fit');
  const [recommendation, setRecommendation] = useState(null);

  const sizeTableInches = [
    { size: 'XS', uk: '6', bust: '31 - 32', waist: '24 - 25', hip: '33 - 34', shoulder: '13.5' },
    { size: 'S', uk: '8', bust: '33 - 34', waist: '26 - 27', hip: '35 - 36', shoulder: '14.0' },
    { size: 'M', uk: '10', bust: '35 - 36', waist: '28 - 29', hip: '37 - 38', shoulder: '14.5' },
    { size: 'L', uk: '12', bust: '37 - 39', waist: '30 - 32', hip: '39 - 41', shoulder: '15.0' },
    { size: 'XL', uk: '14', bust: '40 - 42', waist: '33 - 35', hip: '42 - 44', shoulder: '15.5' },
    { size: 'XXL', uk: '16', bust: '43 - 45', waist: '36 - 38', hip: '45 - 47', shoulder: '16.0' },
    { size: '3XL', uk: '18', bust: '46 - 48', waist: '39 - 41', hip: '48 - 50', shoulder: '16.5' },
  ];

  const sizeTableCm = [
    { size: 'XS', uk: '6', bust: '78 - 81', waist: '61 - 64', hip: '84 - 87', shoulder: '34' },
    { size: 'S', uk: '8', bust: '83 - 87', waist: '66 - 69', hip: '89 - 92', shoulder: '35.5' },
    { size: 'M', uk: '10', bust: '89 - 92', waist: '71 - 74', hip: '94 - 97', shoulder: '37' },
    { size: 'L', uk: '12', bust: '94 - 99', waist: '76 - 81', hip: '99 - 104', shoulder: '38' },
    { size: 'XL', uk: '14', bust: '101 - 107', waist: '84 - 89', hip: '107 - 112', shoulder: '39.5' },
    { size: 'XXL', uk: '16', bust: '109 - 114', waist: '91 - 97', hip: '114 - 119', shoulder: '40.5' },
    { size: '3XL', uk: '18', bust: '116 - 122', waist: '99 - 104', hip: '122 - 127', shoulder: '42' },
  ];

  const currentTable = unit === 'in' ? sizeTableInches : sizeTableCm;

  const handleRecommend = (e) => {
    e.preventDefault();
    const b = parseFloat(calcBust);
    const w = parseFloat(calcWaist);

    if (isNaN(b) || isNaN(w)) {
      setRecommendation(null);
      return;
    }

    const bInch = unit === 'in' ? b : b / 2.54;
    let recSize = 'M';
    if (bInch < 33) recSize = 'XS';
    else if (bInch <= 34.5) recSize = 'S';
    else if (bInch <= 36.5) recSize = 'M';
    else if (bInch <= 39.5) recSize = 'L';
    else if (bInch <= 42.5) recSize = 'XL';
    else if (bInch <= 45.5) recSize = 'XXL';
    else recSize = '3XL';

    setRecommendation({
      size: recSize,
      fit: fitPreference,
      note: `Recommended base size is ${recSize} with ${fitPreference}. In our bespoke atelier, your exact custom measurements will be cut with precision margins.`
    });
  };

  return (
    <div className="size-guide-page">
      <div className="guide-hero">
        <div className="container text-center">
          <span className="section-tag">Precision Atelier Standards</span>
          <h1 className="page-title font-serif">Interactive Size & Fit Guide</h1>
          <p className="page-subtitle">
            Find your ideal size, understand standard body measurements, or get an instant size estimate for your bespoke tailoring orders.
          </p>
        </div>
      </div>

      <div className="container py-5">
        {/* Interactive Recommender */}
        <div className="recommender-card studio-card mb-5">
          <div className="recommender-header">
            <div className="recommender-icon">
              <Sparkles size={22} />
            </div>
            <div>
              <h2 className="recommender-title font-serif">Instant Size Recommender</h2>
              <p className="recommender-desc">Enter your key measurements below to view your closest standard benchmark.</p>
            </div>
          </div>

          <form onSubmit={handleRecommend} className="recommender-form">
            <div className="recommender-inputs">
              <div className="form-group">
                <label className="form-label">Measurement Unit</label>
                <div className="unit-toggle-group">
                  <button
                    type="button"
                    onClick={() => setUnit('in')}
                    className={`unit-btn ${unit === 'in' ? 'active' : ''}`}
                  >
                    Inches (in)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUnit('cm')}
                    className={`unit-btn ${unit === 'cm' ? 'active' : ''}`}
                  >
                    Centimeters (cm)
                  </button>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Bust / Chest ({unit})</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder={unit === 'in' ? 'e.g. 36.0' : 'e.g. 91.5'}
                  value={calcBust}
                  onChange={(e) => setCalcBust(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Natural Waist ({unit})</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder={unit === 'in' ? 'e.g. 30.0' : 'e.g. 76.0'}
                  value={calcWaist}
                  onChange={(e) => setCalcWaist(e.target.value)}
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Fit Preference</label>
                <select
                  value={fitPreference}
                  onChange={(e) => setFitPreference(e.target.value)}
                  className="form-select"
                >
                  <option value="Custom Fit">Custom Fit (Atelier Precision)</option>
                  <option value="Regular Fit">Regular Fit (Standard Comfort)</option>
                  <option value="Relaxed Fit">Relaxed Fit (Easy Ease)</option>
                  <option value="Slim Fit">Slim Fit (Snug Tailored)</option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-primary mt-2">
              <Ruler size={16} />
              <span>Calculate Recommended Benchmark</span>
            </button>
          </form>

          {recommendation && (
            <div className="rec-result-box animate-fade mt-4">
              <div className="rec-badge">
                <span className="rec-label">Closest Benchmark Size:</span>
                <span className="rec-val">{recommendation.size}</span>
              </div>
              <p className="rec-note">{recommendation.note}</p>
              <div className="rec-disclaimer">
                <Info size={14} />
                <span>Note: Standard charts are approximate. Custom tailoring utilizes your specific measurements for each cut.</span>
              </div>
            </div>
          )}
        </div>

        {/* Size Chart Table */}
        <div className="chart-section studio-card mb-5">
          <div className="chart-header">
            <div>
              <h2 className="chart-title font-serif">Standard Women's Size Benchmark</h2>
              <p className="chart-desc">Measurements in <strong>{unit === 'in' ? 'Inches (in)' : 'Centimeters (cm)'}</strong></p>
            </div>
            <div className="unit-switch">
              <button onClick={() => setUnit('in')} className={`btn btn-sm ${unit === 'in' ? 'btn-primary' : 'btn-outline'}`}>
                Inches
              </button>
              <button onClick={() => setUnit('cm')} className={`btn btn-sm ${unit === 'cm' ? 'btn-primary' : 'btn-outline'}`}>
                CM
              </button>
            </div>
          </div>

          <div className="table-responsive">
            <table className="size-table">
              <thead>
                <tr>
                  <th>Size</th>
                  <th>UK / Standard</th>
                  <th>Bust / Chest</th>
                  <th>Waist</th>
                  <th>Hip</th>
                  <th>Shoulder</th>
                </tr>
              </thead>
              <tbody>
                {currentTable.map((row) => (
                  <tr key={row.size}>
                    <td className="size-pill-td">
                      <span className="size-pill">{row.size}</span>
                    </td>
                    <td>UK {row.uk}</td>
                    <td>{row.bust} {unit}</td>
                    <td>{row.waist} {unit}</td>
                    <td>{row.hip} {unit}</td>
                    <td>{row.shoulder} {unit}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Measuring Guide Cards */}
        <div className="guide-instructions-grid grid-3">
          <div className="guide-card studio-card">
            <div className="guide-icon-wrap">
              <Ruler size={22} />
            </div>
            <h3 className="guide-card-title">How to Measure Bust</h3>
            <p className="guide-card-desc">
              Wrap measuring tape comfortably around the fullest part of your bust across shoulder blades. Keep tape level and not too tight.
            </p>
          </div>

          <div className="guide-card studio-card">
            <div className="guide-icon-wrap">
              <Ruler size={22} />
            </div>
            <h3 className="guide-card-title">How to Measure Waist</h3>
            <p className="guide-card-desc">
              Measure around your natural waistline, which is generally 1-2 inches above your belly button. Breathe normally while taking measurement.
            </p>
          </div>

          <div className="guide-card studio-card">
            <div className="guide-icon-wrap">
              <Ruler size={22} />
            </div>
            <h3 className="guide-card-title">How to Measure Shoulder</h3>
            <p className="guide-card-desc">
              Measure horizontally across the back from the tip of the left shoulder bone to the tip of the right shoulder bone.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .guide-hero {
          background: linear-gradient(135deg, #FFF0F5 0%, #FCE4EC 100%);
          padding: 4rem 0 3.5rem 0;
          border-bottom: 1px solid var(--border-color);
        }
        .recommender-card {
          padding: 2.5rem;
          background: #ffffff;
        }
        .recommender-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .recommender-icon {
          width: 50px;
          height: 50px;
          border-radius: var(--radius-full);
          background: var(--soft-blush);
          color: var(--deep-rose);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .recommender-title {
          font-size: 1.6rem;
          margin-bottom: 0.25rem;
        }
        .recommender-desc {
          font-size: 0.9rem;
          color: var(--text-muted);
        }
        .recommender-inputs {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }
        .unit-toggle-group {
          display: flex;
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
          background: #ffffff;
        }
        .unit-btn {
          flex: 1;
          padding: 0.65rem 0.5rem;
          background: transparent;
          border: none;
          font-size: 0.8rem;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .unit-btn.active {
          background: var(--deep-rose);
          color: #ffffff;
        }
        .rec-result-box {
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          padding: 1.5rem;
          border-radius: var(--radius-md);
        }
        .rec-badge {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .rec-label {
          font-weight: 600;
          color: var(--text-muted);
        }
        .rec-val {
          font-size: 1.4rem;
          font-weight: 800;
          color: var(--deep-rose);
        }
        .rec-note {
          font-size: 0.9rem;
          color: var(--text-main);
          line-height: 1.5;
          margin-bottom: 0.75rem;
        }
        .rec-disclaimer {
          display: flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.775rem;
          color: var(--text-light);
        }

        .chart-section {
          padding: 2rem;
          background: #ffffff;
        }
        .chart-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
          gap: 1rem;
        }
        .chart-title {
          font-size: 1.5rem;
          margin-bottom: 0.25rem;
        }
        .chart-desc {
          font-size: 0.85rem;
          color: var(--text-muted);
        }
        .unit-switch {
          display: flex;
          gap: 0.5rem;
        }
        .table-responsive {
          overflow-x: auto;
        }
        .size-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .size-table th {
          background: var(--soft-blush);
          color: var(--deep-rose);
          font-size: 0.825rem;
          font-weight: 700;
          text-transform: uppercase;
          padding: 0.85rem 1rem;
          border-bottom: 1px solid var(--border-color);
        }
        .size-table td {
          padding: 1rem;
          border-bottom: 1px solid var(--border-color);
          font-size: 0.9rem;
          color: var(--text-main);
        }
        .size-table tr:hover td {
          background: var(--bg-main);
        }
        .size-pill {
          background: var(--soft-blush);
          color: var(--deep-rose);
          font-weight: 800;
          font-size: 0.85rem;
          padding: 0.25rem 0.65rem;
          border-radius: var(--radius-full);
          display: inline-block;
        }
        .guide-card {
          padding: 1.75rem;
          background: #ffffff;
        }
        .guide-icon-wrap {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background: var(--soft-blush);
          color: var(--deep-rose);
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 1rem;
        }
        .guide-card-title {
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        .guide-card-desc {
          font-size: 0.875rem;
          color: var(--text-muted);
          line-height: 1.55;
        }
        .mb-5 { margin-bottom: 2.5rem; }
        .mt-4 { margin-top: 1.5rem; }
        .mt-2 { margin-top: 0.5rem; }
        @media (max-width: 868px) {
          .recommender-inputs { grid-template-columns: 1fr 1fr; }
        }
        @media (max-width: 540px) {
          .recommender-inputs { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}
