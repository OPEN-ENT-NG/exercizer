/**
 * Created by Erwan_LP on 03/05/2016.
 */

interface IGrainTypeService {
    getTypeNameByTypeId(id:number);
    exerciseTypeList : IGrainType[];
    grainTypeList : IGrainType[];
}

class GrainTypeService implements IGrainTypeService {

    static $inject = [];

    private _grainTypeList:IGrainType[];
    private _exerciseTypeList:IGrainType[];
    private _cacheTypeIdToTypeName:string[];
    private _cacheTypeNameToTypeId:number[];
    private _cacheTypeIdToDirectiveEditName:string[];


    constructor() {
        this._cacheTypeIdToTypeName = [];
        this._cacheTypeNameToTypeId = [];
        this._cacheTypeIdToDirectiveEditName = [];

        this._grainTypeList = this.feedGrainTypeList();
        this._exerciseTypeList = this.setExerciseTypeList(this.feedGrainTypeList());

    }

    public get grainTypeList():IGrainType[] {
        return this._grainTypeList;
    }


    public get exerciseTypeList():IGrainType[] {
        return this._exerciseTypeList;
    }

    private setExerciseTypeList(exerciseTypeList) {
        var index:number = exerciseTypeList.indexOf(this.getStatementType(exerciseTypeList));
        if (index > -1) {
            exerciseTypeList.splice(index, 1);
            return exerciseTypeList;
        } else {
            console.error('indexOf statement null');
        }

    }

    public getTypeDirectiveEditNameByGrainId(id:number) {
        var self = this;
        if (!self._cacheTypeIdToDirectiveEditName[id]) {
            angular.forEach(this._grainTypeList, function (grainType) {
                if (grainType.id == id) {
                    self._cacheTypeIdToDirectiveEditName[id] = grainType.directiveEditName;
                }
            });
        }
        return self._cacheTypeIdToDirectiveEditName[id];
    }

    public getTypeNameByTypeId(id:number) {
        var res:string = null;
        angular.forEach(this._grainTypeList, function (grainType) {
            if (grainType.id == id) {
                res = grainType.name;
            }
        });
        return res;
    }

    public getTypeIdByTypeName(name:string):number {
        if (!this._cacheTypeNameToTypeId[name]) {
            var self = this;
            angular.forEach(this._grainTypeList, function (grainType) {
                if (grainType.name == name) {
                    self._cacheTypeNameToTypeId[name] = grainType.id;
                } else{
                }
            });
        }
        return this._cacheTypeNameToTypeId[name];
    }

    private getStatementType(grainTypeList) {
        var grain_statement = null;
        angular.forEach(grainTypeList, function (grainType) {
            if (grainType.name == 'statement') {
                grain_statement = grainType;
            } else {
            }
        });
        if (grain_statement) {
            return grain_statement;
        } else {
            console.error('Statement not found in _grainTypeList');
        }
    }

    private feedGrainTypeList():IGrainType[] {
        return [
            {
                id: 1,
                name: "statement",
                publicName: "Enoncer",
                directiveEditName: "edit-statement",
                picture: "http://www.barmitzvah-online.com/wp-content/uploads/2013/12/question-300x300.jpg"
            },
            {
                id: 2,
                name: "openQuestion",
                publicName: "Question Libre",
                directiveEditName: "edit-open-question",
                picture: "http://www.barmitzvah-online.com/wp-content/uploads/2013/12/question-300x300.jpg"
            },
            {
                id: 3,
                name: "simpleAnswer",
                publicName: "Réponse Simple",
                directiveEditName: "edit-simple-answer",
                picture: "http://www.barmitzvah-online.com/wp-content/uploads/2013/12/question-300x300.jpg"
            }
        ];
    }

}