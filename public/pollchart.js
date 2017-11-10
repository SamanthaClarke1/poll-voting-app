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
var possibleColors = ['green', 'aqua', 'blue', 'purple', 'red', 'pink', 'orange', 'yellow', 'grey', 'lime'];

function pickRandomBarClass() {
  return pickRandom(bars);
}
function getBarWithIndex(barIndex) {
  barIndex %= bars.length;
  return bars[barIndex];
}
function getBarsLength() {return bars.length;}

function getIndexOfColor(color) { return possibleColors.indexOf(color); }
function getClassOfColor(color) { return bars[possibleColors.indexOf(color)]; }

$(document).ready(function() {
  var margin = {
                  top: 10,
                  right: 20,
                  bottom: 20,
                  left: 40
               }, w = ($("#bigholderguy").width()) - margin.left - margin.right,
                  h = ($("#bigholderguy").height() * .7) - margin.top - margin.bottom;

  var answers = getAns(); // it's defined before this with some sneaky js work ;)
  answers = d3.entries(answers); // it's defined before this with some sneaky d3 work ;)
  var params = getAnsParams(); // it's defined before this with some sneaky js work ;)
  
  var wscl = w / answers.length;
  var highestVal = 0;
  for(var i in answers) {
    if(answers[i].value > highestVal) highestVal = answers[i].value;
  }
  var hscl = h / highestVal;

  const svg = d3.select("#chart")
                .attr("width", w)
                .attr("height", h);

  var barIndex = -1; // since the first call will increment

  svg.selectAll("rect")
     .data(answers)
     .enter()
     .append('rect')
     .attr('x', function(d, i) { return i * (wscl) })
     .attr('y', function(d) { return h - (d.value * hscl) - 20 })
     .attr('width', wscl - margin.right)
     .attr("height", (d, i) => { return d.value * hscl})
     .attr("value", (d) => { return d.key; })
     .attr("class", (d) => { var color = params[d.key].color; return getClassOfColor(color) + " graph-bar"; })
     .append('title')
     .text(function(d) { return d.key });

  const xScale = d3.scaleLinear()
                   .domain([d3.min(answers, function(d, i){
                     return i;
                   }), d3.max(answers, function(d, i) {
                     return i + 1;
                   })])
                   .range([0, w]);

  const xAxis = d3.axisBottom(xScale);

  svg.append("g")
     .attr("transform", "translate(0, "+(h-20)+")")
     .call(xAxis);

  const yScale = d3.scaleLinear()
                   .domain([0, d3.max(answers, (d) => d.value)])
                   .range([h, 0]);

  const yAxis = d3.axisLeft(yScale);

  svg.append("g")
       .attr("transform", "translate("+(w-1)+", -20)")
       .call(yAxis);


  $(".graph-bar").click(function() {
    console.log("graph bar clicked");
    console.log($(this).attr("value"));
    $(".poll-submit").val("Confirm: " + $(this).attr("value") );
  });
});