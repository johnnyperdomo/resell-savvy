// <!-- Works as a bridge for the chrome extension and how they communicate with each other -->

// <!-- NOTE: Communication between our background scripts are handled as if it was a single script, since the bckground scripts are combined. So we don't use the chrome.runtime api, just call a regular function normally -->

try {
  // import scripts

  console.log("working perfectly");
  // open new tab, redirect to getting started page if they installed the first time, or signup page if not authenticated
  chrome.runtime.onInstalled.addListener((reason) => {
    if (reason === chrome.runtime.OnInstalledReason.INSTALL) {
      chrome.tabs.create({
        url: "https://app.resellsavvy.com/getting-started",
      });
    }
  });

  // LATER: only match manifest.json urls to specific closets and listing urls, cuz if not, you don't want to inject styles and dependencies on the other modules

  // NOTE: for manifest testing on local host: but can't post to production "*://localhost:*/*",
} catch (error) {
  //log errors in service workers
  console.log("error: ", error);
}

//LATER: see how you can make your web scraping more robust, since data can change on any given page
// https://codeburst.io/two-simple-technique-for-web-scraping-pages-with-dynamically-created-css-class-names-72eaca8c1304
//LATER: your websraping tools should also be done in a way of importance and availability, 'id'(99% of the time unique, and rarely changes), if not available -> 'name'(not necessarily unique, but it can be, and it changes less), 'class'(sometimes not unique, and it can change more often than the other two). i.e., if we're looking for an input, better to look for type input with an id attached rather than a class name: see this tut for more explanation: https://www.youtube.com/watch?v=b5jt2bhSeXs -->
