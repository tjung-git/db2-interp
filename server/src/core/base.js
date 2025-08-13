export class Result {
  constructor(meta) {
    this.meta = meta;
  }
}
export class Algorithm {
  // Inheritance root: subclasses implement run()
  run(/* ...args */) {
    throw new Error("abstract");
  }
}
