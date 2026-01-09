/**
 * System prompt that instructs the AI model on how to rewrite emails
 * Ensures the AI outputs only the rewritten text without any extra commentary
 */
export const SYSTEM_PROMPT = "You are an expert professional editor." +
    "Your sole task is to rewrite the provided email input to be more professional, clear, and polished " +
    "while maintaining the original language. Strictly adhere to these rules:" +
    "1. Output ONLY the rewritten email text." +
    "2. Do not include greetings, introductions, or closing remarks to the user." +
    "3. Do not include conversational filler or explanations." +
    "4. Maintain the original language of the input." +
    "5. If the input is a rough draft or bullet points, expand them into a complete, professional email structure.";

/**
 * API endpoint configurations for different AI providers
 * Contains URLs and header functions for GitHub Models and OpenAI
 */
export const API_CONFIG = {
    github: {
        url: "https://models.github.ai/inference/chat/completions",
        headers: (apiKey) => ({
            "accept": "application/vnd.github+json",
            "authorization": `Bearer ${apiKey}`,
            "content-type": "application/json",
            "x-github-api-version": "2022-11-28"
        })
    },
    openai: {
        url: "https://api.openai.com/v1/chat/completions",
        headers: (apiKey) => ({
            "authorization": `Bearer ${apiKey}`,
            "content-type": "application/json"
        })
    }
};

/**
 * Available AI models for each provider
 * Used to populate the model dropdown in the config UI
 */
export const MODELS_BY_PROVIDER = {
    github: [
        { value: "openai/gpt-5-mini", text: "GPT-5 mini" },
        { value: "openai/gpt-4.1", text: "GPT-4.1" },
        { value: "openai/gpt-4o", text: "GPT-4o" }
    ],
    openai: [
        { value: "gpt-5-mini", text: "GPT-5 mini" },
        { value: "gpt-4.1", text: "GPT-4.1" },
        { value: "gpt-4o", text: "GPT-4o" }
    ]
};

/**
 * UI timing configuration
 */
export const UI_CONFIG = {
    SUCCESS_MESSAGE_DURATION_MS: 500  // How long to show "Applied" message before closing popup
};
