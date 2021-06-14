class ImageRenderer {
  //all image fetch requests should be passed through this proxy, which is a firebase cloud function, in order to bypass cors error on the browser
  _corsProxy =
    "https://us-central1-reseller-savvy-dev.cloudfunctions.net/corsanywhere/";

  //always convert to Data Uri before passing between marketplaces, that way we only have to perform network fetch once, and its faster when crosslisting
  async convertImages(images, type) {
    //type: converting from  => blob/base64/url

    //map the images
    let imagePromises = images.map((img) => {
      //1. TODO: check if blob url or normal url, if normal url, do something else
      switch (type) {
        //type: blob
        case "blob":
          return this._convertObjectUrlToBase64(img);

        //type: url
        default:
          return this._convertUrlToBase64(img);
      }
    });

    console.log("imgs: ", images);
    console.log("imgs convr: ", imagePromises);

    let results = await Promise.allSettled(imagePromises);
    console.log("results: ", results);

    //only retrieve successfully converted image
    const fulfilledImages = results
      .filter((res) => res.status === "fulfilled")
      .map((img) => img.value);

    return fulfilledImages;
  }

  //type: blob => data-uri(base64)
  async _convertObjectUrlToBase64(url) {
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
  async _convertUrlToBase64(url) {
    let cleanUrl = this._removeHttp(url); //remove the https protocol of normal url
    let proxiedUrl = this._corsProxy.concat(cleanUrl); //{proxy_url}/{image_url}

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

  //NOTE: remove the http(s) protocol on any appended urls, if not the browser will rewrite the url in order to remove double-slashes. -> https://stackoverflow.com/questions/56994726/google-cloud-functions-replaces-double-slash-in-url
  _removeHttp(url) {
    return url.replace(/(^\w+:|^)\/\//, "");
  }
}

// let url4 = `${imageRenderer._corsProxy}static.nike.com/a/images/t_PDP_864_v1/f_auto,b_rgb:f5f5f5/eldp6cx0ctfcizztdhei/pro-mens-short-sleeve-top-CTKmcB.png`;
