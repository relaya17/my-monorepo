import React, { useState, useEffect } from 'react';

interface AccessibilitySettings {
  fontSize: 'small' | 'base' | 'large' | 'xl' | 'xxl';
  contrast: 'normal' | 'high';
  motion: 'normal' | 'reduced';
  spacing: 'normal' | 'large';
  links: 'normal' | 'underlined';
}

const AccessibilityPanel: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState<AccessibilitySettings>({
    fontSize: 'base',
    contrast: 'normal',
    motion: 'normal',
    spacing: 'normal',
    links: 'normal'
  });

  useEffect(() => {
    // טעינת הגדרות מ-localStorage
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  useEffect(() => {
    // שמירת הגדרות ב-localStorage
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    
    // החלת הגדרות על הדף
    applySettings(settings);
  }, [settings]);

  const applySettings = (newSettings: AccessibilitySettings) => {
    const root = document.documentElement;
    
    // הגדלת טקסט
    const fontSizeMap = {
      small: '0.875rem',
      base: '1rem',
      large: '1.125rem',
      xl: '1.25rem',
      xxl: '1.5rem'
    };
    
    root.style.setProperty('--font-size-base', fontSizeMap[newSettings.fontSize]);
    
    // ניגודיות
    if (newSettings.contrast === 'high') {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    
    // מרווחים
    if (newSettings.spacing === 'large') {
      document.body.classList.add('large-spacing');
    } else {
      document.body.classList.remove('large-spacing');
    }

    // קו תחתון לקישורים
    if (newSettings.links === 'underlined') {
      document.body.classList.add('underline-links');
    } else {
      document.body.classList.remove('underline-links');
    }
    
    // אנימציות
    if (newSettings.motion === 'reduced') {
      document.body.classList.add('reduced-motion');
    } else {
      document.body.classList.remove('reduced-motion');
    }
  };

  const handleFontSizeChange = (size: AccessibilitySettings['fontSize']) => {
    setSettings(prev => ({ ...prev, fontSize: size }));
  };

  const handleContrastChange = (contrast: AccessibilitySettings['contrast']) => {
    setSettings(prev => ({ ...prev, contrast }));
  };

  const handleMotionChange = (motion: AccessibilitySettings['motion']) => {
    setSettings(prev => ({ ...prev, motion }));
  };

  const handleSpacingChange = (spacing: AccessibilitySettings['spacing']) => {
    setSettings(prev => ({ ...prev, spacing }));
  };

  const handleLinksChange = (links: AccessibilitySettings['links']) => {
    setSettings(prev => ({ ...prev, links }));
  };

  const resetSettings = () => {
    const defaultSettings: AccessibilitySettings = {
      fontSize: 'base',
      contrast: 'normal',
      motion: 'normal',
      spacing: 'normal',
      links: 'normal'
    };
    setSettings(defaultSettings);
  };

  return (
    <>
      {/* כפתור פתיחת פאנל הנגישות */}
      <button
        className="btn btn-primary position-fixed"
        style={{
          bottom: '20px',
          right: '20px',
          zIndex: 1050,
          borderRadius: '50%',
          width: '60px',
          height: '60px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
        }}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="פתח הגדרות נגישות"
        title="הגדרות נגישות"
      >
        <i className="fas fa-universal-access fa-lg"></i>
      </button>

      {/* פאנל הנגישות */}
      {isOpen && (
        <div
          className="position-fixed"
          style={{
            bottom: '90px',
            right: '20px',
            zIndex: 1050,
            width: '350px',
            maxWidth: '90vw'
          }}
        >
          <div className="card shadow-lg border-0">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h6 className="mb-0">
                <i className="fas fa-universal-access me-2"></i>
                הגדרות נגישות
              </h6>
              <button
                className="btn btn-sm btn-outline-light"
                onClick={() => setIsOpen(false)}
                aria-label="סגור"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            
            <div className="card-body">
              {/* גודל טקסט */}
              <div className="mb-3">
                <label className="form-label fw-bold">
                  <i className="fas fa-text-height me-2"></i>
                  גודל טקסט
                </label>
                <div className="btn-group w-100" role="group" aria-label="גודל טקסט">
                  {(['small', 'base', 'large', 'xl', 'xxl'] as const).map((size) => (
                    <button
                      key={size}
                      type="button"
                      className={`btn btn-outline-primary ${settings.fontSize === size ? 'active' : ''}`}
                      onClick={() => handleFontSizeChange(size)}
                      aria-pressed={settings.fontSize === size}
                    >
                      {size === 'small' && 'קטן'}
                      {size === 'base' && 'רגיל'}
                      {size === 'large' && 'גדול'}
                      {size === 'xl' && 'גדול מאוד'}
                      {size === 'xxl' && 'ענק'}
                    </button>
                  ))}
                </div>
              </div>

              {/* ניגודיות */}
              <div className="mb-3">
                <label className="form-label fw-bold">
                  <i className="fas fa-adjust me-2"></i>
                  ניגודיות
                </label>
                <div className="btn-group w-100" role="group" aria-label="ניגודיות">
                  <button
                    type="button"
                    className={`btn btn-outline-primary ${settings.contrast === 'normal' ? 'active' : ''}`}
                    onClick={() => handleContrastChange('normal')}
                    aria-pressed={settings.contrast === 'normal'}
                  >
                    רגיל
                  </button>
                  <button
                    type="button"
                    className={`btn btn-outline-primary ${settings.contrast === 'high' ? 'active' : ''}`}
                    onClick={() => handleContrastChange('high')}
                    aria-pressed={settings.contrast === 'high'}
                  >
                    גבוה
                  </button>
                </div>
              </div>

              {/* מרווחים */}
              <div className="mb-3">
                <label className="form-label fw-bold">
                  <i className="fas fa-arrows-alt-v me-2"></i>
                  מרווחים
                </label>
                <div className="btn-group w-100" role="group" aria-label="מרווחים">
                  <button
                    type="button"
                    className={`btn btn-outline-primary ${settings.spacing === 'normal' ? 'active' : ''}`}
                    onClick={() => handleSpacingChange('normal')}
                    aria-pressed={settings.spacing === 'normal'}
                  >
                    רגיל
                  </button>
                  <button
                    type="button"
                    className={`btn btn-outline-primary ${settings.spacing === 'large' ? 'active' : ''}`}
                    onClick={() => handleSpacingChange('large')}
                    aria-pressed={settings.spacing === 'large'}
                  >
                    גדול
                  </button>
                </div>
              </div>

              {/* אנימציות */}
              <div className="mb-3">
                <label className="form-label fw-bold">
                  <i className="fas fa-play me-2"></i>
                  אנימציות
                </label>
                <div className="btn-group w-100" role="group" aria-label="אנימציות">
                  <button
                    type="button"
                    className={`btn btn-outline-primary ${settings.motion === 'normal' ? 'active' : ''}`}
                    onClick={() => handleMotionChange('normal')}
                    aria-pressed={settings.motion === 'normal'}
                  >
                    רגיל
                  </button>
                  <button
                    type="button"
                    className={`btn btn-outline-primary ${settings.motion === 'reduced' ? 'active' : ''}`}
                    onClick={() => handleMotionChange('reduced')}
                    aria-pressed={settings.motion === 'reduced'}
                  >
                    מופחת
                  </button>
                </div>
              </div>

              {/* קישורים */}
              <div className="mb-3">
                <label className="form-label fw-bold">
                  <i className="fas fa-link me-2"></i>
                  קישורים
                </label>
                <div className="btn-group w-100" role="group" aria-label="קישורים">
                  <button
                    type="button"
                    className={`btn btn-outline-primary ${settings.links === 'normal' ? 'active' : ''}`}
                    onClick={() => handleLinksChange('normal')}
                    aria-pressed={settings.links === 'normal'}
                  >
                    רגיל
                  </button>
                  <button
                    type="button"
                    className={`btn btn-outline-primary ${settings.links === 'underlined' ? 'active' : ''}`}
                    onClick={() => handleLinksChange('underlined')}
                    aria-pressed={settings.links === 'underlined'}
                  >
                    עם קו תחתון
                  </button>
                </div>
              </div>

              {/* כפתור איפוס */}
              <div className="d-grid">
                <button
                  className="btn btn-outline-secondary"
                  onClick={resetSettings}
                  aria-label="אפס הגדרות"
                >
                  <i className="fas fa-undo me-2"></i>
                  אפס הגדרות
                </button>
              </div>

              {/* מידע נוסף */}
              <div className="mt-3">
                <small className="text-muted">
                  <i className="fas fa-info-circle me-1"></i>
                  הגדרות אלו נשמרות בדפדפן שלך
                </small>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AccessibilityPanel; 