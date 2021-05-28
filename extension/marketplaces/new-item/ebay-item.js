console.log("hi from ebay");
//TODO: just in case, autotimeout "sweet alert crosslisting modal to 30 seconds, if there is an error or something stalls, they can still access the page after 30 seconds"
//TODO: have window flag, but only set value to true once detected
//LATER: await for element should time out to not freeze ui

//TODO: //FIX: inputs not detecting change, not working!!!!!
//TODO: remove new item from manifest.json

async function delay(ms) {
  // return await for better async stack trace support in case of errors.
  return await new Promise((resolve) => setTimeout(resolve, ms));
}

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

function showCrosslistSuccessAlert() {
  Swal.fire({
    icon: "success",
    title: "Almost done!",
    html: `Item successfully crosslisted. Finish adding a few details unique to <b>Ebay</b> to finish your listing.`,
    timer: 7500,
    timerProgressBar: true,
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    footer: "Don't forget to link this listing to your ResellSavvy inventory.",
  });
}

function fillInputValue(input, value) {
  var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  ).set;

  nativeInputValueSetter.call(input, value);

  var inputEvent = new Event("input", { bubbles: true });

  //LATEr: potential code for bug fix
  // const ke = new KeyboardEvent("keydown", {
  //   bubbles: true,
  //   cancelable: true,
  //   keyCode: 13,
  // });
  input.dispatchEvent(inputEvent);
  // input.dispatchEvent(ke);
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
      //waits for iframe to load
      //LATER: just set delay? cleaner?
      setTimeout(() => {
        fillOutEbayFormTwo(
          [],
          "Banana",
          "Adidas is the best brand",
          "Adidas",
          "nwt",
          "Red",
          "132.00",
          "123edg"
        );
      }, 1000);

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
  //LATER: check to see if element is found before buying?

  //TODO: //FIX: inputs not detecting change, not working!!!!!
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

  showCrosslistSuccessAlert();
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
  console.log(title);
  //LATER: fill out color in next update
  let ebay_title = document.querySelector("input[name='title']");
  let ebay_sku = document.querySelector("input[name='customLabel']");
  let ebay_price = document.querySelector("input[name='price']");

  let ebay_desc = document.querySelector("textarea[name='description']");
  let ebay_desc_iframe = $('iframe[id="se-rte-frame__summary"]')[0]
    .contentWindow.document.body;
  let desc_iframe_textArea = $(ebay_desc_iframe).find(
    '[contenteditable="true"]'
  );

  // fillInputValue(ebay_title, title);
  // fillInputValue(ebay_title, title);
  // $(document).ready(function () {
  //   $(ebay_title).change(function () {
  //     console.log("ebay title was changed");
  //   });

  // fillInputValue(ebay_title, "Boy if you dont get");

  fillInputValue(ebay_sku, sku);
  // fillInputValue(ebay_price, "17.00");
  // $(ebay_price).attr("value", "17.00");

  //can be either, sometimes its in iframe or it isn't
  fillTextAreaValue(ebay_desc, description);
  $(desc_iframe_textArea[0]).html(description);
  let keyboard = Keysim.Keyboard.US_ENGLISH;

  console.log(keyboard);
  keyboard.dispatchEventsForInput("hello!", ebay_title);
  // $(ebay_title).trigger("focus");
  //   ebay_desc_iframe.html(description); //in iframe, so inputing the value by html

  //brand
  if (brand) {
    let item_specifics_edit_button = document.querySelector(
      "button[_track*='ATTRIBUTES'].edit-button"
    );

    $(item_specifics_edit_button).trigger("click");

    let sidepane = await waitForElementToLoad(
      "div[_track*='ATTRIBUTES']#dialog-sidepane"
    );

    if (sidepane.length > 0) {
      let brandPanel = $(
        "#dialog-sidepane .se-field-card:has(button[name*='Brand'])"
      );

      //middle page
      if (brandPanel.length > 0) {
        console.log(
          "se field card button",
          $(brandPanel).find("button[name*='Brand']")
        );
        $(brandPanel).find("button[name*='Brand']").trigger("click");
      }

      //input page

      let searchBoxInput = await waitForElementToLoad(
        "#dialog-sidepane .search-box__field input"
      );

      if (searchBoxInput.length > 0) {
        searchBoxInput = searchBoxInput[0];

        // $(searchBoxInput).val(brand);
        fillInputValue(searchBoxInput, brand);

        //wait 1 second for custom value btn to show
        await delay(1000);

        //if button doesn't show up, bcuz it is already same brand, it will just fail to click but continue function
        let addCustomValueButton = $(
          "#dialog-sidepane button.se-filter-list__add-custom-value"
        ).first();

        console.log("custom val", addCustomValueButton);

        $(addCustomValueButton).trigger("click");
      }

      await delay(1000);
      $(sidepane).trigger("click");
    }
  }

  await delay(500);

  //condition
  if (condition) {
    let conditionValue = formatConditionVersionTwo(condition);

    let condition_edit_button = document.querySelector(
      "button[_track*='CONDITION'].edit-button"
    );

    $(condition_edit_button).trigger("click");

    //LATER: in the wait for element function, we are going to wait for sidepane for 5 seconds, if not found, we are going to exit out of function, return the await, and just continue on with our code
    let sidepane = await waitForElementToLoad(
      "div[_track*='CONDITION']#dialog-sidepane"
    );

    if (sidepane.length > 0) {
      sidepane = sidepane[0];
      console.log("sidepane is", sidepane);

      let conditionPanel = $(
        "#dialog-sidepane .se-panel-container__body .se-panel-section:Contains('Condition'):first"
      );

      console.log("condition panel, ", conditionPanel);

      //middle page
      if (conditionPanel.length > 0) {
        console.log(
          "se field card button",
          $(conditionPanel).find(".se-field-card button")
        );
        $(conditionPanel).find(".se-field-card button").trigger("click");
      }

      let radio = await waitForElementToLoad(
        `#dialog-sidepane input[type='radio'][value='${conditionValue}']`
      );

      //input page
      //find radio by value
      if (radio.length > 0) {
        radio = radio[0];
        console.log(radio);

        //click condition value
        $(radio).trigger("click");
      }

      //click outside sidepane modal to close; wait a second for radio button to process
      await delay(1000);
      $(sidepane).trigger("click");
    }
  }

  //price
  //TODO: //FIX: work on price, not simulating input change
  if (price) {
    let price_edit_button = document.querySelector(
      "button[_track*='PRICE'].edit-button"
    );

    $(price_edit_button).trigger("click");

    //LATER: in the wait for element function, we are going to wait for sidepane for 5 seconds, if not found, we are going to exit out of function, return the await, and just continue on with our code
    let sidepane = await waitForElementToLoad(
      "div[_track*='PRICE']#dialog-sidepane"
    );

    if (sidepane.length > 0) {
      sidepane = sidepane[0];
      console.log("sidepane is", sidepane);

      let pricePanel = $(
        "#dialog-sidepane .se-panel-container__body .se-panel-section:has(button[name='price'])"
      );

      console.log("condition panel, ", pricePanel);

      //middle page
      if (pricePanel.length > 0) {
        console.log(
          "se field card button",
          $(pricePanel).find("button[name='price']")
        );
        $(pricePanel).find("button[name='price']").trigger("click");
      }

      //input page
      //find textBox input
      let textBoxInput = await waitForElementToLoad(
        "#dialog-sidepane .se-textbox--input input[name='price']"
      );

      if (textBoxInput.length > 0) {
        textBoxInput = textBoxInput[0];

        //TODO: //FIX not simulating user typing, use plugin for jquery simulate

        // $(textBoxInput).trigger("focus");
        // // fillInputValue(textBoxInput, price);
        // $(textBoxInput).val("157.00").trigger("change");
        // $(textBoxInput).attr("value", "157.00");

        // $(textBoxInput).prop("value", "157.00");
        // $(textBoxInput).trigger({
        //   type: "keypress",
        //   which: a.charCodeAt(0),
        // });
        // setTimeout(() => {
        //   $(textBoxInput).trigger("change");
        //   $(textBoxInput).trigger("blur");
        // }, 2000);
        // $(textBoxInput).val(price);
        // $(textBoxInput).trigger("focus").trigger("blur");
      }

      //click outside sidepane modal to close; wait a second for radio button to process
      await delay(1000);
      $(sidepane).trigger("click");
    }
  }
}

function formatConditionVersionTwo(condition) {
  //return rs condition value from condition value
  switch (condition) {
    //ebay conditions are different based on category, default to nwt if applicable or second value to remove complexity
    //LATER: when setting condition, just choose closest to 'new' as the value,(first item with "new" in it) if not, just default to the second nearest selection //scrape all the values of select condition, so new, used, good, etc....filter out nwt, and get the second one

    case "nwt": //NEW
      return "1000";

    default:
      return "3000";
  }
}
