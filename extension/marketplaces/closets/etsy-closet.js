///////////////
//FIX: css error blue not working, btnprimary not working either, maybe inherits from parent
//LATER: set timeout node

// function insertModal() {
//   //TODO
//   var modal = document.createElement("div");
//   modal.classList = "modal fade";
//   modal.id = "rs-crosslist-modal";
//   modal.tabIndex = "-1";
//   modal.innerHTML = `
//   <div class="modal-dialog" role="document">
//     <div class="modal-content">
//       <div class="modal-header">
//         <h5 class="modal-title" id="exampleModalLabel">Modal title</h5>
//         <button type="button" class="close" data-dismiss="modal" aria-label="Close">
//           <span aria-hidden="true">&times;</span>
//         </button>
//       </div>
//       <div class="modal-body">
//         <p>hi my name is johnny what is</p>
//       </div>
//       <div class="modal-footer">
//         <button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>
//         <button type="button" class="btn btn-primary">Save changes</button>
//       </div>
//     </div>
// </div>
//   `;

//   // TODO: modal margins
//   document.body.appendChild(modal);

//   $("#rs-crosslist-modal").modal({ show: false });
// }

// insertModal();
var domEvent = new DomEvent();

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

async function createCrossListButton() {
  //should wait for list region element to know it's on list tab
  await domEvent.waitForElementToLoad(".list-region");
  await domEvent.waitForElementToLoad(".content-region ");

  console.log("found btn");
  const button = document.createElement("button");
  button.classList = "rs-crosslist-btn btn-primary shadow ";
  button.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 rs-icon-center" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /> </svg>';
  button.addEventListener("click", openModal);

  document.body.appendChild(button);
}

function getCardInfo() {
  var parsedArray = [];

  var items = document.querySelectorAll(".content-region ul li");

  items.forEach((item) => {
    var imageURL = $(item).find("img").attr("src");
    var listingURL = $(item).find("a").attr("href");
    var title = $(item).find(".card .card-title").text().trim();

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
    };

    parsedArray.push(parsedData);
  });

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
