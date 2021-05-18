async function createLinkButton() {
  const button = document.createElement("button");
  button.id = "rs-link-listing-btn";
  button.classList = "rs-link-listing-btn btn-primary shadow ";
  button.innerHTML =
    '<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>';
  button.addEventListener("click", onLinkBtnPressed);

  document.body.appendChild(button);
}

function onLinkBtnPressed() {
  //LATER: currently using this method to verify if content script is in listing url page, bcuz in spa applications, page isn't reloaded, so content script isn't removed. Which can leak the listing button to another page.
  //LATER: //FIX: fix leaking blue corner buttons on other pages, recheck observer

  let windowURL = window.location.href;

  //LATER: maybe do a regex, so that it doesn't only detect us listings?
  if (windowURL.indexOf("mercari.com/us/item") > -1) {
    console.log(" closet detected, ", window.location.href);
  }

  //open modal,
  //loading spinner
  //fetch logged in user or not
  //NOTE: (don't fetch paying user here, we want our workflow to be fast, so that would be extra loading time.)
  //if not, fire SWAL, error message
  //if successful authorization, show linking modal with table in it, fetch 20 recent listings. They can link whatever, but they can only link to one of them
}

function fetchLoggedInUser() {
  //return true or false
}

function showErrorMessage() {
  //swal error message
}

function openLinkingModal() {
  //show linking modal here, modal present
  //fetch items
}

function linkItemWithListing(id) {
  //link this item with the listing in the rs savvy inventory
  //set item in firebase
}

function unlinkItemFromListing(id) {
  //unlink item from rs savvy inventory
  //set new item firebase
}

createLinkButton();
