
interface IToolsService {
    createId() : number
}

class ToolsService implements IToolsService {


    constructor(

    ) {

    }


    public createId() : number{
        var min = 1;
        var max = 999999999;
        return Math.floor(Math.random() * (max - min)) + min;
    }


}