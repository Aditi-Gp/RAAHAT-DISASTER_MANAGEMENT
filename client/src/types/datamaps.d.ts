// Type declarations for datamaps
declare module 'datamaps' {
  export default class Datamap {
    constructor(options: any);
    bubbles(data: any[], options?: any): void;
    resize(): void;
  }
}
