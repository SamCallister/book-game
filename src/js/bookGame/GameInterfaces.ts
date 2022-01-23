import { QuestionData, Answer } from "./components/QuestionInterfaces";

interface Book extends Answer {
  img: string;
}

interface GameI {
  questions: [QuestionData];
  books: [Book];
}

export { GameI };
