import * as d3 from "d3";

const margin = {
  top: 40,
  right: 100,
  bottom: 60,
  left: 100,
};

const animationDuration = 500;

interface AddLabelFunc {
  (): void;
}

interface Margin {
  top: number;
  left: number;
  right: number;
  bottom: number;
}

function drawOrUpdateAxis(
  // eslint-disable-next-line
  svg: d3.Selection<any, unknown, null, undefined>,
  className: string,
  translateValue: string,
  // eslint-disable-next-line
  callable: Function,
  addLabel: AddLabelFunc
) {
  const selection = svg.select(`.${className}`);

  if (selection.empty()) {
    svg
      .append("g")
      .attr("class", className)
      .attr("transform", translateValue)
      // @ts-expect-error: Couldn't figure out right time from D3 here :(
      .call(callable);

    addLabel();
  } else {
    // @ts-expect-error: Couldn't figure out right time from D3 here :(
    selection.transition().duration(animationDuration).call(callable);
  }
}

function addXAxisLabel(
  // eslint-disable-next-line
  svg: d3.Selection<any, unknown, null, undefined>,
  label: string,
  margin: Margin,
  width: number,
  height: number
) {
  const x = margin.left + (width - margin.left - margin.right) / 2;
  svg
    .append("text")
    .attr(
      "transform",
      "translate(" + x + " ," + (height - margin.bottom + 37) + ")"
    )
    .attr("class", "xaxis-text")
    .text(label);
}

function addYAxisLabel(
  // eslint-disable-next-line
  svg: d3.Selection<any, unknown, null, undefined>,
  label: string,
  margin: Margin,
  height: number
) {
  const x = margin.left / 2 - 10;
  const y = margin.top + (height - margin.top - margin.bottom) / 2;
  svg
    .append("text")
    .attr("transform", `rotate(-90, ${x}, ${y})`)
    .attr("y", y)
    .attr("x", x)
    .attr("dy", "1em")
    .attr("class", "yaxis-text")
    .text(label);
}

export default {
  margin,
  drawOrUpdateAxis,
  addXAxisLabel,
  addYAxisLabel,
};
