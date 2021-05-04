console.log("yoooooooo from local hest extension working meng");
console.log(window.location.href);

// if (window.location.href.indexOf("item") > -1) {
//   console.log("yo this is the item page ");
// } else {
//   console.log("this does not contain id page");
// }

alert("hi");
window.addEventListener("hashchange", (e) => {
  console.log("URL hash changed", e);
});
window.addEventListener("popstate", (e) => {
  console.log("State changed", e);
});

// permissions:     "http://localhost:4200/*"

// {
//     "js": ["jquery-3.6.0.min.js", "content-scripts/resell-savvy-item.js"],
//     "matches": ["http://localhost:4200/*"],
//     "run_at": "document_start"
//   },
