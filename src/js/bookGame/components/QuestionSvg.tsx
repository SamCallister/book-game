import React, { useRef, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import wordCloud from "../wordCloud";
import kde from "../kde";
import horizontalBar from "../horizontalBar";
import Question from "./Question";
import * as d3 from "d3";
import { QuestionProps } from "./QuestionInterfaces";

const width = 500;
const height = 300;

const styles = makeStyles(() => ({
  outerSvgContainer: {
    maxHeight: "450px",
  },
}));

function QuestionSvg(props: QuestionProps) {
  const { data, questionAnswered, providedAnswer } = props;
  const s = styles();
  const d3Container = useRef(null);

  const drawSvg = () => {
    const questionType = data.meta.type;
    const questionDisplay = data.meta.display;

    if (questionDisplay == "cloud" || questionType == "tf-idf") {
      wordCloud.draw(d3.select(d3Container.current), data, width, height);
    } else if (questionType == "longest-median-sent-length") {
      kde.draw(
        d3.select(d3Container.current),
        data,
        width,
        height,
        "book with longest median sentence"
      );
    } else if (questionType == "shortest-median-sent-length") {
      kde.draw(
        d3.select(d3Container.current),
        data,
        width,
        height,
        "book with shortest median sentence"
      );
    } else if (
      questionDisplay == "bar" ||
      questionType == "unique-most-common"
    ) {
      horizontalBar.draw(d3.select(d3Container.current), data, width, height);
    } else if (questionType == "unique-longest") {
      wordCloud.drawPlain(d3.select(d3Container.current), data, width, height);
    }
  };

  useEffect(() => {
    if (d3Container.current) {
      // draw the svg
      drawSvg();
    }
  }, [d3Container]);

  return (
    <div>
      <div className={s.outerSvgContainer}>
        <svg
          ref={d3Container}
          preserveAspectRatio="xMinYMin meet"
          viewBox={`0 0 ${width} ${height}`}
        ></svg>
      </div>
      <Question
        data={data}
        questionAnswered={questionAnswered}
        providedAnswer={providedAnswer}
      ></Question>
    </div>
  );
}

export default QuestionSvg;
