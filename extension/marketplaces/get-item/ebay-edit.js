console.log("message recevied from ebay session");

function waitForElementToDisplay(
  selector,
  callback,
  checkFrequencyInMs,
  timeoutInMs
) {
  var startTimeInMs = Date.now();
  (function loopSearch() {
    if (document.querySelector(selector) != null) {
      callback();
      return;
    } else {
      setTimeout(function () {
        if (timeoutInMs && Date.now() - startTimeInMs > timeoutInMs) return;
        console.log("element not found yet");

        loopSearch();
      }, checkFrequencyInMs);
    }
  })();
}

// // TODO: call code from postMessage request
// waitForElementToDisplay(
//   "#description",
//   function () {
//     //itemData inherited from execute script
//     // getItemDetails(itemData);
//     console.log("found element");
//   },
//   100,
//   7500
// );

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

function detectEbayListingVersion() {
  //detect using a unique element from each version

  //ebay listing version 1
  waitForElementToDisplay(
    "#editpane_form",
    function () {
      //itemData inherited from execute script
      // getItemDetails(itemData);
      console.log("detected ebay v1");
      getItemDetails("one");
    },
    100,
    1000000000000
  );

  //ebay listing version 2
  waitForElementToDisplay(
    ".summary__container",
    function () {
      //itemData inherited from execute script
      // getItemDetails(itemData);
      console.log("detected ebay v2");
      getItemDetails("two");
    },
    100,
    1000000000000
  );
}

async function getItemDetails(version) {
  //send message to background script

  //ebay version 1 or 2
  if (version == "one") {
    const properties = await formatItemPropertiesVersionOne();

    const data = {
      copyToMarketplaces: retrievalObject.copyToMarketplaces,
      copyFromMarketplace: retrievalObject.copyFromMarketplace,
      listingURL: retrievalObject.listingURL,
      tab: retrievalObject.tab,
      properties: properties,
    };
    console.log("data from version one, ", data);

    sendMessageToBackground(data);
  } else if (version == "two") {
    const properties = await formatItemPropertiesVersionTwo();

    const data = {
      copyToMarketplaces: retrievalObject.copyToMarketplaces,
      copyFromMarketplace: retrievalObject.copyFromMarketplace,
      listingURL: retrievalObject.listingURL,
      tab: retrievalObject.tab,
      properties: properties,
    };
    console.log("data from version two, ", data);

    sendMessageToBackground(data);
  }
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
    detectEbayListingVersion();
  }
};

//=====================> Ebay Listing Version 1

async function formatItemPropertiesVersionOne() {
  //LATER: some categories have color property(such as handbags), search to see if color exists, if it does, get
  await waitForElementToLoad("#editpane_title");

  return await new Promise(
    (resolve) =>
      setTimeout(() => {
        //NOTE: Alternative method would be to inject script into iframe, get urls, and then send message back here
        //hidden uploader form with input values
        let imageURLS = $("#epsUrls").val().split(";");

        let ebay_title = $("#editpane_title").val();
        let ebay_description = $('iframe[id*="txtEdit_st"]')
          .contents()
          .find("body")[0].innerText;
        let ebay_brand = $("input[fieldname='Brand']").val();
        let ebay_condition = $("select[name='itemCondition']").val();
        let ebay_price = $("#binPrice").val(); //TODO: check ebay to see what would it be for an auction listing
        let ebay_sku = $("#editpane_skuNumber").val();

        console.log(ebay_description);

        let properties = {
          imageUrls: imageURLS,
          title: ebay_title,
          description: ebay_description,
          color: "", //null
          brand: ebay_brand,
          condition: formatConditionVersionOne(ebay_condition),
          price: ebay_price,
          sku: ebay_sku,
          cost: "", //null
        };

        resolve(properties);
      }, 3000) //NOTE: wait 3 seconds to wait for iframe to load
  );
}

function formatConditionVersionOne(condition) {
  //return rs condition value from condition value
  switch (condition) {
    //LATER: some ebay conditions may be different based on category. so reconfigure this later to just pull new if nwt, or default to the second one
    case "1000": //NEW
      return "nwt";

    case "3000": //USED
      return "good";

    default:
      return "";
  }
}

////=====================> Ebay Listing Version 2

async function formatItemPropertiesVersionTwo() {
  //LATER: some categories have color property(such as handbags), search to see if color exists, if it does, get
  await waitForElementToLoad("input[name='title']");

  return await new Promise(
    (resolve) =>
      setTimeout(() => {
        //image is nested inside button as a css background style
        let imagesEl = document.querySelectorAll(
          "button.uploader-thumbnails__image"
        );
        let imageURLs = Array.from(imagesEl).map((image) => {
          let fullURL = $(image).css("background-image"); //this returns url("{image link goes here}")
          let cleanURL = fullURL.substring(
            fullURL.lastIndexOf("http"),
            fullURL.lastIndexOf('")')
          ); //get url between parentheses

          //regex replace thumbnail size of _(random int).JPG, with full image _57
          return cleanURL.replace(/_[\d]+\.JPG/, "_57.JPG");
        });

        let ebay_title = $("input[name='title']").val();

        //LATER: desc only works after iframe has been loaded in, this loads dynamically a little bit after page, so we have to wait for it. using 5 seconds in not the best way, see how you can use a wait for iframe to load function or something.
        let ebay_description = $(".summary__description iframe")
          .contents()
          .find("body")[0].innerText;

        let ebay_brand = $('button[_track*="_Brand."]').text();
        let ebay_condition = $('button[_track*=".condition."]')
          .text()
          .toLowerCase();
        let ebay_price = $("input[name='price']").val(); //TODO: check ebay to see what would it be for an auction listing
        let ebay_sku = $("input[name='customLabel']").val();

        // console.log(ebay_description);

        console.log("ebay condition, ", ebay_condition);
        let properties = {
          imageUrls: imageURLs,
          title: ebay_title,
          description: ebay_description,
          color: "", //null
          brand: ebay_brand,
          condition: formatConditionVersionTwo(ebay_condition),
          price: ebay_price,
          sku: ebay_sku,
          cost: "", //null
        };

        resolve(properties);
      }, 3000) //NOTE: wait 3 seconds to wait for iframe to load
  );
}

function formatConditionVersionTwo(condition) {
  //return rs condition value from condition value
  switch (condition) {
    //LATER: some ebay conditions may be different based on category. so reconfigure this later to just pull new if nwt, or default to the second one

    case "new": //NEW
      return "nwt";

    case "used": //USED
      return "good";

    default:
      return "";
  }
}

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
