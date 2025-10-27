chrome.runtime.onMessage.addListener(async (msg, sender, sendResponse) => {
    if (msg.type === "oauth" && msg.provider && msg.clientId && msg.authUrl) {
        const redirectUri = chrome.identity.getRedirectURL();
        const url = `${msg.authUrl}?client_id=${msg.clientId}&redirect_uri=${encodeURIComponent(
            redirectUri
        )}&response_type=token&scope=${msg.scope}`;

        chrome.identity.launchWebAuthFlow({ url, interactive: true }, (redirectedTo) => {
            if (chrome.runtime.lastError || !redirectedTo) {
                sendResponse({ error: chrome.runtime.lastError?.message || "No redirect URI" });
                return;
            }

            const params = new URL(redirectedTo).hash.substring(1);
            const token = new URLSearchParams(params).get("access_token");
            if (!token) sendResponse({ error: "No access token returned" });
            else sendResponse({ token });
        });

        return true; // Keep the messaging channel open for async response
    }
});
