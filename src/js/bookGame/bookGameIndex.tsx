import React from "react";
import ReactDOM from "react-dom";
import Game from "./game";
import SelectGamePage from "./selectGamePage";
import "./styles.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GameI } from "./GameInterfaces";
import { createTheme, MuiThemeProvider } from "@material-ui/core/styles";

const theme = createTheme({
  typography: {
    button: {
      textTransform: "none",
    },
  },
});

export function buildGame(baseUrlToAssets: string, divId: string) {
  fetch(`${baseUrlToAssets}/data/games.json`)
    .then((res) => {
      return res.json();
    })
    .then((jsonData: [GameI]) => {
      const currentPath = document.location.pathname;

      ReactDOM.render(
        <MuiThemeProvider theme={theme}>
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
                  element={
                    <Game games={jsonData} gameSelectUrl={currentPath} />
                  }
                />
              </Route>
            </Routes>
          </BrowserRouter>
        </MuiThemeProvider>,
        document.getElementById(divId)
      );
    });
}
