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
  if (document.readyState === "interactive") {
    console.log("page is interactive");
  }

  if (document.readyState === "complete") {
    console.log("page complete");

    //TODO: some inputs only exist on certain categories, before inputing, make sure input exists if available, if so then apply input

    //look for subtitle, which is unique from the bulksell title search bar
    //Ebay listing version 1
    waitForElementToDisplay(
      "#editpane_subtitle",
      function () {
        console.log("detected ebay v1");
        getItemDetails("one");
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
        // getItemDetails(itemData);
        console.log("detected ebay v2");
        getItemDetails("two");

        //remove ebay active tab
      },
      100,
      1000000000000
    );
  }
};

function getItemDetails(version) {
  switch (version) {
    case "one":
      //TODO
      //   fillOutEbayFormOne(
      //     itemData.imageUrls,
      //     itemData.title,
      //     itemData.description,
      //     itemData.brand,
      //     itemData.condition,
      //     itemData.color,
      //     itemData.price,
      //     itemData.sku
      //   );

      fillOutEbayFormOne(
        [],
        "Nike shirt premium bro",
        "this is the best nike shirt i have ever seen in my entire life",
        "Nike",
        "used",
        "Red",
        "97",
        "123edg"
      );

      break;
    case "two":
      fillOutEbayFormTwo(
        [],
        "Nike shirt premium bro",
        "this is the best nike shirt i have ever seen in my entire life",
        "Nike",
        "used",
        "Red",
        "97",
        "123edg"
      );

      break;
    default:
      break;
  }
}

//remove active tab from ebay array in sessions.js that way we don't keep listing for unintended changes to tab
function removeEbayActiveTab() {
  console.log("this is called removed");
  chrome.runtime.sendMessage({
    command: "remove-ebay-active-tab",
    data: itemData,
  });
}

//=====================> Ebay Listing Version 1

async function fillOutEbayFormOne(
  imageUrls,
  title,
  description,
  brand,
  condition,
  color,
  price,
  sku
) {
  //LATER: fill out color

  //LATER: check to see if element is found before buying?

  await waitForElementToLoad("#editpane_title");

  let ebay_title = document.querySelector("input[id='editpane_title']");
  let ebay_sku = document.querySelector("input[id='editpane_skuNumber']");
  let ebay_condition = document.querySelector("select[id='itemCondition']");

  let ebay_brand = document.querySelector(
    "input[id='Listing.Item.ItemSpecific[Brand]']"
  );
  let ebay_color = document.querySelector(
    "input[id='Listing.Item.ItemSpecific[Color]']"
  );

  let ebay_desc_iframe = $('iframe[id*="txtEdit_st"]').contents().find("body");

  let ebay_price = document.querySelector("input[id='binPrice']");

  fillInputValue(ebay_title, title);
  fillInputValue(ebay_sku, sku);
  fillInputValue(ebay_brand, brand);
  fillInputValue(ebay_color, color);
  ebay_desc_iframe.html(description); //in iframe, so inputing the value by html
  fillInputValue(ebay_price, price);

  if (condition) {
    let conditionValue = formatConditionVersionOne(condition);

    $(ebay_condition).val(conditionValue).trigger("change");
  }
}

function formatConditionVersionOne(condition) {
  //return rs condition value from condition value
  switch (condition) {
    //ebay conditions are different based on category, default to nwt if applicable or second value to remove complexity

    //LATER: when setting condition, just choose 1000 as the value, if not 1000, just default to the second nearest selection
    //var values = $.map(options ,function(option) {
    //     return option.value;
    // });

    case "nwt": //NEW
      return "1000";

    default:
      return "3000";
  }
}

////=====================> Ebay Listing Version 2

async function fillOutEbayFormTwo(
  imageUrls,
  title,
  description,
  brand,
  condition,
  color,
  price,
  sku
) {
  //LATER: fill out color based on clothes type if exists
}

function formatConditionVersionTwo(condition) {
  //return rs condition value from condition value
  switch (condition) {
    //ebay conditions are different based on category, default to nwt if applicable or second value to remove complexity
    //LATER: when setting condition, just choose closest to 'new' as the value,(first item with "new" in it) if not, just default to the second nearest selection //scrape all the values of select condition, so new, used, good, etc....filter out nwt, and get the second one

    case "nwt": //NEW
      return "new";

    default:
      return "";
  }
}
