import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Typography from '@material-ui/core/Typography';


const useStyles = makeStyles((theme) => ({
  answersContainer: {
    margin: theme.spacing(3)
  },
  button: {
    margin: theme.spacing(1, 1, 0, 0),
    width: "min-content",
    alignSelf: "end"
  },
  questionText: {
    marginBottom: theme.spacing(2)
  },
  correctAnswer: {
    '&.Mui-checked': {
      color: 'green'
    },
    '&.MuiButtonBase-root': {
      background: 'none'
    },
    backgroundColor: 'rgba(0, 204, 0, .4)'
  },
  wrongAnswer: {
    '&.Mui-checked': {
      color: 'red',
    },
    '&.MuiButtonBase-root': {
      background: 'none'
    },
    backgroundColor: 'rgba(225, 102, 102, .4)'
  },
  regularChoice: {}
}));


export default function Question(props) {
  const { data, questionAnswered, providedAnswer } = props;
  const s = useStyles();
  const [value, setValue] = React.useState(providedAnswer === undefined ? '' : providedAnswer);

  const handleRadioChange = (event) => {
    // do nothing if question is answered
    if (value) {
      return;
    }

    const answerId = event.target.value;
    setValue(answerId);

    questionAnswered(answerId == data.correct_answer.id, answerId)
  };


  const getClassBasedOnAnswer = (questionId, correctAnswer, selectedChoice) => {
    if (questionId == selectedChoice) {
      return correctAnswer == questionId ? s.correctAnswer : s.wrongAnswer;
    } else if (selectedChoice.length && questionId == correctAnswer) {
      return s.correctAnswer;
    } else {
      return s.regularChoice;
    }
  }

  return (
    <div className={s.answersContainer}>
      <div className={s.questionText}><Typography>{data.text}</Typography></div>
      <RadioGroup aria-label="quiz" name="quiz" value={value} onChange={handleRadioChange}>
        {data.answers.map((q) => {
          const chosenClass = getClassBasedOnAnswer(q.id, data.correct_answer.id, value);
          
          return (<FormControlLabel
            className={chosenClass}
            key={q.id}
            value={`${q.id}`}
            control={<Radio classes={{ root: chosenClass }} />}
            label={q.title} />)
        })}
      </RadioGroup>

    </div>
  );
}