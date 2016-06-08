interface IFolderService {
    resolve(): ng.IPromise<boolean>;
    persist(folder:IFolder):ng.IPromise<IFolder>;
    update(folder:IFolder):ng.IPromise<IFolder>;
    remove(folder:IFolder) : ng.IPromise<IFolder>;
    duplicate(folder: IFolder, parentFolder : IFolder, recursive : boolean) : ng.IPromise<IFolder>;
    setParentFolderId(originFolderId, targetFolderId);
    getListOfSubFolderByFolderId(folderId);
    folderById(id:number) : IFolder;
    isAParentOf(originFolder, targetFolder):boolean;
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
        
        this._folderList = {};
        this._folderListByParentFolderId = {};
    }

    public resolve(): ng.IPromise<boolean> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: 'exercizer/folders'
            };
        this._$http(request).then(
            function (response) {
                // for each folder, add to list
                angular.forEach(response.data, function (folderObject) {
                    var folder = SerializationHelper.toInstance(new Folder(), JSON.stringify(folderObject));
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
     * get list of folder by folder parent id
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
        var deferred = this._$q.defer(),
            self = this;
        // before delete children
        var promises = [];
        promises.push(this.deleteChildrenFolder(folder));
        promises.push(this._subjectService.deleteSubjectChildrenOfFolder(folder));
        this._$q.all(promises).then(
            function(results) {
                    var request = {
                        method: 'DELETE',
                        url: 'exercizer/folder',
                        data: folder
                    };
                    self._$http(request).then(
                    function () {
                        delete self._folderList[folder.id];
                        self._removeFolderToFolderListByParentFolderId(folder);
                        deferred.resolve();
                    },
                    function () {
                        deferred.reject('Une erreur est survenue lors de la suppression du dossier.');
                    }
                );
            }
        );
        return deferred.promise;
    }

    private deleteChildrenFolder(folder:IFolder) {
        var self = this,
            deferred = this._$q.defer();
        var promises = [];
        angular.forEach(this._folderList, function (value, key) {
            if (value.parent_folder_id === folder.id) {
                promises.push(self.remove(value));
            }
        });
        this._$q.all(promises).then(
            function(results) {
                deferred.resolve();
            }, function(err){
                console.error(err);
                deferred.reject
            }
        );
        return deferred.promise;
    }

    /**
     * duplicate folder
     * @param folder
     * @param parentFolder
     * @param recursive
     * @returns {IPromise<T>}
     */
    public duplicate(folder: IFolder, parentFolder : IFolder, recursive : boolean): ng.IPromise<IFolder> {
        var deferred = this._$q.defer(),
            self= this;
        // create new folder
        var newFolder = new Folder();
            newFolder.label = folder.label + '_copie';
        // verification
        if(parentFolder && folder.id === parentFolder.id){
            var msg = "Vous ne pouvez pas dupliquer le dossier dans lui-même.";
            deferred.reject(msg);
        } else if (self.isAParentOf(folder, parentFolder)){
            var msg = "Vous ne pouvez pas dupliquer le dossier dans lui-même.";
            deferred.reject(msg);
        } else{
            // persist it
            this.persist(newFolder).then(
                function(duplicatedFolder: IFolder) {
                    // if origin folder has children
                    var childrenFolder = self.getListOfSubFolderByFolderId(folder.id);
                    var childrenSubject = self._subjectService.getListByFolderId(folder.id);
                    if(childrenFolder){
                        self.duplicateList(childrenFolder, duplicatedFolder)
                    }
                    if(childrenSubject){
                        self._subjectService.duplicateList(childrenSubject,duplicatedFolder);
                    }
                    // set parent folder id
                    if(parentFolder){
                        self.setParentFolderId(duplicatedFolder.id, parentFolder.id);
                    } else {
                        self.setParentFolderId(duplicatedFolder.id, null);
                    }
                    deferred.resolve(duplicatedFolder);
                },
                function() {
                    deferred.reject('Une erreur est survenue lors de la duplication du dossier.')
                }
            );
        }
        return deferred.promise;
    }

    public duplicateList(list, parentFolder){
        var self = this,
            deferred = this._$q.defer(),
            promises = [];
        angular.forEach(list, function(value) {
            promises.push(self.duplicate(value,parentFolder, true));
        });
        this._$q.all(promises).then(
            function(data) {
                deferred.resolve(data);
            }, function(err) {
                console.error(err);
                deferred.reject(err);
            }
        );
        return deferred.promise;
    };

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
                notify.error("Deplacement non autorisé");
            } else {
                // check if the folder is not drop in itself
                if (originFolderId == targetFolderId) {
                    console.error("A folder can't be placed in itself");
                    notify.error("Deplacement non autorisé");
                } else {
                    // before change parent folder id
                    // delete folder from old _folderListByParentFolderId
                    if (originFolder.parent_folder_id) {
                        delete this._folderListByParentFolderId[originFolder.parent_folder_id][originFolderId];
                    }
                    originFolder.parent_folder_id = targetFolderId;
                    // persist folder
                    this.update(this.folderById(originFolder.id));

                    // after change parent folder id
                    //  add folder to new _folderListByParentFolderId
                    if (!this._folderListByParentFolderId[targetFolderId]) {
                        this._folderListByParentFolderId[targetFolderId] = [];
                    }
                    this._folderListByParentFolderId[targetFolderId][originFolderId] = originFolder;
                }
            }
        }

    }

    /**
     * remove folder list  in folderListByFolderID
     * @param folder
     */
    private _removeFolderToFolderListByParentFolderId(folder: IFolder) {
        var self = this;
        angular.forEach(this._folderListByParentFolderId, function(value_1, key_1) {
            if (folder.id == key_1) {
                // delete parent folder
                delete self._folderListByParentFolderId[key_1];
            }
            if (value_1) {
                angular.forEach(value_1, function(value_2, key_2) {
                    if (folder.id == key_2) {
                        // delete children folder
                        delete self._folderListByParentFolderId[key_1][key_2];
                    }
                });
            }
        });
    }

    /**
     * check if a folder is a parent of a other folder
     * @param originFolder
     * @param targetFolder
     * @returns {boolean}
     */
    public isAParentOf(originFolder, targetFolder):boolean {
        if(!originFolder || !targetFolder){
            return false;
        }
        if (targetFolder.parent_folder_id == null) {
            return false;
        } else if (originFolder.id == targetFolder.parent_folder_id) {
            return true;
        } else {
            return this.isAParentOf(originFolder, this._folderList[targetFolder.parent_folder_id]);
        }
    }

}