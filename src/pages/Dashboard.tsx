import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Book } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuthStore } from '../store/authStore';

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  created_at: string;
  is_public: boolean;
}

export default function Dashboard() {
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [publicSets, setPublicSets] = useState<FlashcardSet[]>([]);
  const { user } = useAuthStore();

  useEffect(() => {
    async function loadSets() {
      // Load user's sets
      const { data: userSets } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (userSets) {
        setSets(userSets);
      }

      // Load public sets
      const { data: publicSets } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('is_public', true)
        .neq('user_id', user?.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (publicSets) {
        setPublicSets(publicSets);
      }
    }

    loadSets();
  }, [user]);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-3xl font-bold">My Flashcard Sets</h2>
        <Link
          to="/create"
          className="flex items-center gap-2 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg"
        >
          <Plus className="h-5 w-5" />
          Create New Set
        </Link>
      </div>

      {sets.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <Book className="h-12 w-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">You haven't created any flashcard sets yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sets.map((set) => (
            <Link
              key={set.id}
              to={`/sets/${set.id}`}
              className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2">{set.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{set.description}</p>
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>{new Date(set.created_at).toLocaleDateString()}</span>
                {set.is_public && <span className="text-primary-400">Public</span>}
              </div>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-4">Public Sets</h2>
        {publicSets.length === 0 ? (
          <p className="text-gray-400">No public sets available.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {publicSets.map((set) => (
              <Link
                key={set.id}
                to={`/sets/${set.id}`}
                className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <h3 className="text-xl font-semibold mb-2">{set.title}</h3>
                <p className="text-gray-400 text-sm mb-4">{set.description}</p>
                <div className="text-sm text-gray-500">
                  {new Date(set.created_at).toLocaleDateString()}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}