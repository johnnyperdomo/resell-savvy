var domEvent = new DomEvent();
var swalAlert = new SwalAlert();
var helpers = new Helpers();

console.log("detected ebay stage 1");

async function enterEbayItemTitle() {
  //wait half a second for dom to render
  await helpers.delay(500);

  //can't manipulate dom from iframe - inject a seperate script from manifest.json, and then send a message to iframe with data
  let iframe = document.querySelector("iframe[name='findprod_iframe']");

  iframe.contentWindow.postMessage(
    {
      data: window.itemData,
      command: "add-ebay-title-iframe",
    },
    "*"
  );

  // update ebay listing stage to "form"
  updateEbayListingStage();
}

//ebay listing will now advanced to stage 'form'
function updateEbayListingStage() {
  let tabId = window.itemData.tab;
  let newStage = "form";

  let data = {
    tab: tabId,
    stage: newStage,
  };

  chrome.runtime.sendMessage({
    command: "update-ebay-active-tab-stage",
    data: data,
  });
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

// document.onreadystatechange = function () {
//   if (document.readyState === "interactive") {
//     swalAlert.showPageLoadingAlert();
//   }

//   if (document.readyState === "complete") {
//     swalAlert.showProcessingAlert();
//     enterEbayItemTitle(itemData.title);
//   }
// };

//listen for message from the crosslist listings
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.command == "set-item-data") {
    console.log("set listing objected detected: ", msg);

    //set item data, parse stringified json
    window.itemData = JSON.parse(msg.data.itemData);

    checkDocumentState();
  }
});

function checkDocumentState() {
  //doc is loaded
  if (document.readyState === "interactive") {
    swalAlert.showPageLoadingAlert(); //swal alert ui waiting
  } else {
    //NOTE: sometimes doc can already be complete when script injected; race condition
    swalAlert.showProcessingAlert();

    enterEbayItemTitle(window.itemData.title);
  }

  document.addEventListener("readystatechange", () => {
    //doc tree is fully ready to be manipulated
    if (document.readyState === "complete") {
      swalAlert.showProcessingAlert();

      enterEbayItemTitle(window.itemData.title);
    }
  });
}
