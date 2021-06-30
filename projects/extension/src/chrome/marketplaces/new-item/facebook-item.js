// //LATER: create files by pages to make code cleaner
// //LATER: make elements fail safely if not found, just skip instead of failing the entire function
// //FIX: error with itemData not being recognized

// async function fillOutFacebookForm(
//   imageUrls,
//   title,
//   description,
//   condition,
//   price
// ) {
//   console.log("waiting on form filler");

//   await domEvent.waitForElementToLoad("form");
//   console.log("called form filler");
//   let facebook_title = document.querySelector(
//     "label[aria-label='Title'] input"
//   );
//   let facebook_price = document.querySelector(
//     "label[aria-label='Price'] input"
//   );
//   let facebook_description = document.querySelector(
//     "label[aria-label='Description'] textarea"
//   );

//   fillInputValue(facebook_title, title);
//   fillInputValue(facebook_price, price);

//   if (condition != "") {
//     let conditionValue = formatCondition(condition);

//     //LATER: condition needs to click value

//     //matches exact text
//     $.expr[":"].textEquals = $.expr.createPseudo(function (arg) {
//       return function (elem) {
//         return $(elem)
//           .text()
//           .match("^" + arg + "$");
//       };
//     });

//     $(`label[aria-label="Condition"]`).trigger("click");
//     let searchCondition = await domEvent.waitForElementToLoad(
//       `span:textEquals('${conditionValue}')`
//     );
//     searchCondition.trigger("click");
//   }

//   fillTextAreaValue(facebook_description, description);
// }

// function formatCondition(condition) {
//   //return poshmark condition value from our condition value
//   switch (condition) {
//     case "nwt":
//       return "New";

//     case "nwot":
//       return "Used - Like New";

//     case "good":
//       return "Used - Good";

//     case ("preowned", "poor"):
//       return "Used - Fair";

//     default:
//       return "";
//   }
// }

// //only this function works to change text
// function fillInputValue(input, value) {
//   var nativeInputValueSetter = Object.getOwnPropertyDescriptor(
//     window.HTMLInputElement.prototype,
//     "value"
//   ).set;

//   nativeInputValueSetter.call(input, value);

//   var inputEvent = new Event("input", { bubbles: true });
//   input.dispatchEvent(inputEvent);
// }

// function fillTextAreaValue(textArea, value) {
//   var nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(
//     window.HTMLTextAreaElement.prototype,
//     "value"
//   ).set;

//   nativeTextAreaValueSetter.call(textArea, value);

//   var textAreaEvent = new Event("input", { bubbles: true });
//   textArea.dispatchEvent(textAreaEvent);
// }

// //LATER: do more error checking for fields, example like price/currency validation
// function getItemDetails(itemData) {
//   console.log("ready to insert fields is called from poshmark");

//   fillOutFacebookForm(
//     itemData.imageUrls,
//     itemData.title,
//     itemData.description,
//     itemData.condition,
//     itemData.price
//   );
// }
