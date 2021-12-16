import React, { useState } from 'react';
import QuestionSvg from './components/QuestionSvg.jsx';
import Container from '@material-ui/core/Container';
import { makeStyles } from '@material-ui/core/styles';

import IconButton from '@material-ui/core/IconButton';
import ArrowForward from '@material-ui/icons/ArrowForward';
import ArrowBack from '@material-ui/icons/ArrowBack';
import Typography from '@material-ui/core/Typography';


const styles = makeStyles({
	container: {
		display: "flex",
		justifyContent: "center"
	},
	content: {
		flexGrow: 0.4,
		maxWidth: "65%"
	},
	svgResponsive: {
	},
	outerSvgContainer: {position: "relative"},
	arrowsContainer: {
		display:"flex",
		justifyContent: "center"
	},
	hide: { visibility: "hidden"}
});



function Game(props) {
	const s = styles();
	const { gameData } = props;
	const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
	const [answeredUntil, setAnsweredUntil] = useState(0);
	const [numCorrect, setNumCorrect] = React.useState(0);
	const [gameOver, setGameOver] = React.useState(false);
	const [answers, setAnswers] = React.useState({});

	const numQuestions = gameData.questions.length;
	

	const questionAnswered = (wasCorrect, answer) => {
		setAnsweredUntil(currentQuestionIndex + 1);

		if(wasCorrect) {
			setNumCorrect(numCorrect + 1);
		}

		const newAnswer = {};
		newAnswer[currentQuestionIndex] = answer;

		setAnswers({...answers, ...newAnswer});
	}


	const nextQuestion = () => {

		// handle if on final question here
		const nextQuestionIndex = currentQuestionIndex + 1;
		if(nextQuestionIndex == numQuestions) {
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
						<span className={ currentQuestionIndex != 0 ? '': s.hide}>
						<IconButton aria-label="back"
									onClick={prevQuestion}>
								<ArrowBack />
						</IconButton>
						</span>
						<Typography display="inline">{currentQuestionIndex + 1} of {numQuestions}</Typography>
						 <span className={ answeredUntil != currentQuestionIndex ? '': s.hide}>
							<IconButton aria-label="next"
										onClick={nextQuestion}>
								<ArrowForward />
							</IconButton>
						</span>
					</div>
				</div>
			</div>)}
			{gameOver && (<div className={s.content}>
				The game is over! You got {numCorrect} of {numQuestions} correct.
				{gameData.questions.map((d, i) => {
					return (<QuestionSvg
						key={i + 100}
						data={d}
						questionAnswered={questionAnswered}
						providedAnswer={answers[i]}
					/>)
				})}
			</div>)}
		</Container>);
}

export default Game;