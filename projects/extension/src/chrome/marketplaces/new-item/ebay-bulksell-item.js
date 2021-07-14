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
      data: itemData,
      command: "add-ebay-title-iframe",
    },
    "*"
  );

  // update ebay listing stage to "form"
  updateEbayListingStage();
}

//ebay listing will now advanced to stage 'form'
function updateEbayListingStage() {
  let tabId = itemData.tab;
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

document.onreadystatechange = function () {
  if (document.readyState === "interactive") {
    swalAlert.showPageLoadingAlert();
  }

  if (document.readyState === "complete") {
    swalAlert.showProcessingAlert();
    enterEbayItemTitle(itemData.title);
  }
};
