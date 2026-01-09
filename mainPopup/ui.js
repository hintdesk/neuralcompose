export function showConfigSection() {
    const configDiv = document.getElementById("config");
    configDiv.classList.remove("d-none");
}

export function hideOutputSection() {
    const outputDiv = document.getElementById("output");
    outputDiv.classList.add("d-none");
}

export function hideActionsSection() {
    const actions = document.getElementById("actions");
    actions.classList.add("d-none");
}

export function hideConfigSection() {
    const configDiv = document.getElementById("config");
    configDiv.classList.add("d-none");
}

export function showOutputSection() {
    const outputDiv = document.getElementById("output");
    outputDiv.classList.remove("d-none");
}

export function showActionsSection() {
    const actions = document.getElementById("actions");
    actions.classList.remove("d-none");
}

export function hideErrorSection() {
    const errorDiv = document.getElementById("error");
    errorDiv.textContent = "";
    errorDiv.classList.add("d-none");
}

export function setOutput(message) {
    const displayArea = document.getElementById("output");
    displayArea.textContent = message;
}

export function getOutput() {
    const displayArea = document.getElementById("output");
    return displayArea.textContent || "";
}

export function setErrorMessage(message) {
    const errorDiv = document.getElementById("error");
    errorDiv.textContent = message;
}

export function showErrorSection() {
    const errorDiv = document.getElementById("error");
    errorDiv.classList.remove("d-none");
}

export function setButtonState(button, isDisabled, text) {
    if (!button) return;
    button.disabled = isDisabled;
    if (text) button.textContent = text;
}

export function getFormValues() {
    return {
        apiKey: document.getElementById("apiKey").value.trim(),
        provider: document.getElementById("provider").value,
        model: document.getElementById("model").value
    };
}

export function setFormValues(apiKey, provider, model) {
    const apiKeyInput = document.getElementById("apiKey");
    if (apiKey) apiKeyInput.value = apiKey;
    
    const providerSelect = document.getElementById("provider");
    if (provider) providerSelect.value = provider;
    
    const modelSelect = document.getElementById("model");
    if (model) modelSelect.value = model;
}