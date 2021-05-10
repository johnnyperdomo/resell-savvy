console.log("grailed edit ");

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
        loopSearch();
      }, checkFrequencyInMs);
    }
  })();
}

waitForElementToDisplay(
  "input[name='title']",
  function () {
    //retrievalObject inherited from execute script
    getItemDetails(retrievalObject);
  },
  100,
  100000000000000
);

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

async function formatItemProperties() {
  await waitForElementToLoad("form");
  console.log("called form filler");

  //TODO: maybe check if imge src are loaded first

  const title = "";

  //while loop freezing
  //TODO: instead of making firm 3 seconds, check the interval every 2 seconds
  return await new Promise((resolve) =>
    setTimeout(() => {
      let imagesEl = document.querySelectorAll(".photo img");
      let imageURLs = Array.from(imagesEl).map((image) => {
        return $(image).attr("src");
      });

      let grailed_title = $("input[name='title']").val();
      let grailed_description = $("textarea[name='description']").val();
      let grailed_color = $("input[name='color']").val();
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
        sku: "", //doesn't exist
        cost: "", //doesn't exist
      };

      resolve(properties);
    }, 3000)
  );
}

async function getItemDetails(retrievalObject) {
  //TODO: get item details, convert to rs-savvy-format
  //send message to background script
  const properties = await formatItemProperties();

  const data = {
    copyToMarketplaces: retrievalObject.copyToMarketplaces,
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
