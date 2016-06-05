class TeacherDashboardSubjectTabController {

    static $inject = [
        '$location',
        '$scope',
        'FolderService',
        'SubjectService'
    ];

    private _selectedSubjectList;
    private _selectedFolderList;

    constructor
    (
        private _$location: ng.ILocationService,
        private _$scope: ng.IScope,
        private _folderService: IFolderService,
        private _subjectService: ISubjectService
    ) {
        var self = this;
        this._$location = _$location;
        this._$scope = _$scope;
        this._folderService = _folderService;
        this._subjectService = _subjectService;

        this._selectedSubjectList = [];
        this._selectedFolderList = [];

        this._folderService.resolve().then(
            function() {
                self._subjectService.resolve().then(
                    function() {
                        self._eventsHandler(self);
                    },
                    function(err) {
                       notify.error(err);
                    }
                );
        }, 
            function(err) {
            notify.error(err);
        });
    }

    private _eventsHandler = function (self) {

        self._$scope.$on('E_ADD_NEW_SUBJECT', function() {
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_EDIT_SUBJECT', null);
        });
        
        self._$scope.$on('E_SELECT_FOLDER', function (event, folder) {
            self._toggleItem(folder.id, folder.selected, self._selectedFolderList);
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_TOASTER',  self._selectedSubjectList, self._selectedFolderList);
        });

        self._$scope.$on('E_SELECT_SUBJECT', function (event, subject) {
            self._toggleItem(subject.id, subject.selected, self._selectedSubjectList);
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_TOASTER',  self._selectedSubjectList, self._selectedFolderList);
        });

        self._$scope.$on('E_CREATE_FOLDER', function () {
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_EDIT_FOLDER', null);
        });

        self._$scope.$on('E_SCHEDULE_SUBJECT', function (event, subject) {
            self._$scope.$broadcast('E_DISPLAY_MODAL_SCHEDULE_SUBJECT', subject);
            self._resetSelectedSubjectList();
        });

        self._$scope.$on('E_EDIT_FOLDER', function (event, folder) {
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_EDIT_FOLDER', folder);
            self._resetSelectedFolderList();
        });

        self._$scope.$on('E_COPY_SELECTED_FOLDER_SUBJECT', function () {
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_COPY_PASTE', self._selectedSubjectList, self._selectedFolderList);
            // reset list in confirm
        });

        self._$scope.$on('E_EDIT_SUBJECT', function (event, subject) {
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_EDIT_SUBJECT', subject);
            self._resetSelectedSubjectList();
        });

        self._$scope.$on('E_REMOVE_SELECTED_FOLDER_SUBJECT', function () {
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_REMOVE_SELECTED_FOLDER_SUBJECT', self._selectedSubjectList, self._selectedFolderList);
            // reset list in confirm
        });

        self._$scope.$on('E_CONFIRM_REMOVE_SELECTED_FOLDER_SUBJECT', function () {
            
            // delete subject list
            angular.forEach(self._selectedSubjectList, function (id) {
                self._subjectService.remove(self._subjectService.getById(id));
            });
            self._resetSelectedSubjectList();
            
            // delete folder list
            angular.forEach(self._selectedFolderList, function (id, key) {
                self._folderService.remove(self._folderService.folderById(id));
            });
            self._resetSelectedFolderList();
        });

        self._$scope.$on('E_CONFIRM_COPY_PASTE', function (event, folder) {
            var folderParentId = folder ? folder.id : null;
            self._duplicateFolderList(self._selectedFolderList, folderParentId);
            self._duplicateSubjectList(self._selectedSubjectList, folderParentId);
            self._resetSelectedList();
        });
    };

    private _duplicateSubjectList(list, folderParentId){
        var self = this;
        angular.forEach(list, function (subject) {
            var id;
            if(subject instanceof Subject){
                id = subject.id;
            } else{
                id = subject;
            }
            var promise = self._subjectService.duplicate(self._subjectService.getById(id));
            promise.then(function(data){
                data.folder_id = folderParentId;
            });
        });
    }

    private _duplicateFolderList (list, folderParentId){
        var self = this;
        angular.forEach(list, function (folder) {
            var id;
            if(folder instanceof Folder){
                id = folder.id;
            } else {
                id = folder;
            }
            
            if(id == folderParentId){
                notify.error('Vous ne pouvez pas ajouter le dossier dans lui-même. Utilisez plutôt l\'action copier (si disponible).');
            } else {
                self._folderService.duplicate(self._folderService.folderById(id)).then(function(duplicatedFolder: IFolder) {
                        // ---
                        // id is the id of the folder duplicated (origin)
                        // folderParentId is the folder where the folder is duplicate
                        // ---
                        // set parent folder id to the folder created
                        if(folderParentId){
                            self._folderService.setParentFolderId(duplicatedFolder.id, folderParentId);
                        }
                        // get children folder of the folder duplicated
                        var childrenFolder = self._folderService.getListOfSubFolderByFolderId(id);
                    
                        // if children exit , duplicate it
                        if(childrenFolder){
                            self._duplicateFolderList(childrenFolder, duplicatedFolder.id);
                        }
                        // duplicate children subject of the folder duplicated
                        var childrenSubject = self._subjectService.getListByFolderId(id);
                    
                        if(childrenSubject.length != 0){
                            self._duplicateSubjectList(childrenSubject,duplicatedFolder.id);
                        }
                },
                    function(err) {
                    notify.error(err);
                });
            }

        });
    }

    private _toggleItem(id, isSelected, list) {
        var index = list.indexOf(id);
        if (isSelected) {
            if (index === -1) {
                // the item is not in the list
                list.push(id);
                // force attribut selected in object
            } else {
                // the item is in the list
                console.error('try to add an item in the list but the item is already in the list');
            }
        } else {
            if (index === -1) {
                // the item is not in the list
                console.error('try to remove an item from the list but item missing');
            } else{
                // the item is not in the list
                list.splice(index, 1);
            }
        }
    }

    private _resetSelectedFolderList(){
        var self = this,
            folder;
        
        angular.forEach(self._selectedFolderList, function(id){
            folder = self._folderService.folderById(id) || null;
            if(folder !== null){
                folder.selected = false;
            }
        });
        
        this._selectedFolderList = [];
        self._$scope.$broadcast('E_DISPLAY_DASHBOARD_TOASTER',  self._selectedSubjectList, self._selectedFolderList);

    }
    private _resetSelectedSubjectList(){
        var self = this,
            subject;
        
        angular.forEach(self._selectedSubjectList, function(id){
            subject = self._subjectService.getById(id) || null;
            if(subject !== null){
                subject.selected = false;
            }
        });
        
        this._selectedSubjectList = [];
        self._$scope.$broadcast('E_DISPLAY_DASHBOARD_TOASTER',  self._selectedSubjectList, self._selectedFolderList);

    }

    private _resetSelectedList(){
        this._resetSelectedFolderList();
        this._resetSelectedSubjectList();
    }



}
