DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN
        SELECT conname
        FROM pg_constraint
        WHERE conrelid = 'public_files'::regclass
          AND contype = 'c'
    LOOP
        EXECUTE 'ALTER TABLE public_files DROP CONSTRAINT ' || r.conname;
    END LOOP;
END;
$$;

ALTER TABLE public_files 
ADD CONSTRAINT public_files_category_check 
CHECK (category IN ('መተዳደርያ ደንብ', 'የኮሚሽኑ መመሪያዎች', 'የፓርቲ መመሪያዎች', 'የኮሚሽኑ ሚስጥራዊ ሰነዶች', 'ሌላ'));
