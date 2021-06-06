
const DATASETS = {
  videogames: {
    TITLE: 'Video Game Sales',
    DESCRIPTION: 'Top 100 Most Sold Video Games Grouped by Platform',
    FILE_PATH:
      'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/video-game-sales-data.json'
  },
  movies: {
    TITLE: 'Movie Sales',
    DESCRIPTION: 'Top 100 Highest Grossing Movies Grouped By Genre',
    FILE_PATH:
      'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/movie-data.json'
  },
  kickstarter: {
    TITLE: 'Kickstarter Pledges',
    DESCRIPTION:
      'Top 100 Most Pledged Kickstarter Campaigns Grouped By Category',
    FILE_PATH:
      'https://cdn.rawgit.com/freeCodeCamp/testable-projects-fcc/a80ce8f9/src/data/tree_map/kickstarter-funding-data.json'
  }
};

const urlParams = new URLSearchParams(window.location.search),
DEFAULT_DATASET = 'videogames',
DATASET = DATASETS[urlParams.get('data') || DEFAULT_DATASET];

document.getElementById('title').innerHTML = DATASET.TITLE;
document.getElementById('description').innerHTML = DATASET.DESCRIPTION;

const body = d3.select('body');

const tooltip = body
  .append('div')
  .attr('class', 'tooltip')
  .attr('id', 'tooltip')
  .style('opacity', 0);

const svg = d3.select('#tree-map'),
  width = +svg.attr('width'),
  height = +svg.attr('height');

const fader = color => d3.interpolateRgb(color, '#fff')(0.2),
color = d3.scaleOrdinal(d3.schemeCategory20.map(fader)),
treemap = d3.treemap().size([width, height]).paddingInner(1);

const sumBySize = d => d.value;

d3.json(DATASET.FILE_PATH, function (error, data) {
    if (error) throw error;
    
    const root = d3
      .hierarchy(data)
      .eachBefore(d => d.data.id = (d.parent ? d.parent.data.id + '.' : '') + d.data.name)
      .sum(sumBySize)
      .sort((a, b) => b.height - a.height || b.value - a.value);
  
    treemap(root);
  
    const cell = svg
      .selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('class', 'group')
      .attr('transform', d => `translate(${d.x0}, ${d.y0})`);
  
    cell
      .append('rect')
      .attr('id', d => d.data.id)
      .attr('class', 'tile')
      .attr('width', d => d.x1 - d.x0)
      .attr('height', d => d.y1 - d.y0)
      .attr('data-name', d => d.data.name)
      .attr('data-category', d => d.data.category)
      .attr('data-value', d => d.data.value)
      .attr('fill', d => color(d.data.category))
      .on('mousemove', d => {
        tooltip.style('opacity', 0.9);
        tooltip
          .html(
            'Name: ' +
              d.data.name +
              '<br>Category: ' +
              d.data.category +
              '<br>Value: ' +
              d.data.value
          )
          .attr('data-value', d.data.value)
          .style('left', d3.event.pageX + 10 + 'px')
          .style('top', d3.event.pageY - 28 + 'px');
      })
      .on('mouseout', () => tooltip.style('opacity', 0));
  
    cell
      .append('text')
      .attr('class', 'tile-text')
      .selectAll('tspan')
      .data(d => d.data.name.split(/(?=[A-Z][^A-Z])/g))
      .enter()
      .append('tspan')
      .attr('x', 4)
      .attr('y', (d, i) =>  13 + i * 10)
      .text(d  => d);
  
    let categories = root.leaves().map(nodes => nodes.data.category);
    categories = categories.filter((category, index, self) => self.indexOf(category) === index);
    const legend = d3.select('#legend');
    const legendWidth = +legend.attr('width');
    const LEGEND_OFFSET = 10;
    const LEGEND_RECT_SIZE = 15;
    const LEGEND_H_SPACING = 150;
    const LEGEND_V_SPACING = 10;
    const LEGEND_TEXT_X_OFFSET = 3;
    const LEGEND_TEXT_Y_OFFSET = -2;
    var legendElemsPerRow = Math.floor(legendWidth / LEGEND_H_SPACING);
  
    const legendElem = legend
      .append('g')
      .attr('transform', 'translate(60,' + LEGEND_OFFSET + ')')
      .selectAll('g')
      .data(categories)
      .enter()
      .append('g')
      .attr('transform', (d, i) => {
        return `
        translate(${(i % legendElemsPerRow) * LEGEND_H_SPACING}, ${Math.floor(i / legendElemsPerRow) * LEGEND_RECT_SIZE +
            LEGEND_V_SPACING * Math.floor(i / legendElemsPerRow)})
        ` 
      });
  
    legendElem
      .append('rect')
      .attr('width', LEGEND_RECT_SIZE)
      .attr('height', LEGEND_RECT_SIZE)
      .attr('class', 'legend-item')
      .attr('fill', d => color(d));
  
    legendElem
      .append('text')
      .attr('x', LEGEND_RECT_SIZE + LEGEND_TEXT_X_OFFSET)
      .attr('y', LEGEND_RECT_SIZE + LEGEND_TEXT_Y_OFFSET)
      .text(d =>  d);
  });