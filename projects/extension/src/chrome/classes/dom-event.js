//for responding to events that have to do with the dom/node events
//NOTE: use 'var' when declaring class, since it can be redeclared across different scopes
class DomEvent {
  //waits for the element to be loaded in the page
  waitForElementToLoad(selector, timeoutInMs, inTree) {
    if (!inTree) inTree = $(document.body);
    var startTimeInMs = Date.now();

    return new Promise((resolve) => {
      let interval = setInterval(() => {
        let element = inTree.find(selector);
        if (element.length > 0) {
          console.log("element is detected: ", selector);
          clearInterval(interval);
          resolve(element);
        } else {
          console.log("element is not detected: ", selector);

          //optional timeout after a few seconds; used to exit function after a set period of time, instead of blocking ui forever.
          if (timeoutInMs && Date.now() - startTimeInMs > timeoutInMs) {
            console.log(
              `selector: [${selector}], could not be detected. Timed out after the following milliseconds: `,
              timeoutInMs
            );
            clearInterval(interval);
            resolve(element);

            //LATER: if selector times out bcuz it can't be found, send an error message to sentry
          }
        }
      }, 50);
    });
  }

  //this waits for the element to be displayed, and then
  waitForElementToDisplay(selector, callback, checkFrequencyInMs, timeoutInMs) {
    var startTimeInMs = Date.now();
    (function loopSearch() {
      if (document.querySelector(selector) != null) {
        callback();
        return;
      } else {
        setTimeout(function () {
          if (timeoutInMs && Date.now() - startTimeInMs > timeoutInMs) return;
          loopSearch();
        }, checkFrequencyInMs);
      }
    })();
  }

  //only this function works to change text, while firing inputs
  fillInputValue(input, value) {
    var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype,
      "value"
    ).set;

    nativeInputValueSetter.call(input, value);

    var inputEvent = new Event("input", { bubbles: true });
    input.dispatchEvent(inputEvent);
  }

  fillTextAreaValue(textArea, value) {
    var nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
      window.HTMLTextAreaElement.prototype,
      "value"
    ).set;

    nativeTextAreaValueSetter.call(textArea, value);

    var textAreaEvent = new Event("input", { bubbles: true });
    textArea.dispatchEvent(textAreaEvent);
  }

  //dispatch dom events manually
  dispatchEvent(element, type) {
    var event = new Event(type, {
      bubbles: !0,
    });
    element.dispatchEvent(event);
  }
}
