class TeacherDashboardController {

    /**
     * INJECT
     */
    private $location;
    private $scope;
    private folderService;
    private subjectService;
    private selectionService;
    private lightboxService;
    private grainService;
    private dragService;
    private _openLightboxSubjectProperties: boolean;
    private _displayList : string;



    static $inject = [
        '$location',
        'FolderService',
        'SubjectService',
        'GrainService',
        'SelectionService',
        'DragService',
        '$scope',
        'LightboxService'
    ];


    constructor(
        $location,
        FolderService,
        SubjectService: ISubjectService,
        GrainService,
        SelectionService,
        DragService,
        $scope,
        LightboxService
    ) {
        this.folderService = FolderService;
        this.subjectService = SubjectService;
        this.grainService = GrainService;
        this.$location = $location;
        this.feedExercizer();
        this._openLightboxSubjectProperties = false;
        this._displayList = 'domino';
        this.selectionService = SelectionService;
        this.dragService = DragService;
        this.$scope = $scope;
        this.lightboxService = LightboxService;
    }


    public get displayList():string {
        return this._displayList;
    }

    public set displayList(value:string) {
        this._displayList = value;
    }

    get openLightboxSubjectProperties(): boolean {
        return this._openLightboxSubjectProperties;
    };

    set openLightboxSubjectProperties(value: boolean) {
        this._openLightboxSubjectProperties = value;
    };

    public displaySubjectProperties() {
        this._openLightboxSubjectProperties = true;
    };

    public subjectList(){
        return this.subjectService.getList();
    }

    public folderList(){
        return this.folderService.folderList;
    }

    /**
     * GETTER
     */

    public canManageFolder(){
        return true;
    }
    public canManageSubject(){
        return true;
    }

    public getSubjectPicture (subject) {
        var defaultPicture = "/assets/themes/leo/img/illustrations/poll-default.png";
        return subject.picture || defaultPicture;
    };

    public getSubjectModificationDate(subject) {
        return subject.modified ? "Modifié le " + subject.modified : ""
    };


    /**
     * EVENT
     */

    public clickOnFolderTitle(folder){
        this.folderService.currentFolderId = folder.id;
    }
    public clickOnSubjectTitle(subject){
        if(subject.id){
            this.$location.path('/teacher/subject/edit/' + subject.id);
        }
    }

    public selectFolder(folder){
        folder.selected = folder.selected? true : false;
        this.selectionService.toggleFolder(folder.id, folder.selected);
    }
    public selectSubject(subject){
        subject.selected = subject.selected? true : false;
        this.selectionService.toggleSubject(subject.id, subject.selected);
    }

    public clickCreateFolder() {
        this.lightboxService.showLightboxEditFolderForNewFolder();
    };

    public goToRoot(){
        this.folderService.currentFolderId = null;
    };

    /**
     * FILTER
     */

    public filterFolderByParentFolder(folder) {
        if (this.folderService.currentFolderId) {
            return  folder.parent_folder_id == this.folderService.currentFolderId
        }
        return  folder.parent_folder_id == null;
    }
    public filterSubjectByParentFolder(subject) {
        if (this.folderService.currentFolderId) {
            return subject.folder_id == this.folderService.currentFolderId
        }
        return subject.folder_id == null;
    }

    /**
     * DRAG
     */

    public drag(item, $originalEvent) {
        this.dragService.drag(item, $originalEvent);
    }

    public dragFolderCondition(item) {
        return this.dragService.canDragFolderInPage(item);
    };
    public dragSubjectCondition(item) {
        return this.dragService.canDragSubjectInPage(item);
    };

    public dropTo (targetItem, $originalEvent) {
        this.dragService.dropTo(targetItem, $originalEvent, this.$scope);
    };

    public dropFolderCondition(targetItem) {
        return this.dragService.canDropOnFolderInPage(targetItem);

    }
    public dropSubjectCondition(targetItem) {
        return this.dragService.canDropOnSubjectInPage(targetItem);
    };

    public dropToRoot($originalEvent){
        this.dragService.dropTo(null, $originalEvent, this.$scope);
    };

    /**
     * FEED
     */

    private feedExercizer(){

        var self = this;

        // create folder
        var folderA = new Folder(null, null, null, null, "A Folder");
        var folderB = new Folder(null, null, null, null, "B Folder");
        var folderC = new Folder(null, null, null, null, "C Folder");
        this.folderService.createFolder(folderA,  null, null);
        this.folderService.createFolder(folderB,  null, null);
        this.folderService.createFolder(folderC,  null, null);

        // create subject
        var subject = new Subject(null, null,null, null,null,null,null,"My Subject", "My description", null, null, null, null);

        var promise = this.subjectService.persist(subject);
        promise.then(function(subject) {
            console.log('Success: ', subject);
        }, function(subject) {
            console.log('Failed: ', subject);
        });
    }
}
