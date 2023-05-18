var compactHeadersID = messenger.runtime.getURL("");
console.log(compactHeadersID);

//browser.messageDisplay.onMessageDisplayed.addListener((tab, info) => {
browser.messageDisplay.onMessageDisplayed.addListener((tab, message) => {
  browser.compactHeadersApi.compactHeaders();
  //console.log(tab.windowId);
});

