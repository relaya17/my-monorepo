/**
 * דבר המייסדת – Why Vantera?
 * ציטוט יוקרתי עם פס טורקיז, טיפוגרפיה מינימליסטית.
 */
import React from 'react';

const FoundersNote: React.FC = () => {
  return (
    <section className="founders-note" aria-labelledby="founders-note-title">
      <div className="founders-note-inner">
        <h2 id="founders-note-title" className="founders-note-title">Why Vantera?</h2>
        <p className="founders-note-label">A Message from the Founder</p>
        <div className="founders-note-body">
          <p>
            We grew up in cities that grow upward, but the technology that runs our lives inside those towers stayed behind. I saw how lack of transparency, recurring failures, and poor maintenance hurt not only asset value but everyone’s quality of life.
          </p>
          <p>
            I founded Vantera to close that gap. Our goal is not only to fix issues but to predict them; not only to manage finances but to deliver full transparency that restores trust between resident and building. We’re building the intelligence layer that makes our buildings more stable, more efficient, and truly autonomous.
          </p>
          <p className="founders-note-close">
            Join us in writing the next chapter in the life of the city.
          </p>
        </div>
        <div className="founders-note-signature">
          <p className="founders-note-name">Vantera CEO</p>
          <p className="founders-note-tagline">EST. 2026 | THE OPERATING SYSTEM FOR VERTICAL COMMUNITIES</p>
        </div>
      </div>
    </section>
  );
};

export default FoundersNote;
