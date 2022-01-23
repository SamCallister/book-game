import React from "react";
import ReactDOM from "react-dom";
import Game from "./game";
import SelectGamePage from "./selectGamePage";
import "./styles.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameI } from "./GameInterfaces";

export function buildGame(baseUrlToAssets: string, divId: string) {
  fetch(`${baseUrlToAssets}/data/games.json`)
    .then((res) => {
      return res.json();
    })
    .then((jsonData: [GameI]) => {
      const currentPath = document.location.pathname;

      ReactDOM.render(
        <BrowserRouter>
          <Routes>
            <Route
              path={currentPath}
              element={
                <SelectGamePage
                  games={jsonData}
                  baseUrl={currentPath}
                  baseURLToAssets={baseUrlToAssets}
                ></SelectGamePage>
              }
            />
            <Route
              path={`${currentPath}/quiz`}
              element={<Game games={jsonData} gameSelectUrl={currentPath} />}
            >
              <Route
                path=":gameIndex"
                element={<Game games={jsonData} gameSelectUrl={currentPath} />}
              />
            </Route>
          </Routes>
        </BrowserRouter>,
        document.getElementById(divId)
      );
    });
}
