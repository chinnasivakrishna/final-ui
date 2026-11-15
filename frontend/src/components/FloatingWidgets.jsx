import React, { useState } from 'react';

export default function FloatingWidgets() {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    message: '',
    categories: ['Glass Hardware']
  });
  const [submitted, setSubmitted] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const availableCategories = [
    'Glass Hardware',
    'Sliding Folding Systems',
    'Automatic Sensor Doors',
    'Hotel RFID & Digital Locks',
    'Luxury Shower Cubicles',
    'Acoustic Office Partitions',
    'Architectural Railings',
    'Aluminium Doors & Windows'
  ];

  const handleCategoryToggle = (cat) => {
    setFormData((prev) => {
      const exists = prev.categories.includes(cat);
      if (exists) {
        return { ...prev, categories: prev.categories.filter((c) => c !== cat) };
      } else {
        return { ...prev, categories: [...prev.categories, cat] };
      }
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setShowModal(false);
      setSubmitted(false);
      setFormData({
        name: '',
        phone: '',
        email: '',
        message: '',
        categories: ['Glass Hardware']
      });
    }, 2000);
  };

  return (
    <div className="taiton-floating-widgets">


      <div className="taiton-floating-actions">
        <button
          className="floating-support-btn hover-scale"
          type="button"
          onClick={() => setShowModal(true)}
          title="Customer Support"
          aria-label="Customer Support"
        >
          <i className="fas fa-headset fs-4"></i>
        </button>

        <a
          href="https://wa.me/919063090009"
          target="_blank"
          rel="noopener noreferrer"
          className="floating-whatsapp-btn hover-scale"
          title="Chat on WhatsApp"
          aria-label="Chat on WhatsApp"
        >
          <i className="fab fa-whatsapp fs-2"></i>
        </a>
      </div>

      {showModal && (
        <>
          <div className="modal fade show d-block" tabIndex="-1" role="dialog" aria-modal="true">
            <div className="modal-dialog modal-dialog-centered modal-lg">
              <div className="modal-content rounded-4 border-0 shadow-lg overflow-hidden">
                <div className="modal-header modal-primary-header p-4">
                  <h5 className="modal-header-title mb-0 fw-bold">
                    <i className="fas fa-paper-plane me-2"></i> Get a Quick Quote / Enquiry
                  </h5>
                  <button
                    type="button"
                    className="btn-close btn-close-white"
                    onClick={() => setShowModal(false)}
                    aria-label="Close"
                  ></button>
                </div>
                <div className="modal-body p-4 p-md-5">
                  {submitted ? (
                    <div className="text-center py-4">
                      <div className="rounded-circle bg-success text-white d-inline-flex align-items-center justify-content-center p-3 mb-3">
                        <i className="fas fa-check fs-2"></i>
                      </div>
                      <h4 className="fw-bold text-success mb-2">Enquiry Sent Successfully!</h4>
                      <p className="text-muted">
                        Thank you, {formData.name}. Our architectural specification team will contact you shortly.
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit}>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label htmlFor="modalName" className="form-label fw-semibold">
                            Your Name <span className="text-danger">*</span>
                          </label>
                          <input
                            type="text"
                            className="form-control rounded-3 py-2"
                            id="modalName"
                            placeholder="John Doe"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6">
                          <label htmlFor="modalPhone" className="form-label fw-semibold">
                            Phone Number <span className="text-danger">*</span>
                          </label>
                          <input
                            type="tel"
                            className="form-control rounded-3 py-2"
                            id="modalPhone"
                            placeholder="+91 98765 43210"
                            required
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          />
                        </div>
                        <div className="col-md-12">
                          <label htmlFor="modalEmail" className="form-label fw-semibold">
                            Email Address <span className="text-danger">*</span>
                          </label>
                          <input
                            type="email"
                            className="form-control rounded-3 py-2"
                            id="modalEmail"
                            placeholder="name@example.com"
                            required
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          />
                        </div>

                        <div className="col-md-12">
                          <label className="form-label fw-semibold">Product(s) Interested In</label>
                          <div className="row g-2">
                            {availableCategories.map((cat, idx) => (
                              <div className="col-6 col-md-4" key={idx}>
                                <div className="form-check">
                                  <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id={`modal-cat-${idx}`}
                                    checked={formData.categories.includes(cat)}
                                    onChange={() => handleCategoryToggle(cat)}
                                  />
                                  <label className="form-check-label small" htmlFor={`modal-cat-${idx}`}>
                                    {cat}
                                  </label>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="col-md-12">
                          <label htmlFor="modalMessage" className="form-label fw-semibold">
                            Project Specifications / Message
                          </label>
                          <textarea
                            className="form-control rounded-3 py-2"
                            id="modalMessage"
                            rows="3"
                            placeholder="Please provide your glass thickness, panel size, or project location..."
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          ></textarea>
                        </div>

                        <div className="col-12 text-end mt-4">
                          <button
                            type="button"
                            className="btn btn-light rounded-pill px-4 me-2"
                            onClick={() => setShowModal(false)}
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="btn btn-primary rounded-pill px-5 fw-bold"
                          >
                            Submit Enquiry <i className="fas fa-arrow-right ms-2"></i>
                          </button>
                        </div>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop fade show" onClick={() => setShowModal(false)}></div>
        </>
      )}
    </div>
  );
}
