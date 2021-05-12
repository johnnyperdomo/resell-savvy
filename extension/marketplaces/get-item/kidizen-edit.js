console.log("kidizen edit ");

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
  await waitForElementToLoad("form");
  console.log("called form filler");

  const title = "";

  //while loop freezing
  //TODO: instead of making firm 3 seconds, check the interval every 2 seconds
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
        sku: "", //doesn't exist
        cost: "", //doesn't exist
      };

      resolve(properties);
    }, 100)
  );
}

async function getItemDetails() {
  //TODO: get item details, convert to rs-savvy-format
  //send message to background script

  let rtvObject = retrievalObject;

  const properties = await formatItemProperties();

  const data = {
    copyToMarketplaces: rtvObject.copyToMarketplaces,
    listingURL: rtvObject.listingURL,
    tab: rtvObject.tab,
    properties: properties,
  };
  console.log(data);
  sendMessageToBackground(data);
}

function sendMessageToBackground(data) {
  console.log("data, ", data);

  chrome.runtime.sendMessage({
    command: "start-crosslist-session",
    data: data,
  });
}

window.addEventListener("load", function () {
  console.log("loaded");

  getItemDetails();
});
