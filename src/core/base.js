export class Result {
  constructor(meta) {
    this.meta = meta;
  }
}
export class Algorithm {
  run(/* ...args */) {
    throw new Error("abstract");
  }
}
