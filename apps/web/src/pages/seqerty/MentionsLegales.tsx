/**
 * Mentions Légales – הודעות משפטיות (חובה בצרפת)
 * Conformité: Loi pour la Confiance dans l'Économie Numérique (LCEN)
 */
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import SeoHead from '../../components/SeoHead';
import ROUTES from '../../routs/routes';

const MentionsLegales: React.FC = () => {
  useEffect(() => {
    document.documentElement.setAttribute('lang', 'fr');
    document.documentElement.setAttribute('dir', 'ltr');
  }, []);

  return (
    <div className="container mt-5 py-4" dir="ltr" lang="fr" style={{ maxWidth: '800px' }}>
      <SeoHead
        title="Mentions Légales"
        description="Mentions légales de Vantera – éditeur du site, hébergement, contact."
        noIndex
      />
      <h1 className="mb-4">Mentions Légales</h1>

      <section className="mb-4">
        <p><strong>Éditeur du site :</strong> Vantera Tech Ltd.</p>
        <p><strong>Siège social :</strong> [Adresse de la société – Israël/France]</p>
        <p><strong>Directeur de la publication :</strong> [Nom complet du responsable]</p>
      </section>

      <section className="mb-4">
        <h2 className="h5">Hébergement</h2>
        <p><strong>Hébergeur :</strong> Amazon Web Services (AWS)</p>
        <p><strong>Adresse de l'hébergeur :</strong> Région Europe (Paris), France – eu-west-3</p>
        <p>Les données des utilisateurs français sont stockées exclusivement au sein de l'Union Européenne.</p>
      </section>

      <section className="mb-4">
        <h2 className="h5">Contact</h2>
        <p><strong>E-mail :</strong> hello@vantera.fr</p>
        <p><strong>DPO (délégué à la protection des données) :</strong> dpo@vantera.fr</p>
      </section>

      <section className="mb-4">
        <h2 className="h5">Identification juridique</h2>
        <p><strong>Numéro SIRET :</strong> [À compléter si enregistrement en France]</p>
        <p><strong>TVA intracommunautaire :</strong> [À compléter]</p>
      </section>

      <nav className="mt-4 pt-3 border-top">
        <Link to={ROUTES.LANDING_FR}>Retour à l'accueil</Link>
        {' · '}
        <Link to={ROUTES.POLITIQUE_CONFIDENTIALITE}>Politique de confidentialité</Link>
        {' · '}
        <Link to={ROUTES.CGU}>Conditions Générales d'Utilisation</Link>
      </nav>
    </div>
  );
};

export default MentionsLegales;
