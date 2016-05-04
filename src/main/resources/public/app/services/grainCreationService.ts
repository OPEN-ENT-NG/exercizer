/**
 * Created by Erwan_LP on 03/05/2016.
 */

interface IGrainCreation {
    typeCreation : string;
}

interface IGrainCreationService {
    grainCreationList : IGrainCreation[];
    createNewGrainCreation();
    choiceQuestionType(item, type);
}

class GrainCreationService implements IGrainCreationService {

    static $inject = [

    ];

    private _grainCreationList:IGrainCreation[];


    constructor() {
        console.log('GrainCreationService');
        this._grainCreationList = [];
        // TODO: feedList
        if (this._grainCreationList.length == 0) {
            this.createNewGrainCreation();
        }
    }


    public get grainCreationList():IGrainCreation[] {
        return this._grainCreationList;
    }

    public createNewGrainCreation() {
        var itemGrainCreation:IGrainCreation = {
            typeCreation: "new"
        };
        this._grainCreationList.push(itemGrainCreation);
    }

    public choiceQuestionType(item, type) {
        console.log(item, type);
        item.typeCreation = "exercise";
        item.directiveName = type.directiveName;
    }

}