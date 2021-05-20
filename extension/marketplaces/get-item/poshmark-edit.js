//show loading alert as soon as page loads
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

// function waitForElementToDisplay(
//   selector,
//   callback,
//   checkFrequencyInMs,
//   timeoutInMs
// ) {
//   var startTimeInMs = Date.now();
//   (function loopSearch() {
//     if (document.querySelector(selector) != null) {
//       callback();
//       return;
//     } else {
//       setTimeout(function () {
//         if (timeoutInMs && Date.now() - startTimeInMs > timeoutInMs) return;
//         loopSearch();
//       }, checkFrequencyInMs);
//     }
//   })();
// }

// waitForElementToDisplay(
//   "input[name='title']",
//   function () {
//     //retrievalObject inherited from execute script
//     getItemDetails(retrievalObject);
//   },
//   100,
//   100000000000000
// );

function formatCondition(condition) {
  //return rs condition value from condition value
  switch (condition) {
    case "nwt_yes":
      return "nwt";

    case "nwt_no":
      return "good";

    default:
      return "";
  }
}

async function formatItemProperties() {
  await waitForElementToLoad("input[data-vv-name='title']");

  return await new Promise((resolve) =>
    setTimeout(() => {
      let imagesEl = document.querySelectorAll(
        ".listing-editor__image-content img"
      );
      let imageURLs = Array.from(imagesEl).map((image) => {
        return $(image).attr("src");
      });

      let poshmark_title = $("input[data-vv-name='title']").val();
      let poshmark_description = $(
        "textarea[data-vv-name='description']"
      ).val();
      let poshmark_color = $("div[data-et-name='color'] li")
        .text()
        .trim()
        .toLowerCase();
      let poshmark_brand = $(
        'div[data-et-name="listingEditorBrandSection"] input'
      ).val();
      let poshmark_condition = $(
        ".listing-editor__condition-btn[class*='burgundy']"
      ).attr("data-et-name"); //class of condition button, must include burgundy type, get data et name attribute
      let poshmark_price = $('input[data-vv-name="listingPrice"]').val();
      let poshmark_cost = $('input[data-vv-name="costPriceAmount"]').val();
      let poshmark_sku = $('input[data-vv-name="sku"]').val();

      console.log(poshmark_condition);

      let properties = {
        imageUrls: imageURLs,
        title: poshmark_title,
        description: poshmark_description,
        color: poshmark_color,
        brand: poshmark_brand,
        condition: formatCondition(poshmark_condition),
        price: poshmark_price,
        sku: poshmark_sku,
        cost: poshmark_cost,
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
