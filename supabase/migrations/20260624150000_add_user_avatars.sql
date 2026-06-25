-- 1. Add photo_url to user_profiles
ALTER TABLE public.user_profiles ADD COLUMN IF NOT EXISTS photo_url TEXT;

-- 2. Create the avatars storage bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('avatars', 'avatars', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/jpg', 'image/webp', 'image/gif'])
ON CONFLICT (id) DO UPDATE SET 
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Setup Storage Policies for avatars bucket

-- Allow public to read avatars
CREATE POLICY "Avatar images are publicly accessible."
  ON storage.objects FOR SELECT
  USING ( bucket_id = 'avatars' );

-- Allow admins to upload, update, and delete avatars
CREATE POLICY "Admins can upload avatars."
  ON storage.objects FOR INSERT
  WITH CHECK ( bucket_id = 'avatars' AND public.is_assessment_admin() );

CREATE POLICY "Admins can update avatars."
  ON storage.objects FOR UPDATE
  USING ( bucket_id = 'avatars' AND public.is_assessment_admin() );

CREATE POLICY "Admins can delete avatars."
  ON storage.objects FOR DELETE
  USING ( bucket_id = 'avatars' AND public.is_assessment_admin() );
