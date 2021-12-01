import React, { useRef, useEffect, useState } from 'react';
import Question from './components/Question.jsx';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import wordCloud from './wordCloud.js';
import kde from './kde.js';
import numberRatios from './numberRatios.js';
import horizontalBar from './horizontalBar.js';
import * as d3 from 'd3';
import IconButton from '@material-ui/core/IconButton';
import ArrowForward from '@material-ui/icons/ArrowForward';
import ArrowBack from '@material-ui/icons/ArrowBack';


const styles = makeStyles({
	container: {
		display: "flex",
		justifyContent: "center"
	},
	content: {
		flexGrow: 0.4
	},
	svgResponsive: {
	},
	outerSvgContainer: {position: "relative"},
	arrowsContainer: {
		display:"flex",
		justifyContent: "center"}
});

const width = 500;
const height = 300;

function Game(props) {
	const s = styles();
	const { gameData } = props;
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answeredUntil, setAnsweredUntil] = useState(0);
	const [numCorrect, setNumCorrect] = React.useState(0);
	const [gameOver, setGameOver] = React.useState(false);
	const [answers, setAnswers] = React.useState({});

	const numQuestions = gameData.questions.length;
	const d3Container = useRef(null);

	const questionAnswered = (wasCorrect, answer) => {
		setAnsweredUntil(currentQuestionIndex + 1);

		if(wasCorrect) {
			setNumCorrect(numCorrect + 1);
		}

		const newAnswer = {};
		newAnswer[currentQuestionIndex] = answer;

		setAnswers({...answers, ...newAnswer});
	}

	const drawSvg = (currentQuestionIndex) => {
		const questionData = gameData.questions[currentQuestionIndex];
		const questionType = questionData.meta.type;
		const questionDisplay = questionData.meta.display;
		
		if (questionDisplay == 'cloud' || questionType == 'tf-idf') {
			wordCloud.draw(
				d3.select(d3Container.current),
				questionData,
				width,
				height
			);
		}
		else if (questionType == 'sent-length') {
			kde.draw(
				d3.select(d3Container.current),
				questionData,
				width,
				height
			);
		}
		else if (questionDisplay == 'bar' || questionType == 'unique-most-common') {
			horizontalBar.draw(
				d3.select(d3Container.current),
				questionData,
				width,
				height
			);
		}
		else if (questionType == 'unique-longest') {
			wordCloud.drawPlain(
				d3.select(d3Container.current),
				questionData,
				width,
				height
			);
		}
		else if (questionDisplay == 'number-ratio') {
			numberRatios.draw(
				d3.select(d3Container.current),
				questionData,
				width,
				height 
			)
		}
		
	}

	const nextQuestion = () => {
		// clear svg
		d3.select(d3Container.current).selectAll("*").remove();

		// handle if on final question here
		const nextQuestionIndex = currentQuestionIndex + 1;
		if(nextQuestionIndex == numQuestions) {
			setGameOver(true);
		} else {
			setCurrentQuestionIndex(nextQuestionIndex);
			drawSvg(nextQuestionIndex);
		}
		
	};

	const prevQuestion = () => {
		// clear svg
		d3.select(d3Container.current).selectAll("*").remove();
		const prevQuestionIndex = currentQuestionIndex - 1;

		setCurrentQuestionIndex(prevQuestionIndex);
		drawSvg(prevQuestionIndex);
		
	};


	useEffect(() => {
		if (d3Container.current) {
			// draw the svg
			drawSvg(currentQuestionIndex);
		}
	}, [d3Container])


	console.log(answers)
	console.log(gameData.questions[currentQuestionIndex])
	return (
		<Container maxWidth="lg" className={s.container}>
			{!gameOver && (<div className={s.content}>
				<div className={s.outerSvgContainer}>
					<svg ref={d3Container}
							preserveAspectRatio="xMinYMin meet"
							viewBox={`0 0 ${width} ${height}`}
							className={s.svgResponsive}
						>
						</svg>
				</div>
				<Question key={currentQuestionIndex + 100} data={gameData.questions[currentQuestionIndex]}
				questionAnswered={questionAnswered}
				providedAnswer={answers[currentQuestionIndex]}></Question>
				<div className={s.arrowsContainer}>
					<div>
						{currentQuestionIndex != 0 && (<span>
								<IconButton aria-label="back"
											onClick={prevQuestion}>
									<ArrowBack />
								</IconButton>
							</span>)}
						<span>{currentQuestionIndex + 1} of {numQuestions}</span>
						{answeredUntil != currentQuestionIndex && (<span>
							<IconButton aria-label="next"
										onClick={nextQuestion}>
								<ArrowForward />
							</IconButton>
						</span>)}
					</div>
				</div>
			</div>)}
			{gameOver && (<div>
				The game is over! You got {numCorrect} of {numQuestions} correct.
			</div>)}
		</Container>);
}

export default Game;