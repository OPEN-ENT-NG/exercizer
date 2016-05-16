
interface ICompareStringService {
    compareString(string_a : string, string_b : string) : boolean;
}

class CompareStringService implements ICompareStringService {


    constructor(

    ) {

    }

    public compareString(string_a : string, string_b : string) : boolean{
        if(string_a && string_b){
            if(string_a.toUpperCase() == string_b.toUpperCase()){
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }

    }


}