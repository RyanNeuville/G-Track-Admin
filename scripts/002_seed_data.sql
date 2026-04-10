-- 002_seed_data.sql
-- Seed data for G-Track Logistics (inspired by Glotelho context in Cameroon)

-- 1. FIX RECURSIVE RLS POLICY (Essential to avoid 500 errors)
-- Remove the old recursive policy
DROP POLICY IF EXISTS "Allow admins to view all profiles" ON public.profiles;

-- Create a new, efficient policy (Assumes 'role' is in app_metadata or raw JWT)
-- If using raw column check, we need to bypass recursion using a search path or auth.jwt metadata
-- For now, we will use a more direct but less recursive check if possible, 
-- or recommend the use of service_role for admin tasks.
CREATE POLICY "Allow admins to view all profiles" ON public.profiles FOR SELECT USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'Administrateur' OR 
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'Administrateur'
);

-- 2. SAMPLE PACKAGES (Glotelho Electronics & Appliances)
INSERT INTO public.packages (tracking_number, sender_name, sender_address, sender_phone, recipient_name, recipient_address, recipient_phone, weight, status, priority)
VALUES 
('GLO-2026-001', 'Glotelho Akwa', 'Rue Njo-Njo, Douala', '+237 670 123 456', 'Jean-Pierre Mbida', 'Bastos, Yaoundé', '+237 690 111 222', 1.5, 'en attente', 'express'),
('GLO-2026-002', 'Glotelho Bonanjo', 'Avenue De Gaulle, Douala', '+237 670 123 456', 'Marie-Thérèse Ngo', 'Mvan, Yaoundé', '+237 699 333 444', 15.0, 'en transit', 'standard'),
('GLO-2026-003', 'Glotelho E-commerce', 'Zone Industrielle Magzi, Douala', '+237 670 000 000', 'Paulin Fotso', 'Dschang, Ouest', '+237 655 888 777', 0.5, 'livré', 'urgent'),
('GLO-2026-004', 'Glotelho Bafoussam', 'Marché B, Bafoussam', '+237 677 444 555', 'Alice Eyenga', 'Santa Barbara, Yaoundé', '+237 671 222 333', 1.2, 'en attente', 'standard'),
('GLO-2026-005', 'Glotelho Yaoundé', 'Place An IV, Yaoundé', '+237 699 123 456', 'Robert Atangana', 'Kribi, Littoral', '+237 650 444 555', 4.5, 'retard', 'express'),
('GLO-2026-006', 'Glotelho Akwa', 'Rue Njo-Njo, Douala', '+237 670 123 456', 'Michel Tchakounte', 'Bonapriso, Douala', '+237 677 111 000', 0.8, 'livré', 'standard'),
('GLO-2026-007', 'Glotelho E-commerce', 'Douala', '+237 670 000 000', 'Sophie Ekotto', 'Bali, Douala', '+237 691 000 111', 2.0, 'en attente', 'standard');

-- 3. STATISTICS (Simulate last 7 days of activity)
INSERT INTO public.statistics (date, total_deliveries, completed_deliveries, pending_deliveries, total_distance)
VALUES 
(CURRENT_DATE - INTERVAL '6 days', 45, 42, 3, 1250.40),
(CURRENT_DATE - INTERVAL '5 days', 52, 48, 4, 1420.15),
(CURRENT_DATE - INTERVAL '4 days', 38, 35, 3, 1080.60),
(CURRENT_DATE - INTERVAL '3 days', 61, 58, 3, 1650.90),
(CURRENT_DATE - INTERVAL '2 days', 49, 45, 4, 1340.25),
(CURRENT_DATE - INTERVAL '1 day', 55, 50, 5, 1510.80),
(CURRENT_DATE, 12, 5, 7, 340.50);

-- 4. SAMPLE NOTIFICATIONS
-- Note: Replace UUIDs with real ones if testing manually
-- INSERT INTO public.notifications (user_id, title, message, type)
-- VALUES 
-- ('<uuid>', 'Nouveau colis assigné', 'Un nouveau smartphone Samsung a été assigné pour livraison à Yaoundé.', 'info'),
-- ('<uuid>', 'Retard signalé', 'La livraison GLO-2026-005 vers Kribi est retardée.', 'warning');
