import * as d3 from 'd3';
import svgUtil from './svgUtil';

const yPadding = 0.4;
const f = d3.format(".2f");

function draw(svg, questionData, width, height) {
	const data = questionData.data;

	const y = d3.scaleBand(data.map((d, i) => i), [svgUtil.margin.top + 50, height]).padding(yPadding);

	svg.append("g")
		.attr("class", "ratio-title-text")
		.attr('transform', `translate(${width/2}, ${svgUtil.margin.top})`)
		.append('text')
		.text("Noun to Verb Ratios for Each Book")

	svg.append("g")
		.attr("class", "ratio-title-subtext")
		.attr('transform', `translate(${width/2}, ${svgUtil.margin.top + 20})`)
		.append('text')
		.text("(Number of nouns for each verb in the book)")


	svg.append("g")
		.selectAll("text")
		.data(data)
		.join("text")
		.attr("class", "ratio-text")
		.attr("fill", (d, i) => d3.schemeDark2[i])
		.attr("y",  (d,i) => y(i))
		.attr("x", width / 2)
		.text((d) => f(d));

	svg.append("ellipse")
		.attr("cx",  width / 2)
		.attr("cy", y(0) - 10)
		.attr("rx", 32)
		.attr("ry", 25)
		.attr("fill", "none")
		.attr("stroke", "black")
}

export default { draw };