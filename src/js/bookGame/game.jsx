import React, { useState, useEffect } from 'react';
import useStateRef from './useStateRefHook.js';
import QuestionSvg from './components/QuestionSvg.jsx';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import { useParams } from "react-router-dom";
import { includes } from 'lodash';

import IconButton from '@material-ui/core/IconButton';
import ArrowForward from '@material-ui/icons/ArrowForward';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Typography from '@material-ui/core/Typography';
import GameOver from './gameOver.jsx';


const styles = makeStyles(() => ({
	container: {
		display: "flex",
		justifyContent: "center"
	},
	content: {
		flexBasis: "90%",
		maxWidth: "620px"
	},
	arrowsContainer: {
		display: "flex",
		justifyContent: "center",
		marginTop: "-16px"
	},
	hide: { visibility: "hidden" }
}));


function Game(props) {
	const s = styles();
	const params = useParams();
	const { games } = props;
	const gameData = games[params.gameIndex];
	const [currentQuestionIndex, setCurrentQuestionIndex, currentQuestionIndexRef] = useStateRef(0);
	const [answeredUntil, setAnsweredUntil, answeredUntilRef] = useStateRef(0);
	const [numCorrect, setNumCorrect] = useState(0);
	const [gameOver, setGameOver] = useState(false);
	const [answers, setAnswers] = useState({});

	const numQuestions = gameData.questions.length;


	const questionAnswered = (wasCorrect, answer) => {
		setAnsweredUntil(currentQuestionIndexRef.current + 1);

		if (wasCorrect) {
			setNumCorrect(numCorrect + 1);
		}

		const newAnswer = {};
		newAnswer[currentQuestionIndex] = answer;

		setAnswers({ ...answers, ...newAnswer });
	}


	const nextQuestion = () => {
		// handle if on final question here
		const nextQuestionIndex = currentQuestionIndexRef.current + 1;
		if (nextQuestionIndex == numQuestions) {
			setGameOver(true);
		} else {
			setCurrentQuestionIndex(nextQuestionIndex);
		}

	};

	const prevQuestion = () => {
		const prevQuestionIndex = currentQuestionIndexRef.current - 1;

		setCurrentQuestionIndex(prevQuestionIndex);
	};

	const onFirstQuestionRef = () => currentQuestionIndexRef.current === 0;
	const onFirstQuestion = currentQuestionIndex === 0;
	const answeredCurrentQuestionRef = () => answeredUntilRef.current > currentQuestionIndexRef.current;
	const answeredCurrentQuestion = answeredUntil > currentQuestionIndex;

	const handleKeyDownEvent = ({ keyCode }) => {
		if (includes([39, 13], keyCode) && answeredCurrentQuestionRef()) {
			nextQuestion();
		} else if (keyCode === 37 && !onFirstQuestionRef()) {
			// go back a question
			prevQuestion();
		}
	};

	useEffect(() => {
		window.addEventListener("keydown", handleKeyDownEvent)

		return () => {
			window.removeEventListener("keydown", handleKeyDownEvent);
		}
	}, []);


	return (
		<Container maxWidth="lg" className={s.container}>
			{!gameOver && (<div className={s.content}>
				<QuestionSvg
					key={currentQuestionIndex + 100}
					data={gameData.questions[currentQuestionIndex]}
					questionAnswered={questionAnswered}
					providedAnswer={answers[currentQuestionIndex]}
				/>
				<div className={s.arrowsContainer}>
					<div>
						<span className={!onFirstQuestion ? '' : s.hide}>
							<IconButton aria-label="back"
								onClick={prevQuestion}>
								<ArrowBack />
							</IconButton>
						</span>
						<Typography display="inline">{currentQuestionIndex + 1} of {numQuestions}</Typography>
						<span className={answeredCurrentQuestion ? '' : s.hide}>
							<IconButton aria-label="next"
								onClick={nextQuestion}>
								<ArrowForward />
							</IconButton>
						</span>
					</div>
				</div>
			</div>)}
			{gameOver && <GameOver
				gameData={gameData}
				questionAnswered={questionAnswered}
				answers={answers}
				numCorrect={numCorrect}
				numQuestions={numQuestions}
			></GameOver>}
		</Container>);
}

export default Game;