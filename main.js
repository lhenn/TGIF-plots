console.log('well hello');

const propublicaURL = "https://api.propublica.org/congress/v1/113/senate/members.json";
const propublicaAPIkey = 'E58FNEqHGDgcK00Ty0XoyVpupxkLQXMc3okUc8EU';



const svg = d3.select('.canvas')
  .append('svg')
    .attr('width', 600)
    .attr('height', 600);

// margins and dimensions
const margin = {top:20, right:20, bottom: 100, left: 100};
const graphWidth = 600 - margin.left - margin.right;
const graphHeight = 600 - margin.top - margin.bottom;

//create a group for bars, add width/height attributes
const graph = svg.append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left},${margin.top})`)

const xAxisGroup = graph.append('g')
  .attr('transform', `translate(0, ${graphHeight})`);

const yAxisGroup = graph.append('g');

// get data, set scales
d3.json(propublicaURL, {
  method: "GET",
  headers: new Headers({
    "X-API-KEY":propublicaAPIkey
    })
  })
  .then(json => {
    const data = json.results[0].members.map(m => m.votes_with_party_pct);
    console.log(data);
    console.log(d3.min(data))


    const x = d3.scaleLinear()
      .range([0, graphWidth])
      .domain([d3.min(data), d3.max(data)]);


    var histogram = d3.histogram()
       .value(data)   // I need to give the vector of value
       .domain([d3.min(data), d3.max(data)])  // then the domain of the graphic
       .thresholds(x.ticks(20)); // then the numbers of bins

    const bins = d3.histogram()
      .thresholds(20)(data);

    const y = d3.scaleLinear()
      .range([graphHeight, 0])
      .domain([0, d3.max(bins, function(d) { return d.length; })]);

    graph.selectAll("rect")
      .data(bins)
      .enter()
      .append("rect")
        .attr("x", 1)
        .attr("transform", function (d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")";})
        .attr("width", function(d) { return x(d.x1) - x(d.x0) - 1 ; })
        .attr("height", function(d) { return graphHeight - y(d.length); })
        .style("fill", "#69b3a2")

    const xAxis = d3.axisBottom(x);

    const yAxis = d3.axisLeft(y);

    xAxisGroup.call(xAxis);
    yAxisGroup.call(yAxis);

  //   bins.forEach(function(d, i) {
  //   console.log("Array number " + i + " --> Lower limit: " + d.x0 + " Upper limit:" + d.x1)
  // })
    console.log(bins)



  })
