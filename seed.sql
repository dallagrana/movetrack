-- Run this in your Supabase SQL Editor AFTER running exempledb.sql
-- Seeds the default categories

INSERT INTO categories (id, name, icon) VALUES
  (1, 'Utilities', 'Zap'),
  (2, 'Packing', 'Package'),
  (3, 'Legal', 'Scale'),
  (4, 'Moving', 'Truck'),
  (5, 'Administrative', 'FileText')
ON CONFLICT (id) DO NOTHING;

-- Reset sequence so new categories auto-increment correctly
SELECT setval('categories_id_seq', (SELECT MAX(id) FROM categories));
