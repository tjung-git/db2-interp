export class Node {
  constructor(value, next = null) {
    this.value = value;
    this.next = next;
  }
}
export class LinkedList {
  constructor() {
    this.head = null;
    this._size = 0;
  }
  get size() {
    return this._size;
  }
  append(v) {
    const n = new Node(v);
    if (!this.head) {
      this.head = n;
      this._size = 1;
      return;
    }
    let cur = this.head;
    while (cur.next) cur = cur.next;
    cur.next = n;
    this._size++;
  }
  popLeft() {
    if (!this.head) throw new Error("pop from empty");
    const v = this.head.value;
    this.head = this.head.next;
    this._size--;
    return v;
  }
  reverseIter() {
    let prev = null,
      cur = this.head;
    while (cur) {
      const nxt = cur.next;
      cur.next = prev;
      prev = cur;
      cur = nxt;
    }
    this.head = prev;
  }
  reverseRec() {
    const _rev = (n) =>
      !n || !n.next
        ? n
        : (() => {
            const nh = _rev(n.next);
            n.next.next = n;
            n.next = null;
            return nh;
          })();
    this.head = _rev(this.head);
  }
}
