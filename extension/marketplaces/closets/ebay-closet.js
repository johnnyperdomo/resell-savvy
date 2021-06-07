///////////////
//FIX: css error blue not working, btnprimary not working either, maybe inherits from parent
//LATER: set timeout node

var domEvent = new DomEvent();

function insertModal() {
  //TODO
  var modal = document.createElement("div");
  modal.classList = "modal fade";
  modal.id = "rs-crosslist-modal";
  modal.tabIndex = "-1";
  modal.innerHTML = `
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body">
          <p>hi my name is johnny what is</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
          <button type="button" class="btn btn-primary">Save changes</button>
        </div>
      </div>
  </div>
    `;

  // TODO: modal margins
  document.body.appendChild(modal);

  $("#rs-crosslist-modal").modal({ show: false });
}

insertModal();

function openModal() {
  const cardInfo = getCardInfo();

  //TODO
  //$("#rs-crosslist-modal").modal("show");

  //TODO: open modal

  $("#rs-crosslist-modal").on("show.bs.modal", function (e) {
    // //get data-id attribute of the clicked element
    // var bookId = $(e.relatedTarget).data('book-id');

    // //populate the textbox
    // $(e.currentTarget).find('input[name="bookId"]').val(bookId);
    console.log("triggered modal open");
  });

  console.log("open modal with data = ", cardInfo);
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

  var items = document.querySelectorAll("#shlistings-cntr table tbody");

  console.log(items);
  items.forEach((item) => {
    console.log("item = ", item);
    var imageURL = $(item).find(".shui-dt-column__image img").attr("src");
    var editUrl = $(item).find(".shui-dt-column__lineActions a").attr("href");
    var listingURL = $(item).find(".shui-dt-column__title a").attr("href");
    var title = $(item).find(".shui-dt-column__title a").text().trim();

    if (listingURL === undefined) {
      listingURL = "";
    }

    if (imageURL === undefined) {
      imageURL = "";
    }

    if (editUrl === undefined) {
      editUrl = "";
    }

    const parsedData = {
      title: title,
      thumbnailURL: imageURL,
      listingURL: listingURL,
      editUrl: editUrl,
    };

    parsedArray.push(parsedData);
  });

  return parsedArray;
}
