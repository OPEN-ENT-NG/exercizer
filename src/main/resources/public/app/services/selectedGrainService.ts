interface ISelectedGrainService {
    selectedGrainIdList;
    toggleGrainInSelectedGrainList(grain : IGrain, isSelected : boolean);
    displayLightBoxDeleteGrain : boolean;
    uniqueSelectedGrain(grain : IGrain);
}

class SelectedGrainService implements ISelectedGrainService {

    static $inject = [

    ];

    private _selectedGrainIdList;
    private _displayLightBoxDeleteGrain;

    constructor() {
        this._selectedGrainIdList = [];
        this._displayLightBoxDeleteGrain = false;
    }

   public get selectedGrainIdList() {
        return this._selectedGrainIdList;
   }


    public get displayLightBoxDeleteGrain() {
        return this._displayLightBoxDeleteGrain;
    }

    public set displayLightBoxDeleteGrain(value) {
        this._displayLightBoxDeleteGrain = value;
    }

    public toggleGrainInSelectedGrainList(grain : IGrain, isSelected : boolean){
        if(isSelected){
            this._selectedGrainIdList.push(grain.id);

        } else{
            var index = this._selectedGrainIdList.indexOf(grain.id);
            this._selectedGrainIdList.splice(index, 1);
        }
        console.info('selectedGrainIdList', this._selectedGrainIdList);
    }

    public uniqueSelectedGrain(grain : IGrain){
        this.resetList();
        this._selectedGrainIdList.push(grain.id);
        console.info('selectedGrainIdList', this._selectedGrainIdList);

    }

    public resetList(){
        this._selectedGrainIdList = [];
        console.info('selectedGrainIdList', this._selectedGrainIdList);
    }
}