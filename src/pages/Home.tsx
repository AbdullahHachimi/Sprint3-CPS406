import React from 'react';
import { Link } from 'react-router-dom';
import { Brain } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
      <Brain className="h-24 w-24 text-primary-400 mb-8" />
      <h1 className="text-5xl font-bold mb-4">AI-Powered Flashcards</h1>
      <p className="text-xl text-gray-400 mb-8 max-w-2xl">
        Create intelligent flashcard sets using AI technology. Study smarter, not harder.
      </p>
      <div className="flex gap-4">
        <Link
          to="/register"
          className="bg-primary-500 hover:bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-medium"
        >
          Get Started
        </Link>
        <Link
          to="/login"
          className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg text-lg font-medium"
        >
          Login
        </Link>
      </div>
    </div>
  );
}