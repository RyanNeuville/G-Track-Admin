-- 004_rename_to_french.sql
-- Script global pour renommer les tables et colonnes en français pour Glotelho Logistics

-- 1. Renommage de la table profiles -> profils
ALTER TABLE IF EXISTS public.profiles RENAME TO profils;
ALTER TABLE public.profils RENAME COLUMN full_name TO nom_complet;
ALTER TABLE public.profils RENAME COLUMN phone TO telephone;
ALTER TABLE public.profils RENAME COLUMN status TO statut;

-- 2. Renommage de la table packages -> colis
ALTER TABLE IF EXISTS public.packages RENAME TO colis;
ALTER TABLE public.colis RENAME COLUMN tracking_number TO numero_suivi;
ALTER TABLE public.colis RENAME COLUMN sender_name TO nom_expediteur;
ALTER TABLE public.colis RENAME COLUMN sender_address TO adresse_expediteur;
ALTER TABLE public.colis RENAME COLUMN sender_phone TO telephone_expediteur;
ALTER TABLE public.colis RENAME COLUMN recipient_name TO nom_destinataire;
ALTER TABLE public.colis RENAME COLUMN recipient_address TO adresse_destinataire;
ALTER TABLE public.colis RENAME COLUMN recipient_phone TO telephone_destinataire;
ALTER TABLE public.colis RENAME COLUMN weight TO poids;
ALTER TABLE public.colis RENAME COLUMN status TO statut;
ALTER TABLE public.colis RENAME COLUMN priority TO priorite;
ALTER TABLE public.colis RENAME COLUMN declared_value TO valeur_declaree;

-- 3. Renommage de la table drivers -> livreurs
ALTER TABLE IF EXISTS public.drivers RENAME TO livreurs;
ALTER TABLE public.livreurs RENAME COLUMN user_id TO id_utilisateur;
ALTER TABLE public.livreurs RENAME COLUMN license_number TO numero_permis;
ALTER TABLE public.livreurs RENAME COLUMN license_expiry TO expiration_permis;
ALTER TABLE public.livreurs RENAME COLUMN vehicle_type TO type_vehicule;
ALTER TABLE public.livreurs RENAME COLUMN vehicle_number TO immatriculation;
ALTER TABLE public.livreurs RENAME COLUMN status TO statut;

-- 4. Renommage de la table deliveries -> livraisons
ALTER TABLE IF EXISTS public.deliveries RENAME TO livraisons;
ALTER TABLE public.livraisons RENAME COLUMN package_id TO id_colis;
ALTER TABLE public.livraisons RENAME COLUMN driver_id TO id_livreur;
ALTER TABLE public.livreisons RENAME COLUMN delivery_date TO date_livraison;
ALTER TABLE public.livraisons RENAME COLUMN pickup_time TO heure_ramassage;
ALTER TABLE public.livraisons RENAME COLUMN delivery_time TO heure_livraison;
ALTER TABLE public.livraisons RENAME COLUMN status TO statut;
-- region et notes restent region et notes (ou notes -> notes)
ALTER TABLE public.livraisons RENAME COLUMN notes TO remarques;

-- 5. Renommage de la table statistics -> statistiques
ALTER TABLE IF EXISTS public.statistics RENAME TO statistiques;
ALTER TABLE public.statistiques RENAME COLUMN total_deliveries TO total_livraisons;
ALTER TABLE public.statistiques RENAME COLUMN completed_deliveries TO livraisons_terminees;
ALTER TABLE public.statistiques RENAME COLUMN pending_deliveries TO livraisons_en_attente;
ALTER TABLE public.statistiques RENAME COLUMN total_distance TO distance_totale;

-- 6. Renommage de la table notifications -> notifications (reste pareil)
ALTER TABLE public.notifications RENAME COLUMN user_id TO id_utilisateur;
ALTER TABLE public.notifications RENAME COLUMN title TO titre;
ALTER TABLE public.notifications RENAME COLUMN is_read TO lu;

-- Mise à jour du trigger handle_new_user
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profils (id, email, nom_complet, role, statut)
  VALUES (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'Chauffeur'),
    'actif'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
