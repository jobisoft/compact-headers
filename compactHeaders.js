browser.messageDisplay.onMessageDisplayed.addListener((tab, message) => {
  browser.compactHeadersApi.compactHeaders(tab.windowId);
});

