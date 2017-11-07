$(document).ready(function() {
  //console.log("secretHider linked");
  $("#secretBtn").click(function() {
    $("#userSecret").toggle();
    if($("#secretBtn").text() == "Show Me") $("#secretBtn").text("Hide Me");
    else $("#secretBtn").text("Show Me");
    //console.log("test");
  });
});