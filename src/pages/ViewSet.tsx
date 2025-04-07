import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Edit } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface Flashcard {
  id: string;
  front: string;
  back: string;
}

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  is_public: boolean;
  user_id: string;
}

export default function ViewSet() {
  const { id } = useParams<{ id: string }>();
  const [set, setSet] = useState<FlashcardSet | null>(null);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showingFront, setShowingFront] = useState(true);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    async function loadSet() {
      if (!id) return;

      try {
        // Load set details
        const { data: setData } = await supabase
          .from('flashcard_sets')
          .select('*')
          .eq('id', id)
          .single();

        if (setData) {
          setSet(setData);

          // Load flashcards
          const { data: cardsData } = await supabase
            .from('flashcards')
            .select('*')
            .eq('set_id', id)
            .order('created_at');

          if (cardsData) {
            setCards(cardsData);
          }
        }
      } catch (error) {
        console.error('Error loading flashcard set:', error);
      } finally {
        setLoading(false);
      }
    }

    loadSet();
  }, [id]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
    setShowingFront(true);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : prev));
    setShowingFront(true);
  };

  const handleFlip = () => {
    setShowingFront((prev) => !prev);
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400"></div>
      </div>
    );
  }

  if (!set || cards.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-400">Flashcard set not found</h2>
      </div>
    );
  }

  const currentCard = cards[currentIndex];
  const canEdit = user && set.user_id === user.id;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">{set.title}</h2>
          {set.description && (
            <p className="text-gray-400">{set.description}</p>
          )}
        </div>
        {canEdit && (
          <Link
            to={`/sets/${set.id}/edit`}
            className="flex items-center gap-2 px-4 py-2 bg-primary-500 hover:bg-primary-600 rounded-lg text-white"
          >
            <Edit className="h-4 w-4" />
            Edit Set
          </Link>
        )}
      </div>

      <div className="relative">
        <div
          onClick={handleFlip}
          className="min-h-[400px] bg-gray-800 rounded-xl p-8 flex items-center justify-center cursor-pointer transition-all duration-300 transform perspective-1000"
        >
          <div className="text-xl text-center">
            {showingFront ? currentCard.front : currentCard.back}
          </div>
        </div>

        <div className="absolute left-0 right-0 bottom-4 flex justify-center items-center gap-4">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          
          <div className="text-gray-400">
            {currentIndex + 1} / {cards.length}
          </div>

          <button
            onClick={handleNext}
            disabled={currentIndex === cards.length - 1}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 disabled:opacity-50"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div className="mt-8 text-center text-gray-400">
        Click the card to flip it
      </div>
    </div>
  );
}