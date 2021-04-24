//Listen for messages
chrome.runtime.onMessage.addListener((msg, sender, response) => {
  if (msg.name == "message") {
    alert("hi");
  }
});

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
