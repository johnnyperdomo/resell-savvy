//you have to select category first before having access to the other drop downs. Just default to 'kids clothing'

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

// //TODO: call code from postMessage request
// waitForElementToDisplay(
//   "#item_title",
//   function () {
//     //itemData inherited from execute script
//     getItemDetails(itemData);
//   },
//   100,
//   100000000000000
// );

async function fillOutKidizenForm(
  imageUrls,
  title,
  description,
  condition,
  brand,
  price
) {
  console.log("waiting on form filler");

  await waitForElementToLoad("form");
  console.log("called form filler");

  let kidizen_title = document.querySelector("#item_title");
  let kidizen_description = document.querySelector("#item_description");
  let kidizen_price = document.querySelector("#item_list_price");

  fillInputValue(kidizen_title, title);
  fillTextAreaValue(kidizen_description, description);

  //set default category item
  $("span:contains('Category')")
    .closest(".DropdownTrigger--required")
    .trigger("click");
  const kidDropDownItem = await waitForElementToLoad(
    "div:contains('Kid Clothing')"
  );
  kidDropDownItem.trigger("click");

  if (brand != "") {
    const brandEl = $("span:contains('Brand')").closest(
      ".DropdownTrigger--required"
    );

    brandEl.trigger("click");

    console.log(brandEl.parent().parent().find("div"));

    const dropDown = await waitForElementToLoad(
      ".Dropdown",
      100000000,
      brandEl.parent().parent()
    );

    const searchBarInput = dropDown.find('input[placeholder="Search"]');
    fillInputValue(searchBarInput[0], brand);

    //wait half a second for dom to rerender
    setTimeout(() => {
      const brandList = dropDown.find(" .Dropdown-item");

      if (brandList.length) {
        brandList.eq(0).trigger("click");
      }
    }, 500);
  }

  if (condition != "") {
    const conditionVal = matchCondition(condition);

    $("span:contains('Condition')")
      .closest(".DropdownTrigger--required")
      .trigger("click");
    const conditionDropDownItem = await waitForElementToLoad(
      `div:contains('${conditionVal}')`
    );
    conditionDropDownItem.trigger("click");
  }

  //LATER: currency/price validation
  fillInputValue(kidizen_price, price);

  showCrosslistSuccessAlert();
}

function showCrosslistSuccessAlert() {
  Swal.fire({
    icon: "success",
    title: "Almost done!",
    html: `Item successfully crosslisted. Finish adding a few details unique to <b>Kidizen</b> to finish your listing.`,
    timer: 7500,
    timerProgressBar: true,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    footer: "Don't forget to link this listing to your ResellSavvy inventory.",
  });
}

function matchCondition(condition) {
  //return kidizen condition value from our condition value
  switch (condition) {
    case "nwt":
      return "New with tag";

    case "nwot":
      return "New without tag";

    case "good":
      return "Very good used condition";

    case "preowned":
      return "Good used condition";

    case "poor":
      return "Play condition";

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
function getItemDetails() {
  fillOutKidizenForm(
    itemData.imageUrls,
    itemData.title,
    itemData.description,
    itemData.condition,
    itemData.brand,
    itemData.price
  );
}

//detect if document is ready
document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    getItemDetails();
    console.log("page complete");
  }
};
