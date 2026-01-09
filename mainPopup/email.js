/**
 * Extracts clean email body text without citations and quoted content
 * @param {number} tabId - The compose tab ID
 * @returns {Promise<string>} The cleaned email text
 */
export async function getCleanBody(tabId) {
    const details = await browser.compose.getComposeDetails(tabId);
    const htmlString = details.body;

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    // Remove citation prefixes and blockquotes
    const prefixes = doc.querySelectorAll('.moz-cite-prefix');
    prefixes.forEach(el => el.remove());

    const citations = doc.querySelectorAll('blockquote[type="cite"]');
    citations.forEach(el => el.remove());

    const cleanText = doc.body.innerText.trim();

    return cleanText;
}

/**
 * Extracts the citation/quoted content from the original email
 * @param {number} tabId - The compose tab ID
 * @returns {Promise<string>} The citation HTML content
 */
export async function getCitations(tabId) {
    const details = await messenger.compose.getComposeDetails(tabId);
    const htmlString = details.body;

    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlString, 'text/html');

    const citePrefix = doc.querySelector('.moz-cite-prefix');
    const citeBody = doc.querySelector('blockquote[type="cite"]');
    
    let oldEmailHtml = "";
    if (citePrefix) oldEmailHtml += citePrefix.outerHTML;
    if (citeBody) oldEmailHtml += citeBody.outerHTML;

    return oldEmailHtml;
}

export function formatEmailContent(content) {
    return content.replace(/\n/g, "<br>");
}
