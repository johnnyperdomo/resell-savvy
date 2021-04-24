async function fillOutMercariForms() {
  let title = document.getElementById("sellName");
  let description = document.getElementById("sellDescription");

  let tag1 = document.querySelector('input[data-testid="Tag1"]');
  let tag3 = document.querySelector('input[data-testid="Tag3"]');

  $("#sellName").val("Apple bottom Jeans");

  $("#sellZipCode").val("44444"); //using jQuery

  //   $('button[data-testid="PhotoUploadButton"]').trigger("click");
  // $("#categoryId").trigger("click");
  // console.log("clicked the category");
  //   await waitForElementToLoad("ul#categoryId li");
  // $('li[data-testid="select-opt-7"]').trigger("click");
  // console.log("clicked the option 7");

  // fillField(title, "Hat");
  // fillField(description, "Beautiful hat you can where every day");
  // fillField(tag1, "nike");
  // fillField(tag3, "limited edition");
  // // fillField(zip, "33784");
}

function fillField(field, value) {
  if (field) {
    field.value = value;
  } else {
    console.log("could not find, ", field);
  }
}

fillOutMercariForms();
