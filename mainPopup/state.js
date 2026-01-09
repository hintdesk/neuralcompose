export const state = {
    activeTab: null,
    apiKey: null,
    provider: "github",
    model: "openai/gpt-5-mini",
    applyButton: null
};

export function setState(updates) {
    Object.assign(state, updates);
}

export function getState() {
    return { ...state };
}
