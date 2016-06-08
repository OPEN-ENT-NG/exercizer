class StringISOHelper {
    static toISO(str:string):string {
        if (typeof str !== 'undefined' && str) {
            str = str.trim();

            if (/\S/.test(str)) {
                str = undefined;
            }
        } else if (!str) {
            str = undefined;
        }

        return str;
    }
}
