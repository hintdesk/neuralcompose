import { showConfigSection, hideOutputSection, hideActionsSection, hideConfigSection, showOutputSection,showActionsSection } from './ui.js';

let activeTab = null;
let applyButton = null;
let apiKey = null;
let provider = "github";
let model = "openai/gpt-4.1";

function getApiConfig() {
    let url, headers;
    if (provider === "github") {
        url = "https://models.github.ai/inference/chat/completions";
        headers = {
            "accept": "application/vnd.github+json",
            "authorization": `Bearer ${apiKey}`,
            "content-type": "application/json",
            "x-github-api-version": "2022-11-28"
        };
    } else if (provider === "openai") {
        url = "https://api.openai.com/v1/chat/completions";
        headers = {
            "authorization": `Bearer ${apiKey}`,
            "content-type": "application/json"
        };
    }
    return { url, headers };
}

function getMessages(input) {
    return [
        {
            role: "system",
            content: "You are an expert professional editor." +
                "Your sole task is to rewrite the provided email input to be more professional, clear, and polished " +
                "while maintaining the original language. Strictly adhere to these rules:" +
                "1. Output ONLY the rewritten email text." +
                "2. Do not include greetings, introductions, or closing remarks to the user." +
                "3. Do not include conversational filler or explanations." +
                "4. Maintain the original language of the input." +
                "5. If the input is a rough draft or bullet points, expand them into a complete, professional email structure."
        },
        {
            role: "user",
            content: input
        }
    ];
}

function populateModels(providerValue) {
    const modelSelect = document.getElementById("model");
    modelSelect.innerHTML = ""; // Clear existing options
    let models = [];
    if (providerValue === "github") {
        models = [
            { value: "openai/gpt-4.1", text: "GPT-4.1" },
            { value: "openai/gpt-4o", text: "GPT-4o" },
            { value: "openai/gpt-3.5-turbo", text: "GPT-3.5 Turbo" }
        ];
    } else if (providerValue === "openai") {
        models = [
            { value: "gpt-4", text: "GPT-4" },
            { value: "gpt-4o", text: "GPT-4o" },
            { value: "gpt-3.5-turbo", text: "GPT-3.5 Turbo" }
        ];
    }
    models.forEach(m => {
        const option = document.createElement("option");
        option.value = m.value;
        option.textContent = m.text;
        modelSelect.appendChild(option);
    });
    // Set to saved model if it exists, else first one
    if (model && models.some(m => m.value === model)) {
        modelSelect.value = model;
    } else {
        model = models[0].value;
        modelSelect.value = model;
    }
}

async function rewrite() {
    if (!activeTab) {
        return;
    }

    // Keep apply button disabled until rewrite succeeds
    if (applyButton) applyButton.disabled = true;
    const input = await getCleanBody(activeTab.id);

    if (!input || input.trim().length === 0) {
        return;
    }

    try {
        // Clear any previous error
        const errorDiv = document.getElementById("error");
        errorDiv.textContent = "";
        errorDiv.classList.add("d-none");
        const { url, headers } = getApiConfig();
        const response = await fetch(url, {
            method: "POST",
            headers: headers,
            body: JSON.stringify({
                model: model,
                messages: getMessages(input),
                temperature: 0.7
            })
        });

        console.log(JSON.stringify(response.status));
        if (response.status != 200) {
            if (response.status === 401) {
                throw new Error("Missing API key or incorrect credentials. Check your configuration.");
            } else {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
        }
        const result = await response.json();

        const displayArea = document.getElementById("output");
        displayArea.textContent = result.choices[0].message.content;

        // Enable Apply button after successful rewrite
        if (applyButton) applyButton.disabled = false;
    } catch (error) {
        console.error("Error during rewrite:", error);
        const errorDiv = document.getElementById("error");
        errorDiv.textContent = error.message;
        // Keep apply button disabled on error
        if (applyButton) applyButton.disabled = true;
        // Show the error section
        errorDiv.classList.remove("d-none");
    }
}

async function handleApplyClick() {
    const displayArea = document.getElementById("output");
    try {
        applyButton.disabled = true;
        applyButton.textContent = "Applying...";

        // Use the stored activeTab
        const newBody = displayArea.textContent || "";       

        let htmlContent = newBody.replace(/\n/g, "<br>");
        const citations = await getCitations(activeTab.id);
        
        await browser.compose.setComposeDetails(activeTab.id, {
            body: htmlContent + "<br><br><br><br>" + citations
        });

        applyButton.textContent = "Applied";
        setTimeout(() => {
            applyButton.textContent = "Apply";
            applyButton.disabled = false;
            window.close();
        }, 1500);

    } catch (err) {
        console.error("Failed to apply body:", err);
        applyButton.textContent = "Error";
        applyButton.disabled = false;
        setTimeout(() => applyButton.textContent = "Apply", 2000);
    }
}


function handleConfigClick() {
    showConfigSection();
    hideOutputSection();
    hideActionsSection();    
}

function handleCloseClick() {
    console.log("Close config clicked");
    hideConfigSection();
    showOutputSection();
    showActionsSection();

}

function handleSaveClick() {
    const apiKeyInput = document.getElementById("apiKey");
    const apiKeyValue = apiKeyInput.value.trim();
    const providerSelect = document.getElementById("provider");
    const providerValue = providerSelect.value;
    const modelSelect = document.getElementById("model");
    const modelValue = modelSelect.value;
    if (apiKeyValue) {
        browser.storage.local.set({ apiKey: apiKeyValue, provider: providerValue, model: modelValue });
        apiKey = apiKeyValue;
        provider = providerValue;
        model = modelValue;
        alert("Settings saved!");
        const configDiv = document.getElementById("config");
        configDiv.classList.add("d-none");
        const outputDiv = document.getElementById("output");
        outputDiv.classList.remove("d-none");
        
    } else {
        alert("Please enter a valid API Key.");
    }
}

async function loadApiKey() {
    const result = await browser.storage.local.get(["apiKey", "provider", "model"]);
    if (result.apiKey) {
        apiKey = result.apiKey;
        document.getElementById("apiKey").value = apiKey;
    }
    if (result.provider) {
        provider = result.provider;
        document.getElementById("provider").value = provider;
    }
    if (result.model) {
        model = result.model;
        document.getElementById("model").value = model;
    }
}

function handleProviderChange(e) {
    const newProvider = e.target.value;
    provider = newProvider;
    populateModels(newProvider);
}

document.addEventListener("DOMContentLoaded", async () => {
    // Get the active tab in Thunderbird
    let tabs = await browser.tabs.query({ active: true, currentWindow: true });
    if (tabs.length == 0) {
        return;
    }
    activeTab = tabs[0];

    // Set up event listeners
    applyButton = document.getElementById("applyButton");
    if (applyButton) applyButton.addEventListener("click", handleApplyClick);

    const configButton = document.getElementById("configButton");
    if (configButton) configButton.addEventListener("click", handleConfigClick);

    const saveButton = document.getElementById("saveButton");
    if (saveButton) saveButton.addEventListener("click", handleSaveClick);

    const closeButton = document.getElementById("closeButton");
    if (closeButton) closeButton.addEventListener("click", handleCloseClick);

    const providerSelect = document.getElementById("provider");
    if (providerSelect) providerSelect.addEventListener("change", handleProviderChange);

    loadVersion();
    // Load saved settings
    await loadApiKey();

    // Populate models based on loaded provider
    populateModels(provider);    

    // Populate output on load
    await rewrite();
});

function loadVersion() {
    const manifestData = browser.runtime.getManifest();    
    const version = manifestData.version;
    const versionElement = document.getElementById('app-version');
    if (versionElement) {
        versionElement.textContent = "v" + version;
    }
}

async function getCleanBody(tabId) {
    let details = await browser.compose.getComposeDetails(tabId);
    let htmlString = details.body;

    let parser = new DOMParser();
    let doc = parser.parseFromString(htmlString, 'text/html');

    let prefixes = doc.querySelectorAll('.moz-cite-prefix');
    prefixes.forEach(el => el.remove());

    let citations = doc.querySelectorAll('blockquote[type="cite"]');
    citations.forEach(el => el.remove());

    let cleanText = doc.body.innerText.trim();

    return cleanText.substring(0, 1000);
}

async function getCitations(tabId) {
    let details = await messenger.compose.getComposeDetails(tabId);
    let htmlString = details.body;

    let parser = new DOMParser();
    let doc = parser.parseFromString(htmlString, 'text/html');

    let citePrefix = doc.querySelector('.moz-cite-prefix');
    let citeBody = doc.querySelector('blockquote[type="cite"]');
    
    let oldEmailHtml = "";
    if (citePrefix) oldEmailHtml += citePrefix.outerHTML;
    if (citeBody) oldEmailHtml += citeBody.outerHTML;

    return oldEmailHtml;
}