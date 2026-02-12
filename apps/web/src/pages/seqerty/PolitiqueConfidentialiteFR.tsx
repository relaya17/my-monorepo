/**
 * Politique de Confidentialité (GDPR) – מדיניות פרטיות צרפתית
 * Conformité: RGPD, CNIL
 */
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../../components/SeoHead';
import ROUTES from '../../routs/routes';

const PolitiqueConfidentialiteFR: React.FC = () => {
  useEffect(() => {
    document.documentElement.setAttribute('lang', 'fr');
    document.documentElement.setAttribute('dir', 'ltr');
  }, []);

  return (
    <div className="container mt-5 py-4" dir="ltr" lang="fr" style={{ maxWidth: '800px' }}>
      <SeoHead
        title="Politique de Confidentialité"
        description="Politique de confidentialité Vantera – RGPD, protection des données, droit à l'oubli."
        noIndex
      />
      <h1 className="mb-4">Politique de Confidentialité</h1>

      <p className="lead">Conformément au Règlement Général sur la Protection des Données (RGPD), Vantera s'engage à protéger vos données personnelles.</p>

      <section className="mb-4">
        <h2 className="h5">1. Données collectées</h2>
        <p>Nous collectons : nom, prénom, adresse e-mail, numéro de téléphone, données de gestion immobilière (adresse du bien, informations de copropriété) et, si pertinent, données de paiement (tokenisées, non stockées en clair).</p>
      </section>

      <section className="mb-4">
        <h2 className="h5">2. Finalité</h2>
        <p>Les données sont utilisées pour : la gestion de la copropriété, la communication via l'assistant IA V-One, la facturation et le respect des obligations légales (Loi Élan).</p>
      </section>

      <section className="mb-4">
        <h2 className="h5">3. Conservation et localisation</h2>
        <p><strong>Vos données sont stockées exclusivement au sein de l'Union Européenne</strong> (région AWS Paris, France). Aucun transfert hors UE sans votre consentement explicite.</p>
      </section>

      <section className="mb-4">
        <h2 className="h5">4. Vos droits (RGPD)</h2>
        <p>Vous disposez des droits suivants :</p>
        <ul>
          <li><strong>Droit d'accès</strong> : obtenir une copie de vos données.</li>
          <li><strong>Droit de rectification</strong> : corriger des données inexactes.</li>
          <li><strong>Droit à l'effacement (droit à l'oubli)</strong> : demander la suppression complète de vos données.</li>
          <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format structuré.</li>
        </ul>
        <p>Pour exercer ces droits, contactez : <a href="mailto:dpo@vantera.fr">dpo@vantera.fr</a></p>
        <p>Vous pouvez également introduire une réclamation auprès de la CNIL : <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer">www.cnil.fr</a></p>
      </section>

      <section className="mb-4">
        <h2 className="h5">5. Base légale</h2>
        <p>Le traitement repose sur : l'exécution du contrat (gestion de la copropriété) et, le cas échéant, votre consentement pour les cookies non essentiels.</p>
      </section>

      <nav className="mt-4 pt-3 border-top">
        <Link to={ROUTES.LANDING_FR}>Retour à l'accueil</Link>
        {' · '}
        <Link to={ROUTES.MENTIONS_LEGALES}>Mentions Légales</Link>
        {' · '}
        <Link to={ROUTES.CGU}>Conditions Générales d'Utilisation</Link>
      </nav>
    </div>
  );
};

export default PolitiqueConfidentialiteFR;
