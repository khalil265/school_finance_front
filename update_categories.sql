DELETE FROM school_finance.expense_categories;
INSERT INTO school_finance.expense_categories (id, name, description, created_at) VALUES
(gen_random_uuid(), 'Location', 'Frais de location des locaux', now()),
(gen_random_uuid(), 'Honoraires enseignants', 'Paiement des prestataires et vacataires', now()),
(gen_random_uuid(), 'Salaires', 'Salaires du personnel administratif', now()),
(gen_random_uuid(), 'Fournitures de bureau', 'Papier, stylos, consommables', now()),
(gen_random_uuid(), 'Entretien/réparation', 'Maintenance des bâtiments et matériel', now()),
(gen_random_uuid(), 'Autre', 'Dépenses diverses', now());