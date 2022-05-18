import { ng, notify } from 'entcore';
import { IFolderService, ISubjectService } from '../services';
import { angular } from 'entcore';
import http from 'axios';

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
        private _$location,
        private _$scope,
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
                self._subjectService.resolve(true).then(
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

        self._$scope.$root.$on('share-updated', function(event, data){
            if(self._selectedSubjectList[0]){
                var subject = self._subjectService.getById(self._selectedSubjectList[0]);
                if(data.added){
                    if(subject.shared.length > 0){
                     // already shared
                    } else{
                        subject.shared.push({userId : data.added.userId})
                    }
                } else {
                    if(subject.shared.length > 0){
                        subject.shared = [];
                    } else{
                        // subject not shared
                    }
                }
            } else{
                console.error('Subject is not defined');
            }
            self._resetSelectedSubjectList();

        });

        self._$scope.$on('E_RESET_SELECTED_LIST', function() {
            self._resetSelectedList();
        });

        self._$scope.$on('E_ADD_NEW_SUBJECT', function(event, currentFolderId) {
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_EDIT_SUBJECT', null, currentFolderId);
        });
        
        self._$scope.$on('E_SELECT_FOLDER', function (event, folder) {
            self._toggleItem(folder.id, folder.selected, self._selectedFolderList);
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_TOASTER',  self._selectedSubjectList, self._selectedFolderList);
        });

        self._$scope.$on('E_SELECT_SUBJECT', function (event, subject) {
            self._toggleItem(subject.id, subject.selected, self._selectedSubjectList);
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_TOASTER',  self._selectedSubjectList, self._selectedFolderList);
        });

        self._$scope.$on('E_CREATE_FOLDER', function (event, currentFolderId) {
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_EDIT_FOLDER', null, currentFolderId);
        });

        self._$scope.$on('E_SCHEDULE_SUBJECT', function (event, subject) {
            self._$scope.$broadcast('E_DISPLAY_MODAL_SCHEDULE_SUBJECT', subject);
            self._resetSelectedSubjectList();
        });

        self._$scope.$on('E_SHARE_SUBJECT', function (event, subject) {
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_SHARE', subject);
        });

        self._$scope.$on('E_PUBLISH_SUBJECT', function (event, subject) {
            self._$scope.$broadcast('E_DISPLAY_MODAL_PUBLISH_TO_LIBRARY', subject);
            self._resetSelectedSubjectList();
        });

        self._$scope.$on('E_EDIT_FOLDER', function (event, folder) {
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_EDIT_FOLDER', folder, null);
            self._resetSelectedFolderList();
        });

        self._$scope.$on('E_COPY_SELECTED_FOLDER_SUBJECT', function () {
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_COPY_PASTE', self._selectedSubjectList, self._selectedFolderList);
            // reset list in confirm
        });

        self._$scope.$on('E_MOVE_SELECTED_FOLDER_SUBJECT', function () {
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_MOVE', self._selectedSubjectList, self._selectedFolderList);
            // reset list in confirm
        });

        self._$scope.$on('E_EDIT_SUBJECT', function (event, subject) {
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_EDIT_SUBJECT', subject);
            self._resetSelectedSubjectList();
        });

        self._$scope.$on('E_PRINT_SELECTED_SUBJECT', function (event, subject) {
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_PRINT', subject);
        });

        self._$scope.$on('E_REMOVE_SELECTED_FOLDER_SUBJECT', function () {
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_REMOVE_SELECTED_FOLDER_SUBJECT', self._selectedSubjectList, self._selectedFolderList);
            // reset list in confirm
        });

        self._$scope.$on('E_EXPORT_SELECTED_SUBJECT', function (event, subject) {
            self._$scope.$broadcast('E_DISPLAY_DASHBOARD_MODAL_EXPORT_SUBJECT', subject);
        });

        self._$scope.$on('E_DUPLICATE_SUBJECT', function (event, subject)
        {
            notify.info("duplicate.start");
            http.post("/archive/duplicate", { application: "exercizer", resourceId: subject.id.toString() })
                .then(function()
                {
                    notify.info("duplicate.done");
                    self._subjectService.resolve(true);
                })
                .catch(function()
                {
                    notify.error("duplicate.error");
                });
        });

        self._$scope.$on('E_CONFIRM_REMOVE_SELECTED_FOLDER_SUBJECT', function () {
            // delete subject list
            if (self._selectedSubjectList.length > 0) {
                self._subjectService.remove(self._selectedSubjectList).then(
                    function(data){
                        self._subjectService.resolve(true);
                    },
                    function(err){
                        notify.error(err);
                    }
                );
                self._resetSelectedSubjectList();
            }
            if (self._selectedFolderList.length >0) {
                self._folderService.remove(self._selectedFolderList).then(
                    function (data) {
                        self._folderService.resolve().then(
                            function() {
                                self._subjectService.resolve(true).then(
                                    function () {
                                        self._eventsHandler(self);
                                    },
                                    function (err) {
                                        notify.error(err);
                                    }
                                );
                            });
                    },
                    function(err){
                        notify.error(err);
                    }
                );
                self._resetSelectedFolderList();
            }
                     
            self._$scope.$broadcast('E_RESET_SELECT_ALL');
        });

        self._$scope.$on('E_CONFIRM_COPY_PASTE', function (event, folderParent) {
            // copy subject list

            if (self._selectedSubjectList.length > 0) {
                self._subjectService.duplicate(self._selectedSubjectList, folderParent).then(
                    function (data) {
                        self._subjectService.resolve(true);
                    },
                    function (err) {
                        console.error('fail', err);
                        notify.error(err);

                    }
                );
                self._resetSelectedSubjectList();
            }
            if (self._selectedFolderList.length > 0) {
                self._folderService.duplicate(folderParent, self._selectedFolderList).then(
                    function (data) {                       
                        self._folderService.resolve().then(
                            function() {
                                self._subjectService.resolve(true).then(
                                    function() {
                                        self._eventsHandler(self);
                                    },
                                    function(err) {
                                        notify.error(err);
                                    }
                                );
                            });
                    },
                    function (err) {
                        console.error('fail', err);
                        notify.error(err);

                    }
                );
                self._resetSelectedFolderList();
            }

            self._$scope.$broadcast('E_RESET_SELECT_ALL');

        });

        self._$scope.$on('E_CONFIRM_MOVE', function (event, folderParent) {
            // copy subject list
            if (self._selectedSubjectList.length > 0) {
                self._subjectService.move(self._selectedSubjectList, folderParent).then(
                    function (data) {
                        self._subjectService.resolve(true);
                    },
                    function (err) {
                        console.error('fail', err);
                        notify.error(err);

                    }
                );
                self._resetSelectedSubjectList();
            }
            if (self._selectedFolderList.length > 0) {
                // copy folder list
                self._folderService.move(folderParent, self._selectedFolderList).then(
                    function (data) {
                        self._folderService.resolve().then(
                            function() {
                                self._subjectService.resolve(true).then(
                                    function() {
                                        self._eventsHandler(self);
                                    },
                                    function(err) {
                                        notify.error(err);
                                    }
                                );
                            });
                    },
                    function (err) {
                        notify.error(err);
                    }
                );
                self._resetSelectedFolderList();
            }
            self._$scope.$broadcast('E_RESET_SELECT_ALL');

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

export const teacherDashboardSubjectTabController = ng.controller('TeacherDashboardSubjectTabController', TeacherDashboardSubjectTabController);