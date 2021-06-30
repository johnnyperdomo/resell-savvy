//LATER: make elements fail safely if not found, just skip instead of failing the entire function, check to see if element exists, simulate if element not found, send error using sentry for each element, this should work for any element we are looking for, whether in the closets, get item, or set item data. (el -> title not found in poshmark closet, )...blah blah blah... full details, also version of chrome extension, the browser, every little thing they can give details on. don't collect all errors on page, bcuz some of the code is from the platform. Maybe we can automate some of this with puppeteer too & visualping. add errors from waiting on element to load as well, if it times out cuz it couldn't find it

// places we need to track bcuz were manipulating code
// 1. get item listing - edit functionality (edit listing url)
// 2. paste item listing - create item funcitonality (new listing url)
// 3. listing url - the simple url listing
// 4. closet -

var domEvent = new DomEvent();
var swalAlert = new SwalAlert();
var helpers = new Helpers();
var imageRenderer = new ImageRenderer();

async function fillOutPoshmarkForm(
  imageUrls,
  title,
  description,
  brand,
  condition,
  color,
  listPrice,
  sku
) {
  await domEvent.waitForElementToLoad("input[data-vv-name='title']");

  //wait for page to render
  await helpers.delay(100);

  let poshmark_image_input = document.querySelector("input[type='file']");
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

  //images
  await uploadImages(imageUrls, poshmark_image_input);

  //title
  $(poshmark_title).trigger("focus");
  domEvent.fillInputValue(poshmark_title, title);
  $(poshmark_title).trigger("blur");

  //desc
  $(poshmark_description).trigger("focus");
  domEvent.fillTextAreaValue(poshmark_description, description);
  $(poshmark_description).trigger("blur");

  //brand
  $(poshmark_brand).trigger("focus");
  domEvent.fillInputValue(poshmark_brand, brand);
  $(poshmark_brand).trigger("blur");

  //LATER: maybe add msrp input,

  //listPrice
  //TODO: round up, posh dont accept decimals
  $(poshmark_listingPrice).trigger("focus");
  domEvent.fillInputValue(poshmark_listingPrice, listPrice);
  $(poshmark_listingPrice).trigger("blur");

  //---- additional inputs ----

  //sku
  $(poshmark_sku).trigger("focus");
  domEvent.fillInputValue(poshmark_sku, sku);
  $(poshmark_sku).trigger("blur");

  if (condition != "") {
    let conditionValue = formatCondition(condition);

    $(`button[data-et-name="${conditionValue}"]`).trigger("click");
  }

  if (color != "") {
    color = helpers.capitalize(color);

    let searchColor = await domEvent.waitForElementToLoad(
      `li:contains('${color}')`,
      5000
    ); //skips after 3 seconds if not detected

    searchColor.trigger("click");
  }

  swalAlert.closeSwal(); //close modal
  swalAlert.showCrosslistSuccessAlert(); //show success alert
}

function formatCondition(condition) {
  //return poshmark condition value from our condition value
  switch (condition) {
    case "nwt":
      return "nwt_yes";

    default:
      return "nwt_no";
  }
}

async function uploadImages(images, targetElement) {
  //wait 100ms for inputs to render
  await helpers.delay(100);

  //truncate image array;
  let splicedImages = images.slice(0, 16); //poshmark only allows 16 image uploads

  //upload array of images simultaneously
  await imageRenderer.uploadImages(splicedImages, targetElement);

  //find popup button; usually is presented on first image upload
  await domEvent.waitForElementToLoad(
    ".image-edit-modal button[data-et-name='apply']",
    5000
  ); //timeout in 5 seconds

  //wait 500ms for the images to render
  await helpers.delay(500);

  let editImageModalButton = document.querySelector(
    ".image-edit-modal button[data-et-name='apply']"
  );

  if (editImageModalButton) {
    //click button
    editImageModalButton.click();
  }

  return new Promise((resolve, reject) => {
    resolve();
  });
}

//LATER: do more error checking for fields, example like price/currency validation

// //detect if document is ready
document.onreadystatechange = function () {
  if (document.readyState === "interactive") {
    swalAlert.showPageLoadingAlert(); //swal alert ui waiting;
  }

  if (document.readyState === "complete") {
    swalAlert.showProcessingAlert(); //swal alert ui waiting;
    fillOutPoshmarkForm(
      itemData.imageUrls,
      itemData.title,
      itemData.description,
      itemData.brand,
      itemData.condition,
      itemData.color,
      itemData.price,
      itemData.sku
    );
  }
};
