import React from 'react';
import ReactDOM from 'react-dom';
import Game from './game.jsx';
import './styles.css';


fetch("data/questions.json")
	.then((res) => {
		return res.json();
	})
	.then((jsonData) => {
		ReactDOM.render(
				<Game gameData={jsonData}></Game>
			,
			document.getElementById('word-game')
		);
	});