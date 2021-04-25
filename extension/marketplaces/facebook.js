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
  "label[aria-label='Title']",
  function () {
    readyToInsertFields();
  },
  100,
  100000000000000
);

async function fillOutFacebookForm(
  imageUrls,
  title,
  price,
  description,
  condition
) {
  console.log("waiting on form filler");

  await waitForElementToLoad("form");
  console.log("called form filler");
  let facebook_title = document.querySelector(
    "label[aria-label='Title'] input"
  );
  let facebook_price = document.querySelector(
    "label[aria-label='Price'] input"
  );
  let facebook_description = document.querySelector(
    "label[aria-label='Description'] textarea"
  );

  fillInputValue(facebook_title, "nike xl premium");
  fillInputValue(facebook_price, 39);

  fillTextAreaValue(
    facebook_description,
    "only the best quality leather dont disrespect"
  );

  //   if (condition != "") {
  //     //LATER: condition needs to click value
  //     $(`label[aria-label="Condition"]`).trigger("click");
  //   }
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

  fillOutFacebookForm(
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
