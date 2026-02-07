/*
  # User Reviews System

  1. New Tables
    - `user_reviews`
      - `id` (uuid, primary key)
      - `reviewer_id` (uuid, references user_profiles) - User leaving the review
      - `reviewed_user_id` (uuid, references user_profiles) - User receiving the review
      - `conversation_id` (uuid, references conversations, optional) - Related conversation
      - `rating_communication` (integer 1-5) - Communication quality rating
      - `rating_reliability` (integer 1-5) - Reliability rating
      - `rating_friendliness` (integer 1-5) - Friendliness rating
      - `comment` (text, optional) - Written review
      - `is_verified` (boolean) - True if related to completed swap/transaction
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
    
    - `review_reactions` - For emoji reactions to reviews
      - `id` (uuid, primary key)
      - `review_id` (uuid, references user_reviews)
      - `user_id` (uuid, references user_profiles)
      - `reaction_type` (text) - emoji type: 'helpful', 'accurate', 'supportive'
      - `created_at` (timestamptz)

  2. Constraints
    - Users can only leave one review per conversation
    - Ratings must be between 1 and 5
    - Users cannot review themselves
    - Unique constraint on reviewer + reviewed_user + conversation

  3. Security
    - Enable RLS on all tables
    - Users can insert reviews for others
    - Users can view all reviews
    - Users can only update/delete their own reviews
    - Users can add reactions to any review
*/

-- Create user_reviews table
CREATE TABLE IF NOT EXISTS user_reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reviewer_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  reviewed_user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  conversation_id uuid REFERENCES conversations(id) ON DELETE SET NULL,
  rating_communication integer NOT NULL CHECK (rating_communication >= 1 AND rating_communication <= 5),
  rating_reliability integer NOT NULL CHECK (rating_reliability >= 1 AND rating_reliability <= 5),
  rating_friendliness integer NOT NULL CHECK (rating_friendliness >= 1 AND rating_friendliness <= 5),
  comment text DEFAULT '',
  is_verified boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT no_self_review CHECK (reviewer_id != reviewed_user_id),
  CONSTRAINT unique_review_per_conversation UNIQUE (reviewer_id, reviewed_user_id, conversation_id)
);

-- Create review_reactions table
CREATE TABLE IF NOT EXISTS review_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id uuid NOT NULL REFERENCES user_reviews(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES user_profiles(id) ON DELETE CASCADE,
  reaction_type text NOT NULL CHECK (reaction_type IN ('helpful', 'accurate', 'supportive')),
  created_at timestamptz DEFAULT now(),
  CONSTRAINT unique_reaction_per_user UNIQUE (review_id, user_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewer ON user_reviews(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_reviewed_user ON user_reviews(reviewed_user_id);
CREATE INDEX IF NOT EXISTS idx_user_reviews_conversation ON user_reviews(conversation_id);
CREATE INDEX IF NOT EXISTS idx_review_reactions_review ON review_reactions(review_id);

-- Enable RLS
ALTER TABLE user_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_reviews

-- Anyone authenticated can view reviews
CREATE POLICY "Authenticated users can view reviews"
  ON user_reviews FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert reviews for others (but not themselves)
CREATE POLICY "Users can create reviews for others"
  ON user_reviews FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = reviewer_id
    AND auth.uid() != reviewed_user_id
  );

-- Users can update their own reviews
CREATE POLICY "Users can update own reviews"
  ON user_reviews FOR UPDATE
  TO authenticated
  USING (auth.uid() = reviewer_id)
  WITH CHECK (auth.uid() = reviewer_id);

-- Users can delete their own reviews
CREATE POLICY "Users can delete own reviews"
  ON user_reviews FOR DELETE
  TO authenticated
  USING (auth.uid() = reviewer_id);

-- RLS Policies for review_reactions

-- Anyone authenticated can view reactions
CREATE POLICY "Authenticated users can view reactions"
  ON review_reactions FOR SELECT
  TO authenticated
  USING (true);

-- Users can add reactions
CREATE POLICY "Users can add reactions"
  ON review_reactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reactions
CREATE POLICY "Users can delete own reactions"
  ON review_reactions FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
DROP TRIGGER IF EXISTS user_reviews_updated_at_trigger ON user_reviews;
CREATE TRIGGER user_reviews_updated_at_trigger
  BEFORE UPDATE ON user_reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_user_reviews_updated_at();