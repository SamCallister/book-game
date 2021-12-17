import React from 'react';
import ReactDOM from 'react-dom';
import Game from './game.jsx';
import SelectGamePage from './selectGamePage.jsx';
import './styles.css';
import {
	BrowserRouter,
	Routes,
	Route
} from "react-router-dom";


fetch("data/games.json")
	.then((res) => {
		return res.json();
	})
	.then((jsonData) => {
		ReactDOM.render(
			<BrowserRouter>
				<Routes>
					<Route path="/" element={<SelectGamePage games={jsonData}></SelectGamePage>} />
					<Route path="/quiz" element={<Game games={jsonData} />}>
						<Route path=":gameIndex" element={<Game games={jsonData} />} />
					</Route>
				</Routes>
			</BrowserRouter>,
			document.getElementById('word-game')
		);
	});