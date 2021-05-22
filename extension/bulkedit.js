console.log("bulk edit page - iframe detected");

//listen to message from 'ebay-bulksell-item.js' this is an iframe, so we manipulate dom from inside this iframe that was injected in manifest.json
window.addEventListener("message", function (event) {
  console.log("message detected in iframe, ", event);

  const data = event.data;
  const command = data.command;
  const properties = data.data.properties;

  if (command == "add-ebay-title-iframe") {
    let searchBar = document.querySelector(
      "input[id*='find-product-search-bar']"
    );
    console.log(searchBar);
    console.log(properties.title);

    //TODO: wait for node to show list after we insert text
    //TODO: click on first one ,

    //TODO: send message to background session that lets the user know if we we should keep track of specific tab,

    fillInputValue(searchBar, properties.title);
    $(searchBar).trigger("focus");
  }
});

function fillInputValue(input, value) {
  var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype,
    "value"
  ).set;

  nativeInputValueSetter.call(input, value);

  var inputEvent = new Event("input", { bubbles: true });
  input.dispatchEvent(inputEvent);
}
