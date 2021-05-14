function dataURLtoBlob(dataurl) {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  const blobber = new Blob([u8arr], { type: mime });

  console.log(blobber);

  return;
}

let img = new Image();
img.src = `data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGQAAABkCAYAAABw4pVUAAAA8UlEQVR4nO3X0Q2CMBQF0DeLcziIkzAKszAMu9QPIQFSqqUfEjgnaYiSkvqu5LURAAAAAAAAAAAAAAAAAADAuQzTyHlGRJquv3pNcx7T5zEi+sOruyGBnIxATuZIIGkxxs29XwIpzb+92kBSrAvcx7qopUAeO/PTkYVf1RDrf2xuzIF0kS9eik8QEeVAtuEt53ctP+JKat6QIfL9YPl9KZC9ftIX1nA7NYGMsf8Wzc8QSKPaQL7tmI4EUlrD7dQEstcDloXWQxrVBJLbJc2Nfg7ALqtR6zlkW0znEAAAAAAAAAAAAAAAAAAAAAAAAAD+5A1s+4fOp2st6wAAAABJRU5ErkJggg==`;

img.addEventListener("load", myScript);

function myScript() {}

function convertImgToBase64URL(url, callback, outputFormat) {
  var img = new Image();
  img.crossOrigin = "Anonymous";
  img.onload = function () {
    var canvas = document.createElement("CANVAS"),
      ctx = canvas.getContext("2d"),
      dataURL;
    canvas.height = img.height;
    canvas.width = img.width;
    ctx.drawImage(img, 0, 0);
    dataURL = canvas.toDataURL(outputFormat);
    callback(dataURL);
    canvas = null;
  };
  img.src = url;
}

let dataTransfer = new DataTransfer();

function dataURLtoFile(dataurl, filename) {
  var arr = dataurl.split(","),
    mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]),
    n = bstr.length,
    u8arr = new Uint8Array(n);

  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }

  return new File([u8arr], filename, { type: mime });
}

convertImgToBase64URL(
  "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b6/Image_created_with_a_mobile_phone.png/1200px-Image_created_with_a_mobile_phone.png",
  function (base64Img) {
    console.log(base64Img);
    // var blob = dataURLtoBlob(base64Img);

    // const myFile = new File([blob], "texter.png", { type: "png" });

    var file = dataURLtoFile(base64Img, "hello.png");

    console.log(file);

    dataTransfer.items.add(file);

    console.log(dataTransfer);
  }
);

// // Assign the DataTransfer files list to the file input
//document.querySelector('input[type="file"]').files = dataTransfer.files;

document.onreadystatechange = function () {
  if (document.readyState === "complete") {
    // let input = $('[type="file"]');

    // input.files = dataTransfer.files;

    // input.trigger("change");
    // $(input).trigger("change");

    // console.log("input", input.files);
    // console.log("page complete");

    // let target = document.documentElement;
    // let body = document.body;
    // let fileInput = document.querySelector('input[type="file"]');

    // target.addEventListener("dragover", (e) => {
    //   console.log(e);
    //   e.preventDefault();
    //   body.classList.add("dragging");
    // });

    // target.addEventListener("dragleave", () => {
    //   console.log(e);
    //   body.classList.remove("dragging");
    // });

    // target.addEventListener("drop", (e) => {
    //   console.log(e);
    //   e.preventDefault();
    //   body.classList.remove("dragging");

    //   fileInput.files = e.dataTransfer.files;
    // });

    document.querySelector("#content").addEventListener("drop", (ev) => {
      console.log("dropeed, ", ev);
      ev.preventDefault();
      document.querySelector("input[type='file']").files =
        ev.dataTransfer.files;
    });
  }
};
