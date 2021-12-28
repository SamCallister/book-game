import React, { useRef, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import wordCloud from './../wordCloud.js';
import kde from './../kde.js';
import numberRatios from './../numberRatios.js';
import horizontalBar from './../horizontalBar.js';
import Question from './Question.jsx';
import * as d3 from 'd3';


const width = 500;
const height = 300;

const styles = makeStyles(() => ({
	outerSvgContainer: {
		maxHeight: "450px"
	}
}));

function QuestionSvg(props) {
	const { data, questionAnswered, providedAnswer } = props;
	const s = styles();
	const d3Container = useRef(null);

	const drawSvg = () => {
		const questionType = data.meta.type;
		const questionDisplay = data.meta.display;
		
		if (questionDisplay == 'cloud' || questionType == 'tf-idf') {
			wordCloud.draw(
				d3.select(d3Container.current),
				data,
				width,
				height
			);
		}
		else if (questionType == 'sent-length') {
			kde.draw(
				d3.select(d3Container.current),
				data,
				width,
				height
			);
		}
		else if (questionDisplay == 'bar' || questionType == 'unique-most-common') {
			horizontalBar.draw(
				d3.select(d3Container.current),
				data,
				width,
				height
			);
		}
		else if (questionType == 'unique-longest') {
			wordCloud.drawPlain(
				d3.select(d3Container.current),
				data,
				width,
				height
			);
		}
		else if (questionDisplay == 'number-ratio') {
			numberRatios.draw(
				d3.select(d3Container.current),
				data,
				width,
				height 
			)
		}
		
	}

	useEffect(() => {
		if (d3Container.current) {
			// draw the svg
			drawSvg();
		}
	}, [d3Container])

	return (
		<div>
			<div className={s.outerSvgContainer}>
				<svg ref={d3Container}
					preserveAspectRatio="xMinYMin meet"
					viewBox={`0 0 ${width} ${height}`}
					className={s.svgResponsive}
				>
				</svg>
			</div>
			<Question data={data}
				questionAnswered={questionAnswered}
				providedAnswer={providedAnswer}></Question>
		</div>)
}

export default QuestionSvg;