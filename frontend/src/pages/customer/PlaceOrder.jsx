import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import CustomerSidebar from '../../components/CustomerSidebar';
import { getServices } from '../../services/serviceService';
import { getMeasurements } from '../../services/measurementService';
import { createOrder } from '../../services/orderService';
import { LoadingSpinner } from '../../components/CommonComponents';
import {
  Scissors,
  Layers,
  Ruler,
  Truck,
  CreditCard,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  Info,
  ShieldCheck,
  Plus
} from 'lucide-react';

export default function PlaceOrder() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialServiceId = searchParams.get('serviceId');

  const [step, setStep] = useState(1);
  const [services, setServices] = useState([]);
  const [savedMeasurements, setSavedMeasurements] = useState([]);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    service_id: initialServiceId || '',
    garment_type: 'Custom Blouse',
    quantity: 1,
    fabric_source: 'customer_provided', // 'customer_provided' or 'tailor_provided'
    fabric_type: 'Silk Cotton',
    color: 'Baby Pink / Rose',
    sleeve_style: 'Elbow Length',
    neck_design: 'Sweetheart Neck with Deep Back',
    length_spec: 'Standard 14.5 inches',
    fit_preference: 'Custom Fit',
    customization_notes: '',
    measurement_id: '',
    custom_measurements: {
      unit: 'in',
      bust: 36,
      waist: 30,
      hip: 38,
      shoulder: 14.5,
      sleeve_length: 10.5,
      armhole: 16,
      shirt_length: 14,
      pant_length: 0,
      neck: 7,
      inseam: 0,
      outseam: 0
    },
    use_custom_measurements: false,
    delivery_address: user?.profile?.address || '',
    delivery_city: user?.profile?.city || 'Bengaluru',
    delivery_state: user?.profile?.state || 'Karnataka',
    delivery_postal_code: user?.profile?.postal_code || '560001',
    preferred_delivery_date: '',
    delivery_notes: ''
  });

  useEffect(() => {
    Promise.all([getServices(), getMeasurements()])
      .then(([srvList, measList]) => {
        setServices(srvList);
        setSavedMeasurements(measList);
        if (measList.length > 0) {
          setFormData((prev) => ({ ...prev, measurement_id: String(measList[0].id) }));
        } else {
          setFormData((prev) => ({ ...prev, use_custom_measurements: true }));
        }

        if (initialServiceId) {
          const selected = srvList.find((s) => String(s.id) === String(initialServiceId));
          if (selected) {
            setFormData((prev) => ({
              ...prev,
              service_id: String(selected.id),
              garment_type: selected.name
            }));
          }
        } else if (srvList.length > 0) {
          setFormData((prev) => ({
            ...prev,
            service_id: String(srvList[0].id),
            garment_type: srvList[0].name
          }));
        }
      })
      .finally(() => setLoadingInitial(false));
  }, [initialServiceId]);

  const selectedService = services.find((s) => String(s.id) === String(formData.service_id));
  const basePrice = selectedService ? Number(selectedService.base_price) : 650;
  const customizationFee = formData.fabric_source === 'tailor_provided' ? 300 : 0;
  const deliveryFee = 50;
  const subtotal = (basePrice * Number(formData.quantity || 1)) + customizationFee;
  const totalAmount = subtotal + deliveryFee;
  const advanceRequired = Math.round(totalAmount * 0.3); // 30% advance

  const handleNext = () => {
    setErrorMsg('');
    if (step === 1 && !formData.service_id) {
      setErrorMsg('Please select a tailoring service.');
      return;
    }
    if (step === 3 && !formData.measurement_id && !formData.use_custom_measurements) {
      setErrorMsg('Please select a measurement profile or enter your measurements.');
      return;
    }
    if (step === 4 && (!formData.delivery_address || !formData.delivery_city)) {
      setErrorMsg('Please provide your complete delivery address and city.');
      return;
    }
    setStep((prev) => Math.min(prev + 1, 5));
  };

  const handleBack = () => {
    setErrorMsg('');
    setStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmitOrder = async () => {
    setSubmitting(true);
    setErrorMsg('');

    try {
      const payload = {
        service_id: formData.service_id,
        garment_type: formData.garment_type,
        quantity: formData.quantity,
        fabric_source: formData.fabric_source,
        fabric_type: formData.fabric_type,
        color: formData.color,
        sleeve_style: formData.sleeve_style,
        neck_design: formData.neck_design,
        length_spec: formData.length_spec,
        fit_preference: formData.fit_preference,
        customization_notes: formData.customization_notes,
        measurement_id: formData.use_custom_measurements ? null : formData.measurement_id,
        custom_measurements: formData.use_custom_measurements ? formData.custom_measurements : null,
        delivery_address: formData.delivery_address,
        delivery_city: formData.delivery_city,
        delivery_state: formData.delivery_state,
        delivery_postal_code: formData.delivery_postal_code,
        preferred_delivery_date: formData.preferred_delivery_date || null,
        delivery_notes: formData.delivery_notes
      };

      const createdOrder = await createOrder(payload);
      navigate(`/customer/orders/${createdOrder.id}`);
    } catch (err) {
      setErrorMsg(err.message || 'Failed to place order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingInitial) {
    return <LoadingSpinner text="Preparing tailoring consultation form..." size="large" />;
  }

  const stepsHeader = [
    { num: 1, label: 'Service & Qty' },
    { num: 2, label: 'Customization' },
    { num: 3, label: 'Measurements' },
    { num: 4, label: 'Delivery' },
    { num: 5, label: 'Summary & Advance' },
  ];

  return (
    <div className="portal-page">
      <div className="container portal-container">
        <CustomerSidebar />

        <main className="portal-content">
          <div className="wizard-card studio-card">
            {/* Header & Stepper */}
            <div className="wizard-header">
              <span className="section-tag">Bespoke Stitching Request</span>
              <h1 className="wizard-title font-serif">Place a Custom Order</h1>

              <div className="stepper-bar">
                {stepsHeader.map((s) => (
                  <div
                    key={s.num}
                    className={`stepper-step ${step === s.num ? 'active' : ''} ${step > s.num ? 'completed' : ''}`}
                  >
                    <div className="step-circle">
                      {step > s.num ? <CheckCircle2 size={16} /> : s.num}
                    </div>
                    <span className="step-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            {errorMsg && (
              <div className="alert alert-error animate-fade mb-4">
                <span>{errorMsg}</span>
              </div>
            )}

            {/* SECTION A: Service & Quantity */}
            {step === 1 && (
              <div className="step-section animate-fade">
                <h3 className="step-title font-serif mb-3">Select Tailoring Service</h3>
                <div className="services-select-grid">
                  {services.map((srv) => (
                    <div
                      key={srv.id}
                      onClick={() => {
                        setFormData((prev) => ({
                          ...prev,
                          service_id: String(srv.id),
                          garment_type: srv.name
                        }));
                      }}
                      className={`service-select-card ${String(formData.service_id) === String(srv.id) ? 'selected' : ''}`}
                    >
                      <div className="srv-check-indicator">
                        {String(formData.service_id) === String(srv.id) && <CheckCircle2 size={16} />}
                      </div>
                      <h4 className="srv-card-title">{srv.name}</h4>
                      <p className="srv-card-desc">{srv.short_description}</p>
                      <div className="srv-card-price">
                        <span>Base: ₹{Number(srv.base_price).toFixed(2)}</span>
                        <span className="srv-card-days">{srv.estimated_days} Days</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="form-group mt-4" style={{ maxWidth: '240px' }}>
                  <label className="form-label">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={formData.quantity}
                    onChange={(e) => setFormData((prev) => ({ ...prev, quantity: Math.max(1, parseInt(e.target.value) || 1) }))}
                    className="form-input"
                  />
                </div>
              </div>
            )}

            {/* SECTION B: Fabric & Customization */}
            {step === 2 && (
              <div className="step-section animate-fade">
                <h3 className="step-title font-serif mb-3">Fabric & Style Customizations</h3>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Fabric Source</label>
                    <select
                      value={formData.fabric_source}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fabric_source: e.target.value }))}
                      className="form-select"
                    >
                      <option value="customer_provided">Customer Provided Fabric (Pickup/Courier)</option>
                      <option value="tailor_provided">Studio Provided Fabric (+₹300)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fabric Material / Type</label>
                    <input
                      type="text"
                      placeholder="e.g. Pure Silk, Cotton, Chanderi, Georgette"
                      value={formData.fabric_type}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fabric_type: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Color & Pattern Notes</label>
                    <input
                      type="text"
                      placeholder="e.g. Dusty Rose with Gold Zari Border"
                      value={formData.color}
                      onChange={(e) => setFormData((prev) => ({ ...prev, color: e.target.value }))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Fit Preference</label>
                    <select
                      value={formData.fit_preference}
                      onChange={(e) => setFormData((prev) => ({ ...prev, fit_preference: e.target.value }))}
                      className="form-select"
                    >
                      <option value="Custom Fit">Custom Fit (Tailored Precision)</option>
                      <option value="Regular Fit">Regular Fit (Standard Comfort)</option>
                      <option value="Relaxed Fit">Relaxed Fit (Easy Fit)</option>
                      <option value="Slim Fit">Slim Fit (Snug Silhouette)</option>
                    </select>
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Sleeve Style</label>
                    <input
                      type="text"
                      placeholder="e.g. Elbow Length, Sleeveless, Full Sleeve, Puff"
                      value={formData.sleeve_style}
                      onChange={(e) => setFormData((prev) => ({ ...prev, sleeve_style: e.target.value }))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Neckline Design</label>
                    <input
                      type="text"
                      placeholder="e.g. Sweetheart Neck, Boat Neck, Deep Back with Dori"
                      value={formData.neck_design}
                      onChange={(e) => setFormData((prev) => ({ ...prev, neck_design: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Additional Customization Notes</label>
                  <textarea
                    rows="3"
                    placeholder="Provide specific notes regarding cup padding, hook placement (front/back), piping colors, or latkans..."
                    value={formData.customization_notes}
                    onChange={(e) => setFormData((prev) => ({ ...prev, customization_notes: e.target.value }))}
                    className="form-textarea"
                  />
                </div>
              </div>
            )}

            {/* SECTION C: Measurements */}
            {step === 3 && (
              <div className="step-section animate-fade">
                <h3 className="step-title font-serif mb-3">Select or Enter Measurements</h3>

                <div className="meas-choice-toggle mb-4">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, use_custom_measurements: false }))}
                    className={`meas-choice-btn ${!formData.use_custom_measurements ? 'active' : ''}`}
                  >
                    Use Saved Measurement Profile ({savedMeasurements.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, use_custom_measurements: true }))}
                    className={`meas-choice-btn ${formData.use_custom_measurements ? 'active' : ''}`}
                  >
                    Enter Order-Specific Custom Measurements
                  </button>
                </div>

                {!formData.use_custom_measurements ? (
                  savedMeasurements.length === 0 ? (
                    <div className="empty-meas-alert">
                      <Info size={18} />
                      <div>
                        <p>You don't have any saved measurement profiles yet.</p>
                        <button
                          type="button"
                          onClick={() => setFormData((prev) => ({ ...prev, use_custom_measurements: true }))}
                          className="btn btn-outline btn-sm mt-2"
                        >
                          Enter Custom Measurements for this Order
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="saved-meas-grid">
                      {savedMeasurements.map((m) => (
                        <div
                          key={m.id}
                          onClick={() => setFormData((prev) => ({ ...prev, measurement_id: String(m.id) }))}
                          className={`saved-meas-card ${String(formData.measurement_id) === String(m.id) ? 'selected' : ''}`}
                        >
                          <div className="meas-card-header">
                            <h4 className="meas-title">{m.title}</h4>
                            <span className="meas-unit-badge">{m.unit}</span>
                          </div>
                          <p className="meas-summary">
                            Bust: {m.bust || '-'}, Waist: {m.waist || '-'}, Shoulder: {m.shoulder || '-'}, Sleeve: {m.sleeve_length || '-'}
                          </p>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  <div className="custom-meas-inputs-box">
                    <div className="unit-switch-row mb-3">
                      <span>Measurement Unit:</span>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({
                          ...prev,
                          custom_measurements: { ...prev.custom_measurements, unit: 'in' }
                        }))}
                        className={`btn btn-sm ${formData.custom_measurements.unit === 'in' ? 'btn-primary' : 'btn-outline'}`}
                      >
                        Inches (in)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({
                          ...prev,
                          custom_measurements: { ...prev.custom_measurements, unit: 'cm' }
                        }))}
                        className={`btn btn-sm ${formData.custom_measurements.unit === 'cm' ? 'btn-primary' : 'btn-outline'}`}
                      >
                        Centimeters (cm)
                      </button>
                    </div>

                    <div className="grid-4">
                      <div className="form-group">
                        <label className="form-label">Bust / Chest *</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.custom_measurements.bust || ''}
                          onChange={(e) => setFormData((prev) => ({
                            ...prev,
                            custom_measurements: { ...prev.custom_measurements, bust: parseFloat(e.target.value) || 0 }
                          }))}
                          className="form-input"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Waist *</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.custom_measurements.waist || ''}
                          onChange={(e) => setFormData((prev) => ({
                            ...prev,
                            custom_measurements: { ...prev.custom_measurements, waist: parseFloat(e.target.value) || 0 }
                          }))}
                          className="form-input"
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Hip</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.custom_measurements.hip || ''}
                          onChange={(e) => setFormData((prev) => ({
                            ...prev,
                            custom_measurements: { ...prev.custom_measurements, hip: parseFloat(e.target.value) || 0 }
                          }))}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Shoulder</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.custom_measurements.shoulder || ''}
                          onChange={(e) => setFormData((prev) => ({
                            ...prev,
                            custom_measurements: { ...prev.custom_measurements, shoulder: parseFloat(e.target.value) || 0 }
                          }))}
                          className="form-input"
                        />
                      </div>
                    </div>

                    <div className="grid-4">
                      <div className="form-group">
                        <label className="form-label">Sleeve Length</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.custom_measurements.sleeve_length || ''}
                          onChange={(e) => setFormData((prev) => ({
                            ...prev,
                            custom_measurements: { ...prev.custom_measurements, sleeve_length: parseFloat(e.target.value) || 0 }
                          }))}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Armhole</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.custom_measurements.armhole || ''}
                          onChange={(e) => setFormData((prev) => ({
                            ...prev,
                            custom_measurements: { ...prev.custom_measurements, armhole: parseFloat(e.target.value) || 0 }
                          }))}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Garment Length</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.custom_measurements.shirt_length || ''}
                          onChange={(e) => setFormData((prev) => ({
                            ...prev,
                            custom_measurements: { ...prev.custom_measurements, shirt_length: parseFloat(e.target.value) || 0 }
                          }))}
                          className="form-input"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Front Neck Depth</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.custom_measurements.neck || ''}
                          onChange={(e) => setFormData((prev) => ({
                            ...prev,
                            custom_measurements: { ...prev.custom_measurements, neck: parseFloat(e.target.value) || 0 }
                          }))}
                          className="form-input"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* SECTION D: Delivery Address */}
            {step === 4 && (
              <div className="step-section animate-fade">
                <h3 className="step-title font-serif mb-3">Doorstep Delivery Details</h3>

                <div className="form-group">
                  <label className="form-label">Delivery Street Address *</label>
                  <input
                    type="text"
                    placeholder="Flat No, Apartment, Street name"
                    value={formData.delivery_address}
                    onChange={(e) => setFormData((prev) => ({ ...prev, delivery_address: e.target.value }))}
                    className="form-input"
                    required
                  />
                </div>

                <div className="grid-3">
                  <div className="form-group">
                    <label className="form-label">City *</label>
                    <input
                      type="text"
                      value={formData.delivery_city}
                      onChange={(e) => setFormData((prev) => ({ ...prev, delivery_city: e.target.value }))}
                      className="form-input"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">State</label>
                    <input
                      type="text"
                      value={formData.delivery_state}
                      onChange={(e) => setFormData((prev) => ({ ...prev, delivery_state: e.target.value }))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Postal Code</label>
                    <input
                      type="text"
                      value={formData.delivery_postal_code}
                      onChange={(e) => setFormData((prev) => ({ ...prev, delivery_postal_code: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                </div>

                <div className="grid-2">
                  <div className="form-group">
                    <label className="form-label">Preferred Delivery Date (Optional)</label>
                    <input
                      type="date"
                      value={formData.preferred_delivery_date}
                      onChange={(e) => setFormData((prev) => ({ ...prev, preferred_delivery_date: e.target.value }))}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Delivery Instructions / Landmark</label>
                    <input
                      type="text"
                      placeholder="e.g. Leave with security, call before arrival"
                      value={formData.delivery_notes}
                      onChange={(e) => setFormData((prev) => ({ ...prev, delivery_notes: e.target.value }))}
                      className="form-input"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* SECTION E: Price Summary & Advance Requirement */}
            {step === 5 && (
              <div className="step-section animate-fade">
                <h3 className="step-title font-serif mb-3">Review & Submit Order</h3>

                <div className="summary-split-grid grid-2">
                  {/* Left: Garment Specs Review */}
                  <div className="summary-specs-card">
                    <h4 className="specs-card-title">Order Specifications</h4>
                    <div className="specs-row">
                      <span className="spec-k">Garment:</span>
                      <span className="spec-v">{formData.garment_type} (Qty: {formData.quantity})</span>
                    </div>
                    <div className="specs-row">
                      <span className="spec-k">Fabric Source:</span>
                      <span className="spec-v">{formData.fabric_source === 'customer_provided' ? 'Customer Provided' : 'Studio Provided (+₹300)'}</span>
                    </div>
                    <div className="specs-row">
                      <span className="spec-k">Material & Color:</span>
                      <span className="spec-v">{formData.fabric_type} ({formData.color})</span>
                    </div>
                    <div className="specs-row">
                      <span className="spec-k">Sleeve & Neck:</span>
                      <span className="spec-v">{formData.sleeve_style}, {formData.neck_design}</span>
                    </div>
                    <div className="specs-row">
                      <span className="spec-k">Fit Preference:</span>
                      <span className="spec-v">{formData.fit_preference}</span>
                    </div>
                    <div className="specs-row">
                      <span className="spec-k">Delivery to:</span>
                      <span className="spec-v">{formData.delivery_address}, {formData.delivery_city}</span>
                    </div>
                  </div>

                  {/* Right: Price Breakdown */}
                  <div className="summary-price-card">
                    <h4 className="specs-card-title">Transparent Price Breakdown</h4>
                    <div className="price-line">
                      <span>Base Stitching ({formData.quantity}x ₹{basePrice.toFixed(2)}):</span>
                      <span>₹{(basePrice * formData.quantity).toFixed(2)}</span>
                    </div>
                    {customizationFee > 0 && (
                      <div className="price-line">
                        <span>Fabric & Customization Surcharge:</span>
                        <span>₹{customizationFee.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="price-line">
                      <span>Doorstep Delivery & Logistics:</span>
                      <span>₹{deliveryFee.toFixed(2)}</span>
                    </div>

                    <div className="price-line total-line">
                      <span>Total Order Amount:</span>
                      <span className="total-amount-val">₹{totalAmount.toFixed(2)}</span>
                    </div>

                    <div className="advance-highlight-box mt-3">
                      <div className="advance-row">
                        <span>Required Advance (30%):</span>
                        <span className="advance-amount-val">₹{advanceRequired.toFixed(2)}</span>
                      </div>
                      <p className="advance-subtext">
                        Upon order submission, your order will be created in status <strong>Order Placed</strong>. You can immediately pay the advance of ₹{advanceRequired} via UPI QR to initiate master cutting.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="wizard-nav-footer mt-4">
              {step > 1 ? (
                <button type="button" onClick={handleBack} className="btn btn-outline">
                  <ChevronLeft size={16} />
                  <span>Back</span>
                </button>
              ) : (
                <div />
              )}

              {step < 5 ? (
                <button type="button" onClick={handleNext} className="btn btn-primary">
                  <span>Continue to {stepsHeader[step].label}</span>
                  <ChevronRight size={16} />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmitOrder}
                  disabled={submitting}
                  className="btn btn-primary btn-lg"
                >
                  <Scissors size={18} />
                  <span>{submitting ? 'Creating Order in Database...' : 'Submit Custom Stitching Order'}</span>
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      <style>{`
        .wizard-card {
          padding: 2.5rem;
          background: #ffffff;
        }
        .wizard-title {
          font-size: 2.2rem;
          margin: 0.25rem 0 1.5rem 0;
        }
        .stepper-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 1.5rem;
          margin-bottom: 2rem;
          position: relative;
        }
        .stepper-step {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--text-light);
          font-weight: 600;
          font-size: 0.85rem;
        }
        .step-circle {
          width: 30px;
          height: 30px;
          border-radius: var(--radius-full);
          border: 1.5px solid var(--border-color);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          background: var(--bg-main);
          color: var(--text-muted);
        }
        .stepper-step.active {
          color: var(--deep-rose);
        }
        .stepper-step.active .step-circle {
          background: var(--deep-rose);
          color: #ffffff;
          border-color: var(--deep-rose);
        }
        .stepper-step.completed {
          color: var(--success);
        }
        .stepper-step.completed .step-circle {
          background: var(--success-bg);
          color: var(--success);
          border-color: var(--success);
        }
        .services-select-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
        }
        .service-select-card {
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          cursor: pointer;
          background: var(--bg-main);
          transition: all 0.2s;
          position: relative;
        }
        .service-select-card:hover {
          border-color: var(--rose-accent);
          transform: translateY(-2px);
        }
        .service-select-card.selected {
          border-color: var(--deep-rose);
          background: #FFF0F5;
          box-shadow: 0 0 0 2px rgba(168, 63, 98, 0.2);
        }
        .srv-check-indicator {
          position: absolute;
          top: 1rem;
          right: 1rem;
          color: var(--deep-rose);
        }
        .srv-card-title {
          font-size: 1rem;
          font-weight: 700;
          margin-bottom: 0.35rem;
        }
        .srv-card-desc {
          font-size: 0.8rem;
          color: var(--text-muted);
          line-height: 1.4;
          margin-bottom: 0.75rem;
        }
        .srv-card-price {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          font-weight: 700;
          color: var(--deep-rose);
        }
        .srv-card-days {
          color: var(--text-light);
          font-weight: 500;
          font-size: 0.75rem;
        }
        .meas-choice-toggle {
          display: flex;
          border: 1px solid var(--border-color);
          border-radius: var(--radius-md);
          overflow: hidden;
        }
        .meas-choice-btn {
          flex: 1;
          padding: 0.75rem;
          background: var(--bg-main);
          border: none;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          transition: all 0.2s;
        }
        .meas-choice-btn.active {
          background: var(--deep-rose);
          color: #ffffff;
        }
        .saved-meas-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }
        .saved-meas-card {
          border: 1.5px solid var(--border-color);
          border-radius: var(--radius-md);
          padding: 1.25rem;
          cursor: pointer;
          background: #ffffff;
        }
        .saved-meas-card.selected {
          border-color: var(--deep-rose);
          background: #FFF0F5;
        }
        .meas-card-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
        }
        .meas-title {
          font-size: 0.95rem;
          font-weight: 700;
        }
        .meas-unit-badge {
          font-size: 0.7rem;
          font-weight: 700;
          background: var(--soft-blush);
          color: var(--deep-rose);
          padding: 0.15rem 0.5rem;
          border-radius: var(--radius-full);
        }
        .meas-summary {
          font-size: 0.8rem;
          color: var(--text-muted);
        }
        .custom-meas-inputs-box {
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          padding: 1.5rem;
          border-radius: var(--radius-md);
        }
        .unit-switch-row {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.85rem;
          font-weight: 600;
        }
        .summary-specs-card, .summary-price-card {
          background: var(--bg-main);
          border: 1px solid var(--border-color);
          padding: 1.5rem;
          border-radius: var(--radius-md);
        }
        .specs-card-title {
          font-size: 1.05rem;
          font-weight: 700;
          margin-bottom: 1rem;
          padding-bottom: 0.5rem;
          border-bottom: 1px solid var(--border-color);
        }
        .specs-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.875rem;
          margin-bottom: 0.65rem;
        }
        .spec-k { color: var(--text-muted); }
        .spec-v { font-weight: 600; color: var(--text-main); }
        .price-line {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
          color: var(--text-muted);
          margin-bottom: 0.65rem;
        }
        .total-line {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--text-main);
          padding-top: 0.75rem;
          border-top: 1px dashed var(--border-color);
        }
        .total-amount-val {
          color: var(--deep-rose);
          font-size: 1.35rem;
          font-weight: 800;
        }
        .advance-highlight-box {
          background: #FFF0F5;
          border: 1px solid var(--primary-pink);
          padding: 1rem;
          border-radius: var(--radius-md);
        }
        .advance-row {
          display: flex;
          justify-content: space-between;
          font-size: 1rem;
          font-weight: 700;
          color: var(--deep-rose);
          margin-bottom: 0.35rem;
        }
        .advance-amount-val {
          font-size: 1.25rem;
        }
        .advance-subtext {
          font-size: 0.775rem;
          color: var(--text-muted);
          line-height: 1.4;
        }
        .wizard-nav-footer {
          display: flex;
          justify-content: space-between;
          padding-top: 1.5rem;
          border-top: 1px solid var(--border-color);
        }
        @media (max-width: 868px) {
          .services-select-grid, .saved-meas-grid {
            grid-template-columns: 1fr;
          }
          .stepper-bar {
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
}
