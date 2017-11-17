var baseUrl = "https://poll-voting-app1.glitch.me/";

$(document).ready(function() {
  if(window.location.href.indexOf("err=") != -1) window.history.pushState("", "",window.location.href.split("err=")[0]) ;
  
  clearActiveNavis();
  var url = "https://poll-voting-app.glitch.me/";
  var urlsize = 34;
  if(window.location.href.slice(0, urlsize+17) == url+"login?signup=true") { 
    //console.log('at signup');
    $("#signup-navi").addClass("active"); 
  }
  else if(window.location.href.slice(0, urlsize+7) == url+"account") { 
    //console.log('at account')
    $("#account-navi").addClass("active"); 
  }
  else if(window.location.href.slice(0, urlsize+5) == url+"login") { 
    //console.log('at login');
    $("#login-navi").addClass("active"); 
  }else if(window.location.href.slice(0, urlsize+4) == url+"help") { 
    //console.log('at help');
    $("#help-navi").addClass("active"); 
  }
   else if(window.location.href.slice(0, urlsize+10) == url+"createpoll") { 
    //console.log('at add');
    $("#add-navi").addClass("active"); 
  }
  else if(window.location.href.slice(0, urlsize+0) == url) { 
    //console.log('at home');
    $("#home-navi").addClass("active"); 
  }
 
  //$(".acc-polls-section").css("min-height", $(".acc-user-section").css("height"));
  //$(".acc-user-section").css("min-height", $(".acc-polls-section").css("height"));
  //fades the body to black
  $("a").click(function(){
    if($(this).attr("href")[0]!="#"){ // prevents non-transfering links from fading

      //$(".secondarybody").addClass("faded"); // just honestly dont even like it that much. works fine as is.
     // $(".fa").addClass("animated fadeOutUp ");

    }
  });
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
     $("help-navi").removeClass("active");
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
          if($("#arrofvals").html().split("</li>").length > 2) {
            $("#subm").prop("disabled", false);
          }
          else {
            $("#subm").prop("disabled", true);
          }
        });
        if($("#arrofvals").html().split("</li>").length > 2) {
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
            if($("#arrofvals").html().split("</li>").length > 2) {
              $("#subm").prop("disabled", false);
            }
            else {
              $("#subm").prop("disabled", true);
            }
          });
          if($("#arrofvals").html().split("</li>").length > 2) {
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

  $(".poll-thumb-group").each(function(index) {
  });
  
  $(".view-all-btn").click(function() {
    if($("#poll-thumb-group-bottom").hasClass("rowOverride")) $("#poll-thumb-group-bottom").removeClass("rowOverride");
    else $("#poll-thumb-group-bottom").addClass("rowOverride");
  });

  //$('div').each(function(index) {$(this).css("background", "url(https://flagspot.net/images/c/cu.gif)")})
  
  //Feckin toggle switch yet again
  $(function() {
    //console.log('meep');
    $('.toggle-handle').css("background", "#0275d8");
    $("#toggle-event").change(function() {
      // toggle the active class
      //console.log('clicked');
      if($(this).prop("checked")) {
        //console.log("checked");
        //$('.toggle-on').addClass("active");
        //$('.toggle-off').removeClass("active");
        $('.toggle-handle').css("background", "white");
      } else {
        //console.log("unchecked");
        //$('.toggle-on').removeClass("active");
        //$('.toggle-off').addClass("active");
        $(".toggle-handle").css("background", "#0275d8");
      }
    });
  })
  
  $('#add-answer-submit').click(function() {
    console.log("slug holder contains: " + $("slug-hidden-val-holder").val());
    console.log("navigating to: { " + baseUrl + "/addans?ans=" + $('#add-answer-txt').val().split(" ").join("%20") + "&s=" + $("#slug-hidden-val-holder").val() + " }");
    window.location = baseUrl + "/addans?ans=" + encodeURIComponent($('#add-answer-txt').val()) + "&s=" + $("#slug-hidden-val-holder").val();
  });
  
});
