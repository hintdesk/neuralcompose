import * as ui from './ui.js';
import { state } from './state.js';

export function showError(message) {
    ui.setErrorMessage(message);
    ui.showErrorSection();
}

export function hideError() {
    ui.hideErrorSection();
}

export function handleRewriteError(error) {
    console.error("Error during rewrite:", error);
    showError(error.message);
    
    if (state.applyButton) {
        state.applyButton.disabled = true;
    }
}

export function handleApplyError(error, applyButton) {
    console.error("Failed to apply body:", error);
    applyButton.textContent = "Error";
    applyButton.disabled = false;
    setTimeout(() => applyButton.textContent = "Apply", 2000);
}

export function getErrorMessage(statusCode) {
    switch (statusCode) {
        case 401:
            return "Missing API key or incorrect credentials. Check your configuration.";
        default:
            return `HTTP error! status: ${statusCode}`;
    }
}
