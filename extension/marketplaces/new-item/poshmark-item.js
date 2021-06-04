//LATER: make elements fail safely if not found, just skip instead of failing the entire function, check to see if element exists, simulate if element not found, send error using sentry for each element, this should work for any element we are looking for, whether in the closets, get item, or set item data. (el -> title not found in poshmark closet, )...blah blah blah... full details, also version of chrome extension, the browser, every little thing they can give details on. don't collect all errors on page, bcuz some of the code is from the platform. Maybe we can automate some of this with puppeteer too & visualping. add errors from waiting on element to load as well, if it times out cuz it couldn't find it

// places we need to track bcuz were manipulating code
// 1. get item listing - edit functionality (edit listing url)
// 2. paste item listing - create item funcitonality (new listing url)
// 3. listing url - the simple url listing
// 4. closet -

var domEvent = new DomEvent();
var swalAlert = new SwalAlert();
var helpers = new Helpers();

async function fillOutPoshmarkForm(
  imageUrls,
  title,
  description,
  brand,
  condition,
  color,
  listPrice,
  costPrice,
  sku
) {
  await domEvent.waitForElementToLoad("input[data-vv-name='title']");
  console.log("wait for element to load");
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

  url =
    "https://c.files.bbci.co.uk/12A9B/production/_111434467_gettyimages-1143489763.jpg"; // url of image

  //TODO: this works!!!!!!
  //Tested Successfully on major platforms.
  //Execute Command
  UploadImage(
    imageUrls[0],
    fname,
    document.querySelectorAll("input[type=file]")[0]
  );

  fillInputValue(poshmark_title, title);
  fillTextAreaValue(poshmark_description, description);

  fillInputValue(poshmark_brand, brand);

  //TODO: round up, posh dont accept decimals
  fillInputValue(poshmark_listingPrice, listPrice);
  fillInputValue(poshmark_sku, sku);
  fillInputValue(poshmark_costPrice, costPrice);

  if (condition != "") {
    let conditionValue = formatCondition(condition);

    $(`button[data-et-name="${conditionValue}"]`).trigger("click");
  }

  if (color != "") {
    color = helpers.capitalize(color);

    // $(`div[data-et-name="color"]`).trigger("click");

    let searchColor = await domEvent.waitForElementToLoad(
      `li:contains('${color}')`
    );

    searchColor.trigger("click");

    console.log(searchColor);
    // $('a:contains("This One")')
    //   .filter(function (index) {
    //     return $(this).text() === "This One";
    //   })
    //   .trigger("click");

    // console.log($(`a:contains("Red")`).parent());
  }

  swalAlert.showCrosslistSuccessAlert();
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
  fillOutPoshmarkForm(
    itemData.imageUrls,
    itemData.title,
    itemData.description,
    itemData.brand,
    itemData.condition,
    itemData.color,
    itemData.price,
    itemData.cost,
    itemData.sku
  );
}

// //detect if document is ready
document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    getItemDetails();
    console.log("page complete");
  }
};

/////

url2 =
  "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_JDZg_z9AvlVGUNG0S7YzzlYEtyax1jkhFQ&usqp=CAU";

fname = "cat.png"; //File name to be submitted

function event_dispatcher(t) {
  var e = new Event("change", {
    bubbles: !0,
  });
  t.dispatchEvent(e);
}

function uploadImage_trigger(t) {
  console.log("Uploaded Success.");
  var e = t.file,
    n = t.targetInput,
    i = new DataTransfer();
  i.items.add(e), (n.files = i.files), event_dispatcher(n);
}

async function UploadImage(url, file_name, input_Element) {
  fetch(url)
    .then((res) => res.arrayBuffer())
    .then((blob) => {
      u = new Uint8Array(blob);
      myfile = new File([u.buffer], file_name, { type: "image/png" });
      uploadImage_trigger({ file: myfile, targetInput: input_Element });
    });
}
