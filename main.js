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

svg.append("text")
  .attr("class", "x label")
  .attr("text-anchor", "end")
  .attr("x", graphWidth)
  .attr("y", graphHeight + margin.bottom/1.5)
  .text("Votes with party (%)");

svg.append("text")
    .attr("class", "y label")
    .attr("text-anchor", "end")
    .attr("y", margin.left/2)
    .attr("x", 0-graphHeight/3)
    .attr("dy", "10px")
    .attr("transform", "rotate(-90)")
    .text("Congress members (count)");

// scales
const x = d3.scaleLinear()
  .range([0, graphWidth]);

const y = d3.scaleLinear()
  .range([graphHeight, 0]);


// create the axes
const xAxis = d3.axisBottom(x);
const yAxis = d3.axisLeft(y);



// ------ update function -------
const update = (total, data, party) => {

  let fillColor = '';
  if(party === 't') fillColor = 'grey';
  if(party === 'd') fillColor = 'blue';
  if(party === 'r') fillColor = 'red';

  var count = 20;
  x.domain(d3.extent(total))
    .nice(count);

  const histogram = d3.histogram()
    .domain(x.domain())
    .thresholds(x.ticks(count));

  const totalBins = histogram(total);
  const bins = histogram(data);

  y.domain([0, d3.max(totalBins.map(bin => bin.length))]);

  const rects = graph.selectAll('rect')
    .data(bins);

  rects.exit().remove();
  const t = d3.transition().duration(1000)
  rects.attr("x", d => x(d.x0)+1)
    .attr("width", (d => d.length == 0 ? 0 : (x(d.x1) - x(d.x0))-1))
    .attr("y", graphHeight)
    .attr("height", 0)
    .style("fill", fillColor)
    .transition(t)
      .attr('y', d => y(d.length))
      .attr('height', d => graphHeight - y(d.length))


  rects.enter()
    .append("rect")
      .attr("x", d => x(d.x0)+1)
      .attr("width", (d => d.length == 0 ? 0 : (x(d.x1) - x(d.x0))-1))
      .attr("y", graphHeight)
      .attr("height", 0)
      .style("fill", fillColor)
      .transition(t)
        .attr('y', d => y(d.length))
        .attr('height', d => graphHeight - y(d.length))

  xAxis.ticks(5)
    .tickFormat(d => d + '%')


  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);
}

const propublicaURL = "https://api.propublica.org/congress/v1/113/house/members.json";
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


    update(total, total, 't');

    const options = document.getElementsByName('dataset');

    for(let i = 0; i < options.length; i++) {
      options[i].addEventListener('change', function() {
        let datasetChoice = this.value;
        switch(datasetChoice) {
          case 'total':
            update(total, total, 't');
            break;
          case 'democrats':
            update(total, democrats, 'd');
            break;
          case 'republicans':
            update(total, republicans, 'r');
            break;
          default:
        }
      })
    }
  })

// const heightTween = (d) => {
//   let i = d3.interpolate(0, y.height);
//
//   return function(t) {
//     return i(t)
//   }
// }
