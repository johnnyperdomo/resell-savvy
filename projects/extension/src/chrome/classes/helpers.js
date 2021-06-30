//random methods that are re-used
class Helpers {
  //string capitalize

  //set a delay using promise, before continuing with code
  async delay(ms) {
    console.log("awaiting delay: ", ms);
    return await new Promise((resolve) => setTimeout(resolve, ms));
  }

  //TODO: add to class, maybe extend string functionality instead
  capitalize = (s) => {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  //TODO: firebase cloud functions cors, get different keys for prod/dev servers
}

// function getCorsProxyPath() {
//   //TODO: get chrome runtime for dev/prod keys, return a key

// }
