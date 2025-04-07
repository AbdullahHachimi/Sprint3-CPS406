# AI Flashcards

A flashcard application that uses AI to help generate study materials.

## Setup

1. Create a Supabase project at https://supabase.com
2. Copy the SQL from `supabase/migrations` and run it in your Supabase SQL editor
3. Copy your project configuration:
   - Go to Project Settings -> API
   - Copy the "Project URL" and "anon/public" key
4. Create a `.env` file in the root directory with:
   ```
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

## Development

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

## Deployment

1. Build the project:
   ```bash
   npm run build
   ```

2. Deploy the `dist` directory to your preferred hosting service