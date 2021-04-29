console.log("hi from grailed");

//LATER: create files by pages to make code cleaner

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
  "input[name='title']",
  function () {
    readyToInsertFields();
  },
  100,
  100000000000000
);

async function fillOutGrailedForm(
  imageUrls,
  title,
  description,
  color,
  condition,
  brand,
  price
) {
  console.log("waiting on form filler");

  await waitForElementToLoad("form");
  console.log("called form filler");

  const inputFiles = $('input[type="file"]');

  console.log("input files, ", inputFiles);

  let grailed_title = document.querySelector("input[name='title']");
  let grailed_description = document.querySelector(
    "textarea[name='description']"
  );
  let grailed_color = document.querySelector("input[name='color']");
  let grailed_brand = document.querySelector("#designer-autocomplete"); //designer
  let grailed_condition = document.querySelector("select[name='condition']");
  let grailed_price = document.querySelector("input[name='price']");

  fillInputValue(grailed_title, title);

  if (brand != "") {
    fillInputValue(grailed_brand, brand);

    const brandList = await waitForElementToLoad("ul.autocomplete > li");

    if (brandList.length) {
      //LATER: this is not clicking
      brandList.eq(0).trigger("click");
    }
  }

  if (color != "") {
    color = capitalize(color);
    fillInputValue(grailed_color, color);
  }

  //   const dataTransfer = new DataTransfer();
  //   dataTransfer.items.add(new File(["hello world"], "This_Works.txt"));

  //   console.log("data transfer, " + dataTransfer);

  grailed_condition.selecl;
  $(grailed_condition).trigger("click");
  if (condition != "") {
    //TODO: this is not selecting value
    console.log($(grailed_condition).val());
    console.log("condition");
    $(grailed_condition).val("is_used");
    $(grailed_condition).trigger("change");
    // $('select[name="condition"] option[value="is_used"]').attr(
    // //   "selected",
    // //   "selected"
    // // );
    console.log($(grailed_condition).val());
  }

  fillTextAreaValue(grailed_description, description);

  //LATER: currency/price validation
  fillInputValue(grailed_price, price);
}

const capitalize = (s) => {
  if (typeof s !== "string") return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
};

function matchCondition(condition) {
  //return grailed condition value from our condition value
  switch (condition) {
    case ("nwt", "nwot"):
      return "is_new";

    case "good":
      return "is_gently_used";

    case "preowned":
      return "is_used";

    case "poor":
      return "is_worn";

    default:
      return "";
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
  console.log("yeahhhhhh title found");
  fillOutGrailedForm(
    [],
    "Nike Premium Shirt",
    "Nike shirt has only been used once but it is really good condition you cannot go wrong with this.",
    "blue",
    "nwt",
    "Nike",
    54.28
  );
}
