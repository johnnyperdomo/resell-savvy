// //FIX: detect changes, when urls change like from new tab change, crosslist button should be removed

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

function onLinkBtnPressed() {
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

async function createLinkButton() {
  //if profile edit, user's closet
  await domEvent.waitForElementToLoad("a[href='/user/edit-profile']");
  //tile card
  await domEvent.waitForElementToLoad(".tile .card");

  console.log("found btn");
  const button = document.createElement("button");
  button.id = "rs-crosslist-btn";
  button.classList = "rs-crosslist-btn btn-primary shadow ";
  button.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 rs-icon-center" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /> </svg>';
  button.addEventListener("click", onLinkBtnPressed);

  document.body.appendChild(button);
}

createLinkButton();

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

// async function createCrosslistButtons() {
//   //remove crosslist buttons before recreating, to avoid duplicates
//   removeCrossListButtons();

//   //find edit profile button to know this is your personal closet
//   await domEvent.waitForElementToLoad("a[href='/user/edit-profile']");
//   //find card
//   await domEvent.waitForElementToLoad(".tile .card");

//   var items = document.querySelectorAll(".tile .card");

//   items.forEach((card) => {
//     let crosslistButton = document.createElement("button");
//     crosslistButton.id = "rs-crosslist-button";
//     crosslistButton.className = "rs-crosslist-btn btn-primary";

//     //icon
//     //TODO: make this button better
//     crosslistButton.innerHTML =
//       '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 rs-icon-center" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /> </svg> <div><p>Crosslist</p></div>';

//     crosslistButton.addEventListener("click", openModal);
//     card.appendChild(crosslistButton);
//   });
// }

// function removeCrossListButton() {
//   var crosslistButton = $("#rs-crosslist-btn");

//   console.log("before, ", crosslistButton);

//   crosslistButton.remove();

//   console.log("after, ", crosslistButton);
// }

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
