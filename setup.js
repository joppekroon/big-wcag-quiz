/* Do all the setup things */

import { Questions } from "./questions.js";

const questions = new Questions();

const setupForm = document.querySelector("#setup-form");
const setupButton = document.querySelector("#setup-submit");
const principlesSelect = document.querySelector("#principles");
const levelsSelect = document.querySelector("#levels");
const quizGuidelinesCheck = document.querySelector("#quiz-guidelines");

const answerForm = document.querySelector("#answer-form");
const answerButton = document.querySelector("#answer-submit");
const answerField = document.querySelector("#answer-field");
const questionSpan = document.querySelector("#question");

const livesIndicator = document.querySelector("#lives");

const restartForm = document.querySelector("#restart-form");
const restartButton = document.querySelector("#reset");

/**
 * @param {number} principle 
 * @param {Array.<string>} levels
 * @param {boolean} quizGuidelines
 * @param {number} columnOffset
 */
const drawPrinciple = (principle, levels, quizGuidelines, columnOffset = 0) => {
  const principleCell = document.querySelector(
    `.cell.p[data-p="${principle}"]`
  );
  const guidelineCells = document.querySelectorAll(
    `.cell.g[data-p="${principle}"]`
  );
  const criteriaCells = document.querySelectorAll(
    `.cell.sc[data-p="${principle}"]`
  );

  principleCell.style.setProperty(
    "grid-column",
    `${1 + columnOffset} / span ${guidelineCells.length}`
  );
  principleCell.style.setProperty("grid-row", "1");
  principleCell.classList.remove("hide");

  guidelineCells.forEach((guidelineCell) => {
    guidelineCell.style.setProperty(
      "grid-column",
      `${parseInt(guidelineCell.dataset.g, 10) + columnOffset}`
    );
    guidelineCell.style.setProperty("grid-row", "2");

    guidelineCell.classList.remove("hide");
    
    if (!quizGuidelines) {
      guidelineCell.classList.add("correct");
    }
  });

  const scRows = Array(guidelineCells.length).fill(3);
  criteriaCells.forEach((criteriumCell) => {
    const column = parseInt(criteriumCell.dataset.g, 10);
    const row = scRows[column - 1]++;
    criteriumCell.style.setProperty("grid-column", `${column + columnOffset}`);
    criteriumCell.style.setProperty("grid-row", `${row}`);

    if (!levels.includes(criteriumCell.dataset.l)) {
      criteriumCell.classList.add("out-of-play");
    }

    criteriumCell.classList.remove("hide");
  });
};

setupButton.addEventListener("click", (event) => {
  event.preventDefault();

  const translateLevels = (selectValue) => {
    switch (selectValue) {
      case "A":
        return ["A"];
      case "AA":
        return ["A", "AA"];
      case "AAA":
        return ["A", "AA", "AAA"];
      default:
        console.error('Unknown level selected, defaulting to "All"');
        return ["A", "AA", "AAA"];
    }
  };
  const translatePrinciples = (selectValue) => {
    switch (selectValue) {
      case "0":
        return [1, 2, 3, 4];
      case "1":
        return [1];
      case "2":
        return [2];
      case "3":
        return [3];
      case "4":
        return [4];
      default:
        console.error('Unknown principles selected, defaulting to "All"');
        return [1, 2, 3, 4];
    }
  };

  const levels = translateLevels(levelsSelect.value);
  const principles = translatePrinciples(principlesSelect.value);
  const quizGuidelines = quizGuidelinesCheck.checked;

  if (principles.length === 1) {
    drawPrinciple(principles[0], levels, quizGuidelines);
  } else {
    drawPrinciple(1, levels, quizGuidelines, 0);
    drawPrinciple(2, levels, quizGuidelines, 5);
    drawPrinciple(3, levels, quizGuidelines, 11);
    drawPrinciple(4, levels, quizGuidelines, 15);
  }

  questions.shuffle(principles, levels);

  setupForm.classList.add("hide");

  questionSpan.textContent = questions.question;
  livesIndicator.dataset.lives = 5;

  answerForm.classList.remove("hide");
  livesIndicator.classList.remove("hide");
  restartForm.classList.remove("hide");

  answerField.focus();
});

const finished = () => {
  answerForm.classList.add("hide");

  // eslint-disable-next-line no-undef
  confetti({
    disableForReducedMotion: true,
    particleCount: 200,
    spread: 90
  });

  restartButton.focus();
};

const processAnswer = (pStr, gStr, scStr) => {
  const p = parseInt(pStr, 10);
  const g = parseInt(gStr, 10);
  const sc = !!scStr ? parseInt(scStr, 10) : undefined;

  const correct = questions.isCorrect(p, g, sc);

  let cellSelector = `.cell:not(.hide):not(.out-of-play)[data-p="${p}"][data-g="${g}"]`;
  if (!!sc) {
    cellSelector += `[data-sc="${sc}"]`;
  }

  const cell = document.querySelector(cellSelector);

  if (correct) {
    // eslint-disable-next-line no-unused-expressions
    cell?.classList.add("correct");

    if (questions.hasNext()) {
      questions.next();
      questionSpan.textContent = questions.question;
    } else {
      finished();
    }
  } else {
    livesIndicator.dataset.lives = livesIndicator.dataset.lives - 1;
    // eslint-disable-next-line no-unused-expressions
    cell?.classList.add("incorrect");
    setTimeout(() => {
      // eslint-disable-next-line no-unused-expressions
      cell?.classList.remove("incorrect");
    }, 1000);
  }
};

answerButton.addEventListener("click", (event) => {
  event.preventDefault();

  const groups = answerField.value.match(/(\d)\.?(\d)\.?(\d+)?/);

  processAnswer(groups[1], groups[2], groups[3]);

  answerField.value = "";
});

document.querySelectorAll(".cell:not(.p)").forEach((cell) => {
  cell.addEventListener("click", () => {
    processAnswer(cell.dataset.p, cell.dataset.g, cell.dataset.sc);
  });
});

restartButton.addEventListener("click", (event) => {
  event.preventDefault();

  document.querySelectorAll(".cell").forEach((cell) => {
    cell.classList.remove("out-of-play");
    cell.classList.remove("correct");
    cell.classList.add("hide");
  });

  answerForm.classList.add("hide");
  livesIndicator.classList.add("hide");
  restartForm.classList.add("hide");

  setupForm.classList.remove("hide");
  principlesSelect.focus();
});
