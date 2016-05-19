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


    constructor() {
        this._cacheTypeIdToTypeName = [];
        this._cacheTypeNameToTypeId = [];

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

    public getTypeNameByTypeId(id:number):string {
        if (!this._cacheTypeIdToTypeName[id]) {
            var self = this;
            angular.forEach(this._grainTypeList, function (grainType) {
                if (grainType.id == id) {
                    self._cacheTypeIdToTypeName[id] = grainType.name;
                } else{
                }
            });
            if(!self._cacheTypeIdToTypeName[id]){
                return null;
            }
        }
        return this._cacheTypeIdToTypeName[id];
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
                illustration: ""
            },
            {
                id: 2,
                name: "openQuestion",
                publicName: "Question Libre",
                illustration: "ouverte"
            },
            {
                id: 3,
                name: "simpleAnswer",
                publicName: "Réponse Simple",
                illustration: "simple"
            }
        ];
    }

}