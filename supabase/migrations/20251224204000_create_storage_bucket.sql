-- Create storage bucket for pitch decks if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
VALUES ('pitch_decks', 'pitch_decks', true)
ON CONFLICT (id) DO NOTHING;

-- Policy: Give authenticated users access to upload
CREATE POLICY "Authenticated users can upload pitch decks"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'pitch_decks');

-- Policy: Give public access to read (needed for n8n to download if passing URL, and for VCs)
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pitch_decks');

-- Policy: Users can delete their own files
CREATE POLICY "Users can delete own pitch decks"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pitch_decks' AND auth.uid() = owner);
