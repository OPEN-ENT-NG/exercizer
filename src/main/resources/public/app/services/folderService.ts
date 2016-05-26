interface IFolderService {
    createFolder(folder:IFolder, callbackSuccess, callBackFail);
    updateFolder(folder:IFolder, callbackSuccess, callBackFail);
    deleteFolder(folder:IFolder, callbackSuccess, callbackFail);
    createObjectFolder() : IFolder;
    setParentFolderId(originFolderId, targetFolderId);
    getListOfSubFolderByFolderId(folderId);
    folderById(id) : IFolder;
    folderList : IFolder[];
    currentFolderId;
}

class FolderService implements IFolderService {

    static $inject = [
        'serverUrl',
        '$http'
    ];

    // inject
    private serverUrl:string;
    private $http:any;
    private $scope; // Evil

    // variables
    private _folderList:any;
    // TODO move to controller;
    private _currentFolderId;
    private _folderListByParentFolderId;

    constructor(serverUrl,
                $http
                ) {
        this.serverUrl = serverUrl;
        this.$http = $http;

        // init folder list as an object
        this._folderList = {};
        this._folderListByParentFolderId = {};
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
        return {
            id: null,
            label: null,
            parent_folder_id: null
        }
    }

    public createFolder(folder:IFolder, callbackSuccess, callBackFail) {
        var self = this;
        this._createFolder(
            folder,
            function (data) {
                self.addFolderToFolderList(data);
                if (callbackSuccess) {
                    callbackSuccess(data);
                }
            },
            function (err) {
                console.error(err);
            }
        );
    }

    private addFolderToFolderList(folder:IFolder) {
        if (this._folderList[folder.id]) {
            delete this._folderList[folder.id];
        }
        this._folderList[folder.id] = folder;
    }


    public updateFolder(folder:IFolder, callbackSuccess, callbackFail) {
        var self = this;
        this._updateFolder(
            folder,
            function (data) {
                // data is a folder;
                self.addFolderToFolderList(data);
                console.log(self._folderList);
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
                console.log(data);
                self.removeFolderToFolderList(data);
                self.removeFolderToFolderListByParentFolderId(data);
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

    private _createFolder(folder:IFolder, callbackSuccess, callbackFail) {
        folder.id = Math.floor((Math.random() * 1000) + 1);
        if (callbackSuccess) {
            callbackSuccess(folder);
        }
    }

    private _deleteFolder(folder:IFolder, callbackSuccess, callbackFail) {
        if (callbackSuccess) {
            callbackSuccess(folder);
        }
    }


}