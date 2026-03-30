-- Seed data for G-Track-Admin

-- 1. Create some profiles (Passwords would normally be handled by Supabase Auth)
-- Note: Replace UUIDs with actual ones if testing manually with specific users
INSERT INTO public.profiles (id, email, full_name, role, phone, status)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'admin@gtrack.com', 'Administrateur G-Track', 'Administrateur', '+33600000001', 'actif'),
  ('00000000-0000-0000-0000-000000000002', 'jean.dupont@gtrack.com', 'Jean Dupont', 'Chauffeur', '+33600000002', 'actif'),
  ('00000000-0000-0000-0000-000000000003', 'marie.martin@gtrack.com', 'Marie Martin', 'Chauffeur', '+33600000003', 'actif')
ON CONFLICT (id) DO NOTHING;

-- 2. Create drivers
INSERT INTO public.drivers (id, user_id, license_number, vehicle_type, vehicle_number, status, latitude, longitude)
VALUES 
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000002', 'LIC-12345', 'Camionnette', 'ABC-123-DE', 'actif', 48.8566, 2.3522),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000003', 'LIC-67890', 'Moto', 'XYZ-789-GP', 'actif', 48.9215, 2.3989)
ON CONFLICT (id) DO NOTHING;

-- 3. Create initial packages
INSERT INTO public.packages (tracking_number, sender_name, sender_address, recipient_name, recipient_address, weight, status, priority)
VALUES 
  ('FR-2024-001-001', 'Logistique Central', 'Entrepôt A', 'Acme Corp', '123 Rue de Paris, 75000 Paris', 2.5, 'en transit', 'express'),
  ('FR-2024-001-002', 'Logistique Central', 'Entrepôt A', 'TechStart SARL', '456 Avenue Lyon, 69000 Lyon', 1.2, 'en attente', 'standard'),
  ('FR-2024-001-003', 'Boutique Mode', 'Rue du Commerce', 'Marie Martin', '789 Rue Marseille, 13000 Marseille', 0.8, 'livré', 'standard')
ON CONFLICT (tracking_number) DO NOTHING;

-- 4. Create a route
INSERT INTO public.routes (driver_id, delivery_date, total_distance, total_deliveries, status, region)
VALUES 
  ('11111111-1111-1111-1111-111111111111', CURRENT_DATE, 45.2, 12, 'in_progress', 'Île-de-France')
ON CONFLICT (id) DO NOTHING;

-- 5. Create some notifications
INSERT INTO public.notifications (user_id, title, message, type)
VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Système prêt', 'La base de données a été initialisée avec succès.', 'success'),
  ('00000000-0000-0000-0000-000000000001', 'Alerte Stock', 'Le niveau de colis en attente est élevé.', 'warning')
ON CONFLICT (id) DO NOTHING;
