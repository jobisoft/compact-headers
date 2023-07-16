browser.messageDisplay.onMessageDisplayed.addListener((tab, message) => {
  browser.compactHeadersApi.compactHeaders(tab.id);
});

// Handle all already displayed messages.
async function handlerAlreadyDisplayedMessages() {
  let tabs = (await browser.tabs.query({})).filter(t => ["messageDisplay", "mail"].includes(t.type));
  for (let tab of tabs) {
    browser.compactHeadersApi.compactHeaders(tab.id);
  }
}
handlerAlreadyDisplayedMessages();
