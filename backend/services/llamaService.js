const axios = require('axios');

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL_NAME = process.env.LLAMA_MODEL || 'llama3.2';
const MAX_CONTEXT_LENGTH = 10000;

class LlamaService {
  async generateResponse(prompt, options = {}) {
    try {
      console.log(`🤖 Calling Ollama at ${OLLAMA_URL} with model ${MODEL_NAME}`);
      
      const response = await axios.post(`${OLLAMA_URL}/api/generate`, {
        model: MODEL_NAME,
        prompt: prompt,
        stream: false,
        options: {
          temperature: options.temperature || 0.7,
          top_p: options.top_p || 0.9,
          num_predict: options.max_tokens || 2000
        }
      }, {
        timeout: 120000
      });

      console.log('✅ Ollama response received');
      return response.data.response;
    } catch (error) {
      console.error('❌ Ollama API Error:', error.message);
      
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Ollama is not running. Start it with: ollama serve');
      }
      
      if (error.response?.status === 404) {
        throw new Error(`Model "${MODEL_NAME}" not found. Pull it with: ollama pull ${MODEL_NAME}`);
      }
      
      throw new Error(`AI service unavailable: ${error.message}`);
    }
  }

  truncateText(text, maxLength = MAX_CONTEXT_LENGTH) {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  async chat(documentText, userQuestion) {
    try {
      const truncatedText = this.truncateText(documentText);
      
      const prompt = `You are a helpful learning assistant. Based on the following document, answer the user's question accurately and concisely.

Document:
${truncatedText}

Question: ${userQuestion}

Answer:`;

      return await this.generateResponse(prompt, { temperature: 0.7 });
    } catch (error) {
      console.error('Chat error:', error);
      throw error;
    }
  }

  async generateSummary(documentText) {
    try {
      const truncatedText = this.truncateText(documentText, 15000);
      
      const prompt = `Provide a clear and concise summary of the following document in 200-300 words. Focus on the main ideas and key points.

Document:
${truncatedText}

Summary:`;

      return await this.generateResponse(prompt, { 
        temperature: 0.5,
        max_tokens: 500 
      });
    } catch (error) {
      console.error('Summary error:', error);
      throw error;
    }
  }

  async explainConcept(documentText, concept) {
    try {
      const truncatedText = this.truncateText(documentText);
      
      const prompt = `Based on the following document, provide a detailed and easy-to-understand explanation of the concept: "${concept}"

Document:
${truncatedText}

Explain the concept of "${concept}" in detail:`;

      return await this.generateResponse(prompt, { temperature: 0.6 });
    } catch (error) {
      console.error('Explanation error:', error);
      throw error;
    }
  }

  async generateFlashcards(documentText, count = 10) {
    try {
      const truncatedText = this.truncateText(documentText, 8000);
      
      const prompt = `Generate exactly ${count} educational flashcards from the following document. Each flashcard should have a question and a detailed answer.

Return ONLY a valid JSON array with no additional text, explanations, or markdown formatting. Format:
[
  {"question": "Question text here", "answer": "Answer text here"},
  {"question": "Question text here", "answer": "Answer text here"}
]

Document:
${truncatedText}

JSON array of flashcards:`;

      const response = await this.generateResponse(prompt, { 
        temperature: 0.7,
        max_tokens: 3000 
      });
      
      console.log('Raw flashcard response:', response.substring(0, 200));
      
      // Extract JSON from response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('No JSON found in response');
        throw new Error('Invalid response format from AI');
      }
      
      const flashcards = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(flashcards)) {
        throw new Error('Invalid flashcard format');
      }
      
      return flashcards.slice(0, count).map(card => ({
        question: card.question || '',
        answer: card.answer || ''
      }));
    } catch (error) {
      console.error('Flashcard generation error:', error);
      throw new Error('Failed to generate flashcards. Please try again.');
    }
  }

  async generateQuiz(documentText, questionCount = 5) {
    try {
      const truncatedText = this.truncateText(documentText, 8000);
      
      const prompt = `Generate exactly ${questionCount} multiple-choice quiz questions from the following document.

Return ONLY a valid JSON array with no additional text, explanations, or markdown formatting. Format:
[
  {
    "question": "Question text",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "explanation": "Explanation of why this is correct"
  }
]

Requirements:
- Each question must have exactly 4 options
- correctAnswer must be a number (0-3) indicating the index of the correct option
- Include a brief explanation for each answer

Document:
${truncatedText}

JSON array of quiz questions:`;

      const response = await this.generateResponse(prompt, { 
        temperature: 0.8,
        max_tokens: 4000 
      });
      
      console.log('Raw quiz response:', response.substring(0, 200));
      
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        console.error('No JSON found in response');
        throw new Error('Invalid response format from AI');
      }
      
      const quizQuestions = JSON.parse(jsonMatch[0]);
      
      if (!Array.isArray(quizQuestions)) {
        throw new Error('Invalid quiz format');
      }
      
      const validatedQuestions = quizQuestions.slice(0, questionCount).map((q, idx) => {
        if (!q.question || !Array.isArray(q.options) || q.options.length !== 4) {
          throw new Error(`Invalid question format at index ${idx}`);
        }
        if (typeof q.correctAnswer !== 'number' || q.correctAnswer < 0 || q.correctAnswer > 3) {
          throw new Error(`Invalid correct answer at index ${idx}`);
        }
        return {
          question: q.question,
          options: q.options,
          correctAnswer: q.correctAnswer,
          explanation: q.explanation || 'No explanation provided.'
        };
      });
      
      return validatedQuestions;
    } catch (error) {
      console.error('Quiz generation error:', error);
      throw new Error('Failed to generate quiz. Please try again.');
    }
  }

  async healthCheck() {
    try {
      const response = await axios.get(`${OLLAMA_URL}/api/tags`, { timeout: 5000 });
      
      // Check if the model exists
      const models = response.data.models || [];
      const modelExists = models.some(m => m.name.includes(MODEL_NAME.split(':')[0]));
      
      if (!modelExists) {
        return {
          status: 'warning',
          message: `Model "${MODEL_NAME}" not found. Pull it with: ollama pull ${MODEL_NAME}`,
          model: MODEL_NAME
        };
      }
      
      return { 
        status: 'ok', 
        message: 'Ollama is running',
        model: MODEL_NAME 
      };
    } catch (error) {
      return { 
        status: 'error', 
        message: 'Ollama is not running. Start it with: ollama serve' 
      };
    }
  }

  async listModels() {
    try {
      const response = await axios.get(`${OLLAMA_URL}/api/tags`);
      return response.data.models || [];
    } catch (error) {
      throw new Error('Failed to fetch models');
    }
  }
}

module.exports = new LlamaService();