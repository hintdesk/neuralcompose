export const SYSTEM_PROMPT = "You are an expert professional editor." +
    "Your sole task is to rewrite the provided email input to be more professional, clear, and polished " +
    "while maintaining the original language. Strictly adhere to these rules:" +
    "1. Output ONLY the rewritten email text." +
    "2. Do not include greetings, introductions, or closing remarks to the user." +
    "3. Do not include conversational filler or explanations." +
    "4. Maintain the original language of the input." +
    "5. If the input is a rough draft or bullet points, expand them into a complete, professional email structure.";

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

export const MODELS_BY_PROVIDER = {
    github: [
        { value: "openai/gpt-4.1", text: "GPT-4.1" },
        { value: "openai/gpt-4o", text: "GPT-4o" },
        { value: "openai/gpt-3.5-turbo", text: "GPT-3.5 Turbo" }
    ],
    openai: [
        { value: "gpt-4", text: "GPT-4" },
        { value: "gpt-4o", text: "GPT-4o" },
        { value: "gpt-3.5-turbo", text: "GPT-3.5 Turbo" }
    ]
};

export const REWRITE_CONFIG = {
    temperature: 0.7,
    maxInputLength: 1000,
    buttonTimeout: 500,
    buttonErrorTimeout: 2000
};
