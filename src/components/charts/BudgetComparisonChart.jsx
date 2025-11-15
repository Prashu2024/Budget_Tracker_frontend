import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

function BudgetComparisonChart({ budget, expenses }) {
  const svgRef = useRef();

  useEffect(() => {
    if (!budget) return;

    const data = [
      { label: 'Budget', value: budget, color: '#3b82f6' },
      { label: 'Expenses', value: expenses, color: expenses > budget ? '#ef4444' : '#10b981' },
    ];

    const margin = { top: 20, right: 30, bottom: 40, left: 80 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3
      .select(svgRef.current)
      .attr('width', '100%')
      .attr('height', height + margin.top + margin.bottom)
      .attr('viewBox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // X scale
    const x = d3
      .scaleLinear()
      .domain([0, Math.max(budget, expenses) * 1.1])
      .range([0, width]);

    // Y scale
    const y = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([0, height])
      .padding(0.3);

    // Add X axis
    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(
        d3.axisBottom(x).tickFormat((d) =>
          d >= 1000 ? `₹${(d / 1000).toFixed(0)}k` : `₹${d}`
        )
      )
      .style('font-size', '12px');

    // Add Y axis
    svg
      .append('g')
      .call(d3.axisLeft(y))
      .style('font-size', '12px');

    // Add bars
    svg
      .selectAll('rect')
      .data(data)
      .enter()
      .append('rect')
      .attr('x', 0)
      .attr('y', (d) => y(d.label))
      .attr('width', 0)
      .attr('height', y.bandwidth())
      .attr('fill', (d) => d.color)
      .attr('rx', 6)
      .style('cursor', 'pointer')
      .on('mouseenter', function (event, d) {
        d3.select(this).attr('opacity', 0.8);
      })
      .on('mouseleave', function () {
        d3.select(this).attr('opacity', 1);
      })
      .transition()
      .duration(800)
      .attr('width', (d) => x(d.value));

    // Add value labels
    svg
      .selectAll('.value-label')
      .data(data)
      .enter()
      .append('text')
      .attr('class', 'value-label')
      .attr('x', 0)
      .attr('y', (d) => y(d.label) + y.bandwidth() / 2)
      .attr('dy', '.35em')
      .attr('dx', 10)
      .style('font-size', '14px')
      .style('font-weight', 'bold')
      .style('fill', 'white')
      .style('opacity', 0)
      .text((d) => `₹${d.value.toFixed(2)}`)
      .transition()
      .delay(400)
      .duration(400)
      .attr('x', (d) => x(d.value) - 10)
      .attr('text-anchor', 'end')
      .style('opacity', 1);

    // Add difference indicator
    if (expenses > budget) {
      const overbudget = expenses - budget;
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .style('font-size', '13px')
        .style('font-weight', 'bold')
        .style('fill', '#ef4444')
        .text(`Over budget by ₹${overbudget.toFixed(2)}`);
    } else {
      const remaining = budget - expenses;
      svg
        .append('text')
        .attr('x', width / 2)
        .attr('y', -5)
        .attr('text-anchor', 'middle')
        .style('font-size', '13px')
        .style('font-weight', 'bold')
        .style('fill', '#10b981')
        .text(`₹${remaining.toFixed(2)} remaining`);
    }

  }, [budget, expenses]);

  return <svg ref={svgRef}></svg>;
}

export default BudgetComparisonChart;