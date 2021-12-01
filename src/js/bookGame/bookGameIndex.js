import React from 'react';
import ReactDOM from 'react-dom';
import Game from './game.jsx';
import { createTheme, ThemeProvider } from '@material-ui/core/styles';
import './styles.css';



fetch("data/questions.json")
	.then((res) => {
		return res.json();
	})
	.then((jsonData) => {
		// jsonData.questions = [jsonData.questions[3]];
		console.log(jsonData)
		ReactDOM.render(
				<Game gameData={jsonData}></Game>
			,
			document.getElementById('word-game')
		);
	});