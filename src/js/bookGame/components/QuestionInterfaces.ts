interface Answer {
  id: number;
  title: string;
  author: string;
}

interface QuestionData {
  correct_answer: Answer;
  meta: {
    type: string;
    num_words?: number;
    display?: string;
  };
  text: string;
  answers: [Answer];
  data_other_and_answer?: {
    other_points: [[number, number]];
    answer_points: [[number, number]];
  };
  data_all_answer?: {
    all_points: [[number, number]];
    answer_points: [[number, number]];
  };
  data_word_and_freq?: [[string, number]];
  data_words_only?: [string];
}

interface QuestionAnsweredFunc {
  (wasCorrect: boolean, answer: string): void;
}

interface QuestionProps {
  data: QuestionData;
  questionAnswered: QuestionAnsweredFunc;
  providedAnswer: string;
}

interface AnswerMap {
  [questionIndex: number]: string;
}

export { Answer, QuestionData, QuestionAnsweredFunc, QuestionProps, AnswerMap };
