import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function PieChart({ data, colors }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!data || data.length === 0) return;

    const width = 400;
    const height = 300;
    const radius = Math.min(width, height) / 2 - 40;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', '100%')
      .attr('height', height)
      .attr('viewBox', `0 0 ${width} ${height}`)
      .append('g')
      .attr('transform', `translate(${width / 2}, ${height / 2})`);

    const color = d3.scaleOrdinal().range(colors);

    const pie = d3.pie().value((d) => d.value);

    const arc = d3
      .arc()
      .innerRadius(0)
      .outerRadius(radius);

    const arcHover = d3
      .arc()
      .innerRadius(0)
      .outerRadius(radius + 10);

    const arcs = svg
      .selectAll('arc')
      .data(pie(data))
      .enter()
      .append('g')
      .attr('class', 'arc');

    arcs
      .append('path')
      .attr('d', arc)
      .attr('fill', (d, i) => color(i))
      .attr('stroke', 'white')
      .attr('stroke-width', 2)
      .style('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arcHover);
      })
      .on('mouseleave', function (event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('d', arc);
      });

    // Add labels
    arcs
      .append('text')
      .attr('transform', (d) => `translate(${arc.centroid(d)})`)
      .attr('text-anchor', 'middle')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .attr('fill', 'white')
      .style('pointer-events', 'none')
      .text((d) => {
        const percent = ((d.data.value / d3.sum(data, (d) => d.value)) * 100).toFixed(1);
        return percent > 5 ? `${percent}%` : '';
      });

    // Add legend
    const legend = svg
      .selectAll('.legend')
      .data(data)
      .enter()
      .append('g')
      .attr('class', 'legend')
      .attr('transform', (d, i) => `translate(${radius + 20}, ${i * 25 - (data.length * 25) / 2})`);

    legend
      .append('rect')
      .attr('width', 18)
      .attr('height', 18)
      .attr('fill', (d, i) => color(i))
      .attr('rx', 3);

    legend
      .append('text')
      .attr('x', 24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .attr('font-size', '12px')
      .attr('fill', '#374151')
      .text((d) => {
        const label = d.label.length > 15 ? d.label.substring(0, 15) + '...' : d.label;
        return label;
      });

  }, [data, colors]);

  return <svg ref={svgRef}></svg>;
}

export default PieChart;