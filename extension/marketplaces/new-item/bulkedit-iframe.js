console.log("bulk edit page - iframe detected");
var domEvent = new DomEvent();

//listen to message from 'ebay-bulksell-item.js' this is an iframe, so we manipulate dom from inside this iframe that was injected in manifest.json
window.addEventListener("message", function (event) {
  console.log("message detected in iframe, ", event);

  const data = event.data;
  const command = data.command;
  const properties = data.data;

  if (command == "add-ebay-title-iframe") {
    setTitle(properties.title);
  }
});

async function setTitle(title) {
  let searchBar = document.querySelector(
    "input[id*='find-product-search-bar']"
  );

  fillInputValue(searchBar, title);
  $(searchBar).trigger("focus");

  let autocompleteList = await domEvent.waitForElementToLoad(
    'div[id="w0-find-product-search-bar-autocomplete"] ul > li'
  );

  console.log("autocoplet, ", autocompleteList);

  if (autocompleteList.length) {
    console.log(autocompleteList.eq(0).find("button"));
    autocompleteList.eq(0).find("button").trigger("click");
  }
}

function fillInputValue(input, value) {
  var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  ).set;

  nativeInputValueSetter.call(input, value);

  var inputEvent = new Event("input", { bubbles: true });
  input.dispatchEvent(inputEvent);
}
