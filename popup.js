document.addEventListener('DOMContentLoaded', function () {
    const historyBtn = document.getElementById('historyBtn');
    const addSiteBtn = document.getElementById('addSiteBtn');
    const removeSiteBtn = document.getElementById('removeSiteBtn');
    const siteList = document.getElementById('siteList');

    function loadBlockedSites() {
        fetch('http://127.0.0.1:5000/phishing-urls')
            .then(response => response.json())
            .then(data => {
                siteList.innerHTML = '';
                data.forEach(site => {
                    const option = document.createElement('option');
                    option.value = site.url;
                    option.textContent = site.url;
                    siteList.appendChild(option);
                });
            });
    }

    loadBlockedSites();

    if (historyBtn) {
        historyBtn.addEventListener('click', function () {
            chrome.runtime.sendMessage({ action: 'openHistory' });
        });
    }

    if (addSiteBtn) {
        addSiteBtn.addEventListener('click', function () {
            const url = prompt("Enter the URL of the site to add to the blocklist:");
            if (url) {
                fetch('http://127.0.0.1:5000/add-blocked-site', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: url })
                }).then(() => loadBlockedSites());
            }
        });
    }

    if (removeSiteBtn) {
        removeSiteBtn.addEventListener('click', function () {
            const url = siteList.value;
            if (url) {
                fetch('http://127.0.0.1:5000/remove-blocked-site', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ url: url })
                }).then(() => loadBlockedSites());
            }
        });
    }
});