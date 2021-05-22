//LATER: kidizen doesn't load images in edit page, their error.

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

function formatCondition(condition) {
  //return rs condition value from condition value
  switch (condition) {
    //

    case "New with tag":
      return "nwt";

    case "New without tag":
      return "nwot";

    case ("Very good used condition", "Excellent used condition"):
      return "good";

    case "Good used condition":
      return "preowned";

    case "Play condition":
      return "poor";

    default:
      return "";
  }
}

async function formatItemProperties() {
  await waitForElementToLoad("#item_title");

  return await new Promise((resolve) =>
    setTimeout(() => {
      let imageURLs = []; //LATER: kidizen doens't show on edit page

      let kidizen_title = $("#item_title").val();
      let kidizen_description = $("#item_description").val();
      let kidizen_price = $("#item_list_price").val();

      const brandEl = $("span:contains('Brand')").closest(
        ".DropdownTrigger--required"
      );

      let kidizen_brand = brandEl
        .find(".DropdownTrigger-selection")
        .text()
        .trim();

      const conditionEl = $("span:contains('Condition')").closest(
        ".DropdownTrigger--required"
      );

      let kidizen_condition = conditionEl
        .find(".DropdownTrigger-selection")
        .text()
        .trim();

      let properties = {
        imageUrls: imageURLs, //kidizen doesn't show on edit page
        title: kidizen_title,
        description: kidizen_description,
        color: "", //null
        brand: kidizen_brand,
        condition: formatCondition(kidizen_condition),
        price: kidizen_price,
        sku: "", //null
        cost: "", //null
      };

      resolve(properties);
    }, 100)
  );
}

async function getItemDetails() {
  //TODO: get item details, convert to rs-savvy-format
  //send message to background script

  const properties = await formatItemProperties();

  const data = {
    copyToMarketplaces: retrievalObject.copyToMarketplaces,
    copyFromMarketplace: retrievalObject.copyFromMarketplace,
    listingURL: retrievalObject.listingURL,
    tab: retrievalObject.tab,
    properties: properties,
  };

  sendMessageToBackground(data);
}

function sendMessageToBackground(data) {
  console.log("data, ", data);

  chrome.runtime.sendMessage({
    command: "start-crosslist-session",
    data: data,
  });
}

//detect if document is ready
document.onreadystatechange = function () {
  //doc tree is loaded
  if (document.readyState === "interactive") {
    showPageLoadingAlert();
  }

  //doc tree is fully ready to be manipulated
  if (document.readyState === "complete") {
    showProcessingAlert();
    getItemDetails();
  }
};

function showPageLoadingAlert() {
  //LATER: change background color to make it more presentable, maybe a opaque white?
  //LATER: show gif, or lottie image instead of just a simple loading spinner?
  Swal.fire({
    title: "Waiting on page to finish loading...",
    html: "Please wait a few seconds while we start processing your listing soon. <b>Closing this tab will stop your item from being crosslisted</b>.",
    footer: "Page loading time is affected by your internet speed.",
    allowOutsideClick: false,
    backdrop: "rgba(239, 239, 239, 0.98)",
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
    backdrop: "rgba(239, 239, 239, 0.98)",
    showConfirmButton: false,
    willOpen: () => {
      Swal.showLoading();
    },
  });
}
