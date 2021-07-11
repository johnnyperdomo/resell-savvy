var swalAlert = new SwalAlert();
var domEvent = new DomEvent();

function openModal() {
  const cardInfo = getCardInfo();

  //TODO: open modal
  let src = chrome.extension.getURL("index.html?#/import");
  swalAlert.showModalIframes(src);
}

function createCrossListButton() {
  var findHost = document.querySelectorAll(".rs-crosslist-host-element");

  if (findHost.length > 0) {
    //exit out function here, if button is already created/found
    return;
  }

  // create host element
  const hostElement = document.createElement("div");
  hostElement.className = "rs-crosslist-host-element";
  document.body.appendChild(hostElement);

  var host = document.querySelector(".rs-crosslist-host-element");
  var root = host.attachShadow({ mode: "open" });

  const button = document.createElement("button");
  button.classList = "rs-crosslist-btn bootstrap-btn";

  //shadow dom doesn't inherit parent styles or bootstrap css
  //LATER: make button cuter/ui friendly + shadow
  button.innerHTML =
    "<style>.rs-crosslist-btn{border-radius: 28px; border-collapse: separate; height: 56px;width: 56px;position: fixed;bottom: 20px;left: 20px;box-shadow: rgba(149, 157, 165, 0.2) 0px 8px 8px;z-index: 100;} .bootstrap-btn {display: inline-block;font-weight: 400;color: #212529;text-align: center;border: 1px solid transparent; color: #fff;background-color: #007bff;}.bootstrap-btn:hover{background-color: #0069d9;cursor: pointer;}</style>" +
    '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 rs-icon-center" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /> </svg>';
  button.addEventListener("click", openModal);

  root.appendChild(button);
}

createCrossListButton();

function getCardInfo() {
  var parsedArray = [];
  var items = document.querySelectorAll(".tile .card");

  items.forEach((item) => {
    let listingID = $(item).find("a").attr("data-et-prop-listing_id");
    var imageURL = $(item).find(".img__container img").attr("src");
    var title = $(item)
      .find(".item__details .title__condition__container a")
      .text()
      .trim();
    var listingURL = $(item)
      .find(".item__details .title__condition__container a")
      .attr("href");

    if (listingURL === undefined) {
      listingURL = "";
    }

    if (imageURL === undefined) {
      imageURL = "";
    }

    const parsedData = {
      title: title,
      thumbnailURL: imageURL,
      listingURL: listingURL,
      listingID: listingID,
    };

    parsedArray.push(parsedData);
  });

  return parsedArray;
}
// var observer = new MutationObserver(function (mutations) {
//   mutations.forEach(function (mutation) {
//     if (mutation.addedNodes.length) {
//       console.log("observing");

//       //if poshmark closet
//       if (window.location.href.indexOf("poshmark.com/closet") > -1) {
//         removeCrossListButton();
//         createCrossListButton();
//       }
//     }
//   });
// });

// observer.observe(document.body, {
//   childList: true,
// });
