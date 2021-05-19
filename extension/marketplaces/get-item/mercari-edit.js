showPageLoadingAlert();

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
        console.log("node is not ready yet ", selector);
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
    case "1": // ConditionNew
      return "nwt";

    case "2": //ConditionLikenew
      return "nwot";

    case "3": //ConditionGood
      return "good";

    case "4": //ConditionFair
      return "preowned";

    case "5": //ConditionPoor
      return "poor";

    default:
      return "";
  }
}

async function formatItemProperties() {
  await waitForElementToLoad('input[data-testid="Title"]');

  return await new Promise((resolve) =>
    setTimeout(() => {
      let imagesEl = document.querySelectorAll("img[class*='PreviewImage']"); //contains atleast the name 'preview image'
      let imageURLs = Array.from(imagesEl).map((image) => {
        return $(image).attr("src");
      });

      let mercari_title = $('input[data-testid="Title"]').val();
      let mercari_description = $('textarea[data-testid="Description"]').val();

      let mercari_brand = $('input[data-testid="Brand"]').attr("placeholder");
      let mercari_price = $('input[data-testid="Price"]').val();
      let mercari_color = $("#itemColorId").text().trim().toLowerCase();
      let mercari_condition = $('[name="sellCondition"]:checked').attr("id");

      let properties = {
        imageUrls: imageURLs, //kidizen doesn't show on edit page
        title: mercari_title,
        description: mercari_description,
        color: mercari_color, //null
        brand: mercari_brand,
        condition: formatCondition(mercari_condition),
        price: mercari_price,
        sku: "", //null
        cost: "", //null
      };

      console.log(properties);

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
