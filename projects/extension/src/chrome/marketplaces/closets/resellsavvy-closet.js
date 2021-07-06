//crosslist modal is here

var swalAlert = new SwalAlert();
var domEvent = new DomEvent();
var helpers = new Helpers();
var imageRenderer = new ImageRenderer();

var crosslistButton = document.getElementById("rs-crosslist-button");

//if button exists/is detected
if (crosslistButton) {
  //enable crosslist button, by removing disabled attribute
  crosslistButton.removeAttribute("disabled");

  //add event listener to listen to click
  crosslistButton.addEventListener("click", onCrosslistBtnPressed);
}

async function onCrosslistBtnPressed() {
  console.log("crosslist button pressed");

  try {
    //show processing alert; swal
    swalAlert.showSimpleProcessingAlert();

    //get item details
    let itemDetails = await getItemDetails();
    console.log(itemDetails);

    //let user select marketplaces to crosslist to; swal
    let crosslistTo = await selectMarketplaces();

    if (!crosslistTo || !itemDetails) {
      throw Error(
        "There was a problem while processing this listing, please refresh the page and try again."
      );
    }

    //crosslist item; swal dismissed
    crosslistItem(crosslistTo, itemDetails);
  } catch (error) {
    //LATER: handle errors
    console.error(error);
    swalAlert.closeSwal();
  }
}

async function getItemDetails() {
  await domEvent.waitForElementToLoad("#title");

  let imagesEl = document.querySelectorAll('img[id="image"]');
  let imageURLs = Array.from(imagesEl).map((image) => {
    return $(image).attr("src");
  });

  let convertedImages = await imageRenderer.convertImages(imageURLs, "url"); //convert type: url => base64

  let rs_title = $("#title").val();
  let rs_description = $("#description").val();
  let rs_color = $("#color").val(); //dropdown

  let rs_brand = $("#brand").val();
  let rs_condition = $("#condition").val(); //dropdown
  let rs_price = $("#price").val();
  let rs_sku = $("#sku").val();

  let properties = {
    imageUrls: convertedImages,
    title: rs_title,
    description: rs_description,
    color: rs_color,
    brand: rs_brand,
    condition: rs_condition, //orginal -> no formatting required
    price: rs_price,
    sku: rs_sku,
  };

  return new Promise((resolve, reject) => {
    resolve(properties);
  });
}

async function selectMarketplaces() {
  //LATER: maybe make the modal look nicer ui
  //LATER: option to select all
  try {
    //wait for user response
    let crosslistTo = await swalAlert.showCrosslistModal();

    console.log("results of marketplaces: ", crosslistTo);

    return new Promise((resolve, reject) => {
      resolve(crosslistTo);
    });
  } catch (error) {
    console.log("err", error);
    //LATER: handle errors gracefully
    return;
  }
}

function crosslistItem(crosslistTo, properties) {
  console.log("crosslist init");
  chrome.runtime.sendMessage({
    command: "crosslist-item",
    data: { copyToMarketplaces: crosslistTo, properties: properties },
  });
}
