//TODO: on installed, redirect user to signup page on webapp, so they could go through the onboarding process there.

chrome.management.get(chrome.runtime.id, function (extensionInfo) {
  if (extensionInfo.installType === "development") {
    console.log("developer modeeee");
    key = "dev";
    //TODO: set dev variables here
    // perform dev mode action here
    // alert("dev");
  }

  if (extensionInfo.installType === "production") {
    key = "prod";
    console.log("production mode");
    //perform prod action here
  }
});
