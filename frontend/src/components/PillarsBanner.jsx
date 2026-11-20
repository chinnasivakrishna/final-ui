import React from 'react';

export default function PillarsBanner() {
  return (
    <section className="pillars-banner text-white w-100 m-0 p-0">
      <div className="taiton-layout-container w-100 m-0 p-0">
        <div className="row g-0 text-center align-items-center m-0 p-0">
          <div className="col-6 col-md pillar-item px-2 m-0">
            <div className="d-flex align-items-center justify-content-center gap-2 gap-lg-3">
              <i className="fas fa-award pillar-icon"></i>
              <div className="text-start fw-bold text-uppercase pillar-title">
                PREMIUM<br />QUALITY
              </div>
            </div>
          </div>
          <div className="col-6 col-md pillar-item px-2 m-0">
            <div className="d-flex align-items-center justify-content-center gap-2 gap-lg-3">
              <i className="fas fa-microchip pillar-icon"></i>
              <div className="text-start fw-bold text-uppercase pillar-title">
                ADVANCED<br />TECHNOLOGY
              </div>
            </div>
          </div>
          <div className="col-6 col-md pillar-item px-2 m-0">
            <div className="d-flex align-items-center justify-content-center gap-2 gap-lg-3">
              <i className="fas fa-lightbulb pillar-icon"></i>
              <div className="text-start fw-bold text-uppercase pillar-title">
                INNOVATIVE<br />DESIGNS
              </div>
            </div>
          </div>
          <div className="col-6 col-md pillar-item px-2 m-0">
            <div className="d-flex align-items-center justify-content-center gap-2 gap-lg-3">
              <i className="fas fa-handshake pillar-icon"></i>
              <div className="text-start fw-bold text-uppercase pillar-title">
                TRUSTED<br />PARTNERSHIPS
              </div>
            </div>
          </div>
          <div className="d-none d-md-block col-md pillar-item px-2 m-0">
            <div className="d-flex align-items-center justify-content-center gap-2 gap-lg-3">
              <i className="fas fa-headset pillar-icon"></i>
              <div className="text-start fw-bold text-uppercase pillar-title">
                TECHNICAL EXPERTISE<br />&amp; SUPPORT
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
