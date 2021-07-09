//open new tab, redirect to getting started page if they installed the first time, or signup page if not authenticated
chrome.runtime.onInstalled.addListener((reason) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.tabs.create({
      url: "https://app.resellsavvy.com/getting-started",
    });
  }
});

//LATER: only match manifest.json urls to specific closets and listing urls, cuz if not, you don't want to inject styles and dependencies on the other modules
