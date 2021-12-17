import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from "react-router-dom";

import Container from '@material-ui/core/Container';
import { chunk } from 'lodash';

const styles = makeStyles((theme) => ({
	container: {
	},
	bookImage: {
		width: "200px",
		height: "280px",
		margin: theme.spacing(1)
	},
	linkContainer: {
		width: "100%",
		textAlign: "center"
	},
	twoQuizRow: {
		display: "flex",
		justifyContent: "space-around"
	}
}));


function SelectGamePage(props) {
	const s = styles();
	const { games } = props;
	
	const quizGroups = chunk(games, 2);

	const buildBookGameSelection = (singleGame, gameIndex) => {
		const { books } = singleGame;
		return (
			<div key={gameIndex}>
				<div>
					{books.slice(0, 2).map((d, i) => {
						return (<span key={i}>
							<img className={s.bookImage} src={`img/${d.img}`}></img>
						</span>)
					})}
				</div>
				<div>
					{books.slice(2, 4).map((d, i) => {
						return (<span key={i}>
							<img className={s.bookImage} src={`img/${d.img}`}></img>
						</span>)
					})}
				</div>
				<div className={s.linkContainer}><Link to={`/quiz/${gameIndex}`}>Start Quiz</Link></div>
			</div>
		)
	};


	return (<Container maxWidth="lg" className={s.container}>
		<div>Choose a quiz to start. Every question in the quiz will be based on the four books shown. Try to pick a grouping of books you know something about!</div>
		{quizGroups.map((groupItems, groupIndex) => {
			return (<div key={groupIndex} className={s.twoQuizRow}>
				{groupItems.map((d, groupItemIndex) => {
					return buildBookGameSelection(d, groupIndex + groupItemIndex);
				})}
			</div>)

		})}



	</Container>)
}

export default SelectGamePage;