-- Allow anonymous read access to public-assets bucket objects
-- so signed URLs can be generated and files can be served publicly.
CREATE POLICY "Allow anon select on public-assets objects"
ON storage.objects
FOR SELECT
TO anon
USING (bucket_id = 'public-assets');

CREATE POLICY "Allow authenticated select on public-assets objects"
ON storage.objects
FOR SELECT
TO authenticated
USING (bucket_id = 'public-assets');
