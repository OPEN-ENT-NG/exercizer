interface IFolderService {
    createFolder(folder:IFolder, callbackSuccess, callBackFail);
    updateFolder(folder:IFolder, callbackSuccess, callBackFail);
    deleteFolder(folder:IFolder, callbackSuccess, callbackFail);
    createObjectFolder() : IFolder;
    setParentFolderId(originFolderId, targetFolderId);
    getListOfSubFolderByFolderId(folderId);
    duplicateFolder(folder: IFolder, callbackSuccess, callBackFail)
    folderById(id) : IFolder;
    folderList : IFolder[];
    currentFolderId;
}

class FolderService implements IFolderService {

    static $inject = [
        '$http',
        '$q',
        'SubjectService',
    ];

    // inject
    private $http:any;
    private $q:any;
    private subjectService;

    // variables
    private _folderList:any;
    // TODO move to controller;
    private _currentFolderId;
    private _folderListByParentFolderId;

    constructor(
        $http,
        $q,
        SubjectService
    )
    {
        this.$http = $http;
        this.$q = $q;
        this.subjectService = SubjectService;
        // init folder list as an object
        this._folderList = {};
        this._folderListByParentFolderId = {};

        var self = this,
            request = {
                method: 'GET',
                url: 'exercizer/folders'
            };

        this.$http(request).then(
            function(response) {
                angular.forEach(response.data, function(folderObject) {
                    var folder = SerializationHelper.toInstance(new Folder(), JSON.stringify(folderObject));
                    self._folderList[folder.id] = folder;
                });
            },
            function() {
                notify.error('Une erreur est survenue lors de la récupération de vos dossiers.');
            }
        );

    }


    public get currentFolderId() {
        return this._currentFolderId;
    }

    public set currentFolderId(value) {
        this._currentFolderId = value;
    }

    public get folderList():IFolder[] {
        return this._folderList;
    }

    public folderById(id):IFolder {
        return this._folderList[id];
    }

    public createObjectFolder():IFolder {
        throw "DEPRECATED USE NEW FOLDER";
    }

    public createFolder(folder:IFolder, callbackSuccess, callBackFail) {
        this._persist(folder).then(callbackSuccess, callBackFail);
    }

    public duplicateFolder(folder: IFolder, callbackSuccess, callBackFail){
        var newFolder = new Folder();
        this.createFolder(newFolder,
        function(data){
            data.label = folder.label + "_(copie)";
            if(callbackSuccess){
                callbackSuccess(data);
            }

        }, null);
    }

    private addFolderToFolderList(folder:IFolder) {
        if (this._folderList[folder.id]) {
            delete this._folderList[folder.id];
        }
        this._folderList[folder.id] = folder;
    }


    public updateFolder(folder:IFolder, callbackSuccess, callbackFail) {
        this._updateFolder(
            folder,
            function (data) {
                // data is a folder;
                if (callbackSuccess) {
                    callbackSuccess(data);
                }
            },
            function (err) {
                if (callbackFail) {
                    callbackFail(err)
                }
            }
        )
    }

    public deleteFolder(folder:IFolder, callbackSuccess, callbackFail) {
        var self = this;
        this._deleteFolder(
            folder,
            function (data) {
                self.removeFolderToFolderList(data);
                self.removeFolderToFolderListByParentFolderId(data);
                self.deleteChildrenFolder(data);
                self.deleteChildrenSubject(data);
                if(callbackSuccess){
                    callbackSuccess(data);
                }
            },
            function (err) {
                if (callbackFail) {
                    callbackFail(err)
                }
            }
        )
    }

    private deleteChildrenSubject(folder){
        this.subjectService.deleteSubjectChildrenOfFolder(folder);
    }

    private deleteChildrenFolder(folder){
        var self = this;
        angular.forEach(this._folderList, function (value, key) {
            if(value.parent_folder_id === folder.id){
                self.deleteFolder(value, null, null);
            }
        });
    }

    private removeFolderToFolderList(folder:IFolder) {
        delete this._folderList[folder.id];
    }

    private removeFolderToFolderListByParentFolderId(folder: IFolder){
        var self = this;
        angular.forEach(this._folderListByParentFolderId, function (value_1, key_1) {
            if(folder.id == key_1){
                // delete parent folder
                delete self._folderListByParentFolderId[key_1];
            }
            if(value_1){
                angular.forEach(value_1, function (value_2, key_2) {
                    if(folder.id == key_2){
                        // delete children folder
                        delete self._folderListByParentFolderId[key_1][key_2];
                    }
                });
            }
        });
    }

    public setParentFolderId(originFolderId, targetFolderId) {
        var originFolder = this._folderList[originFolderId];
        if (!originFolder) {
            console.error('originFolder or targetFolder is not defined');
            throw ""
        }
        if (targetFolderId == null) {
            // drag to root
            if (originFolder.parent_folder_id) {
                delete this._folderListByParentFolderId[originFolder.parent_folder_id][originFolderId];
                originFolder.parent_folder_id = null;
            }
        } else {
            // drag to other folder
            var targetFolder = this._folderList[targetFolderId];
            // check if there are no loop in folder
            if (this.isAParentOf(originFolder, targetFolder)) {
                console.error("Loop folder not allowed");
            } else {
                // check if the folder is not drop in itself
                if (originFolderId == targetFolderId) {
                    console.error("A folder can't be placed in itself");
                } else {
                    // before change parent folder id
                    // delete folder from old _folderListByParentFolderId
                    if (originFolder.parent_folder_id) {
                        delete this._folderListByParentFolderId[originFolder.parent_folder_id][originFolderId];
                    }
                    originFolder.parent_folder_id = targetFolderId;
                    // after change parent folder id
                    //  add folder to new _folderListByParentFolderId
                    if(!this._folderListByParentFolderId[targetFolderId]){
                        this._folderListByParentFolderId[targetFolderId] = [];
                    }
                    this._folderListByParentFolderId[targetFolderId][originFolderId] = originFolder;
                }
            }
        }

    }

    private isAParentOf(originFolder, targetFolder):boolean {
        if (targetFolder.parent_folder_id == null) {
            return false;
        } else if (originFolder.id == targetFolder.parent_folder_id) {
            return true;
        } else {
            return this.isAParentOf(originFolder, this._folderList[targetFolder.parent_folder_id]);
        }
    }

    public getListOfSubFolderByFolderId(folderId) {
        if (this._folderListByParentFolderId[folderId]) {
            // already set
        } else {
            // init _folderListByParentFolderId for this id
            this._folderListByParentFolderId[folderId] = {};
            // build it
            angular.forEach(this._folderList, function (value, key) {
                if (value.parent_folder_id == folderId) {
                    this._folderListByParentFolderId[folderId][value.id] = value;
                }
            });
        }
        return this._folderListByParentFolderId[folderId];
    }


    private _updateFolder(folder:IFolder, callbackSuccess, callbackFail) {
        if (callbackSuccess) {
            callbackSuccess(folder);
        }
    }

    private _persist(folder:IFolder):ng.IPromise<IFolder> {
        var self = this,
            deferred = this.$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/folder',
                data: folder
            };

        this.$http(request).then(
            function(response) {
                folder = SerializationHelper.toInstance(new Folder(), JSON.stringify(response.data));
                self.addFolderToFolderList(folder);
                deferred.resolve(folder);
            },
            function() {
                deferred.reject('Une erreur est survenue lors de la création du dossier.');
            }
        );

        return deferred.promise;
    }

    private _deleteFolder(folder:IFolder, callbackSuccess, callbackFail) {
        if (callbackSuccess) {
            callbackSuccess(folder);
        }
    }


}