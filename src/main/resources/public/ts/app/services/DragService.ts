import { notify, ng } from 'entcore';

export interface IDragService {
    drag(item, $originalEvent);
    dropTo(targetItem, $originalEvent, scope);
    canDragFolderInPage(targetItem): boolean
    canDropOnFolderInPage(targetItem): boolean;
    canDragSubjectInPage(targetItem): boolean;
    canDropOnSubjectInPage(targetItem): boolean;
    canDragFolderInNav(targetItem): boolean;
    canDropOnFolderInNav(targetItem): boolean;
    dropConditionFunction(targetItem, event): any;

}

export class DragService implements IDragService {

    static $inject = [
        'FolderService',
        'SubjectService',
    ];


    constructor(
        private _folderService,
        private _subjectService

    ) {
        this._folderService = _folderService;
        this._subjectService = _subjectService;
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

    public dropConditionFunction(targetItem, event) {
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
            } else {
                var targetFolder = (this.isFolder(targetItem)) ? targetItem : null;
                var self = this;
                this._subjectService.move([this.getId(originalItem)], targetFolder).then(
                    function (data) {
                        self._subjectService.resolve(true);
                    },
                    function (err) {
                        notify.error(err);
                    }
                );
            }
        }
        if (this.isFolder(originalItem)) {
            if (this.isSubject(targetItem)) {
                throw "not possible";
            } else {
                var targetFolder = (this.isFolder(targetItem)) ? targetItem : null;
                var self = this;

                self._folderService.move(targetItem, [this.getId(originalItem)]).then(
                    function (data) {
                        self._folderService.resolve().then(
                            function() {
                                self._subjectService.resolve(true).then(
                                    function() {
                                    },
                                    function(err) {
                                        notify.error(err);
                                    }
                                );
                            }
                        );
                    },
                    function (err) {
                        notify.error(err);
                    }
                );
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

export const dragService = ng.service('DragService', DragService);