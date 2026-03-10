-- Run this FIRST if you need to wipe and recreate the schema.
-- It safely drops all tables in the correct order (respecting FK constraints).

DROP TABLE IF EXISTS inventory CASCADE;
DROP TABLE IF EXISTS tasks CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;
