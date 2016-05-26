interface ILightboxService {
    showLightboxEditFolderForNewFolder();
    showLightboxEditFolderForEditFolder(folder);
    hideLightboxEditFolder();
    showLightboxScheduleSubject(subject);
    hideLightboxScheduleSubject();
    showLightboxDeleteSelection(list);
    hideLightboxDeleteSelection();
    lightboxEditFolder;
    lightboxScheduleSubject;
}

class LightboxService implements ILightboxService {

    private _lightboxEditFolder;
    private _lightboxScheduleSubject;
    private _lightboxDeleteSelection;

    // Inject
    private folderService;


    static $inject = [
        'FolderService',
        'SelectionService',
    ];

    constructor(
        FolderService
    ) {
        // Inject
        this.folderService = FolderService;
        // init
        this._lightboxEditFolder = {
            display: false,
            state : null,
            folder: null
        }     ;
        this._lightboxScheduleSubject = {
            display: false,
            subject: null
        }      ;
        this._lightboxDeleteSelection = {
            display: false,
            list: null
        }
    }


    get lightboxEditFolder() {
        return this._lightboxEditFolder;
    }

    get lightboxScheduleSubject() {
        return this._lightboxScheduleSubject;
    }

    get lightboxDeleteSelection() {
        return this._lightboxDeleteSelection;
    }

    /**
     * EDIT FOLDER
     */

    public showLightboxEditFolderForNewFolder() {
        this._lightboxEditFolder.display = true;
        this._lightboxEditFolder.state =  'create';
        this._lightboxEditFolder.folder = this.folderService.createObjectFolder();

    }

    public showLightboxEditFolderForEditFolder(folder){
        this._lightboxEditFolder.display = true;
        this._lightboxEditFolder.state =  'edit';
        this._lightboxEditFolder.folder = folder;

    }

    public hideLightboxEditFolder() {
        this._lightboxEditFolder.display = false;
        this._lightboxEditFolder.state =  null;
        this._lightboxEditFolder.folder = null;
    }

    /**
     * SCHEDULED SUBEJCT
     */

    public showLightboxScheduleSubject(subject) {
        this._lightboxScheduleSubject.display = true;
        this._lightboxScheduleSubject.subject = subject;
    }

    public hideLightboxScheduleSubject() {
        this._lightboxScheduleSubject.display = false;
        this._lightboxScheduleSubject.subject =  null;
    }

    /**
     * DELETE SELECTION
     */

    public showLightboxDeleteSelection(list) {
        console.log('showLightboxDeleteSelection', list);
        this._lightboxDeleteSelection.display = true;
        this._lightboxDeleteSelection.list = list;
    }

    public hideLightboxDeleteSelection() {
        this._lightboxDeleteSelection.display = false;
    }


}
