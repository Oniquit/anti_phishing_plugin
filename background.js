const FLASK_SERVER_URL = 'http://127.0.0.1:5000/check-url';
let requestQueue = [];
let isProcessingQueue = false;

async function checkUrlSafety(url) {
    const response = await fetch(FLASK_SERVER_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url })
    });

    const data = await response.json();
    return data.isPhishing;
}

async function processQueue() {
    if (isProcessingQueue || requestQueue.length === 0) return;
    isProcessingQueue = true;

    while (requestQueue.length > 0) {
        const { url, tabId } = requestQueue.shift();
        const isPhishing = await checkUrlSafety(url);

        if (isPhishing) {
            chrome.scripting.executeScript({
                target: { tabId: tabId },
                func: () => {
                    alert('This site is potentially a phishing site!');
                }
            });

            chrome.notifications.create('phishing-alert', {
                type: 'basic',
                iconUrl: 'icons/6169986.png',
                title: 'Warning: Phishing Detected',
                message: 'The site you are visiting might be a phishing site.'
            });
        }
    }

    isProcessingQueue = false;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'checkPhishing') {
        checkUrlSafety(request.url).then(isPhishing => {
            sendResponse({ isPhishing: isPhishing });
        });
        return true;
    }
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete') {
        requestQueue.push({ url: tab.url, tabId: tabId });
        processQueue();
    }
});
