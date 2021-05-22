console.log("yooooo from the ebay bulksell page");

showPageLoadingAlert();

function waitForElementToLoad(selector, waitTimeMax, inTree) {
  //TODO: we need jQuery for this to work
  if (!inTree) inTree = $(document.body);
  let timeStampMax = null;
  if (waitTimeMax) {
    timeStampMax = new Date();
    timeStampMax.setSeconds(timeStampMax.getSeconds() + waitTimeMax);
  }
  return new Promise((resolve) => {
    let interval = setInterval(() => {
      let node = inTree.find(selector);
      if (node.length > 0) {
        console.log("node is ready");
        clearInterval(interval);
        resolve(node);
      } else {
        console.log("node is not ready yet");
      }
      if (timeStampMax && new Date() > timeStampMax) {
        clearInterval(interval);
        resolve(false);
      }
    }, 50);
  });
}

async function enterEbayItemTitle() {
  setTimeout(() => {
    //can't manipulate dom from iframe - inject a seperate script from manifest.json, and then send a message to
    let iframe = document.querySelector("iframe[name='findprod_iframe']");
    console.log("iframe: ", iframe);

    iframe.contentWindow.postMessage(
      {
        data: itemData,
        command: "add-ebay-title-iframe",
      },
      "*"
    );

    //TODO: after iframe dom is manipulated successfully, when the other pages load, and the dom is successfully added as well after crosslist, send message to remove tab from being listened to, since this won't do it automatically. since the tab won't close right away, this could cause some leaks if not handled properly (OUTDATED METHOD)

    //TODO: use wait for display to show, wait for the listing forms to be present, and check if v1 or v2 before proceeding
  }, 500);
}

function fillInputValue(input, value) {
  var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  ).set;

  nativeInputValueSetter.call(input, value);

  var inputEvent = new Event("input", { bubbles: true });
  input.dispatchEvent(inputEvent);
}

document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    console.log(itemData);
    showProcessingAlert();
    enterEbayItemTitle(itemData.title);
    console.log("page complete");
  }
};

function showPageLoadingAlert() {
  //LATER: change background color to make it more presentable, maybe a opaque white?
  //LATER: show gif, or lottie image instead of just a simple loading spinner?
  Swal.fire({
    title: "Waiting on page to load...",
    html: "Please wait a few seconds while we start processing your listing soon. <b>Closing this tab will stop your item from being crosslisted</b>.",
    footer: "Page loading time is affected by your internet speed.",
    allowOutsideClick: false,
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
    },
  });
}

function showProcessingAlert() {
  Swal.fire({
    title: "Processing...",
    html: "Please wait a few seconds while we finish processing your listing. <b>Closing this tab will stop your item from being crosslisted</b>.",
    footer: "This tab will auto-close after it finishes processing.",
    allowOutsideClick: false,
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
    },
  });
}

// {
//     "matches": [
//       "https://bulksell.ebay.com/ws/eBayISAPI.dll?SingleList*",
//       "https://www.ebay.com/lstng*"
//     ],
//     "js": [
//       "third-party/jquery-3.6.0.min.js",
//       "marketplaces/new-item/ebay-item.js"
//     ],
//     "all_frames": true
//   },

// let autocompleteList = await waitForElementToLoad(
//   'div[id="w0-find-product-search-bar-autocomplete"] ul > li'
// );
