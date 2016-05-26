interface ISelectionService {
    toggleFolder(folderId, isSelected) : boolean;
    toggleSubject(subjectId, isSelected) : boolean;
    resetItemSelected();
}

class SelectionService implements ISelectionService {

    private _itemSelected : any;


    constructor(
    ) {
        // init _itemSelected
        this.resetItemSelected();

    }


    get itemSelected():any {
        return this._itemSelected;
    }

    public toggleFolder(folderId, isSelected) : boolean{
        return this.toggleItem(folderId, isSelected, this._itemSelected.folderList);
    }

    public toggleSubject(subjectId, isSelected) : boolean{
        return this.toggleItem(subjectId, isSelected, this._itemSelected.subjectList);
    }

    public resetItemSelected(){
        this._itemSelected = {
            folderList : [],
            subjectList : []
        }
    }

    private toggleItem(id, isSelected, list){
        var index = list.indexOf(id);
        if(isSelected){
            // item is selected
            if (index === -1){
                // the item is not in the list
                list.push(id);
                return true;
            }{
                // the item is in the list
                console.error('try to add an item in the list but the item is already in the list');
                return false;
            }
        } else{
            // item is not selected
            if (index === -1){
                // the item is not in the list
                console.error('try to remove an item from the list but item missing');
                return false;
            }{
                // the item is not in the list
                list.splice(index, 1);
                return true;
            }
        }
    }
}