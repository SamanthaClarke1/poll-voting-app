var decodeEntities = (function() {
  // this prevents any overhead from creating the object each time
  var element = document.createElement('div');

  function decodeHTMLEntities (str) {
    if(str && typeof str === 'string') {
      // strip script/html tags
      str = str.replace(/<script[^>]*>([\S\s]*?)<\/script>/gmi, '');
      str = str.replace(/<\/?\w(?:[^"'>]|"[^"]*"|'[^']*')*>/gmi, '');
      element.innerHTML = str;
      str = element.textContent;
      element.textContent = '';
    }

    return str;
  }

  return decodeHTMLEntities;
})();

function randomColor() {
  var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'];
  var color = "#";
  for(var i = 0; i < 6; i++) { color += pickRandom(chars); }
  return color;
}
function pickRandom(arr) {
  return arr[Math.floor(Math.random() * (arr.length) - 0.0000001)];
}

var bars = ['graph-bar-green', 'graph-bar-aqua', 'graph-bar-blue', 'graph-bar-purple', 'graph-bar-red', 
            'graph-bar-pink', 'graph-bar-orange', 'graph-bar-yellow', 'graph-bar-grey', 'graph-bar-lime'];

function pickRandomBarClass() {
  return pickRandom(bars);
}
function getBarWithIndex(barIndex) {
  barIndex %= bars.length;
  return bars[barIndex];
}
function getBarsLength() {return bars.length;}