import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyACsJOOBNSPBJej488xYMFRxXD1ucDXV10');

export async function generateFlashcards(topic: string, count: number = 5) {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });

    const prompt = `Generate ${count} flashcards about "${topic}". 
      Return ONLY a JSON array with objects containing "front" and "back" properties.
      Do not include any markdown formatting, code blocks, or additional text.
      Keep each side concise but informative.
      Example:
      [{"front":"What is X?","back":"X is Y"},{"front":"Define Z","back":"Z is..."}]`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    text = text.replace(/```json\n?|\n?```/g, '');
    
    try {
      const parsed = JSON.parse(text.trim());
      
      if (!Array.isArray(parsed) || !parsed.every(card => 
        typeof card === 'object' && 
        typeof card.front === 'string' && 
        typeof card.back === 'string'
      )) {
        throw new Error('Invalid response format');
      }
      
      return parsed;
    } catch (error) {
      console.error('Failed to parse AI response:', error);
      throw new Error('Failed to generate valid flashcard format');
    }
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error('Failed to generate flashcards. Please try again later.');
  }
}