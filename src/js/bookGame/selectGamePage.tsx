import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Link, useNavigate } from "react-router-dom";
import Typography from "@material-ui/core/Typography";

import Container from "@material-ui/core/Container";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { chunk, merge } from "lodash";
import { GameI } from "./GameInterfaces";

const styles = makeStyles((theme) => ({
  container: {},
  explainerTextContainer: {
    textAlign: "center",
    margin: theme.spacing(2),
  },
  bookImage: {
    width: "200px",
    height: "280px",
    margin: theme.spacing(1),
  },
  bookImageSmall: {
    width: "140px",
    height: "204px",
    margin: theme.spacing(1),
  },
  linkContainer: {
    width: "100%",
    textAlign: "center",
    fontSize: "large",
  },
  twoQuizRow: {
    display: "flex",
    justifyContent: "space-around",
    marginBottom: theme.spacing(6),
  },
  gameImageContainer: { cursor: "pointer" },
}));

function buildBookImgUrl(baseURLToAssets: string, imgName: string) {
  return `${baseURLToAssets}/img/${imgName}`;
}

interface SelectGameProps {
  baseURLToAssets: string;
  baseUrl: string;
  games: [GameI];
  aboutGameLink?: string;
}

interface IndexedGameI extends GameI {
  gameIndex: number;
}

function SelectGamePage(props: SelectGameProps) {
  const s = styles();
  const isDesktop = useMediaQuery("(min-width:930px)");
  const { games, baseURLToAssets, baseUrl, aboutGameLink } = props;
  const indexedGames = games.map((d, i) => {
    return merge({ gameIndex: i }, d);
  });

  const navigate = useNavigate();

  const quizGroups = chunk(indexedGames, isDesktop ? 2 : 1);

  const buildBookGameSelection = (singleGame: IndexedGameI) => {
    const { books, gameIndex } = singleGame;
    const fullGameUrl = `${baseUrl === "/" ? "" : baseUrl}/quiz/${gameIndex}`;
    return (
      <div
        key={gameIndex}
        className={s.gameImageContainer}
        onClick={() => {
          navigate(fullGameUrl);
        }}
      >
        <div>
          {books.slice(0, 2).map((d, i) => {
            return (
              <span key={i}>
                <img
                  className={isDesktop ? s.bookImage : s.bookImageSmall}
                  src={buildBookImgUrl(baseURLToAssets, d.img)}
                ></img>
              </span>
            );
          })}
        </div>
        <div>
          {books.slice(2, 4).map((d, i) => {
            return (
              <span key={i}>
                <img
                  className={isDesktop ? s.bookImage : s.bookImageSmall}
                  src={buildBookImgUrl(baseURLToAssets, d.img)}
                ></img>
              </span>
            );
          })}
        </div>
        <div className={s.linkContainer}>
          <Link to={fullGameUrl}>Start Quiz</Link>
        </div>
      </div>
    );
  };

  return (
    <Container maxWidth="lg" className={s.container}>
      <div className={s.explainerTextContainer}>
        {" "}
        <Typography variant="h4" gutterBottom component="div">
          Each question in a quiz is based on the four books above it.
        </Typography>
        {aboutGameLink && (
          <Typography variant="subtitle1" gutterBottom component="div">
            Read about the game <a href={aboutGameLink}>here</a>
          </Typography>
        )}
      </div>
      {quizGroups.map((groupItems, groupIndex) => {
        return (
          <div key={groupIndex} className={s.twoQuizRow}>
            {groupItems.map((d) => {
              return buildBookGameSelection(d);
            })}
          </div>
        );
      })}
    </Container>
  );
}

export default SelectGamePage;
