var randomColors = [
  "#EF70A5", "#C899C5", "#8584BE", "#245C95", "#008E74", "#FFCE41", "#AACF70", "#D37049", "#CE5252", "#A2786A"
]

$(document).ready(function() {
  $(".rndback").each(function(index) {
    $(this).css("background", getRandomIndexOf(randomColors));
  });
  $(".rndbord").each(function(index) {
    $(this).css("border", "3px solid " + getRandomIndexOf(randomColors));
  });
  
  function getRandomIndexOf(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
});