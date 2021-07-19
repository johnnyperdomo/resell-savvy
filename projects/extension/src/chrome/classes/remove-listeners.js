//NOTE: this disables onbeforeunload messages on the tabs, so the user isn't prompted with a "are you sure you want to leave message"

// disable window.onbeforeunload (DOM level 0)
delete Window.prototype.onbeforeunload;
// disable window.addEventListener("beforeunload", ...) (DOM level 2)
var addEventListener_ = EventTarget.prototype.addEventListener;
EventTarget.prototype.addEventListener = function (type) {
  if (this != window || type != "beforeunload")
    addEventListener_.apply(this, arguments);
};
