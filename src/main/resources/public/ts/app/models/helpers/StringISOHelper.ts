export class StringISOHelper {
    static toISO(str:string):string {
        if (typeof str !== 'undefined' && str) {
            str = str.trim();

            if (!str.replace(/\s/g, '').length) {
                str = undefined;
            }
        } else if (!str) {
            str = undefined;
        }

        return str;
    }
}
