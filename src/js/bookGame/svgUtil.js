const margin = {
	top: 60,
	right: 60,
	bottom: 60,
	left: 60
};

function drawOrUpdateAxis(svg, className, translateValue, callable, addLabel) {
	const selection = svg.select(`.${className}`);

	if (selection.empty()) {
		svg.append("g")
			.attr("class", className)
			.attr("transform", translateValue)
			.call(callable);

		addLabel();
	} else {
		selection.transition().duration(animationDuration).call(callable);
	}

}

function addXAxisLabel(svg, label, margin, width, height) {
	const x = margin.left + ((width - margin.left - margin.right) / 2)
	svg.append("text")
		.attr("transform",
			"translate(" + x + " ," +
			(height - margin.bottom + 37) + ")")
		.attr("class", "xaxis-text")
		.text(label);
}

function addYAxisLabel(svg, label, margin, height) {
	const x = 2;
	const y = margin.top + ((height - margin.top - margin.bottom) / 2)
	svg.append("text")
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
	addYAxisLabel
}