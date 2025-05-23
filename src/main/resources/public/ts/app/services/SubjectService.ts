import { ng, Behaviours } from 'entcore';
import { ISubject, IGrain, IFolder, Subject } from '../models/domain';
import { ISubjectDocument } from '../models/domain/SubjectDocument';
import { SerializationHelper, MapToListHelper } from '../models/helpers';
import { IGrainService } from './GrainService';
import { timeLog } from 'core-js/core/log';

function cleanBeforeSave(subject: ISubject|IGrain):ISubject|IGrain{
    const copy:any = {...subject}
    if(copy.owner && copy.owner.userId){
        copy.owner = copy.owner.userId;
    }
    delete copy["tracker"];
    if( copy["files"] ) delete copy["files"];
    return copy;
}

export interface ISubjectService {
    renameFileInWorkspace (id:string, name:string)
    getFileFromWorkspace(id: String): Promise<any>;
    generate(subject: ISubject & { file: File }): Promise<any>;
    resolve(force?:boolean): Promise<boolean>;
    persist(subject: ISubject): Promise<ISubject>;
    importSubject(subject: ISubject, grains: IGrain[]): Promise<ISubject>;
    update(subject: ISubject, updateMaxScore:boolean): Promise<ISubject>;
    remove(subjectIds: number[]): Promise<boolean>;
    getById(id: number): ISubject;
    getList(): ISubject[];
    getById(id: number): ISubject;
    getByIdEvenDeleted (id:number) : Promise<any>;
    duplicateSubjectsFromLibrary (subjectIds:number[], folderId:number);
    duplicate(ids: number[], folder: IFolder): Promise<boolean>;
    move(ids: number[], folder: IFolder): Promise<boolean>;
    importImage(file, name): Promise<String>;
    listFiles(id): Promise<ISubjectDocument[]>;
}

export class SubjectService implements ISubjectService {

    static $inject = [
        '$q',
        '$http',
        'GrainService'
    ];

    private _listMappedById: { [id: number]: ISubject; };

    constructor
    (
        private _$q,
        private _$http,
        private _grainService: IGrainService
    ) {
        this._$q = _$q;
        this._$http = _$http;
        this._grainService = _grainService;
    }

    public resolve = function(force:boolean = false): Promise<boolean> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: 'exercizer/subjects'
            };

        if (this._listMappedById !== undefined && !force) {
            deferred.resolve(true);
        } else {
            this._$http(request).then(
                function(response) {
                    self._listMappedById = {};
                    var subject;
                    response.data.forEach(function(subjectObject) {
                        subject = SerializationHelper.toInstance(new Subject(), JSON.stringify(subjectObject)) as any;
                        self._afterPullBack(subject);
                        self._listMappedById[subject.id] = subject;
                    });
                    deferred.resolve(true);
                },
                function() {
                    deferred.reject('exercizer.error');
                }
            );
        }

        return deferred.promise;
    };

    public persist = function(subject: ISubject): Promise<ISubject> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/subject',
                data: cleanBeforeSave(subject)
            };

        if (!this._listMappedById) {
            this._listMappedById = {};
        }

        if(subject.id){
            self._beforePushBack(subject);
        }
        this._$http(request).then(
            function(response) {
                var subject = SerializationHelper.toInstance(new Subject(), JSON.stringify(response.data)) as any;
                self._afterPullBack(subject);

                self._listMappedById[subject.id] = subject;
                deferred.resolve(subject);
            },
            function() {
                deferred.reject('exercizer.error');
            }
        );
        return deferred.promise;
    };

    /**
     * use for import data from tdbase
     */
    public importImage = function(file, name): Promise<String>  {
        var formData = new FormData();
        formData.append('blob', file, name);

        var deferred = this._$q.defer(),
            thumbnails: "thumbnail=120x120&thumbnail=150x150&thumbnail=100x100&thumbnail=290x290&thumbnail=48x48&thumbnail=82x82&thumbnail=381x381";

        this._$http.post('/workspace/document?protected=true&application=media-library&' + thumbnails, formData, {
            withCredentials: false,
            headers: {
                'Content-Type': undefined
            },
            transformRequest: angular.identity,
            data: {
                formData
            },
            responseType: 'json'

        }).then(function(response){
                deferred.resolve(response.data._id);
            },
            function() {
                deferred.reject("exercizer.error");
            }
        );
        return deferred.promise;
    }

    /**
     * use for import data from tdbase
     */
    public importSubject = function(subject: ISubject, grains: IGrain[]): Promise<ISubject> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'POST',
                url: 'exercizer/subject/import',
                data: {subject:cleanBeforeSave(subject), grains:grains.map(g=>cleanBeforeSave(g))}
            };

        if (!this._listMappedById) {
            this._listMappedById = {};
        }
        
        this._$http(request).then(
            function(response) {
                var subject = SerializationHelper.toInstance(new Subject(), JSON.stringify(response.data)) as any;
                self._afterPullBack(subject);

                self._listMappedById[subject.id] = subject;
                deferred.resolve(subject);
            },
            function() {
                deferred.reject("exercizer.error");
            }
        );
        return deferred.promise;
    };

    public update = function(subject: ISubject, updateMaxScore:boolean = false): Promise<ISubject> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'PUT',
                url: 'exercizer/subject/' + subject.id,
                data: cleanBeforeSave(subject)
            };

        this._grainService.getListBySubject(subject).then(
            function(grainList){
                if (updateMaxScore) {
                    subject.max_score = 0;
                    angular.forEach(grainList, function (grain:IGrain) {
                        if (grain.grain_type_id > 3) {
                            subject.max_score += grain.grain_data.max_score;
                        }
                    })
                }
                if(self._beforePushBack(subject)){

                    self._$http(request).then(
                        function(response) {
                            //var newSubject = SerializationHelper.toInstance(new Subject(), JSON.stringify(response.data));
                            subject.modified = response.data.modified;
                            
                            self._afterPullBack(subject);
                            deferred.resolve(subject);
                        },
                        function() {
                            deferred.reject('exercizer.error');
                        }
                    );
                }
            }
        );
        return deferred.promise;

    };

    public remove = function(subjectIds: number[]): Promise<boolean> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'PUT',
                url: 'exercizer/subject/mark/delete',
                data: {ids: subjectIds}
            };

        self._$http(request).then(
            function() {
                deferred.resolve(true);
            },
            function() {
                deferred.reject('exercizer.error');
            }
        );

        return deferred.promise;
    };

    public move = function(ids: number[], folder: IFolder = undefined): Promise<boolean> {
        var self = this,
            deferred = this._$q.defer();

        var folderId = (folder) ? folder.id : null;

        var body = {ids: ids, folderId: folderId};

        let request = {
            method: 'PUT',
            url: 'exercizer/subjects/move',
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
    };

    public duplicate = function(ids: number[], folder: IFolder = undefined): Promise<boolean> {
        var self = this,
            deferred = this._$q.defer();

        var folderId;
        if(folder){
            folderId = folder.id;
        } else{
            folderId = null;
        }
        
        var body = {ids: ids, folderId: folderId};

        let request = {
            method: 'POST',
            url: 'exercizer/subject/duplicate',
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
    };
    
    public duplicateSubjectsFromLibrary = function(subjectIds:number[], folderId:number) {
        var self = this,
            deferred = this._$q.defer();

        let param = {ids: subjectIds, folderId: folderId};

        let request = {
            method: 'POST',
            url: 'exercizer/subjects/duplicate/library',
            data: param
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
        
    };

    public getList = function(): ISubject[] {
        if (!angular.isUndefined(this._listMappedById)) {
            return MapToListHelper.toList(this._listMappedById);
        } else {
            return [];
        }
    };

    public getById = function(id:number):ISubject {
        return this._listMappedById[id];
    };

    public getByIdEvenDeleted = function(id:number) : Promise<any> {
        var deferred = this._$q.defer(), res;
        this.getSubjectListEvenDeleted().then(function(subjectList){
            subjectList.forEach(function(subjectObject){
                if(id == subjectObject.id){
                    res = SerializationHelper.toInstance(new Subject(), JSON.stringify(subjectObject)) as any;
                }
            });
            if(res){
                deferred.resolve(res);
            } else{
                deferred.reject("exercizer.error");
            }

        }.bind(this));
        return deferred.promise;

    };

    public listFiles(id): Promise<ISubjectDocument[]> {
        var self = this,
            deferred = this._$q.defer(),
            request = {
                method: 'GET',
                url: `exercizer/subject/${id}/files`
            };

        this._$http(request).then(
            function(response) {
                deferred.resolve(response.data);
            },
            function() {
                deferred.reject('exercizer.error');
            }
        );

        return deferred.promise;
    }

    private getSubjectListEvenDeleted = function() : Promise<any> {
        var deferred = this._$q.defer(),
        request = {
            method: 'GET',
            url: 'exercizer/subjects-all'
        };
        this._$http(request).then(
            function(data) {
                deferred.resolve(data.data);
            },
            function() {
                deferred.reject('exercizer.error');
            }
        );
        return deferred.promise;
    };

    private _beforePushBack(subject){
        delete subject.myRights;
        if(subject.owner && subject.owner.userId){
            subject.owner = subject.owner.userId;
            return true
        } else{
            return false;
        }
    }

    private _afterPullBack(subject){
        subject.owner = { userId: subject.owner };
        Behaviours.findRights('exercizer', subject);

    }

    public getFileFromWorkspace(id: string): Promise<any> {
        const request = {
            method: 'GET',
            url: `/workspace/document/${id}`,
            responseType: 'blob'
        };

        return this._$http(request)
            .then((response) => {
                const blob = response.data;
                return blob;
            })
            .catch(() => {
                return Promise.reject("exercizer.error");
            });
    }

    public generate = (subject: any): Promise<any> => {
        const formData = {
            fileId: subject.file,
            id: subject.id
        };

        const request = {
            method: 'POST',
            url: '/exercizer/subject/generate',
            data: formData,
            headers: {
                'Accept': 'application/json'
            },
            withCredentials: true
        };

        return this._$http(request)
            .then((response) => {
                return response.data;
            })
            .catch((error) => {
                switch (error.status) {
                    case 400:
                        return Promise.reject("exercizer.error.invalid.image");
                    case 401:
                        return Promise.reject("exercizer.error.auth.token");
                    case 403:
                        return Promise.reject("exercizer.error.permission");
                    case 404:
                        return Promise.reject("exercizer.error.resource.notfound");
                    case 407:
                        return Promise.reject("exercizer.error.invalid.token.format");
                    case 415:
                        return Promise.reject("exercizer.error.unsupported.generation");
                    case 501:
                        return Promise.reject("exercizer.error.unsupported.format");
                    default:
                        return Promise.reject("exercizer.error");
                }
            });
    }

    public async renameFileInWorkspace( id: string, name: string) {
        try {
            await this._$http.put("/workspace/rename/" + id, { name: name });
        } catch (e) {
            console.error("failed to rename file: ", e);
        }
    }


}

export const subjectService = ng.service('SubjectService', SubjectService);