/*
  # Flashcards Schema Setup

  1. New Tables
    - `flashcard_sets`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `description` (text)
      - `is_public` (boolean)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `flashcards`
      - `id` (uuid, primary key)
      - `set_id` (uuid, references flashcard_sets)
      - `front` (text)
      - `back` (text)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Add policies for:
      - Users can CRUD their own flashcard sets and cards
      - Anyone can read public flashcard sets and their cards
*/

CREATE TABLE flashcard_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users NOT NULL,
  title text NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE flashcards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  set_id uuid REFERENCES flashcard_sets ON DELETE CASCADE NOT NULL,
  front text NOT NULL,
  back text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE flashcard_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE flashcards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own flashcard sets"
  ON flashcard_sets
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Anyone can view public flashcard sets"
  ON flashcard_sets
  FOR SELECT
  TO authenticated
  USING (is_public = true);

CREATE POLICY "Users can manage their own flashcards"
  ON flashcards
  FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM flashcard_sets
    WHERE flashcard_sets.id = flashcards.set_id
    AND flashcard_sets.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM flashcard_sets
    WHERE flashcard_sets.id = flashcards.set_id
    AND flashcard_sets.user_id = auth.uid()
  ));

CREATE POLICY "Anyone can view flashcards in public sets"
  ON flashcards
  FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM flashcard_sets
    WHERE flashcard_sets.id = flashcards.set_id
    AND flashcard_sets.is_public = true
  ));