console.log("hi from poshmark");

//LATER: create files by pages to make code cleaner
//LATER: make elements fail safely if not found, just skip instead of failing the entire function

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

//TODO: call code from postMessage request
waitForElementToDisplay(
  "input[data-vv-name='title']",
  function () {
    readyToInsertFields();
  },
  100,
  100000000000000
);

async function fillOutPoshmarkForm(
  imageUrls,
  title,
  description,
  tags,
  brand,
  condition,
  color,
  listPrice,
  costPrice,
  sku
) {
  console.log("waiting on form filler");

  await waitForElementToLoad("form");
  console.log("called form filler");
  let poshmark_title = document.querySelector('input[data-vv-name="title"]');
  let poshmark_description = document.querySelector(
    'textarea[data-vv-name="description"]'
  );
  let poshmark_brand = document.querySelector(
    'div[data-et-name="listingEditorBrandSection"] input'
  );
  let poshmark_listingPrice = document.querySelector(
    'input[data-vv-name="listingPrice"]'
  );
  let poshmark_sku = document.querySelector('input[data-vv-name="sku"]');
  let poshmark_costPrice = document.querySelector(
    'input[data-vv-name="costPriceAmount"]'
  );

  let poshmark_tag_input = document.querySelector(
    'input[data-vv-name="style-tag-input"]'
  );

  fillInputValue(poshmark_title, title);
  fillTextAreaValue(poshmark_description, description);

  fillInputValue(poshmark_brand, brand);

  //TODO: round up, posh dont accept decimals
  fillInputValue(poshmark_listingPrice, listPrice);
  fillInputValue(poshmark_sku, sku);
  fillInputValue(poshmark_costPrice, costPrice);

  if (tags) {
    //TODO: you need to press enter after this, but for some reason, placing a comma also seems to work
    //https://www.geeksforgeeks.org/trigger-a-keypress-keydown-keyup-event-in-js-jquery/ TODO: this might work
    //TODO: sometimes this throws errors
    //   let tagsArray = tags.split(",");
    //   waitForElementToLoad(poshmark_tag_input);
    //   fillInputValue(poshmark_tag_input, "cool, dad, bro");
    //   //tag 1
    //   if (tagsArray[0]) {
    //     console.log("tag array 1 exists, " + tagsArray[0]);
    //     fillInputValue(poshmark_tag1, tagsArray[0]);
    //   }
    //   //tag 2
    //   if (tagsArray[1]) {
    //     console.log("tag array 2 exists, " + tagsArray[1]);
    //     fillInputValue(poshmark_tag2, tagsArray[1]);
    //   }
    //   //tag 3
    //   if (tagsArray[2]) {
    //     console.log("tag array 3 exists, " + tagsArray[2]);
    //     fillInputValue(poshmark_tag3, tagsArray[2]);
    //   }
  }

  //LATER: size if available, but this won't always be available right away.

  if (condition != "") {
    let conditionValue = matchCondition(condition);

    $(`button[data-et-name="${conditionValue}"]`).trigger("click");
  }

  if (color != "") {
    //TODO: color opening but 'a' link not pressing
    //TODO: click color
    //TODO: match color
    $(`div[data-et-name="color"]`).trigger("click");

    // $('a:contains("This One")')
    //   .filter(function (index) {
    //     return $(this).text() === "This One";
    //   })
    //   .trigger("click");

    // console.log($(`a:contains("Red")`).parent());
  }
}

function matchCondition(condition) {
  //return poshmark condition value from our condition value
  switch (condition) {
    case "nwt":
      return "nwt_yes";

    default:
      return "nwt_no";
  }
}

//only this function works to change text
function fillInputValue(input, value) {
  var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  ).set;

  nativeInputValueSetter.call(input, value);

  var inputEvent = new Event("input", { bubbles: true });
  input.dispatchEvent(inputEvent);
}

function fillTextAreaValue(textArea, value) {
  var nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLTextAreaElement.prototype,
    "value"
  ).set;

  nativeTextAreaValueSetter.call(textArea, value);

  var textAreaEvent = new Event("input", { bubbles: true });
  textArea.dispatchEvent(textAreaEvent);
}

//LATER: do more error checking for fields, example like price/currency validation
function readyToInsertFields() {
  console.log("ready to insert fields is called from poshmark");

  fillOutPoshmarkForm(
    [],
    "Nike xl premium shirt",
    "This is a good nike shirt made from the nike store lit!!!1",
    "abc, ide, fed",
    "Adidas",
    "poor",
    "Blue",
    6,
    19,
    "001Jke"
  );
}
