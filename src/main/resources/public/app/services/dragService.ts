interface IDragService {
    drag(item, $originalEvent);
    dropTo(targetItem, $originalEvent, scope);
    canDragFolderInPage(targetItem): boolean
    canDropOnFolderInPage(targetItem): boolean;
    canDragSubjectInPage(targetItem): boolean;
    canDropOnSubjectInPage(targetItem): boolean;
    canDragFolderInNav(targetItem): boolean;
    canDropOnFolderInNav(targetItem): boolean;

}

class DragService implements IDragService {

    private folderService;
    private subjectService;

    static $inject = [
        'FolderService',
        'SubjectService',
    ];


    constructor(
        FolderService,
        SubjectService,
        SelectionService

    ) {
        this.folderService = FolderService;
        this.subjectService = SubjectService;
    }


    public drag(item, $originalEvent) {
        try {
            $originalEvent.dataTransfer.setData('application/json', JSON.stringify(item));
        } catch (e) {
            $originalEvent.dataTransfer.setData('Text', JSON.stringify(item));
        }
    }

    public dropTo(targetItem, $originalEvent, scope) {
        var dataField = this.dropConditionFunction(targetItem, $originalEvent);
        var originalItem = JSON.parse($originalEvent.dataTransfer.getData(dataField));
        this.actionAfterDragAndDrop(targetItem, originalItem);
        scope.$apply();
    }

    /**
     * CAN
     */

    public canDragFolderInPage(targetItem): boolean {
        return true;
    }

    public canDropOnFolderInPage(targetItem): boolean {
        return true;
    }

    public canDragSubjectInPage(targetItem): boolean {
        return true;
    }

    public canDropOnSubjectInPage(targetItem): boolean {
        return false;
    }

    public canDragFolderInNav(targetItem): boolean {
        return true;
    }

    public canDropOnFolderInNav(targetItem): boolean {
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

    private actionAfterDragAndDrop(targetItem, originalItem) {

        if (this.isSubject(originalItem)) {
            if (this.isSubject(targetItem)) {
                throw "not possible";
            } else if (this.isFolder(targetItem)) {
                var subject = this.subjectService.getById(this.getId(originalItem));
                subject.folder_id = targetItem.id;
            } else {
                //default
                // drop on root
                var subject = this.subjectService.getById(this.getId(originalItem));
                subject.folder_id = null;
            }
        }
        if (this.isFolder(originalItem)) {
            if (this.isSubject(targetItem)) {
                throw "not possible";
            } else if (this.isFolder(targetItem)) {
                this.folderService.setParentFolderId(this.getId(originalItem), this.getId(targetItem));

            } else {
                // default
                // drop on root
                this.folderService.setParentFolderId(this.getId(originalItem), null);

            }
        }
    }

    //TODO move in Service and improve it
    private isSubject(object: any) {
        if (object && object.title) {
            return true
        } else {
            return false;
        }
    }
    private isFolder(object: any) {
        if (object && object.label) {
            return true
        } else {
            return false;
        }
    }

    private getId(object: any) {
        var id = object.id;
        if (id) {
            return id
        } else {
            console.error('no _id in this object', object);
            throw "";
        }
    }






}
