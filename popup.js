chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
    const tabUrl = tabs[0].url;
    chrome.runtime.sendMessage({ action: 'checkPhishing', url: tabUrl }, function (response) {
        document.getElementById('status').textContent = response.isPhishing
            ? 'Warning: This page is potentially phishing.'
            : 'Page is safe.';
    });
});
