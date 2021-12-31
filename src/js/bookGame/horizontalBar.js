import * as d3 from 'd3';
import svgUtil from './svgUtil';

const yPadding = 0.1;
const animationDuration = 1000;

function draw(svg, questionData, width, height) {

	//sort bars based on value
	const data = questionData.data.sort(function (a, b) {
		return d3.descending(a[1], b[1]);
	});

	const numericValues = data.map((d) => d[1]);
	const ordinalValues = data.map((d) => d[0])


	const x = d3.scaleLinear()
		.domain([0, d3.max(numericValues)])
		.range([svgUtil.margin.left, width - svgUtil.margin.right]);


	const y = d3.scaleBand(ordinalValues, [svgUtil.margin.top, height - svgUtil.margin.bottom]).padding(yPadding);

	svg.append("g")
		.attr("fill", "lightsteelblue")
		.selectAll("rect")
		.data(data)
		.join("rect")
		.attr("x", x(0))
		.attr("y", d => y(d[0]))
		.attr("width", 0)
		.attr("height", y.bandwidth())
		.transition(d3.easeLinear)
		.duration(animationDuration)
		.attr("width", d => x(d[1]) - x(0));

	svgUtil.drawOrUpdateAxis(
		svg,
		"xaxis",
		`translate(0,${height - svgUtil.margin.bottom})`,
		d3.axisBottom(x).ticks(7),
		svgUtil.addXAxisLabel.bind(this, svg, "Number of Occurences", svgUtil.margin, width, height)
	);

	svgUtil.drawOrUpdateAxis(
		svg,
		"yaxis",
		`translate(${svgUtil.margin.left},0)`,
		d3.axisLeft(y),
		svgUtil.addYAxisLabel.bind(this, svg, "", svgUtil.margin, height)
	);


}

export default { draw };