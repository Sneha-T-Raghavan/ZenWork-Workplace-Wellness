import { CohereClient } from 'cohere-ai';

// Initialize Cohere client with error handling
let cohere;
try {
    if (!process.env.COHERE_API_KEY) {
        throw new Error('COHERE_API_KEY is not defined in environment variables');
    }
    
    cohere = new CohereClient({
        token: process.env.COHERE_API_KEY,
    });
    
    console.log('Cohere client initialized successfully');
} catch (error) {
    console.error('Failed to initialize Cohere client:', error);
    process.exit(1);
}

export default cohere;