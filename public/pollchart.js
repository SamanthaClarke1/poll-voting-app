$(document).ready(function() {
  var margin = {
                  top: 10,
                  right: 20,
                  bottom: 20,
                  left: 40
               }, w = ($("#bigholderguy").width()) - margin.left - margin.right,
                  h = ($("#bigholderguy").height() * .7) - margin.top - margin.bottom;

  var answers = getAns();
  answers = d3.entries(answers);
  
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
     .attr("class", (d) => { barIndex += 1; barIndex %= getBarsLength(); return getBarWithIndex(barIndex) + " graph-bar"; })
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