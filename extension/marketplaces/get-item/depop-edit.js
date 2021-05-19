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

function formatCondition(condition) {
  //return rs condition value from condition value
  //LATER:later maybe check the cases with everything lowercased values, so we don't run into any issues based on capitalized letters
  switch (condition) {
    case "Brand new":
      return "nwt";

    case "Like new":
      return "nwot";

    case "Excellent":
      return "good";

    case "Good":
      return "preowned";

    case "Fair":
      return "poor";

    default:
      return "";
  }
}

async function formatItemProperties() {
  await waitForElementToLoad("#description");

  //LATER: get brand, brand is optional, bcuz it will only show up if user picks category, so keep that in mind

  return await new Promise((resolve) =>
    setTimeout(() => {
      let imagesEl = document.querySelectorAll(
        '[data-testid*="imageInput"] img'
      );
      let imageURLs = Array.from(imagesEl).map((image) => {
        return $(image).attr("src");
      });

      let depop_description = $("#description").val();
      let depop_color = $(
        '[data-testid="listingSelect__listing__colour"] div[class*="label"]'
      )
        .text()
        .trim()
        .toLowerCase();

      let depop_condition = $(
        '[data-testid="listingSelect__listing__condition"] div[class*="listingSelect__value-container"]'
      )
        .text()
        .trim(); //class of condition button, must include burgundy type, get data et name attribute
      let depop_price = $('input[data-testid="price__input"]').val();

      let properties = {
        imageUrls: imageURLs,
        title: "", //null
        description: depop_description, //
        color: depop_color,
        brand: "", //LATER: append later
        condition: formatCondition(depop_condition),
        price: depop_price,
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
  console.log(data);

  sendMessageToBackground(data);
}

function sendMessageToBackground(data) {
  chrome.runtime.sendMessage({
    command: "start-crosslist-session",
    data: data,
  });
}

//detect if document is ready
document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    showProcessingAlert();
    getItemDetails();
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
  Swal;
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
