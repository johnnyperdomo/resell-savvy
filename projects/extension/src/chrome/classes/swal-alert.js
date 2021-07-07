// sweet alert message popups

//NOTE: use 'var' when declaring class, since it can be redeclared across different scopes
class SwalAlert {
  //when page is loading waiting for dom to be ready
  showPageLoadingAlert() {
    //LATER: //FIX: add to shadow dom

    Swal.fire({
      title: "Waiting on page to finish loading...",
      html: "Please wait a few seconds while we start processing your listing soon. <b>Closing or reloading this tab will stop your item from being crosslisted</b>.",
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
      html: "Please wait a few seconds while we finish processing your listing. <b>Closing or reloading this tab will stop your item from being crosslisted</b>.",
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

  //simple process alert, when we don't want to block ui -> for rs-dashboard-item page
  showSimpleProcessingAlert() {
    Swal.fire({
      title: "Processing...",
      html: "Please wait a few seconds while we finish processing your listing. <b>Closing or reloading this tab will stop your item from being crosslisted</b>.",
      footer:
        "Processing time is affected by your internet speed.💡 Tip: Make sure you have a stable internet connection to process items faster.",
      showConfirmButton: false,
      target: "body",
      willOpen: () => {
        Swal.showLoading();
      },
    });
  }

  //show crosslist modal to let user select where they want to crosslist to: for rs-dashboard-item page,
  async showCrosslistModal() {
    return await Swal.fire({
      title: "Select marketplaces to crosslist",
      html: `
      <div style="margin: 0 auto; display: table">
        <div align="left">
          <div class="form-check">
              <input class="form-check-input" type="checkbox" id="depop">
              <label class="form-check-label" for="depop">
                  Depop
              </label>
          </div>
          <div class="form-check">
              <input class="form-check-input" type="checkbox" id="ebay">
              <label class="form-check-label" for="ebay">
                  Ebay
              </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox"  id="etsy">
            <label class="form-check-label" for="etsy">
                Etsy
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox"  id="grailed">
            <label class="form-check-label" for="grailed">
              Grailed
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox"  id="kidizen">
            <label class="form-check-label" for="kidizen">
                Kidizen
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox"  id="mercari">
            <label class="form-check-label" for="mercari">
                Mercari
            </label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="checkbox"  id="poshmark">
            <label class="form-check-label" for="poshmark">
                Poshmark
            </label>
          </div>
        </div>
      </div>
    `,
      confirmButtonText: "Start Crosslisting",
      confirmButtonColor: "#3085d6",
      preConfirm: () => {
        var depop = Swal.getPopup().querySelector("#depop").checked;
        var ebay = Swal.getPopup().querySelector("#ebay").checked;
        var etsy = Swal.getPopup().querySelector("#etsy").checked;
        var grailed = Swal.getPopup().querySelector("#grailed").checked;
        var kidizen = Swal.getPopup().querySelector("#kidizen").checked;
        var mercari = Swal.getPopup().querySelector("#mercari").checked;
        var poshmark = Swal.getPopup().querySelector("#poshmark").checked;

        return {
          depop: depop,
          ebay: ebay,
          etsy: etsy,
          grailed: grailed,
          kidizen: kidizen,
          mercari: mercari,
          poshmark: poshmark,
        };
      },
    }).then(async (result) => {
      const crosslistTo = []; //array of marketplaces that the user chooses

      for (const [marketplace, isChecked] of Object.entries(result.value)) {
        //only get checked marketplaces
        if (isChecked === true) {
          crosslistTo.push(marketplace);
        }
      }

      return crosslistTo;
    });
  }

  //gets our angular components in an iframe
  showModalIframes(src) {
    Swal.fire({
      showConfirmButton: false,
      grow: "column", //only grow to window height
      padding: "0", //FIX: try to find a way to make padding be actually be 0 on the iframe content, because it doesn't take the full popup window
      background: "#f9fbfd", //light color
      width: "85%",
      html: `<iframe width="100%" height="100%" src="${src}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`,
    });
  }

  closeSwal() {
    Swal.close();
  }
}
