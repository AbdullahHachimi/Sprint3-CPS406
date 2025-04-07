import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';
import { generateFlashcards } from '../lib/gemini';

interface Flashcard {
  front: string;
  back: string;
}

export default function CreateSet() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [topic, setTopic] = useState('');
  const [count, setCount] = useState(5);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const handleGenerate = async () => {
    if (!topic) return;
    
    setLoading(true);
    setError(null);
    try {
      const cards = await generateFlashcards(topic, count);
      setFlashcards(cards);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate flashcards');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || flashcards.length === 0) return;

    try {
      // Create flashcard set
      const { data: set, error: setError } = await supabase
        .from('flashcard_sets')
        .insert({
          title,
          description,
          is_public: isPublic,
          user_id: user?.id,
        })
        .select()
        .single();

      if (setError) throw setError;

      // Create flashcards
      const { error: cardsError } = await supabase
        .from('flashcards')
        .insert(
          flashcards.map(card => ({
            set_id: set.id,
            front: card.front,
            back: card.back,
          }))
        );

      if (cardsError) throw cardsError;

      navigate(`/sets/${set.id}`);
    } catch (error) {
      console.error('Failed to create flashcard set:', error);
      setError('Failed to save flashcard set. Please try again.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Create New Flashcard Set</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium mb-2">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-primary-500"
            required
          />
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-2">
            Description
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:border-primary-500"
            rows={3}
          />
        </div>

        <div className="flex items-center">
          <input
            id="isPublic"
            type="checkbox"
            checked={isPublic}
            onChange={(e) => setIsPublic(e.target.checked)}
            className="h-4 w-4 rounded border-gray-700 bg-gray-800 text-primary-500 focus:ring-primary-500"
          />
          <label htmlFor="isPublic" className="ml-2 text-sm font-medium">
            Make this set public
          </label>
        </div>

        <div className="bg-gray-800 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Generate Flashcards with AI</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label htmlFor="topic" className="block text-sm font-medium mb-2">
                Topic
              </label>
              <input
                id="topic"
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-primary-500"
                placeholder="e.g., Basic JavaScript Concepts"
              />
            </div>
            
            <div>
              <label htmlFor="count" className="block text-sm font-medium mb-2">
                Number of Cards
              </label>
              <input
                id="count"
                type="number"
                value={count}
                onChange={(e) => setCount(parseInt(e.target.value))}
                min={1}
                max={20}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 focus:outline-none focus:border-primary-500"
              />
            </div>
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
            </div>
          )}

          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !topic}
            className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-gray-600 text-white py-2 rounded-lg font-medium"
          >
            {loading ? (
              <span className="flex items-center justify-center">
                <Loader2 className="animate-spin h-5 w-5 mr-2" />
                Generating...
              </span>
            ) : (
              'Generate Flashcards'
            )}
          </button>
        </div>

        {flashcards.length > 0 && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">Generated Flashcards</h3>
              <button
                type="button"
                onClick={handleGenerate}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-sm"
              >
                <RefreshCw className="h-4 w-4" />
                Regenerate
              </button>
            </div>
            <div className="space-y-4">
              {flashcards.map((card, index) => (
                <div key={index} className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <div className="text-sm font-medium text-gray-400 mb-2">Front</div>
                    <textarea
                      value={card.front}
                      onChange={(e) => {
                        const newCards = [...flashcards];
                        newCards[index] = { ...card, front: e.target.value };
                        setFlashcards(newCards);
                      }}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 focus:outline-none focus:border-primary-500"
                      rows={3}
                    />
                  </div>
                  <div className="p-4 bg-gray-800 rounded-lg">
                    <div className="text-sm font-medium text-gray-400 mb-2">Back</div>
                    <textarea
                      value={card.back}
                      onChange={(e) => {
                        const newCards = [...flashcards];
                        newCards[index] = { ...card, back: e.target.value };
                        setFlashcards(newCards);
                      }}
                      className="w-full bg-gray-700 border border-gray-600 rounded-lg p-2 focus:outline-none focus:border-primary-500"
                      rows={3}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={!title || flashcards.length === 0}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-600 text-white py-3 rounded-lg font-medium mt-8"
        >
          Create Flashcard Set
        </button>
      </form>
    </div>
  );
}