interface IFolderService {
    resolve(): ng.IPromise<boolean>;
    persist(folder:IFolder):ng.IPromise<IFolder>;
    update(folder:IFolder):ng.IPromise<IFolder>;
    remove(folderIds: number[]) : ng.IPromise<boolean>;
    setParentFolderId(originFolderId, targetFolderId);
    getListOfSubFolderByFolderId(folderId);
    folderById(id:number) : IFolder;
    isAParentOf(originFolder, targetFolder):boolean;
    folderList : IFolder[];
    duplicate(targetFolder: IFolder, sourcesFolders: number[]): ng.IPromise<boolean>;
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
        // init _folderListByParentFolderId for this id
        this._folderListByParentFolderId[folderId] = {};
        // build it
        var self = this;
        angular.forEach(this._folderList, function (value, key) {
            if (value.parent_folder_id == folderId) {
               self._folderListByParentFolderId[folderId][value.id] = value;
            }
        });
        
        return this._folderListByParentFolderId[folderId];
    }

    public getList = function(): IFolder[] {
        if (!angular.isUndefined(this._folderList)) {
            return MapToListHelper.toList(this._folderList);
        } else {
            return [];
        }
    };

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
                url: 'exercizer/folder/'+folder.id,
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

    public remove = function(folderIds: number[]): ng.IPromise<boolean> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/folders/delete',
                data: {sourceFoldersId: folderIds}
            };

        self._$http(request).then(
            function() {
                _.forEach(folderIds, function (id) {
                    delete self._folderList[id];
                    self._removeFolderToFolderListByParentFolderId(id);
                });

                deferred.resolve(true);
            },
            function() {
                deferred.reject('Une erreur est survenue lors de la suppression du sujet.');
            }
        );

        return deferred.promise;
    };
    
    public duplicate(targetFolder: IFolder, sourcesFolders: number[]): ng.IPromise<boolean> {
        var deferred = this._$q.defer(),
            self= this;

        var targetFolderId;
        if(targetFolder){
            targetFolderId = targetFolder.id;
        } else{
            targetFolderId = null;
        }        

        var body = {targetFolderId: targetFolderId, sourceFoldersId: sourcesFolders};

        let request = {
            method: 'POST',
            url: 'exercizer/folders/duplicate',
            data: body
        };

        this._$http(request).then(
            function(response) {
                deferred.resolve(true);
            },
            function(e) {
                deferred.reject(e.data.error);
            }
        );


        return deferred.promise;
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
                notify.error("Déplacement non autorisé.");
            } else {
                // check if the folder is not drop in itself
                if (originFolderId == targetFolderId) {
                    console.error("A folder can't be placed in itself");
                    notify.error("Déplacement non autorisé.");
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
    private _removeFolderToFolderListByParentFolderId(folderId: number) {
        var self = this;
        angular.forEach(this._folderListByParentFolderId, function(value_1, key_1) {
            if (folderId == key_1) {
                // delete parent folder
                delete self._folderListByParentFolderId[key_1];
            }
            if (value_1) {
                angular.forEach(value_1, function(value_2, key_2) {
                    if (folderId == key_2) {
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