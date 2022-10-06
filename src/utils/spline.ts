type AnyFunc = (...args: any[]) => any;

export class Spline {
   private points: number[][];
   private lerp: AnyFunc;

   constructor(lerp: AnyFunc) {
      this.points = [];
      this.lerp = lerp;
   }

   AddPoint(a: number, b: number) {
      this.points.push([a, b]);
   }

   Get(time: number) {
      let p1 = 0;

      for (let i = 0; i < this.points.length; i++) {
         if (this.points[i][0] >= time) {
            break;
         }
         p1 = i;
      }

      const p2 = Math.min(this.points.length - 1, p1 + 1);

      if (p1 == p2) {
         return this.points[p1][1];
      }

      return this.lerp(
         (time - this.points[p1][0]) / (this.points[p2][0] - this.points[p1][0]),
         this.points[p1][1],
         this.points[p2][1]
      );
   }
}
