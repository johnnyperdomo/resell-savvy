//LATER: after items finish crosslisting, add a little popup(like how honey coupon has), at the top right corner. and mention something like - "we were able to fill the following properties based on listing details - "title", "description", "images", etc...." so everytime we fill a new item successfully, append it successfully to a property of sorts. (make it small and not annoying, and it doesn't block the ui, just like a small notication, they can leave it there or dismiss, but it shouldn't affect them )

//LATER: watch for elements that are not yet loaded, and add them when they are actvated by their previous elements. i.e., brand is not available until the category is filled. watch and then fill as soon as it becomes available.

var domEvent = new DomEvent();
var swalAlert = new SwalAlert();
var helpers = new Helpers();

async function fillOutDepopForm(
  imageUrls,
  description,
  condition,
  color,
  price
) {
  await domEvent.waitForElementToLoad("#description", 10000); //timeout after 10 seconds if undetected

  let depop_description = document.querySelector(
    'textarea[data-testid="description__input"]'
  );
  let depop_price = document.querySelector('input[data-testid="price__input"]');
  let depop_condition = document.querySelector(
    'div[data-testid="listingSelect__listing__condition"] input'
  );
  let depop_color = document.querySelector("#listing__colour__select");

  let depop_image_input = document.querySelector("input[type=file]");

  //TODO: this works!!!!!!
  //Tested Successfully on major platforms.
  //Execute Command

  //TODO: make this a promise that we have to wait for,

  //TODO: wait for the first element to be present and that it has a source present at index

  //TODO: this will be a for loop
  //TODO: don't just look for next input, query select all the outer input boxes, and then query select the inputs in those boxes at the index . box -> input, that way we can't get the same one
  await domEvent.waitForElementToLoad("input[type=file]", 3000);

  await UploadImage(
    imageUrls[0],
    fname,
    document.querySelectorAll("input[type=file]")[0]
  );

  await helpers.delay(1000); //let it re-render new input
  //wait for new input element to be present,
  await domEvent.waitForElementToLoad("input[type=file]", 3000);

  await UploadImage(
    imageUrls[1],
    fname,
    document.querySelector("input[type=file]")
  );

  await helpers.delay(1000); //TODO: make it like 100 ms

  await domEvent.waitForElementToLoad("input[type=file]", 3000); //timeout after 10 seconds if undetected

  await UploadImage(
    imageUrls[2],
    fname,
    document.querySelector("input[type=file]")
  );

  await helpers.delay(1000);

  await domEvent.waitForElementToLoad("input[type=file]", 3000); //timeout after 10 seconds if undetected

  await UploadImage(
    imageUrls[3],
    fname,
    document.querySelector("input[type=file]")
  );

  //description
  $(depop_description).trigger("focus");
  domEvent.fillTextAreaValue(depop_description, description);
  $(depop_description).trigger("blur");

  //condition
  if (condition != "") {
    let conditionValue = matchCondition(condition);

    console.log(conditionValue);

    $(depop_condition).trigger("focus");
    domEvent.fillInputValue(depop_condition, conditionValue);
    let conditionList = await domEvent.waitForElementToLoad(
      ".listingSelect__menu-list > div",
      5000
    );

    if (conditionList.length) {
      conditionList.eq(0).trigger("click");
    }
  }

  if (color != "") {
    //LATER: gray or grey should both match
    $(depop_color).trigger("focus");
    domEvent.fillInputValue(depop_color, color);

    //get first color
    let searchColor = await domEvent.waitForElementToLoad(
      `[class*=ColourSelectstyles__Colour]`,
      5000
    );
    //closet traverses up the dom to find the closest element in the parent
    searchColor.closest(".listingSelect__option").trigger("click");
  }

  $(depop_price).trigger("focus");
  domEvent.fillInputValue(depop_price, price);
  $(depop_price).trigger("blur");

  swalAlert.showCrosslistSuccessAlert();
  //LATER: price validation
}

function matchCondition(condition) {
  //return depop condition value from our condition value
  switch (condition) {
    case "nwt":
      return "Brand new";

    case "nwot":
      return "Like new";

    case "good":
      return "Excellent";

    case "preowned":
      return "Good";

    case "poor":
      return "Fair";

    default:
      return "";
  }
}

//LATER: do more error checking for fields, example like price/currency validation, splices, and maximum length values

//detect if document is ready
document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    fillOutDepopForm(
      itemData.imageUrls,
      itemData.description,
      itemData.condition,
      itemData.color,
      itemData.price
    );
  }
};

//TODO: test image

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
