if (!window.RS_EBAY_SCRIPT_ALREADY_INJECTED_FLAG) {
  window.RS_EBAY_SCRIPT_ALREADY_INJECTED_FLAG = true;

  var domEvent = new DomEvent();
  var swalAlert = new SwalAlert();
  var helpers = new Helpers();
  var imageRenderer = new ImageRenderer();

  //LATER: some inputs only exist on certain categories, before inputing, make sure input exists if available, if so then apply input

  document.onreadystatechange = function () {
    if (document.readyState === "interactive") {
      swalAlert.showPageLoadingAlert(); //swal alert ui waiting;
    }

    if (document.readyState === "complete") {
      swalAlert.closeSwal(); //close modal: //NOTE: processing alert stops ebay from uploading images for some reason, so don't show processing swal. maybe later try to fix this: //LATER

      //Ebay listing version 1; look for subtitle, which is unique from the bulksell title search bar
      domEvent.waitForElementToDisplay(
        "#editpane_subtitle",
        function () {
          console.log("detected ebay v1");
          getItemDetails("one");
          removeEbayActiveTab(); //to stop watching this tab
        },
        100,
        1000000000000
      );

      //ebay listing version 2
      domEvent.waitForElementToDisplay(
        ".summary__container",
        function () {
          console.log("detected ebay v2");
          getItemDetails("two");
          removeEbayActiveTab(); //to stop watching this tab
        },
        100,
        1000000000000
      );
    }
  };

  async function getItemDetails(version) {
    switch (version) {
      case "one":
        fillOutEbayFormOne(
          itemData.properties.imageUrls,
          itemData.properties.title,
          itemData.properties.description,
          itemData.properties.brand,
          itemData.properties.condition,
          itemData.properties.color,
          itemData.properties.price,
          itemData.properties.sku
        );

        break;
      case "two":
        //wait for iframe to load

        fillOutEbayFormTwo(
          itemData.properties.imageUrls,
          itemData.properties.title,
          itemData.properties.description,
          itemData.properties.brand,
          itemData.properties.condition,
          itemData.properties.color,
          itemData.properties.price,
          itemData.properties.sku
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
    await domEvent.waitForElementToLoad("#editpane_title");

    //wait for page to render
    //wait for iframe to load
    await helpers.delay(3000);

    let ebay_title = document.querySelector("input[id='editpane_title']");
    let ebay_sku = document.querySelector("input[id='editpane_skuNumber']");
    let ebay_condition = document.querySelector("select[id='itemCondition']");

    let ebay_brand = document.querySelector(
      "input[id='Listing.Item.ItemSpecific[Brand]']"
    );
    let ebay_color = document.querySelector(
      "input[id='Listing.Item.ItemSpecific[Color]']"
    );
    let ebay_price = document.querySelector("input[id='binPrice']");

    let ebayUploaderIframe = document.querySelector(
      'iframe[id="uploader_iframe"]'
    );

    //images; inject data into iframe to upload images
    uploadEbayImagesFromIframe(ebayUploaderIframe);

    //title
    $(ebay_title).trigger("focus");
    userSimulateType(title, ebay_title);
    $(ebay_title).trigger("blur");

    //sku
    $(ebay_sku).trigger("focus");
    userSimulateType(sku, ebay_sku);
    $(ebay_sku).trigger("blur");

    //brand
    $(ebay_brand).trigger("focus");
    userSimulateType(brand, ebay_brand);
    $(ebay_brand).trigger("blur");

    //color

    if (ebay_color) {
      //check if element exists
      $(ebay_color).trigger("focus");
      userSimulateType(color, ebay_color);
      $(ebay_color).trigger("blur");
    }

    //edit description
    editDescriptionV1(description);

    //price
    $(ebay_price).trigger("focus");
    userSimulateType(price, ebay_price);
    $(ebay_price).trigger("blur");

    if (condition) {
      let conditionValue = formatConditionVersionOne(condition);

      //LATER: //FIX: I don't think the condition is being passed into preview(not being detected?), maybe we should press it later on.
      $(ebay_condition).trigger("focus");
      $(ebay_condition).val(conditionValue).trigger("change");
      $(ebay_condition).trigger("blur");
    }

    swalAlert.closeSwal(); //close modal
    swalAlert.showCrosslistSuccessAlert(); //show success alert
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
    await domEvent.waitForElementToLoad("input[name='title']"); //timeout after 10 seconds if undetected

    //wait for page to render
    //wait for iframe to load
    await helpers.delay(3000);

    //LATER: fill out color in next update

    let ebay_image_input = document.querySelector("input[type='file']");
    let ebay_title = document.querySelector("input[name='title']");
    let ebay_sku = document.querySelector("input[name='customLabel']");
    let ebay_price = document.querySelector("input[name='price']");
    let ebay_desc = document.querySelector("textarea[name='description']"); //normal textarea;
    let ebay_desc_iframe = document.querySelector(
      'iframe[id="se-rte-frame__summary"]'
    ).contentWindow.document.body; //description iframe-textarea
    let ebay_desc_iframe_textarea = ebay_desc_iframe.querySelector(
      '[contenteditable="true"]'
    );

    //images
    console.log("ebay images: ", imageUrls);
    await uploadImages(imageUrls, ebay_image_input);

    //title
    $(ebay_title).trigger("focus");
    userSimulateType(title, ebay_title);
    $(ebay_title).trigger("blur");

    //sku
    $(ebay_sku).trigger("focus");
    userSimulateType(sku, ebay_sku);
    $(ebay_sku).trigger("blur");

    //description //can either be a textarea or an iframe, depending on which one ebay renders
    //desc-textarea
    $(ebay_desc).trigger("focus");
    userSimulateType(description, ebay_desc);
    $(ebay_desc).trigger("blur");

    //desc-iframe
    ebay_desc_iframe_textarea.innerHTML = description;
    $(ebay_desc_iframe_textarea).trigger("focus").trigger("blur");
    $(ebay_desc_iframe).trigger("focus").trigger("blur");

    //price
    $(ebay_price).trigger("focus");
    userSimulateType(price, ebay_price);
    $(ebay_price).trigger("blur");

    //brand
    if (brand) {
      let item_specifics_edit_button = document.querySelector(
        "button[_track*='ATTRIBUTES'].edit-button"
      );

      $(item_specifics_edit_button).trigger("click");

      let sidepane = await domEvent.waitForElementToLoad(
        "div[_track*='ATTRIBUTES']#dialog-sidepane",
        5000
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
        let searchBoxInput = await domEvent.waitForElementToLoad(
          "#dialog-sidepane .search-box__field input",
          5000
        );

        if (searchBoxInput.length > 0) {
          searchBoxInput = searchBoxInput[0];

          domEvent.fillInputValue(searchBoxInput, brand);

          //wait 1 second for custom value btn to show
          await helpers.delay(1000);

          //if button doesn't show up, bcuz it is already same brand, it will just fail to click but continue function
          let addCustomValueButton = $(
            "#dialog-sidepane button.se-filter-list__add-custom-value"
          ).first();

          console.log("custom val", addCustomValueButton);

          $(addCustomValueButton).trigger("click");
        }

        await helpers.delay(1000);
        $(sidepane).trigger("click");
      }
    }

    await helpers.delay(500);

    //condition
    if (condition) {
      let conditionValue = formatConditionVersionTwo(condition);

      let condition_edit_button = document.querySelector(
        "button[_track*='CONDITION'].edit-button"
      );

      $(condition_edit_button).trigger("click");

      let sidepane = await domEvent.waitForElementToLoad(
        "div[_track*='CONDITION']#dialog-sidepane",
        5000
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

        let radio = await domEvent.waitForElementToLoad(
          `#dialog-sidepane input[type='radio'][value='${conditionValue}']`,
          5000
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
        await helpers.delay(1000);
        $(sidepane).trigger("click");
      }
    }

    swalAlert.closeSwal(); //close modal
    swalAlert.showCrosslistSuccessAlert(); //show success alert
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

  //input changes on ebay text fields only //LATER: see if this works with 'fillinput' method, so we can only have one source of truth
  function event_dispatcher(t) {
    var e = new Event("change", {
      bubbles: !0,
    });
    t.dispatchEvent(e);
  }

  function userSimulateType(text, element) {
    element.value = text;
    event_dispatcher(element);
  }

  //special iframe for description in v1 form, this is the steps we have to take to trigger input change
  function editDescriptionV1(text) {
    //LATER: //NOTE: this code was outsourced; later on, re-analyze and make sure it works correctly and its the most efficient

    try {
      document.querySelector("a[id*='_advLnk']").click(); //click on advanced editing button
    } catch (e) {}

    document.querySelector("span[id*='_switchLnk']").children[1].click(); //click 'item description; 'standard/html' tab option'

    document.querySelector(
      "iframe[id*='txtEdit_ht']"
    ).contentWindow.document.body.innerText = text; //set text, on html tab version
    //document.querySelector("iframe[id*='txtEdit_st']").contentWindow.document.body.innerHTML = text;

    document.querySelector("span[id*='_switchLnk']").children[0].click(); //click 'item description; 'standard/html' tab option'
    document.querySelector("a[id*='_ind']").click(); //click 'decrease indent, option in html editing; to trigger action'
  }

  async function uploadEbayImagesFromIframe(iframe) {
    //wait half a second for dom to render
    await helpers.delay(500);

    //can't manipulate dom from iframe - inject a seperate script from manifest.json, and then send a message to iframe with data
    iframe.contentWindow.postMessage(
      {
        data: itemData.properties,
        command: "upload-ebay-images",
      },
      "*"
    );
  }

  async function uploadImages(images, targetElement) {
    console.log("upload images: ", images);

    //wait 100ms for inputs to render
    await helpers.delay(100);

    //truncate image array;
    let sliced = images.slice(0, 16); //ebay only allows 16< image uploads, but we will only work with 16.

    //upload array of images simultaneously
    await imageRenderer.uploadImages(sliced, targetElement);

    return new Promise((resolve, reject) => {
      resolve();
    });
  }
}
