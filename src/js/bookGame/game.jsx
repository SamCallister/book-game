import React, { useState } from 'react';
import QuestionSvg from './components/QuestionSvg.jsx';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";

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
		flexGrow: 0.4,
		maxWidth: "65%"
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
	buttomAnotherGameButton: { width: "100%" },
	arrowsContainer: {
		display: "flex",
		justifyContent: "center"
	},
	hide: { visibility: "hidden" }
}));



function Game(props) {
	const s = styles();
	const params = useParams();
	const { games } = props;
	const gameData = games[params.gameIndex];
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answeredUntil, setAnsweredUntil] = useState(0);
	const [numCorrect, setNumCorrect] = React.useState(0);
	const [gameOver, setGameOver] = React.useState(false);
	const [answers, setAnswers] = React.useState({});
	const [showQuestions, setShowQuestions] = React.useState(false);

	const numQuestions = gameData.questions.length;


	const questionAnswered = (wasCorrect, answer) => {
		setAnsweredUntil(currentQuestionIndex + 1);

		if (wasCorrect) {
			setNumCorrect(numCorrect + 1);
		}

		const newAnswer = {};
		newAnswer[currentQuestionIndex] = answer;

		setAnswers({ ...answers, ...newAnswer });
	}


	const nextQuestion = () => {

		// handle if on final question here
		const nextQuestionIndex = currentQuestionIndex + 1;
		if (nextQuestionIndex == numQuestions) {
			setGameOver(true);
		} else {
			setCurrentQuestionIndex(nextQuestionIndex);
		}

	};

	const prevQuestion = () => {
		const prevQuestionIndex = currentQuestionIndex - 1;

		setCurrentQuestionIndex(prevQuestionIndex);
	};


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
						<span className={currentQuestionIndex != 0 ? '' : s.hide}>
							<IconButton aria-label="back"
								onClick={prevQuestion}>
								<ArrowBack />
							</IconButton>
						</span>
						<Typography display="inline">{currentQuestionIndex + 1} of {numQuestions}</Typography>
						<span className={answeredUntil != currentQuestionIndex ? '' : s.hide}>
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
								<Link to="/">Select another quiz</Link>
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
				<Button className={s.buttomAnotherGameButton} variant="outlined">Another Game</Button>
				</div>

			</div>)}
		</Container>);
}

export default Game;