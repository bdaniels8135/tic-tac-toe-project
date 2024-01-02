export default class Player {
  #type;

  #mark;

  constructor(playerType, playerMark) {
    this.#type = playerType;
    this.#mark = playerMark;
  }

  get type() {
    return this.#type;
  }

  get mark() {
    return this.#mark;
  }

  static #dumbAIMoveGen() {}

  static #smartAIMoveGen() {}

  getAIMove() {
    if (this.#type === "human")
      throw new Error("Human players cannot use getAIMove");
    if (this.#type === "dumb") return Player.#dumbAIMoveGen();
    if (this.#type === "smart") return Player.#smartAIMoveGen();
  }
}
