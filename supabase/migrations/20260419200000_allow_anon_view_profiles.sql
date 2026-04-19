-- Allow anonymous (unauthenticated) users to view cleaner profiles
-- This enables the guest browsing feature
CREATE POLICY "Cleaner profiles viewable by everyone"
ON public.profiles FOR SELECT TO anon USING (true);
