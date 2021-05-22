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
    case "is_new":
      return "nwt";

    case "is_gently_used":
      return "good";

    case "is_used":
      return "preowned";

    case "is_worn":
      return "poor";

    default:
      return "";
  }
}

async function formatItemPropertiesVersion1() {
  await waitForElementToLoad("input[name='title']");

  return await new Promise((resolve) =>
    setTimeout(() => {
      let imagesEl = document.querySelectorAll(".photo img");
      let imageURLs = Array.from(imagesEl).map((image) => {
        return $(image).attr("src");
      });

      let grailed_title = $("input[name='title']").val();
      let grailed_description = $("textarea[name='description']").val();
      let grailed_color = $("input[name='color']").val().toLowerCase();
      let grailed_brand = $("#designer-autocomplete").val(); //designer
      let grailed_condition = $("select[name='condition']").val();
      let grailed_price = $("input[name='price']").val();

      console.log(
        grailed_title,
        grailed_description,
        grailed_color,
        grailed_brand,
        grailed_condition,
        grailed_price
      );

      let properties = {
        imageUrls: imageURLs,
        title: grailed_title,
        description: grailed_description,
        color: grailed_color,
        brand: grailed_brand,
        condition: formatCondition(grailed_condition),
        price: grailed_price,
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
  const properties = await formatItemPropertiesVersion1();

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
  //FIX: //LATER: inherits parents styles, but fix later on, maybe with shadow dom
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
