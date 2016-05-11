interface ISubjectService {
    createSubject(subject:ISubject, callbackSuccess, callBackFail);
    updateSubject(subject:ISubject, callbackSuccess, callbackFail)
    getSubjectList(params, callbackSuccess, callbackFail);
    subjectById(subject_id) : ISubject;
    subjectList : ISubject[];
    isSetSubjectList : boolean;
    currentSubjectId : number;
}

class SubjectService implements ISubjectService {

    static $inject = [
        'serverUrl',
        '$http',
        'GrainService'
    ];

    private serverUrl:string;
    private $http:any;
    private grainService;

    private _subjectList:ISubject[];
    private _isSetSubjectList:boolean;
    private _currentSubjectId:number;

    constructor(serverUrl,
                $http,
                GrainService) {
        this.serverUrl = serverUrl;
        this.$http = $http;
        this.grainService = GrainService;

        this._isSetSubjectList = false;
        this._subjectList = [];
        this._currentSubjectId = null;
        // DEV
        console.error('ONLY DEV : CREATE DEV SUBJECT');
        this.createDevSubject();

    }

    private createDevSubject() {
        var self = this;
        var subject:ISubject = this.createObjectSubject();
        subject.title = "DEV SUBJECT";
        this.createSubject(
            subject,
            function(data){
                console.error(data);
                self.grainService.getGrainListBySubjectId(data.id,null, null);
            },
            function(err){

            }
        );
    }


    public get subjectList():ISubject[] {
        return this._subjectList;
    }

    public get isSetSubjectList():boolean {
        return this._isSetSubjectList;
    }

    /**
     * Set isSetSubjectList is used to force refresh subject list
     * @param value
     */
    public set isSetSubjectList(value:boolean) {
        this._isSetSubjectList = value;
    }

    public get currentSubjectId():number {
        if (!this._currentSubjectId) {
            console.error('_currentSubjectId not defined');
        }
        return this._currentSubjectId;
    }

    public set currentSubjectId(value:number) {
        this._currentSubjectId = value;
    }

    public subjectById(subject_id):ISubject {
        return this._subjectList[subject_id]
    }

    public createObjectSubject() : ISubject{
        return {
            id: null,
            owner: null,
            created: null,
            modified: null,
            visibility: null,
            folder_id: null,
            original_subject_id: null,
            title: null,
            description: null,
            picture: null,
            is_library_subject: null,
            is_deleted: null,
        }
    }

    public createSubject(subject:ISubject, callbackSuccess, callBackFail) {
        var self = this;
        this._createSubject(
            subject,
            function (data) {
                self.addSubjectToSubjectList(data);
                self._currentSubjectId = data.id;
                callbackSuccess(data);
            },
            function (err) {
                console.error(err);
            }
        );
    }

    public updateSubject(subject:ISubject, callbackSuccess, callbackFail) {
        this._updateSubject(
            subject,
            function (data) {
                this.addSubjectToSubjectList(data);
                callbackSuccess(data);
            },
            function (err) {
                console.error(err);
            }
        )
    }

    private addSubjectToSubjectList(subject:ISubject) {
        var subject_id_string = subject.id.toString();
        if (this._subjectList[subject_id_string]) {
            // overwrite
        }
        this._subjectList[subject_id_string] = subject;
    }

    public getSubjectList(params, callbackSuccess, callbackFail) {
        var self = this;
        if (this._isSetSubjectList) {
            callbackSuccess(this._subjectList)
        } else {
            this._getSubjectList(params,
                function (data) {
                    self._subjectList = data;
                    self._isSetSubjectList = true;
                    callbackSuccess(data);
                },
                callbackFail()
            );
        }
    }

    /**
     * PRIVATE HTTPS
     */

    private _getSubjectList(params, callbackSuccess, callbackFail) {
        var req:any;
        var self = this;

        req = this.$http({
            method: 'GET',
            url: self.serverUrl + '/subjects/get',
            params: {
                "user_id": params.user.id,
            },
            paramSerializer: '$httpParamSerializerJQLike'
        });
        req
            .success(function (data, status, headers, config) {
                if (status == 200) {
                    // DATA  : list of subject
                    callbackSuccess(data);
                } else {
                    callbackFail(data);
                }
            })
            .error(function (data, status, headers, config) {
                console.error(data);
                console.error(status);
                console.error(headers);
                console.error(config);
                callbackFail(data);
            });
    }

    private _updateSubject(subject:ISubject, callbackSuccess, callbackFail) {
        var req:any;
        var self = this;
        req = this.$http({
            method: 'POST',
            url: self.serverUrl + '/subjects/update/' + subject.id,
            params: {
                "subject": subject,
            },
            paramSerializer: '$httpParamSerializerJQLike'
        });
        req
            .success(function (data, status, headers, config) {
                if (status == 200) {
                    // DATA : subject
                    callbackSuccess(data);
                } else {
                    callbackFail(data);
                }
            })
            .error(function (data, status, headers, config) {
                console.error(data);
                console.error(status);
                console.error(headers);
                console.error(config);
                callbackFail(data);
            });
    }

    private _createSubject(subject:ISubject, callbackSuccess, callbackFail) {
        /**
         * TEMP
         */
        subject.id = Math.floor((Math.random() * 1000) + 1);
        callbackSuccess(subject);
        /*
         var req: any;
         var self = this;
         req = this.$http({
         method: 'POST',
         url: self.serverUrl+'/subjects/create/',
         params: {
         "subject": subject,
         },
         paramSerializer: '$httpParamSerializerJQLike'
         });
         req
         .success(function (data, status, headers, config) {
         if (status == 200) {
         // DATA : subject
         callbackSuccess(data);
         } else{
         callbackFail(data);
         }
         })
         .error(function (data, status, headers, config) {
         console.error(data);
         console.error(status);
         console.error(headers);
         console.error(config);
         callbackFail(data);
         });
         */
    }


}