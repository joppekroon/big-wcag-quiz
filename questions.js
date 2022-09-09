import guidelines from "./guidelines.js";
import criteria from "./criteria.js";

export class Questions {
  #questions = [];
  #q = 0;

  shuffle(principles, levels) {
    const gs = guidelines.filter((g) => principles.includes(g.principle));
    const scs = criteria.filter(
      (sc) => principles.includes(sc.principle) && levels.includes(sc.level)
    );

    const array = [...gs, ...scs];

    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }

    this.#q = 0;
    this.#questions = array;
  }

  hasNext() {
    return this.#q < this.#questions.length - 1;
  }

  next() {
    if (this.hasNext()) {
      this.#q++;
      return true;
    }

    return false;
  }

  get question() {
    return this.#questions[this.#q]?.name;
  }

  isCorrect(p, g, sc) {
    const answer = this.#questions[this.#q];

    if (!answer.criterium) {
      return (
        sc === undefined &&
        answer.principle === parseInt(p, 10) &&
        answer.guideline === parseInt(g, 10)
      );
    }

    return (
      answer.principle === parseInt(p, 10) &&
      answer.guideline === parseInt(g, 10) &&
      answer.criterium === parseInt(sc, 10)
    );
  }

  reset() {
    this.shuffle();
    this.#q = 0;
  }
}
