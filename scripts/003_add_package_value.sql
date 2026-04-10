-- 003_add_package_value.sql
-- Add a value column to represent the monetary value of a package in local currency (FCFA)

ALTER TABLE public.packages ADD COLUMN IF NOT EXISTS declared_value NUMERIC(15, 2) DEFAULT 0;

-- Comment on column for documentation
COMMENT ON COLUMN public.packages.declared_value IS 'The declared value of the package in FCFA for insurance and tracking purposes.';
