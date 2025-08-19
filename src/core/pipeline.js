import { LinkedList } from "../structures/linkedList.js";

export class Task {
  constructor(name, algo, args = []) {
    this.name = name;
    this.algo = algo;
    this.args = args;
  }
}

export class Pipeline {
  constructor() {
    this.queue = new LinkedList();
  }
  add(name, algo, ...args) {
    this.queue.append(new Task(name, algo, args));
  }
  runAll() {
    const out = [];
    while (this.queue.size > 0) {
      const t = this.queue.popLeft();
      out.push({ name: t.name, result: t.algo.run(...t.args) });
    }
    return out;
  }
}
