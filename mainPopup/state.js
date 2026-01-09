export const state = {
    activeTab: null,
    apiKey: null,
    provider: "github",
    model: "openai/gpt-4.1",
    applyButton: null
};

export function setState(updates) {
    Object.assign(state, updates);
}

export function getState() {
    return { ...state };
}

export function isReady() {
    return state.activeTab && state.apiKey;
}
