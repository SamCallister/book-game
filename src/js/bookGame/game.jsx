import React, { useState, useEffect } from 'react';
import useStateRef from './useStateRefHook.js';
import QuestionSvg from './components/QuestionSvg.jsx';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { includes } from 'lodash';

import IconButton from '@material-ui/core/IconButton';
import ArrowForward from '@material-ui/icons/ArrowForward';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Typography from '@material-ui/core/Typography';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';


const styles = makeStyles((theme) => ({
	cardContainer: {
		marginTop: theme.spacing(4),
		marginBottom: theme.spacing(4),
		width: "60%"
	},
	cardOverride: {
		padding: theme.spacing(2)
	},
	container: {
		display: "flex",
		justifyContent: "center"
	},
	content: {
		flexGrow: 0.2
	},
	gameOverContainer: {
		display: "flex",
		justifyContent: "center"
	},
	gameOverTextContainer: {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		marginBottom: theme.spacing(2)
	},
	gameOverText: {
		fontSize: "xxx-large"
	},
	numCorrectText: {
		fontSize: "x-large"
	},
	gameOverButtonsContainer: {
		marginTop: theme.spacing(3)
	},
	gameOverShowQuestionsButton: {
		marginRight: theme.spacing(2)
	},
	arrowsContainer: {
		display: "flex",
		justifyContent: "center",
		marginTop: "-16px"
	},
	anotherQuizBottomContainer: {
		textAlign: "center",
		margin: theme.spacing(2)
	},
	selectAnotherQuizText: {
		fontSize: "large"
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
	const [numCorrect, setNumCorrect] = React.useState(0);
	const [gameOver, setGameOver] = React.useState(false);
	const [answers, setAnswers] = React.useState({});
	const [showQuestions, setShowQuestions] = React.useState(false);

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
			{gameOver && (<div className={s.content}>
				<div className={s.gameOverContainer}>
					<div className={s.cardContainer}>
						<Card variant="outlined" className={s.cardOverride}>
							<div className={s.gameOverTextContainer}>
								<div className={s.gameOverText}>Game over!</div>
								<div className={s.numCorrectText}>You got {numCorrect} of {numQuestions} correct.</div>
								<div className={s.gameOverButtonsContainer}>
									<Button variant="outlined"
										className={s.gameOverShowQuestionsButton}
										onClick={() => setShowQuestions(true)}>Show Questions</Button>
									<span className={s.selectAnotherQuizText}><Link to="/">Select another quiz</Link></span>
								</div>
							</div>
						</Card>
					</div>
				</div>
				<div className={showQuestions ? '' : s.hide}>
					{gameData.questions.map((d, i) => {
						return (<QuestionSvg
							key={i + 100}
							data={d}
							questionAnswered={questionAnswered}
							providedAnswer={answers[i]}
						/>)
					}
					)}
					<div className={`${s.anotherQuizBottomContainer} ${s.selectAnotherQuizText}`}>
						<Link to="/">Select another quiz</Link>
					</div>
				</div>

			</div>)}
		</Container>);
}

export default Game;