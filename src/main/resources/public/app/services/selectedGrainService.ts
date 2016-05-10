interface ISelectedGrainService {
    selectedGrainIdList;
    toggleGrainInSelectedGrainList(grain : IGrain, isSelected : boolean);
}

class SelectedGrainService implements ISelectedGrainService {

    static $inject = [

    ];

    private _selectedGrainIdList;

    constructor() {
        this._selectedGrainIdList = [];
    }

   public get selectedGrainIdList() {
        return this._selectedGrainIdList;
   }

    public toggleGrainInSelectedGrainList(grain : IGrain, isSelected : boolean){
        if(isSelected){
            this._selectedGrainIdList.push(grain.id);

        } else{
            var index = this._selectedGrainIdList.indexOf(grain.id);
            this._selectedGrainIdList.splice(index, 1);
        }
        console.log('this._selectedGrainIdList');
        console.log(this._selectedGrainIdList);
    }

    public resetList(){
        this._selectedGrainIdList = [];
    }
}