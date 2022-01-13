import React, { useState, useEffect } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import Button from '@material-ui/core/Button';
import { Link } from "react-router-dom";
import QuestionSvg from './components/QuestionSvg.jsx';


const styles = makeStyles((theme) => ({
	cardContainer: {
		marginTop: theme.spacing(4),
		marginBottom: theme.spacing(4),
		width: "70%",
		[theme.breakpoints.down('sm')]: {
			width: "100%"
		}
	},
	cardOverride: {
		padding: theme.spacing(2)
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
		marginTop: theme.spacing(3),
		display: "flex",
		[theme.breakpoints.down('sm')]: {
			flexDirection: "column",
			alignItems: "center"
		}
	},
	gameOverShowQuestionsButton: {
		[theme.breakpoints.up('sm')]: {
			marginRight: theme.spacing(2)
		},
		[theme.breakpoints.down('sm')]: {
			marginBottom: theme.spacing(2)
		}
	},
	anotherQuizBottomContainer: {
		textAlign: "center",
		margin: theme.spacing(2)
	},
	selectAnotherQuizText: {
		fontSize: "large"
	},
	selectAnotherByButton: { paddingTop: "4px" },
	hide: { visibility: "hidden" }
}));


export default function GameOver(props) {

	const s = styles();
	const { gameData, questionAnswered, answers, numCorrect, numQuestions } = props;
	const [showQuestions, setShowQuestions] = React.useState(false);

	return (<div className={s.content}>
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
							<div className={`${s.selectAnotherQuizText} ${s.selectAnotherByButton}`}><Link to="/">Select another quiz</Link></div>
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

	</div>)
}