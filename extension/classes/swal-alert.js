// sweet alert message popups
//NOTE: use 'var' when declaring class, since it can be redeclared across different scopes
class SwalAlert {
  //when page is loading waiting for dom to be ready
  showPageLoadingAlert() {
    //LATER: //FIX: add to shadow dom

    Swal.fire({
      title: "Waiting on page to finish loading...",
      html: "Please wait a few seconds while we start processing your listing soon. <b>Closing this tab will stop your item from being crosslisted</b>.",
      footer:
        "Page loading time is affected by your internet speed.💡 Tip: Make sure you have a stable internet connection to crosslist items faster.",
      allowOutsideClick: false,
      backdrop: "rgba(239, 239, 239, 0.98)",
      showConfirmButton: false,
      target: "body",
      willOpen: () => {
        Swal.showLoading();
      },
    });
  }

  //when page is scraping data
  showProcessingAlert() {
    Swal.fire({
      title: "Processing...",
      html: "Please wait a few seconds while we finish processing your listing. <b>Closing this tab will stop your item from being crosslisted</b>.",
      footer:
        "Processing time is affected by your internet speed.💡 Tip: Make sure you have a stable internet connection to crosslist items faster.",
      allowOutsideClick: false,
      backdrop: "rgba(239, 239, 239, 0.98)",
      showConfirmButton: false,
      target: "body",
      willOpen: () => {
        Swal.showLoading();
      },
    });
  }

  //when listing details have been filled out successfully
  showCrosslistSuccessAlert() {
    Swal.fire({
      icon: "success",
      title: "Almost done!",
      html: `Item successfully crosslisted. Finish adding a few details unique to this marketplace to finish your listing.`,
      timer: 5000,
      timerProgressBar: true,
      toast: true,
      position: "top-end",
      showConfirmButton: false,
      footer:
        "Don't forget to link this listing to your ResellSavvy inventory.",
    });
  }

  closeSwal() {
    Swal.close();
  }
}
