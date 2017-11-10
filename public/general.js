$(document).ready(function() {
  

  window.history.pushState("", "",window.location.href.split("err=")[0]) ;
  clearActiveNavis();
  if(window.location.href.slice(0, 34+17) == "https://poll-voting-app.glitch.me/login?signup=true") { 
    console.log('at signup');
    $("#signup-navi").addClass("active"); 
  }
  else if(window.location.href.slice(0, 34+7) == "https://poll-voting-app.glitch.me/account") { 
    console.log('at account')
    $("#account-navi").addClass("active"); 
  }
  else if(window.location.href.slice(0, 34+5) == "https://poll-voting-app.glitch.me/login") { 
    console.log('at login');
    $("#login-navi").addClass("active"); 
  }else if(window.location.href.slice(0, 34+4) == "https://poll-voting-app.glitch.me/help") { 
    console.log('at help');
    $("#help-navi").addClass("active"); 
  }
  else if(window.location.href.slice(0, 34+0) == "https://poll-voting-app.glitch.me/") { 
    console.log('at home');
    $("#home-navi").addClass("active"); 
  }
 
  //$(".acc-polls-section").css("min-height", $(".acc-user-section").css("height"));
  //$(".acc-user-section").css("min-height", $(".acc-polls-section").css("height"));

  // secret hider / shower
  $("#secretBtn").click(function() {
    $("#userSecret").toggle();
    if($("#secretBtn").text() == "Show Me") $("#secretBtn").text("Hide Me");
    else $("#secretBtn").text("Show Me");
    //console.log("test");
  });
  
  function clearActiveNavis() {
    $("home-navi").removeClass("active"); 
    $("login-navi").removeClass("active"); 
    $("account-navi").removeClass("active"); 
    $("signup-navi").removeClass("active");
  }
  var found = false;
  $("#response").keyup(function(){
   var tempfound = false;
      $(".answervals").each(function(index) { // sets found to true if there's a matching value.
        if(!tempfound) {
          console.log($(this).val())
          if( $(this).val() == $("#response").val()){ tempfound = true; } // this is called for each and every item with the class .answerval
        }
      });
    found = tempfound;
    console.log(found);
    if(found){
      $("#addres").addClass("disabled-adder");
    } else {
      $("#addres").removeClass("disabled-adder");
    }
    
  });
  var num = 0;
  
  // handles the addition of responses to questions on the /createpoll page
  $("#addres").click(function(){
    if(/[a-zA-Z0-9]/.test($("#response").val()) && !$("#addres").hasClass("disabled-adder")) {
        if(!found){
        var toAppend = "";
        toAppend += "<li id='index"+num+"'>";
        toAppend += "<input value='' class='form-control answervals' id='iinput"+num+"' answervals' readonly name='index"+num+"' required />";
        toAppend += "</li>";
        $("#arrofvals").append(toAppend);
        
        var tval = $("#response").val();
        $('#iinput' + num).val(tval);

        $("#response").val('');

        var u = "#index"+(num);
        $("#index"+num).click(function() {
          $(u).remove();
          resetResponseNames();
          //console.log($("#arrofvals").html());
          //console.log($("#arrofvals").html().split("<li>"));
          if($("#arrofvals").html().split("</li>").length > 1) {
            $("#subm").prop("disabled", false);
          }
          else {
            $("#subm").prop("disabled", true);
          }
        });
        if($("#arrofvals").html().split("</li>").length > 1) {
          $("#subm").prop("disabled", false);
        }
        else {
          $("#subm").prop("disabled", true);
        }
        num++;
      }
      resetResponseNames();
    }
  });

  function resetResponseNames() {
    $('.responses').each(function(){
        // this is inner scope, in reference to the .responses element
        $(this).find('li').each(function(index) {
          $(this).attr('id', 'index' + index);
          $(this).find('input').each(function(index2) {
            $(this).attr('id', 'iinput' + index);
            $(this).attr('name', 'index' + index);
          });
          $(this).click(function() {
            $(this).remove();
            resetResponseNames();
            //console.log($("#arrofvals").html());
            //console.log($("#arrofvals").html().split("<li>"));
            if($("#arrofvals").html().split("</li>").length > 1) {
              $("#subm").prop("disabled", false);
            }
            else {
              $("#subm").prop("disabled", true);
            }
          });
          if($("#arrofvals").html().split("</li>").length > 1) {
            $("#subm").prop("disabled", false);
          }
          else {
            $("#subm").prop("disabled", true);
          }
        num++;
      });
    });
  }
  
  $(".poll-choose").click(function() {
    $(".poll-choose").removeClass("poll-selected");
    $(this).addClass("poll-selected");
    $(".poll-submit").val("Confirm: " + $(this).val() );
  });

                                 

  
});
