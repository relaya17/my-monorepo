/**
 * /fr – מגדיר צרפתית ומפנה לדף הנחיתה.
 * חוסך import מ-Landing (פותר בעיות ESM).
 */
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setLanguage } from '../redux/slice/settingsSlice';
import { safeSetItem } from '../utils/safeStorage';
import ROUTES from '../routs/routes';

const LandingFrWrapper: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    dispatch(setLanguage('fr'));
    safeSetItem('app_lang', 'fr');
    document.documentElement.setAttribute('lang', 'fr');
    document.documentElement.setAttribute('dir', 'ltr');
    navigate(ROUTES.LANDING, { replace: true });
  }, [dispatch, navigate]);

  return (
    <div className="container py-5 text-center" style={{ color: '#86868B', minHeight: '40vh' }}>
      <p>Chargement...</p>
    </div>
  );
};

export default LandingFrWrapper;
