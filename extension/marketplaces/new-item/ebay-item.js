console.log("hi from ebay");
//TODO: have window flag, but only set value to true once detected

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

//TODO: make this element ready to display a
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
  if (document.readyState === "complete") {
    console.log("page complete");

    //TODO: some inputs only exist on certain categories, before inputing, make sure input exists if available, if so then apply input

    //look for subtitle, which is unique from the bulksell title search bar
    //Ebay listing version 1
    waitForElementToDisplay(
      "#editpane_subtitle",
      function () {
        // getItemDetails(itemData);
        console.log("detected ebay v1");
        //TODO:
        //   removeEbayActiveTab();
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
        //   getItemDetails("two");
      },
      100,
      1000000000000
    );
  }
};

//remove active tab from ebay array in sessions.js that way we don't keep listing for unintended changes to tab
function removeEbayActiveTab() {
  console.log("this is called removed");
  chrome.runtime.sendMessage({
    command: "remove-ebay-active-tab",
    data: itemData,
  });
}

//=====================> Ebay Listing Version 1

async function fillOutEbayFormOne() {
  //   await waitForElementToLoad("#editpane_title");
  //   return await new Promise(
  //     (resolve) =>
  //       setTimeout(() => {
  //         //NOTE: Alternative method would be to inject script into iframe, get urls, and then send message back here
  //         //hidden uploader form with input values
  //         let imageURLS = $("#epsUrls").val().split(";");
  //         let ebay_title = $("#editpane_title").val();
  //         let ebay_description = $('iframe[id*="txtEdit_st"]')
  //           .contents()
  //           .find("body")[0].innerText;
  //         let ebay_brand = $("input[fieldname='Brand']").val();
  //         let ebay_condition = $("select[name='itemCondition']").val();
  //         let ebay_price = $("#binPrice").val(); //TODO: check ebay to see what would it be for an auction listing
  //         let ebay_sku = $("#editpane_skuNumber").val();
  //         console.log(ebay_description);
  //         let properties = {
  //           imageUrls: imageURLS,
  //           title: ebay_title,
  //           description: ebay_description,
  //           color: "", //null
  //           brand: ebay_brand,
  //           condition: formatConditionVersionOne(ebay_condition),
  //           price: ebay_price,
  //           sku: ebay_sku,
  //           cost: "", //null
  //         };
  //         resolve(properties);
  //       }, 3000) //NOTE: wait 3 seconds to wait for iframe to load
  //   );
}

function formatConditionVersionOne(condition) {
  //return rs condition value from condition value
  switch (condition) {
    //ebay conditions are different based on category, default to nwt if applicable or second value to remove complexity

    //TODO: when setting condition, just choose 1000 as the value, if not 1000, just default to the second nearest selection

    case "nwt": //NEW
      return "1000";

    default:
      return "";
  }
}

////=====================> Ebay Listing Version 2

async function fillOutEbayFormTwo() {
  //   await waitForElementToLoad("input[name='title']");
  //   return await new Promise(
  //     (resolve) =>
  //       setTimeout(() => {
  //         //image is nested inside button as a css background style
  //         let imagesEl = document.querySelectorAll(
  //           "button.uploader-thumbnails__image"
  //         );
  //         let imageURLs = Array.from(imagesEl).map((image) => {
  //           let fullURL = $(image).css("background-image"); //this returns url("{image link goes here}")
  //           let cleanURL = fullURL.substring(
  //             fullURL.lastIndexOf("http"),
  //             fullURL.lastIndexOf('")')
  //           ); //get url between parentheses
  //           //regex replace thumbnail size of _(random int).JPG, with full image _57
  //           return cleanURL.replace(/_[\d]+\.JPG/, "_57.JPG");
  //         });
  //         let ebay_title = $("input[name='title']").val();
  //         //LATER: desc only works after iframe has been loaded in, this loads dynamically a little bit after page, so we have to wait for it. using 5 seconds in not the best way, see how you can use a wait for iframe to load function or something.
  //         let ebay_description = $(".summary__description iframe")
  //           .contents()
  //           .find("body")[0].innerText;
  //         let ebay_brand = $('button[_track*="_Brand."]').text();
  //         let ebay_condition = $('button[_track*=".condition."]')
  //           .text()
  //           .toLowerCase();
  //         let ebay_price = $("input[name='price']").val(); //TODO: check ebay to see what would it be for an auction listing
  //         let ebay_sku = $("input[name='customLabel']").val();
  //         // console.log(ebay_description);
  //         console.log("ebay condition, ", ebay_condition);
  //         let properties = {
  //           imageUrls: imageURLs,
  //           title: ebay_title,
  //           description: ebay_description,
  //           color: "", //null
  //           brand: ebay_brand,
  //           condition: formatConditionVersionTwo(ebay_condition),
  //           price: ebay_price,
  //           sku: ebay_sku,
  //           cost: "", //null
  //         };
  //         resolve(properties);
  //       }, 3000) //NOTE: wait 3 seconds to wait for iframe to load
  //   );
}

function formatConditionVersionTwo(condition) {
  //return rs condition value from condition value
  switch (condition) {
    //ebay conditions are different based on category, default to nwt if applicable or second value to remove complexity
    //TODO: when setting condition, just choose closest to 'new' as the value,(first item with "new" in it) if not, just default to the second nearest selection

    case "nwt": //NEW
      return "new";

    default:
      return "";
  }
}
