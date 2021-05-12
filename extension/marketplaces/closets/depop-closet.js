///////////////
//TODO: only show if node is present for closet
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
  //FIX: this giving error when listing item, since this is a universal closet function
  //if rearrange button is present, it means this is their personal closet
  await waitForElementToLoad('button[data-testid="action__moveSold"]');
  //products tab should be loaded
  await waitForElementToLoad("#products-tab");

  console.log("found btn");
  const button = document.createElement("button");
  button.classList = "rs-crosslist-btn btn-primary shadow ";
  button.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 rs-icon-center" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /> </svg>';
  button.addEventListener("click", openModal);

  document.body.appendChild(button);
}

createCrossListButton();

function getCardInfo() {
  var parsedArray = [];

  var items = document.querySelectorAll(
    "#products-tab ul[data-testid='product__items'] > li"
  );

  items.forEach((item) => {
    var imageURL = $(item).find("a img").attr("src");
    var listingURL = $(item)
      .find("a[data-testid='product__item']")
      .attr("href");

    if (listingURL === undefined) {
      listingURL = "";
    }

    if (imageURL === undefined) {
      imageURL = "";
    }

    const parsedData = {
      thumbnailURL: imageURL,
      listingURL: listingURL,
    };

    parsedArray.push(parsedData);
  });

  return parsedArray;
}

function waitForElementToLoad(selector, waitTimeMax, inTree) {
  //TODO: we need jQuery for this to work
  if (!inTree) inTree = $(document.body);
  let timeStampMax = null;
  if (waitTimeMax) {
    timeStampMax = new Date();
    timeStampMax.setSeconds(timeStampMax.getSeconds() + waitTimeMax);
  }
  return new Promise((resolve) => {
    let interval = setInterval(() => {
      let node = inTree.find(selector);
      if (node.length > 0) {
        console.log("node is ready");
        clearInterval(interval);
        resolve(node);
      } else {
        console.log("node is not ready yet");
      }
      if (timeStampMax && new Date() > timeStampMax) {
        clearInterval(interval);
        resolve(false);
      }
    }, 50);
  });
}