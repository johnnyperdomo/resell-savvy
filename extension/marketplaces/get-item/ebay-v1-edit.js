//check if the content script already exists, if it does, then don't proceed with the function
// if (window.RS_EBAY_ALREADY_INJECTED_FLAG) {
//   console.log("this script was already injected");
// } else {
window.RS_EBAY_ALREADY_INJECTED_FLAG = true;
console.log("letssssssssss go we called v1 here!!!!!");

// showPageLoadingAlert();

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
    case "1000": //NEW
      return "nwt";

    case "3000": //USED
      return "good";

    default:
      return "";
  }
}

async function formatItemProperties() {
  await waitForElementToLoad("#editpane_title");

  return await new Promise((resolve) =>
    setTimeout(() => {
      let imagesEl = document.querySelectorAll("#tg-thumbsWrap img");

      console.log("thumb, ", document.querySelectorAll(".thumb"));

      console.log("images El", imagesEl);
      let imageURLs = Array.from(imagesEl).map((image) => {
        console.log(image);
        //regex to replace whatever jpg url shortener prefic to its original value

        let newImage = $(image).attr("src");
        newImage.replace(/_[\d]+\.JPG/, "_57.JPG");

        console.log("new ", newImage);
        return newImage;
      });

      let desc = $('iframe[id*="txtEdit_st"]')
        .contents()
        .find("body")[0].innerText; //this works!!!

      let img = $('iframe[id="uploader_iframe"]').contents().find("body"); //this works!!!
      console.log("img, ", img);
      console.log("desc, ", desc);

      let ebay_title = $("#editpane_title").val();
      let ebay_description = $("#editpane_desc iframe").contents().find("body");
      let ebay_brand = $("input[fieldname='Brand']").val();
      let ebay_condition = $("select[name='itemCondition']").val();
      let ebay_price = $("#binPrice").val(); //TODO: check ebay to see what would it be for an auction listing
      let ebay_sku = $("#editpane_skuNumber").val();

      console.log(ebay_description);

      let properties = {
        imageUrls: [],
        title: ebay_title,
        description: "",
        color: "", //null
        brand: ebay_brand,
        condition: formatCondition(ebay_condition),
        price: ebay_price,
        sku: ebay_sku,
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

  //  sendMessageToBackground(data);
}

//detect if document is ready
document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    //  showProcessingAlert();

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
  //FIX: //LATER: inheriting parent css style
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
//}
