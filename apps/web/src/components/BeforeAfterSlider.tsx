/**
 * השוואת לפני/אחרי – AI Vision Demo.
 * צד שמאל: "המצב היום" (גג נראה תקין). צד ימין: Vantera Vision (ריבוע אדום מהבהב – זיהוי התנפחות).
 */
import React, { useRef, useState, useEffect } from 'react';

const BeforeAfterSlider: React.FC = () => {
  const [value, setValue] = useState(50);
  const afterRef = useRef<HTMLDivElement>(null);
  const dividerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    afterRef.current?.style.setProperty('--ba-clip', `${100 - value}%`);
    dividerRef.current?.style.setProperty('--ba-pos', `${value}%`);
  }, [value]);

  return (
    <section className="before-after-section">
      <h2>Don’t wait for the first rain to discover a leak</h2>
      <p className="before-after-sub">Drag the slider: Today’s view ← → Vantera Vision</p>
      <div className="before-after-wrap">
        <div className="before-after-panel before-panel">
          <span className="before-after-label">Today’s view</span>
          <div className="before-after-image before-image" />
        </div>
        <div ref={afterRef} className="before-after-panel after-panel">
          <span className="before-after-label after-label">Vantera Vision</span>
          <div className="before-after-image after-image">
            <span className="ai-detection-box" />
          </div>
        </div>
        <div ref={dividerRef} className="before-after-divider" aria-hidden />
        <input
          type="range"
          min={0}
          max={100}
          value={value}
          onChange={e => setValue(Number(e.target.value))}
          className="before-after-slider"
          aria-label="Before and after comparison slider"
        />
      </div>
    </section>
  );
};

export default BeforeAfterSlider;
