import React from "react";
import { makeStyles } from "@material-ui/core/styles";
import Radio from "@material-ui/core/Radio";
import RadioGroup from "@material-ui/core/RadioGroup";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Typography from "@material-ui/core/Typography";
import Check from "@material-ui/icons/Check";
import Clear from "@material-ui/icons/Clear";
import { QuestionProps } from "./QuestionInterfaces";

const useStyles = makeStyles((theme) => ({
  answersContainer: {
    margin: theme.spacing(3),
  },
  button: {
    margin: theme.spacing(1, 1, 0, 0),
    width: "min-content",
    alignSelf: "end",
  },
  questionText: {
    marginBottom: theme.spacing(2),
  },
  correctAnswer: {
    "&.Mui-checked": {
      color: "green",
    },
    "&.MuiButtonBase-root": {
      background: "none",
    },
    backgroundColor: "rgba(0, 204, 0, .5)",
  },
  wrongAnswer: {
    "&.Mui-checked": {
      color: "red",
    },
    "&.MuiButtonBase-root": {
      background: "none",
    },
    backgroundColor: "rgba(225, 102, 102, .5)",
  },
  regularChoice: {
    marginBottom: "2px",
    position: "relative",
  },
  iconPos: {
    position: "absolute",
    left: "-1.1em",
    top: "21%",
  },
}));

type ChoiceStatus = "correct" | "wrong" | "correctNotChosen" | "regular";

export default function Question(props: QuestionProps) {
  const { data, questionAnswered, providedAnswer } = props;
  const s = useStyles();
  const [value, setValue] = React.useState(
    providedAnswer === undefined ? "" : providedAnswer
  );

  const handleRadioChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // do nothing if question is answered
    if (value) {
      return;
    }

    const answerId = event.target.value;
    setValue(answerId);

    questionAnswered(parseInt(answerId) === data.correct_answer.id, answerId);
  };

  const getChoiceStatus = (
    questionId: number,
    correctAnswer: number,
    selectedChoice: string
  ): ChoiceStatus => {
    if (questionId == parseInt(selectedChoice)) {
      return correctAnswer == questionId ? "correct" : "wrong";
    } else if (selectedChoice.length && questionId == correctAnswer) {
      // show correct answer when a choice is selected
      return "correctNotChosen";
    } else {
      return "regular";
    }
  };

  const getClassBasedOnAnswer = (choiceStatus: ChoiceStatus) => {
    return {
      correct: `${s.regularChoice} ${s.correctAnswer}`,
      correctNotChosen: `${s.regularChoice} ${s.correctAnswer}`,
      wrong: `${s.regularChoice} ${s.wrongAnswer}`,
      regular: s.regularChoice,
    }[choiceStatus];
  };

  const buildLabel = (title: string, choiceStatus: ChoiceStatus) => {
    const icon = {
      correct: <Check classes={{ root: s.iconPos }}></Check>,
      wrong: <Clear classes={{ root: s.iconPos }}></Clear>,
      correctNotChosen: null,
      regular: null,
    }[choiceStatus];

    return (
      <span>
        {title} {icon}
      </span>
    );
  };

  return (
    <div className={s.answersContainer}>
      <div className={s.questionText}>
        <Typography>{data.text}</Typography>
      </div>
      <RadioGroup
        aria-label="quiz"
        name="quiz"
        value={value}
        onChange={handleRadioChange}
      >
        {data.answers.map((q) => {
          const choiceStatus = getChoiceStatus(
            q.id,
            data.correct_answer.id,
            value
          );
          const chosenClass = getClassBasedOnAnswer(choiceStatus);

          return (
            <FormControlLabel
              className={chosenClass}
              key={q.id}
              value={`${q.id}`}
              control={<Radio classes={{ root: chosenClass }} />}
              label={buildLabel(q.title, choiceStatus)}
            />
          );
        })}
      </RadioGroup>
    </div>
  );
}
