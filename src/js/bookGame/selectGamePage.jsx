import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Link } from "react-router-dom";
import Typography from '@material-ui/core/Typography';

import Container from '@material-ui/core/Container';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { chunk, merge } from 'lodash';

const styles = makeStyles((theme) => ({
	container: {
	},
	explainerTextContainer: {
		textAlign: "center",
		margin: theme.spacing(2)
	},
	bookImage: {
		width: "200px",
		height: "280px",
		margin: theme.spacing(1)
	},
	bookImageSmall: {
		width: "140px",
		height: "204px",
		margin: theme.spacing(1)
	},
	linkContainer: {
		width: "100%",
		textAlign: "center",
		fontSize: "large"
	},
	twoQuizRow: {
		display: "flex",
		justifyContent: "space-around",
		marginBottom: theme.spacing(6)
	}
}));


function SelectGamePage(props) {
	const s = styles();
	const isDesktop = useMediaQuery('(min-width:930px)');
	const { games } = props;
	const indexedGames = games.map((d, i) => {
		return merge({ gameIndex: i }, d);

	});

	const quizGroups = chunk(
		indexedGames,
		isDesktop ? 2 : 1
	);

	const buildBookGameSelection = (singleGame) => {
		const { books, gameIndex } = singleGame;
		return (
			<div key={gameIndex}>
				<div>
					{books.slice(0, 2).map((d, i) => {
						return (<span key={i}>
							<img className={ isDesktop ? s.bookImage:s.bookImageSmall} src={`img/${d.img}`}></img>
						</span>)
					})}
				</div>
				<div>
					{books.slice(2, 4).map((d, i) => {
						return (<span key={i}>
							<img className={isDesktop ? s.bookImage:s.bookImageSmall} src={`img/${d.img}`}></img>
						</span>)
					})}
				</div>
				<div className={s.linkContainer}><Link to={`/quiz/${gameIndex}`}>Start Quiz</Link></div>
			</div>
		)
	};


	return (<Container maxWidth="lg" className={s.container}>
		<div className={s.explainerTextContainer}> <Typography variant="h4" gutterBottom component="div">
			Each question in a quiz is based on the four books above it.
		</Typography></div>
		{quizGroups.map((groupItems, groupIndex) => {
			return (<div key={groupIndex} className={s.twoQuizRow}>
				{groupItems.map((d) => {
					return buildBookGameSelection(d);
				})}
			</div>)

		})}



	</Container>)
}

export default SelectGamePage;