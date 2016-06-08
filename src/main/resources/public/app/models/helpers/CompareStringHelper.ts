class CompareStringHelper {
    static compare(string1:string, string2:string):boolean {
        var result = false;
        
        if (typeof string1 !=='undefined' && typeof string2 !== 'undefined' && string1 && string2) {
            string1.replace(/\s/g, '').toLocaleLowerCase();
            string2.replace(/\s/g, '').toLocaleLowerCase();
            
            result = string1.localeCompare(string1, string2) === 0;
        }
        
        return result;
    }
}