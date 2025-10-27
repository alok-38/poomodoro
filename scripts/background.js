chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "oauth") {
        const { provider, clientId, authUrl, scope } = message;

        let redirectUri = chrome.identity.getRedirectURL();

        let authRequestUrl = `${authUrl}?client_id=${clientId}&response_type=token&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scope)}`;

        // GitHub requires this extra param
        if (provider === "github") authRequestUrl += "&allow_signup=true";

        chrome.identity.launchWebAuthFlow(
            {
                url: authRequestUrl,
                interactive: true,
            },
            (redirectedTo) => {
                if (chrome.runtime.lastError) {
                    console.error("❌ OAuth error:", chrome.runtime.lastError.message);
                    sendResponse({ error: chrome.runtime.lastError.message });
                    return;
                }

                // Extract access token from redirect URL
                const tokenMatch = redirectedTo.match(/access_token=([^&]+)/);
                const token = tokenMatch ? tokenMatch[1] : null;

                if (token) {
                    console.log(`✅ ${provider} token received`);
                    sendResponse({ token });
                } else {
                    console.error("❌ No token found in redirect URL");
                    sendResponse({ error: "No token found" });
                }
            }
        );

        // Keep message channel open for async response
        return true;
    }
});
