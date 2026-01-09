import { API_CONFIG, MODELS_BY_PROVIDER } from './constants.js';

export function getApiConfig(provider, apiKey) {
    const config = API_CONFIG[provider];
    if (!config) {
        throw new Error(`Unknown provider: ${provider}`);
    }
    return {
        url: config.url,
        headers: config.headers(apiKey)
    };
}

export function getModelsByProvider(provider) {
    return MODELS_BY_PROVIDER[provider] || [];
}

export function populateModels(provider, modelSelect, currentModel) {
    const models = getModelsByProvider(provider);
    modelSelect.innerHTML = "";
    
    models.forEach(m => {
        const option = document.createElement("option");
        option.value = m.value;
        option.textContent = m.text;
        modelSelect.appendChild(option);
    });
    
    // Set to saved model if it exists, else first one
    if (currentModel && models.some(m => m.value === currentModel)) {
        modelSelect.value = currentModel;
    } else {
        modelSelect.value = models[0]?.value || "";
    }
    
    return modelSelect.value;
}
