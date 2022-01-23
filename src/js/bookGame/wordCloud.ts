import * as d3 from "d3";
import * as cloud from "d3-cloud";
import { QuestionData } from "./components/QuestionInterfaces";

interface WordData {
  size: number;
  text: string;
  rotate: number;
  x: number;
  y: number;
}

interface Layout {
  size(): [number, number];
}

function addWords(
  // eslint-disable-next-line
  svg: d3.Selection<any, unknown, null, undefined>,
  layout: Layout,
  words: [WordData]
) {
  svg
    .append("g")
    .attr(
      "transform",
      "translate(" + layout.size()[0] / 2 + "," + layout.size()[1] / 2 + ")"
    )
    .selectAll("text")
    .data(words)
    .enter()
    .append("text")
    .style("font-size", function (d: { size: number }) {
      return d.size + "px";
    })
    .attr("fill", (d, i) => {
      return d3.schemeDark2[i % d3.schemeDark2.length];
    })
    .attr("text-anchor", "middle")
    .attr("transform", function (d: { x: number; y: number; rotate: number }) {
      return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
    })
    .text(function (d) {
      return d.text;
    });
}

function draw(
  // eslint-disable-next-line
  svg: d3.Selection<any, unknown, null, undefined>,
  questionData: QuestionData,
  width: number,
  height: number
) {
  // data is [word, freq]
  const highestCount = d3.max(questionData.data_word_and_freq.map((d) => d[1]));

  const layout = cloud()
    .size([width, height])
    .words(
      questionData.data_word_and_freq.map((d) => {
        const [word, freq] = d;
        return { text: word, size: 10 + (freq / highestCount) * 50 };
      })
    )
    .padding(5)
    .rotate(() => (~~(Math.random() * 6) - 3) * 20)
    .fontSize(function (d: { size: number }) {
      return d.size;
    });

  layout.on("end", addWords.bind(this, svg, layout));

  layout.start();
}

function drawPlain(
  // eslint-disable-next-line
  svg: d3.Selection<any, unknown, null, undefined>,
  questionData: QuestionData,
  width: number,
  height: number
) {
  // data is array of words
  const layout = cloud()
    .size([width, height])
    .words(
      questionData.data_words_only.map((w) => {
        return { text: w, size: 20 };
      })
    )
    .rotate(0)
    .padding(5)
    .fontSize(function (d: { size: number }) {
      return d.size;
    });

  layout.on("end", addWords.bind(this, svg, layout));

  layout.start();
}

export default {
  draw,
  drawPlain,
};
