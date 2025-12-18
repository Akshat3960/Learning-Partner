const { HfInference } = require('@huggingface/inference');

const hf = new HfInference(process.env.HF_API_KEY);

class HuggingFaceService {
  async chat(documentText, question) {
    const prompt = `Document: ${documentText}\n\nQuestion: ${question}\n\nAnswer:`;
    
    const response = await hf.textGeneration({
      model: 'meta-llama/Llama-2-70b-chat-hf',
      inputs: prompt,
      parameters: {
        max_new_tokens: 500,
        temperature: 0.7
      }
    });
    
    return response.generated_text;
  }
}

module.exports = new HuggingFaceService();