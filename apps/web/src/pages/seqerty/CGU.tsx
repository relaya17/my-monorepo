/**
 * Conditions Générales d'Utilisation (CGU)
 * Conformité: Loi Élan, pratiques commerciales
 */
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../../components/SeoHead';
import ROUTES from '../../routs/routes';

const CGU: React.FC = () => {
  useEffect(() => {
    document.documentElement.setAttribute('lang', 'fr');
    document.documentElement.setAttribute('dir', 'ltr');
  }, []);

  return (
    <div className="container mt-5 py-4" dir="ltr" lang="fr" style={{ maxWidth: '800px' }}>
      <SeoHead
        title="Conditions Générales d'Utilisation"
        description="Conditions générales d'utilisation de la plateforme Vantera – Syndic, copropriété, IA."
        noIndex
      />
      <h1 className="mb-4">Conditions Générales d'Utilisation</h1>

      <p className="lead">L'utilisation de la plateforme Vantera implique l'acceptation pleine et entière des présentes CGU.</p>

      <section className="mb-4">
        <h2 className="h5">1. Service</h2>
        <p>Vantera fournit un outil d'assistance à la gestion immobilière basé sur l'IA (V-One). La plateforme permet au Syndic et aux copropriétaires de gérer la transparence des charges, la maintenance prédictive et la communication.</p>
      </section>

      <section className="mb-4">
        <h2 className="h5">2. Responsabilité</h2>
        <p>L'utilisateur est responsable de l'exactitude des données saisies. Vantera ne remplace pas les obligations légales du Syndic au titre de la Loi Élan. Vantera agit en tant que prestataire technologique ; la responsabilité juridique finale incombe au Syndic.</p>
      </section>

      <section className="mb-4">
        <h2 className="h5">3. Propriété intellectuelle</h2>
        <p>Tous les éléments du site (IA V-One, design, code, algorithmes) sont la propriété exclusive de Vantera Tech Ltd.</p>
      </section>

      <section className="mb-4">
        <h2 className="h5">4. Modèle économique</h2>
        <p>Tarification : 5 € par lot et par mois (TVA applicable selon la législation en vigueur). Les conditions détaillées sont précisées dans le contrat commercial.</p>
      </section>

      <section className="mb-4">
        <h2 className="h5">5. Données et conformité</h2>
        <p>Le traitement des données personnelles est décrit dans la <Link to={ROUTES.POLITIQUE_CONFIDENTIALITE}>Politique de Confidentialité</Link>. Les données sont hébergées en France (UE) conformément au RGPD.</p>
      </section>

      <nav className="mt-4 pt-3 border-top">
        <Link to={ROUTES.LANDING_FR}>Retour à l'accueil</Link>
        {' · '}
        <Link to={ROUTES.MENTIONS_LEGALES}>Mentions Légales</Link>
        {' · '}
        <Link to={ROUTES.POLITIQUE_CONFIDENTIALITE}>Politique de confidentialité</Link>
      </nav>
    </div>
  );
};

export default CGU;
