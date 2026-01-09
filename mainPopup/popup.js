import * as ui from './ui.js';
import { state, setState, getState, isReady } from './state.js';
import { getApiConfig, populateModels } from './config.js';
import { getCleanBody, getCitations, formatEmailContent } from './email.js';
import { hideError, showError, handleRewriteError, handleApplyError, getErrorMessage } from './errorHandler.js';
import { SYSTEM_PROMPT, REWRITE_CONFIG } from './constants.js';

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
                temperature: REWRITE_CONFIG.temperature
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
        }, REWRITE_CONFIG.buttonTimeout);

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

document.addEventListener("DOMContentLoaded", async () => {
    // Get the active tab in Thunderbird
    let tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length == 0) {
        return;
    }
    setState({ activeTab: tabs[0] });

    initEventListeners();
    loadVersion();
    await loadApiKey();
    
    const modelSelect = document.getElementById("model");
    populateModels(state.provider, modelSelect, state.model);
    
    await rewrite();
});
