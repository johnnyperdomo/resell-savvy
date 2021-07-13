//random methods that are re-used
class Helpers {
  //string capitalize

  //set a delay using promise, before continuing with code
  async delay(ms) {
    console.log("awaiting delay: ", ms);
    return await new Promise((resolve) => setTimeout(resolve, ms));
  }

  capitalize = (s) => {
    if (typeof s !== "string") return "";
    return s.charAt(0).toUpperCase() + s.slice(1);
  };
}
