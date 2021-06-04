var domEvent = new DomEvent();
var swalAlert = new SwalAlert();
var helpers = new Helpers();

async function enterEbayItemTitle() {
  //wait half a second for dom to render
  await helpers.delay(500);

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
  if (document.readyState === "interactive") {
    swalAlert.showPageLoadingAlert();
  }

  if (document.readyState === "complete") {
    console.log(itemData);
    swalAlert.showProcessingAlert();
    enterEbayItemTitle(itemData.title);
    console.log("page complete");
  }
};

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

// let autocompleteList = await domEvent.waitForElementToLoad(
//   'div[id="w0-find-product-search-bar-autocomplete"] ul > li'
// );
