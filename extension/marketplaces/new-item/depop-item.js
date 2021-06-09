//LATER: add progress states to page when it starts the crosslist session, - white blurry modal that stops the user from editing the page. i.e. waiting for page to load "check internet connection" (make funny animation) -> pasting in progress -> etc.... timeout in a few seconds by default just in case it doesn't get stuck. (that way they know the crosslist is not the reason it's slow, it's because of your internet)

//LATER: after items finish crosslisting, add a little popup(like how honey coupon has), at the top right corner. and mention something like - "we were able to fill the following properties based on listing details - "title", "description", "images", etc...." so everytime we fill a new item successfully, append it successfully to a property of sorts. (make it small and not annoying, and it doesn't block the ui, just like a small notication, they can leave it there or dismiss, but it shouldn't affect them )

//LATER: watch for elements that are not yet loaded, and add them when they are actvated by their previous elements. i.e., brand is not available until the category is filled. watch and then fill as soon as it becomes available.

// function toDataUrl(url, callback) {
//   var xhr = new XMLHttpRequest();
//   xhr.onload = function () {
//     callback(xhr.response);
//   };
//   xhr.open("GET", url);
//   xhr.responseType = "blob";
//   xhr.send();
// }

// function convertImgToBase64URL(url, callback, outputFormat) {
//   var img = new Image();
//   img.crossOrigin = "Anonymous";
//   img.onload = function () {
//     var canvas = document.createElement("CANVAS"),
//       ctx = canvas.getContext("2d"),
//       dataURL;
//     canvas.height = img.height;
//     canvas.width = img.width;
//     ctx.drawImage(img, 0, 0);
//     dataURL = canvas.toDataURL(outputFormat);
//     callback(dataURL);
//     canvas = null;
//   };
//   img.src = url;
// }

// function getBase64Image(img) {
//   // Create an empty canvas element
//   var canvas = document.createElement("canvas");
//   canvas.width = img.width;
//   canvas.height = img.height;

//   // Copy the image contents to the canvas
//   var ctx = canvas.getContext("2d");
//   ctx.drawImage(img, 0, 0);

//   // Get the data-URL formatted image
//   // Firefox supports PNG and JPEG. You could check img.src to
//   // guess the original format, but be aware the using "image/jpg"
//   // will re-encode the image.
//   var dataURL = canvas.toDataURL("image/png");

//   return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
// }

// function datablob(item) {
//   const dataTransfer = new DataTransfer();

//   dataTransfer.items.add(new File(["hello world"], "This_Works.txt"));

//   return dataTransfer.files;
// }

var domEvent = new DomEvent();
var swalAlert = new SwalAlert();

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

  url =
    "https://c.files.bbci.co.uk/12A9B/production/_111434467_gettyimages-1143489763.jpg"; // url of image

  //TODO: this works!!!!!!
  //Tested Successfully on major platforms.
  //Execute Command
  // await UploadImage(
  //   url,
  //   fname,
  //   document.querySelectorAll("input[type=file]")[0]
  // );

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
