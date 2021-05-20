//check if the content script already exists, if it does, then don't proceed with the function
if (window.RS_EBAY_ALREADY_INJECTED_FLAG) {
  console.log("this script was already injected");
} else {
  window.RS_EBAY_ALREADY_INJECTED_FLAG = true;
  console.log("v2 is here and it's being callleededejdnsefnsfiunsd");

  showPageLoadingAlert();

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

  function formatCondition(condition) {
    //return rs condition value from condition value
    switch (condition) {
      case "new": //NEW
        return "nwt";

      case "used": //USED
        return "good";

      default:
        return "";
    }
  }

  async function formatItemProperties() {
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
            condition: formatCondition(ebay_condition),
            price: ebay_price,
            sku: ebay_sku,
            cost: "", //null
          };

          resolve(properties);
        }, 3000) //NOTE: wait 3 seconds to wait for iframe to load
    );
  }

  async function getItemDetails() {
    //TODO: get item details, convert to rs-savvy-format
    //send message to background script
    const properties = await formatItemProperties();

    const data = {
      copyToMarketplaces: retrievalObject.copyToMarketplaces,
      copyFromMarketplace: retrievalObject.copyFromMarketplace,
      listingURL: retrievalObject.listingURL,
      tab: retrievalObject.tab,
      properties: properties,
    };
    console.log(data);

    sendMessageToBackground(data);
  }

  function sendMessageToBackground(data) {
    chrome.runtime.sendMessage({
      command: "start-crosslist-session",
      data: data,
    });
  }

  //detect if document is ready
  document.onreadystatechange = function () {
    if (document.readyState === "complete") {
      showProcessingAlert();
      getItemDetails();
    }
  };

  function showPageLoadingAlert() {
    //LATER: change background color to make it more presentable, maybe a opaque white?
    //LATER: show gif, or lottie image instead of just a simple loading spinner?
    Swal.fire({
      title: "Waiting on page to load...",
      html: "Please wait a few seconds while we start processing your listing soon. <b>Closing this tab will stop your item from being crosslisted</b>.",
      footer: "Page loading time is affected by your internet speed.",
      allowOutsideClick: false,
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
      showConfirmButton: false,
      willOpen: () => {
        Swal.showLoading();
      },
    });
  }
}
