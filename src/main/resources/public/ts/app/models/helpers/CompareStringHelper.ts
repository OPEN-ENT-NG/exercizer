export class CompareStringHelper {
    static compare(string1:string, string2:string):boolean {
        var result = false;
        
        if (typeof string1 !=='undefined' && typeof string2 !== 'undefined' && string1 && string2) {
            // remove all space and zero-width characters
            string1 = string1.replace(/[\u200B\u200C\s]/g, '').toLowerCase();
            string2 = string2.replace(/[\u200B\u200C\s]/g, '').toLowerCase();
           
            result = string1 === string2;
        }
        
        return result;
    }
}