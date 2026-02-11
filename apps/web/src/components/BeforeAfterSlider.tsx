/**
 * השוואת לפני/אחרי – AI Vision Demo.
 * צד שמאל: "המצב היום" (גג נראה תקין). צד ימין: Vantera Vision (ריבוע אדום מהבהב – זיהוי התנפחות).
 */
import React, { useState } from 'react';

const BeforeAfterSlider: React.FC = () => {
  const [value, setValue] = useState(50);
  return (
    <section className="before-after-section">
      <h2>Don’t wait for the first rain to discover a leak</h2>
      <p className="before-after-sub">Drag the slider: Today’s view ← → Vantera Vision</p>
      <div className="before-after-wrap">
        <div className="before-after-panel before-panel">
          <span className="before-after-label">Today’s view</span>
          <div className="before-after-image before-image" />
        </div>
        <div className="before-after-panel after-panel" style={{ clipPath: `inset(0 ${100 - value}% 0 0)` }}>
          <span className="before-after-label after-label">Vantera Vision</span>
          <div className="before-after-image after-image">
            <span className="ai-detection-box" />
          </div>
        </div>
        <div className="before-after-divider" style={{ left: `${value}%` }} aria-hidden />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={e => setValue(Number(e.target.value))}
          className="before-after-slider"
        />
      </div>
    </section>
  );
};

export default BeforeAfterSlider;
