var swalAlert = new SwalAlert();
var domEvent = new DomEvent();

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

function getLoadedListings() {
  var parsedArray = [];

  var items = document.querySelectorAll(".content-region ul li");

  items.forEach((item) => {
    var imageURL = $(item).find("img").attr("src");
    var listingURL = $(item).find("a").attr("href");
    var title = $(item).find(".card .card-title").text().trim();

    if (listingURL === undefined) {
      listingURL = "";
    }

    //clean url; remove query from url path
    listingURL = listingURL.split("?")[0];

    if (imageURL === undefined) {
      imageURL = "";
    }

    const parsedData = {
      title: title,
      image: imageURL,
      url: listingURL,
    };

    parsedArray.push(parsedData);
  });

  console.log(parsedArray);

  return parsedArray;
}

//check frequency every 1 second, expire after 30 seconds, that way node won't block javascript from running on any other page just in case
domEvent.waitForElementToDisplay(
  ".list-region",
  function () {
    createCrossListButton();
  },
  1000,
  30000
);

function openModal() {
  let marketplace = "etsy";
  let tabId = window.tabId; //injected

  let query = "?" + `marketplace=${marketplace}&tabId=${tabId}`;
  let src = chrome.runtime.getURL("index.html?#/import") + query;

  swalAlert.showModalIframes(src);
}

//listen for message from the import listings iframe modal.
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg.command == "get-listings") {
    sendResponse({
      data: {
        listings: getLoadedListings(),
      },
    });
  }

  if (msg.command == "set-tab-id") {
    //set the tab id
    window.tabId = msg.data.tabId;
  }
});
