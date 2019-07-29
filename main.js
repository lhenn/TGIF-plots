// create and append svg container first
const svg = d3.select('.canvas')
  .append('svg')
    .attr('width', 500)
    .attr('height', 400);

// margins and dimensions
const margin = {top:20, right:20, bottom: 100, left: 100};
const graphWidth = 500 - margin.left - margin.right;
const graphHeight = 400 - margin.top - margin.bottom;

//create a group for bars, add width/height attributes
const graph = svg.append('g')
  .attr('width', graphWidth)
  .attr('height', graphHeight)
  .attr('transform', `translate(${margin.left},${margin.top})`)

const xAxisGroup = graph.append('g')
  .attr('transform', `translate(0, ${graphHeight})`);

const yAxisGroup = graph.append('g');

// scales
const x = d3.scaleLinear()
  .range([0, graphWidth]);

const y = d3.scaleLinear()
  .range([graphHeight, 0]);


// create the axes
const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y);

// ------ update function -------
const update = (data, party) => {
  console.log(party);
  let fillColor = '';
  if(party === 't') fillColor = 'grey';
  if(party === 'd') fillColor = 'blue';
  if(party === 'r') fillColor = 'red';
  console.log(fillColor);
  data = [...data];

  var count = 10;
  x.domain(d3.extent(data))
    .nice(count);


  const histogram = d3.histogram()
    .domain(x.domain())
    .thresholds(x.ticks(count));

  const bins = histogram(data);

  y.domain([0, d3.max(bins.map(bin => bin.length))]);

  const rects = graph.selectAll('rect')
    .data(bins);

  rects.exit().remove();

  rects.attr("x", 1)
  .attr("transform", function (d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")";})
    .attr("width", function(d) {return x(d.x1) - x(d.x0); })
    .attr("height", function(d) { return graphHeight - y(d.length); })
    .style("fill", fillColor)

  rects.enter()
    .append("rect")
      .attr("x", 1)
      .attr("transform", function (d) { return "translate(" + x(d.x0) + "," + y(d.length) + ")";})
      .attr("width", function(d) {return x(d.x1) - x(d.x0); })
      .attr("height", function(d) { return graphHeight - y(d.length); })
      .style("fill", fillColor)

  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);
}

const propublicaURL = "https://api.propublica.org/congress/v1/113/senate/members.json";
const propublicaAPIkey = 'E58FNEqHGDgcK00Ty0XoyVpupxkLQXMc3okUc8EU';

d3.json(propublicaURL, {
  method: "GET",
  headers: new Headers({
    "X-API-KEY":propublicaAPIkey
    })
  })
  .then(json => {
    const total = json.results[0].members
      .map(m => m.votes_with_party_pct);

    const republicans = json.results[0].members
      .filter(m => m.party === "R")
      .map(m => m.votes_with_party_pct);

    const democrats = json.results[0].members
      .filter(m => m.party === "D")
      .map(m => m.votes_with_party_pct);

    update(total,'t');

    const options = document.getElementsByName('dataset');

    for(let i = 0; i < options.length; i++) {
      options[i].addEventListener('change', function() {
        let datasetChoice = this.value;
        switch(datasetChoice) {
          case 'total':
            update(total, 't');
            break;
          case 'democrats':
            update(democrats, 'd');
            break;
          case 'republicans':
            update(republicans, 'r');
            break;
          default:
        }
      })
    }
  })
