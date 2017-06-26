export class ScoreHelper {
    static format(score:number):number {
        if(typeof score !== 'undefined') {
            return Math.round(score * 100)/100;
        } else {
            return 0;
        }
    }
}