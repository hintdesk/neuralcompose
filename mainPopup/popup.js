import * as ui from './ui.js';
import { state, setState } from './state.js';
import { getApiConfig, populateModels } from './config.js';
import { getCleanBody, getCitations, formatEmailContent } from './email.js';
import { handleRewriteError, handleApplyError, getErrorMessage } from './errorHandler.js';
import { SYSTEM_PROMPT, AI_MODEL_CONFIG, UI_CONFIG } from './constants.js';

/**
 * Creates the message array for the AI API request
 * @param {string} input - The email text to rewrite
 * @returns {Array} Array of message objects with system and user roles
 */
function getMessages(input) {
    return [
        {
            role: "system",
            content: SYSTEM_PROMPT
        },
        {
            role: "user",
            content: input
        }
    ];
}

async function rewrite() {
    if (!state.activeTab) {
        return;
    }

    // Keep apply button disabled until rewrite succeeds
    if (state.applyButton) state.applyButton.disabled = true;
    const input = await getCleanBody(state.activeTab.id);

    if (!input || input.trim().length === 0) {
        ui.setOutput("No input message found");
        return;
    }

    try {
        // Clear any previous error
        ui.hideErrorSection();
        const { url, headers } = getApiConfig(state.provider, state.apiKey);
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                model: state.model,
                messages: getMessages(input),
                temperature: AI_MODEL_CONFIG.temperature
            })
        });

        console.log(JSON.stringify(response.status));
        if (response.status != 200) {
            throw new Error(getErrorMessage(response.status));
        }
        const result = await response.json();

        ui.setOutput(result.choices[0].message.content);

        // Enable Apply button after successful rewrite
        if (state.applyButton) state.applyButton.disabled = false;
    } catch (error) {
        handleRewriteError(error);
    }
}

/**
 * Applies the rewritten email content back to the compose window
 */
async function handleApplyClick() {
    try {
        ui.setButtonState(state.applyButton, true, "Applying...");

        const newBody = ui.getOutput();
        let htmlContent = formatEmailContent(newBody);
        const citations = await getCitations(state.activeTab.id);
        
        await browser.compose.setComposeDetails(state.activeTab.id, {
            body: htmlContent + "<br><br><br><br>" + citations
        });

        ui.setButtonState(state.applyButton, false, "Applied");
        setTimeout(() => {
            ui.setButtonState(state.applyButton, false, "Apply");
            window.close();
        }, UI_CONFIG.SUCCESS_MESSAGE_DURATION_MS);

    } catch (err) {
        handleApplyError(err, state.applyButton);
    }
}

function handleConfigClick() {
    ui.showConfigSection();
    ui.hideOutputSection();
    ui.hideActionsSection();    
}

function handleCloseClick() {
    console.log("Close config clicked");
    ui.hideConfigSection();
    ui.showOutputSection();
    ui.showActionsSection();
}

function handleSaveClick() {
    const { apiKey, provider, model } = ui.getFormValues();
    
    if (apiKey) {
        browser.storage.local.set({ apiKey, provider, model });
        setState({ apiKey, provider, model });
        alert("Settings saved!");
        ui.hideConfigSection();
        ui.showOutputSection();
    } else {
        alert("Please enter a valid API Key.");
    }
}

/**
 * Loads saved API key and provider settings from storage
 */
async function loadApiKey() {
    const result = await browser.storage.local.get(["apiKey", "provider", "model"]);
    const updates = {};
    
    if (result.apiKey) updates.apiKey = result.apiKey;
    if (result.provider) updates.provider = result.provider;
    if (result.model) updates.model = result.model;
    
    setState(updates);
    
    ui.setFormValues(
        result.apiKey || "",
        result.provider || state.provider,
        result.model || state.model
    );
}

function handleProviderChange(e) {
    const newProvider = e.target.value;
    setState({ provider: newProvider });
    const modelSelect = document.getElementById("model");
    const newModel = populateModels(newProvider, modelSelect, state.model);
    setState({ model: newModel });
}

function loadVersion() {
    const manifestData = browser.runtime.getManifest();    
    const version = manifestData.version;
    const versionElement = document.getElementById('app-version');
    if (versionElement) {
        versionElement.textContent = "v" + version;
    }
}

/**
 * Initializes all event listeners for UI elements
 */
function initEventListeners() {
    const applyButton = document.getElementById("applyButton");
    if (applyButton) {
        setState({ applyButton });
        applyButton.addEventListener("click", handleApplyClick);
    }

    const configButton = document.getElementById("configButton");
    if (configButton) configButton.addEventListener("click", handleConfigClick);

    const saveButton = document.getElementById("saveButton");
    if (saveButton) saveButton.addEventListener("click", handleSaveClick);

    const closeButton = document.getElementById("closeButton");
    if (closeButton) closeButton.addEventListener("click", handleCloseClick);

    const providerSelect = document.getElementById("provider");
    if (providerSelect) providerSelect.addEventListener("change", handleProviderChange);
}

/**
 * Initializes the extension popup
 * Sets up active tab, loads settings, and performs initial rewrite
 */
async function initializePopup() {
    // Get the active tab in Thunderbird
    const tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length === 0) {
        console.warn("No active tab found");
        return;
    }
    setState({ activeTab: tabs[0] });

    // Set up UI and load saved settings
    initEventListeners();
    loadVersion();
    await loadApiKey();
    
    // Populate model dropdown with current provider's models
    const modelSelect = document.getElementById("model");
    populateModels(state.provider, modelSelect, state.model);
    
    // Perform initial rewrite
    await rewrite();
}

document.addEventListener("DOMContentLoaded", initializePopup);
