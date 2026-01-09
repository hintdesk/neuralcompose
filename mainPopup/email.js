export async function getCleanBody(tabId) {
    let details = await browser.compose.getComposeDetails(tabId);
    let htmlString = details.body;

    let parser = new DOMParser();
    let doc = parser.parseFromString(htmlString, 'text/html');

    let prefixes = doc.querySelectorAll('.moz-cite-prefix');
    prefixes.forEach(el => el.remove());

    let citations = doc.querySelectorAll('blockquote[type="cite"]');
    citations.forEach(el => el.remove());

    let cleanText = doc.body.innerText.trim();

    return cleanText;
}

export async function getCitations(tabId) {
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

export function formatEmailContent(content) {
    return content.replace(/\n/g, "<br>");
}

export function getMaxLength(defaultLength = 1000) {
    return defaultLength;
}
