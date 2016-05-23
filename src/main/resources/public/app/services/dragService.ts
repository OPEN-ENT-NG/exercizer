
interface IDragService {
    drag (item, $originalEvent);
    dropTo (targetItem, $originalEvent, scope);
    canDragFolderInPage(targetItem) : boolean
    canDropOnFolderInPage(targetItem) : boolean;
    canDragSubjectInPage(targetItem) : boolean;
    canDropOnSubjectInPage(targetItem) : boolean;
    canDragFolderInNav(targetItem) : boolean;
    canDropOnFolderInNav(targetItem) : boolean;

}

class DragService implements IDragService {

    private folderService;
    private subjectService;

    static $inject = [
        'FolderService',
        'SubjectService'
    ];


    constructor(
        FolderService,
        SubjectService

    ) {
        this.folderService = FolderService;
        this.subjectService = SubjectService;
    }


    public drag (item, $originalEvent){
        try {
            $originalEvent.dataTransfer.setData('application/json', JSON.stringify(item));
        } catch (e) {
            $originalEvent.dataTransfer.setData('Text', JSON.stringify(item));
        }
    }

    public dropTo (targetItem, $originalEvent, scope){
        var dataField = this.dropConditionFunction(targetItem, $originalEvent);
        var originalItem = JSON.parse($originalEvent.dataTransfer.getData(dataField));
        this.actionAfterDragAndDrop(targetItem,originalItem);
        scope.$apply();
    }

    /**
     * CAN
     */

    public canDragFolderInPage(targetItem) : boolean{
        return true;
    }

    public canDropOnFolderInPage(targetItem) : boolean{
        return true;
    }

    public canDragSubjectInPage(targetItem) : boolean{
        return true;
    }

    public canDropOnSubjectInPage(targetItem) : boolean{
        return false;
    }

    public canDragFolderInNav(targetItem) : boolean{
        return true;
    }

    public canDropOnFolderInNav(targetItem) : boolean{
        return true;
    }

    /**
     * DROP CONDITION
     */

    private dropConditionFunction(targetItem, event) {
        var dataField = event.dataTransfer.types.indexOf && event.dataTransfer.types.indexOf("application/json") > -1 ? "application/json" : //Chrome & Safari
            event.dataTransfer.types.contains && event.dataTransfer.types.contains("application/json") ? "application/json" : //Firefox
                event.dataTransfer.types.contains && event.dataTransfer.types.contains("Text") ? "Text" : //IE
                    undefined;

        return dataField ? dataField : false;
    }

    private actionAfterDragAndDrop(targetItem,originalItem){
        if(this.isSubject(originalItem)){
            if(this.isSubject(targetItem)){
                throw "not possible";
            }
            if(this.isFolder(targetItem)){
                console.log('move', originalItem, 'to', targetItem);
                this.subjectService.setFolderIdToThisSubject(originalItem.id, targetItem.id)
            }
        }
        if(this.isFolder(originalItem)){
            if(this.isSubject(targetItem)){
                throw "not possible";
            }
            if(this.isFolder(targetItem)){
                console.log('move', originalItem, 'to', targetItem);
                this.folderService.setParentFolderIdToThisFolderById(originalItem.id, targetItem.id);
            }
        }
    }

    //TODO move in Service and improve it
    private isSubject(object: any){
        return !!object.title;
    }

    private isFolder(object: any){
        return !!object.label;
    }






}