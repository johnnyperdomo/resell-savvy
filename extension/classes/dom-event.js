//for responding to events that have to do with the dom/node events
//NOTE: use 'var' when declaring class, since it can be redeclared across different scopes
class DomEvent {
  //waits for the element to be loaded in the page
  //LATER: make this timeout after certain time, to not be blocked forever, change code up a little bit
  waitForElementToLoad(selector, waitTimeMax, inTree) {
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
}
