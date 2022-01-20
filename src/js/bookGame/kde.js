import * as d3 from "d3";
import svgUtil from "./svgUtil";

const animationDuration = 2000;

function draw(svg, questionData, width, height, correctAnswerLineLabel) {
  const otherPoints = questionData.data.other_points;
  const answerPoints = questionData.data.answer_points;

  const combinedX = otherPoints
    .map((d) => d[0])
    .concat(answerPoints.map((d) => d[0]));
  const combinedY = otherPoints
    .map((d) => d[1])
    .concat(answerPoints.map((d) => d[1]));

  // setup xscale
  const x = d3
    .scaleLinear()
    .domain(d3.extent(combinedX))
    .nice()
    .range([svgUtil.margin.left, width - svgUtil.margin.right]);

  // setup yscale
  const y = d3
    .scaleLinear()
    .domain(d3.extent(combinedY))
    .nice()
    .range([height - svgUtil.margin.bottom, svgUtil.margin.top]);

  // add xaxis
  svgUtil.drawOrUpdateAxis(
    svg,
    "xaxis",
    `translate(0,${height - svgUtil.margin.bottom})`,
    d3.axisBottom(x).ticks(5),
    svgUtil.addXAxisLabel.bind(
      this,
      svg,
      "Sentence Length",
      svgUtil.margin,
      width,
      height
    )
  );

  // add yaxis
  svgUtil.drawOrUpdateAxis(
    svg,
    "yaxis",
    `translate(${svgUtil.margin.left},0)`,
    d3.axisLeft(y).tickFormat(d3.format("0.0%")).ticks(3),
    svgUtil.addYAxisLabel.bind(
      this,
      svg,
      "Percentage of Sentences",
      svgUtil.margin,
      height
    )
  );

  // line generator
  const lineGen = d3
    .line()
    .x(function (d) {
      return x(d[0]);
    })
    .y(function (d) {
      return y(d[1]);
    })
    .curve(d3.curveMonotoneX);

  svg.selectAll(".kde-line").remove();
  const paths = svg
    .append("g")
    .attr("class", "kde-line")
    .selectAll("path")
    .data([otherPoints, answerPoints])
    .enter()
    .append("path")
    .attr("stroke", (_, i) => d3.schemeCategory10[i])
    .attr("d", function (d) {
      return lineGen(d);
    });

  paths
    .attr("stroke-dasharray", (_, i) => {
      const totalLineLength = paths.nodes()[i].getTotalLength();
      return totalLineLength + " " + totalLineLength;
    })
    .attr("stroke-dashoffset", (_, i) => {
      return paths.nodes()[i].getTotalLength();
    })
    .transition(d3.easeLinear)
    .duration(animationDuration)
    .attr("stroke-dashoffset", 0);

  // add legend
  svg.selectAll(".legend-group").remove();
  const legendGroup = svg
    .append("g")
    .attr("class", "legend-group")
    .attr("transform", `translate(${x.range()[1] - 85},${y.range()[1] + 10})`);

  const enteredLegendGroup = legendGroup
    .selectAll("g")
    .data(["other three books", correctAnswerLineLabel])
    .enter();

  enteredLegendGroup
    .append("text")
    .attr("y", (_, i) => i * 15)
    .attr("fill", (_, i) => d3.schemeCategory10[i])
    .text((d) => d);

  enteredLegendGroup
    .append("line")
    .attr("x1", -10)
    .attr("x2", -2)
    .attr("y1", (_, i) => i * 14 - 3)
    .attr("y2", (_, i) => i * 14 - 3)
    .attr("stroke", (_, i) => d3.schemeCategory10[i]);
}

export default {
  draw,
};
