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
        this._resetSelectedList();

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

        self._$scope.$on('E_RESET_SELECTED_LIST', function() {
            self._resetSelectedList();
        });

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

        self._$scope.$on('E_SHARE_SUBJECT', function (event, subject) {
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_SHARE', subject);
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
                self._subjectService.remove(self._subjectService.getById(id)).then(
                    function(data){
                    },
                    function(err){
                        console.error('fail', err);
                        notify.error(err);

                    }
                );
            });
            self._resetSelectedSubjectList();
            // delete folder list
            angular.forEach(self._selectedFolderList, function (id) {
                self._folderService.remove(self._folderService.folderById(id)).then(
                    function(data){
                    },
                    function(err){
                        console.error('fail', err);
                        notify.error(err);

                    }
                );
            });
            self._resetSelectedFolderList();
        });

        self._$scope.$on('E_CONFIRM_COPY_PASTE', function (event, folderParent) {
            // copy subject list
            angular.forEach(self._selectedSubjectList, function (id) {
                self._subjectService.duplicate(self._subjectService.getById(id), folderParent).then(
                    function(data){
                    },
                    function(err){
                        console.error('fail', err);
                        notify.error(err);

                    }
                );
            });
            self._resetSelectedSubjectList();
            // copy folder list
            angular.forEach(self._selectedFolderList, function (id) {
                self._folderService.duplicate(self._folderService.folderById(id), folderParent, true).then(
                    function(data){
                    },
                    function(err){
                        console.error('fail', err);
                        notify.error(err);

                    }
                );
            });
            self._resetSelectedFolderList();
        });
    };

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
        var self = this;
        angular.forEach(self._folderService.folderList, function(folder : any){
            if(folder !== null){
                if(folder.selected){
                    folder.selected = false;
                }
            }
        });
        this._selectedFolderList = [];
        self._$scope.$broadcast('E_DISPLAY_DASHBOARD_TOASTER',  self._selectedSubjectList, self._selectedFolderList);

    }
    private _resetSelectedSubjectList(){
        var self = this;
        angular.forEach(self._subjectService.getList(), function(subject : any){
            if(subject !== null){
                if(subject.selected){
                    subject.selected = false;
                }
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
