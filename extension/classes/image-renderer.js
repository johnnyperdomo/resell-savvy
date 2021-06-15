class ImageRenderer {
  //always convert to Data Uri before passing between marketplaces, that way we only have to perform network fetch once, and its faster when crosslisting
  async convertImages(images, type) {
    //type: converting from => blob/base64/url

    let slicedImages = images.slice(0, 16); //we will only save 16 images in resellsavvy dashboard

    //map the images
    let imagePromises = slicedImages.map(async (img) => {
      //1. TODO: check if blob url or normal url, if normal url, do something else
      switch (type) {
        //type: blob
        case "blob":
          return await _convertObjectUrlToBase64(img);

        //type: url
        default:
          return await _convertUrlToBase64(img);
      }
    });

    let results = await Promise.allSettled(imagePromises);

    //only retrieve successfully converted image
    const fulfilledImages = results
      .filter((res) => res.status === "fulfilled")
      .map((img) => img.value);

    return new Promise((resolve, reject) => {
      resolve(fulfilledImages);
    });
  }

  async uploadImages(urls, targetElement) {
    let arrayBufferFiles = urls.map(async (url) => {
      return await _convertImageToBuffer(url);
    });

    let results = await Promise.allSettled(arrayBufferFiles);

    //only retrieve successfully converted image
    const fulfilledImages = results
      .filter((res) => res.status === "fulfilled")
      .map((img) => img.value);

    _trigger_upload(fulfilledImages, targetElement);

    return new Promise((resolve, reject) => {
      resolve();
    });
  }
}

//convert images ====>

//type: blob => data-uri(base64)
async function _convertObjectUrlToBase64(url) {
  //blob
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        let reader = new FileReader();
        reader.readAsDataURL(blob); // converts the blob to base64 and calls onload

        reader.onload = function () {
          resolve(reader.result);
        };
      })
      .catch((error) => {
        reject(error);
      });
  });
}

//type: url => data-uri(base64)
async function _convertUrlToBase64(url) {
  let cleanUrl = _removeHttp(url); //remove the https protocol of normal url
  let proxiedUrl = _corsProxy.concat(cleanUrl); //{proxy_url}/{image_url}

  return new Promise((resolve, reject) => {
    fetch(proxiedUrl)
      .then((res) => res.blob())
      .then((blob) => {
        let reader = new FileReader();
        reader.readAsDataURL(blob); // converts the blob to base64 and calls onload

        reader.onload = function () {
          resolve(reader.result);
        };
      })
      .catch((error) => {
        reject(error);
      });
  });
}

//Upload images =====>

async function _convertImageToBuffer(url) {
  var fileName = _uuidv4();
  fileName = `${fileName}.png`;

  return new Promise((resolve, reject) => {
    fetch(url)
      .then((res) => res.arrayBuffer())
      .then((blob) => {
        let arrayBuffer = new Uint8Array(blob);
        let arrayBufferFile = new File([arrayBuffer.buffer], fileName, {
          type: "image/png",
        });

        resolve(arrayBufferFile);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

function _trigger_upload(dataFiles, target) {
  var files = dataFiles;
  var targetInput = target;
  var dataTransfer = new DataTransfer();

  //add files to dataTransfer Object
  files.forEach((file) => {
    dataTransfer.items.add(file);
  });

  //add dataTransfer to targetInput
  targetInput.files = dataTransfer.files;

  //dispatch update event on targetInput
  _dispatch_event(targetInput);
}

function _dispatch_event(element) {
  var event = new Event("change", {
    bubbles: !0,
  });
  element.dispatchEvent(event);
}

//NOTE: remove the http(s) protocol on any appended urls, if not the browser will rewrite the url in order to remove double-slashes. -> https://stackoverflow.com/questions/56994726/google-cloud-functions-replaces-double-slash-in-url
function _removeHttp(url) {
  return url.replace(/(^\w+:|^)\/\//, "");
}

//all image fetch requests should be passed through this proxy, which is a firebase cloud function, in order to bypass cors error on the browser
const _corsProxy =
  "https://us-central1-reseller-savvy-dev.cloudfunctions.net/corsanywhere/";

function _uuidv4() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
