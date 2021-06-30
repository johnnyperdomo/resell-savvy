//TODO: on installed, redirect user to signup page on webapp, so they could go through the onboarding process there.

//open new tab, redirect to getting started page if they installed the first time, or signup page if not authenticated
chrome.runtime.onInstalled.addListener((reason) => {
  if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
    // chrome.tabs.create({
    //   url: "onboarding.html",
    // });
  }
});
