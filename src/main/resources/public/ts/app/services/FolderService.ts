import { ng } from 'entcore';
import { IFolder, Folder } from '../models/domain/Folder';
import { SerializationHelper, MapToListHelper } from '../models/helpers';

export interface IFolderService {
    resolve(): Promise<boolean>;
    persist(folder:IFolder):Promise<IFolder>;
    update(folder:IFolder):Promise<IFolder>;
    remove(folderIds: number[]) : Promise<boolean>;
    getListOfSubFolderByFolderId(folderId);
    folderById(id:number) : IFolder;
    folderList : IFolder[];
    duplicate(targetFolder: IFolder, sourcesFolders: number[]): Promise<boolean>;
    move(targetFolder: IFolder, sourcesFolders: number[]): Promise<boolean>;
}

export class FolderService implements IFolderService {

    static $inject = [
        '$http',
        '$q',
        'SubjectService'
    ];

    // Inject
    private _$http;
    private _$q;
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

    public resolve(): Promise<boolean> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: 'exercizer/folders'
            };
        self._folderList= {};
        this._$http(request).then(
            function (response) {
                // for each folder, add to list
                response.data.forEach(function (folderObject) {
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
    public persist(folder:IFolder):Promise<IFolder> {
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
    public update(folder):Promise<IFolder> {
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

    public remove(folderIds: number[]): Promise<boolean> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/folders/delete',
                data: {ids: folderIds}
            };

        self._$http(request).then(
            function() {
                deferred.resolve(true);
            },
            function() {
                deferred.reject('Une erreur est survenue lors de la suppression du sujet.');
            }
        );

        return deferred.promise;
    };
    
    public duplicate(targetFolder: IFolder, sourcesFolders: number[]): Promise<boolean> {
        var deferred = this._$q.defer(),
            self= this;

        var targetFolderId;
        if(targetFolder){
            targetFolderId = targetFolder.id;
        } else{
            targetFolderId = null;
        }        

        var body = {targetFolderId: targetFolderId, ids: sourcesFolders};

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

    public move(targetFolder: IFolder, sourcesFolders: number[]): Promise<boolean> {
        var deferred = this._$q.defer(),
            self= this;

        var targetFolderId = (targetFolder) ? targetFolder.id : null;
        
        var body = {targetFolderId: targetFolderId, ids: sourcesFolders};

        let request = {
            method: 'PUT',
            url: 'exercizer/folders/move',
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
}

export const folderService = ng.service('FolderService', FolderService);