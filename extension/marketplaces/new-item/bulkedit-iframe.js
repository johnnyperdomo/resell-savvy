console.log("bulk edit page - iframe detected");

//listen to message from 'ebay-bulksell-item.js' this is an iframe, so we manipulate dom from inside this iframe that was injected in manifest.json
window.addEventListener("message", function (event) {
  console.log("message detected in iframe, ", event);

  const data = event.data;
  const command = data.command;
  const properties = data.data;

  if (command == "add-ebay-title-iframe") {
    // let searchBar = document.querySelector(
    //   "input[id*='find-product-search-bar']"
    // );

    // //TODO: wait for node to show list after we insert text
    // //TODO: click on first one ,

    // //TODO: send message back to bull-sell-item-page

    // fillInputValue(searchBar, properties.title);
    // $(searchBar).trigger("focus");

    setTitle(properties.title);
    // let autocompleteList = await waitForElementToLoad(
    //   'div[id="w0-find-product-search-bar-autocomplete"] ul > li'
    // );
  }
});

async function setTitle(title) {
  console.log("set titel called");
  let searchBar = document.querySelector(
    "input[id*='find-product-search-bar']"
  );

  //TODO: wait for node to show list after we insert text
  //TODO: click on first one ,

  //TODO: send message back to bull-sell-item-page

  fillInputValue(searchBar, title);
  $(searchBar).trigger("focus");

  let autocompleteList = await waitForElementToLoad(
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
