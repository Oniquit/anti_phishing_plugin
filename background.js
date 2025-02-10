chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openHistory') {
        chrome.tabs.create({
            url: 'http://127.0.0.1:5000/blocked-sites'
        }, function(tab) {
            if (chrome.runtime.lastError) {
                console.error('Failed to open history page:', chrome.runtime.lastError.message);
            }
        });
    } else if (request.action === 'addBlockedSite') {
        fetch('http://127.0.0.1:5000/add-blocked-site', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: request.url })
        }).then(response => response.json())
          .then(data => console.log('Site added:', data));
    } else if (request.action === 'removeBlockedSite') {
        fetch('http://127.0.0.1:5000/remove-blocked-site', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: request.url })
        }).then(response => response.json())
          .then(data => console.log('Site removed:', data));
    }
});
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'openHistory') {
        chrome.tabs.create({
            url: 'http://127.0.0.1:5000/blocked-sites'
        }, function(tab) {
            if (chrome.runtime.lastError) {
                console.error('Failed to open history page:', chrome.runtime.lastError.message);
            }
        });
    }
});
