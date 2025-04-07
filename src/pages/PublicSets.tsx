import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Book } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  created_at: string;
}

export default function PublicSets() {
  const [sets, setSets] = useState<FlashcardSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadSets();
  }, []);

  async function loadSets() {
    try {
      const { data } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false });

      if (data) {
        setSets(data);
      }
    } catch (error) {
      console.error('Error loading public sets:', error);
    } finally {
      setLoading(false);
    }
  }

  const filteredSets = sets.filter(set => 
    set.title.toLowerCase().includes(search.toLowerCase()) ||
    (set.description && set.description.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto">
      <h2 className="text-3xl font-bold mb-8">Public Flashcard Sets</h2>

      <div className="relative mb-8">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
        <input
          type="text"
          placeholder="Search flashcard sets..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-800 border border-gray-700 rounded-lg focus:outline-none focus:border-primary-500"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-400"></div>
        </div>
      ) : filteredSets.length === 0 ? (
        <div className="text-center py-12 bg-gray-800 rounded-lg">
          <Book className="h-12 w-12 mx-auto mb-4 text-gray-600" />
          <p className="text-gray-400">No public flashcard sets found</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSets.map((set) => (
            <Link
              key={set.id}
              to={`/sets/${set.id}`}
              className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
            >
              <h3 className="text-xl font-semibold mb-2">{set.title}</h3>
              {set.description && (
                <p className="text-gray-400 text-sm mb-4">{set.description}</p>
              )}
              <div className="text-sm text-gray-500">
                {new Date(set.created_at).toLocaleDateString()}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}