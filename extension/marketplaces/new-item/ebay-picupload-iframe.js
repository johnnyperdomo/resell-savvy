var domEvent = new DomEvent();
var helpers = new Helpers();
var imageRenderer = new ImageRenderer();

//listen to message from 'ebay-item.js' this is an iframe, so we manipulate dom from inside this iframe that was injected in manifest.json
window.addEventListener("message", function (event) {
  const data = event.data;
  const command = data.command;
  const properties = data.data;

  if (command == "upload-ebay-images") {
    initiateImageUpload(properties.imageUrls);
  }
});

async function initiateImageUpload(images) {
  let ebay_image_input = document.querySelector("input[type='file']");

  await domEvent.waitForElementToLoad("input[type='file']");

  await uploadImages(images, ebay_image_input);
}

async function uploadImages(images, targetElement) {
  console.log("picupload images start");
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
