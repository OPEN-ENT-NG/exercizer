interface IFolderService {
    persist(folder:IFolder):ng.IPromise<IFolder>;
    update(folder:IFolder):ng.IPromise<IFolder>;
    remove(folder:IFolder) : ng.IPromise<IFolder>;
    duplicate(folder:IFolder) : ng.IPromise<IFolder>;
    setParentFolderId(originFolderId, targetFolderId);
    getListOfSubFolderByFolderId(folderId);
    folderById(id:number) : IFolder;
    folderList : IFolder[];
}

class FolderService implements IFolderService {

    static $inject = [
        '$http',
        '$q',
        'SubjectService'
    ];

    // Inject
    private _$http;
    private _$q:ng.IQService;
    private _subjectService;

    // Variable
    private _folderList:any;
    private _folderListByParentFolderId;

    constructor($http, $q, SubjectService) {
        this._$http = $http;
        this._$q = $q;
        this._subjectService = SubjectService;
        // init folder list as an object
        this._folderList = {};
        this._folderListByParentFolderId = {};
        this.loadFolderList();
    }

    /**
     * get folder list
     * @returns {any}
     */
    public get folderList():IFolder[] {
        return this._folderList;
    }

    /**
     * Get folder by id
     * @param id
     * @returns {*}
     */
    public folderById(id:number):IFolder {
        return this._folderList[id];
    }

    /**
     * load folder
     * @returns {IPromise<T>}
     * @private
     */
    private loadFolderList() {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: 'exercizer/folders'
            };
        this._$http(request).then(
            function (response) {
                var folder;
                angular.forEach(response.data, function (folderObject) {
                    folder = SerializationHelper.toInstance(new Folder(), JSON.stringify(folderObject));
                    self._folderList[folder.id] = folder;
                });
                deferred.resolve(self._folderList);
            },
            function () {
                deferred.reject('Une erreur est survenue lors de la récupération de vos dossiers.');
            }
        );
        return deferred.promise;
    }

    /**
     * get list of fodler by folder parent id
     * @param folderId
     * @returns {any}
     */
    public getListOfSubFolderByFolderId(folderId) {
        if (this._folderListByParentFolderId[folderId]) {
            // already set
        } else {
            // init _folderListByParentFolderId for this id
            this._folderListByParentFolderId[folderId] = {};
            // build it
            var self = this;
            angular.forEach(this._folderList, function (value, key) {
                if (value.parent_folder_id == folderId) {
                    self._folderListByParentFolderId[folderId][value.id] = value;
                }
            });
        }
        return this._folderListByParentFolderId[folderId];
    }

    /**
     * persist a folder
     * @param folder
     * @returns {IPromise<T>}
     */
    public persist(folder:IFolder):ng.IPromise<IFolder> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/folder',
                data: folder
            };
        this._$http(request).then(
            function (response) {
                folder = SerializationHelper.toInstance(new Folder(), JSON.stringify(response.data));
                self._folderList[folder.id] = folder;
                deferred.resolve(folder);
            },
            function () {
                deferred.reject('Une erreur est survenue lors de la création du dossier.');
            }
        );
        return deferred.promise;
    }

    /**
     * update a folder
     * @param folder
     * @returns {IPromise<T>}
     */
    public update(folder):ng.IPromise<IFolder> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'PUT',
                url: 'exercizer/folder',
                data: folder
            };
        // delete selected
        delete folder.selected;
        this._$http(request).then(
            function (response) {
                deferred.resolve(folder);
            },
            function () {
                deferred.reject('Une erreur est survenue lors de la création du dossier.');
            }
        );
        return deferred.promise;
    }

    /**
     * remove folder
     * @param folder
     * @returns {IPromise<T>}
     */
    public remove(folder:IFolder):ng.IPromise<IFolder> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'DELETE',
                url: 'exercizer/folder',
                data: folder
            };
        this._$http(request).then(
            function (response) {
                delete self._folderList[folder.id];
                self.removeFolderToFolderListByParentFolderId(folder);
                self.deleteChildrenFolder(folder);
                self.deleteChildrenSubject(folder);
                deferred.resolve();
            },
            function () {
                deferred.reject('Une erreur est survenue lors de la suppression du sujet.');
            }
        );
        return deferred.promise;
    }

    private deleteChildrenSubject(folder:IFolder) {
        this._subjectService.deleteSubjectChildrenOfFolder(folder);
    }

    private deleteChildrenFolder(folder:IFolder) {
        var self = this;
        angular.forEach(this._folderList, function (value, key) {
            if (value.parent_folder_id === folder.id) {
                self.remove(value);
            }
        });
    }

    /**
     * duplicate a folder
     * @param folder
     * @returns {IPromise<T>}
     */
    public duplicate(folder:IFolder):ng.IPromise<IFolder> {
        var self = this,
            deferred = this._$q.defer(),
            newFolder = new Folder();
        newFolder.label = folder.label + "_copie";
        this.persist(newFolder)
            .then(function (dataFolder) {
                    deferred.resolve(dataFolder);
                }
            );
        return deferred.promise;
    }

    /**
     * remove folder list  in folderListByFolderID
     * @param folder
     */
    private removeFolderToFolderListByParentFolderId(folder:IFolder) {
        var self = this;
        angular.forEach(this._folderListByParentFolderId, function (value_1, key_1) {
            if (folder.id == key_1) {
                // delete parent folder
                delete self._folderListByParentFolderId[key_1];
            }
            if (value_1) {
                angular.forEach(value_1, function (value_2, key_2) {
                    if (folder.id == key_2) {
                        // delete children folder
                        delete self._folderListByParentFolderId[key_1][key_2];
                    }
                });
            }
        });
    }

    /**
     * set parent id to a folder
     * @param originFolderId
     * @param targetFolderId
     */
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
                    if (!this._folderListByParentFolderId[targetFolderId]) {
                        this._folderListByParentFolderId[targetFolderId] = [];
                    }
                    this._folderListByParentFolderId[targetFolderId][originFolderId] = originFolder;
                }
            }
        }
        this.update(this.folderById(originFolder.id));

    }

    /**
     * check if a folder is a parent of a other folder
     * @param originFolder
     * @param targetFolder
     * @returns {boolean}
     */
    private isAParentOf(originFolder, targetFolder):boolean {
        if (targetFolder.parent_folder_id == null) {
            return false;
        } else if (originFolder.id == targetFolder.parent_folder_id) {
            return true;
        } else {
            return this.isAParentOf(originFolder, this._folderList[targetFolder.parent_folder_id]);
        }
    }
}