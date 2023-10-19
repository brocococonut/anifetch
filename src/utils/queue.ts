export class Queue <T extends any>{
  queue: T[] = [];

  constructor() {}

  public add(item: any) {
    this.queue.push(item);
  }

  public next() {
    return this.queue.shift();
  }

  public get length () {
    return this.queue.length;
  }
}