-- Messages table for real-time chat between matched users
CREATE TABLE public.messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id    UUID NOT NULL REFERENCES public.matches(id) ON DELETE CASCADE,
  sender_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content     TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 2000),
  created_at  TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_messages_match_id ON public.messages(match_id);
CREATE INDEX idx_messages_created_at ON public.messages(created_at);

CREATE POLICY "Users can view messages in their matches"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.matches
      WHERE id = match_id
        AND (user_a = auth.uid() OR user_b = auth.uid())
    )
  );

CREATE POLICY "Users can send messages in their matches"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.matches
      WHERE id = match_id
        AND (user_a = auth.uid() OR user_b = auth.uid())
    )
  );

-- Reviews & ratings table
CREATE TABLE public.reviews (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reviewed_id  UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  match_id     UUID REFERENCES public.matches(id) ON DELETE SET NULL,
  rating       INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment      TEXT CHECK (char_length(comment) <= 1000),
  created_at   TIMESTAMPTZ DEFAULT now(),
  UNIQUE (reviewer_id, reviewed_id)
);

ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_reviews_reviewed_id ON public.reviews(reviewed_id);

CREATE POLICY "Reviews are publicly visible"
  ON public.reviews FOR SELECT
  USING (true);

CREATE POLICY "Users can write their own reviews"
  ON public.reviews FOR INSERT
  WITH CHECK (reviewer_id = auth.uid() AND reviewer_id <> reviewed_id);

CREATE POLICY "Users can update their own reviews"
  ON public.reviews FOR UPDATE
  USING (reviewer_id = auth.uid());
