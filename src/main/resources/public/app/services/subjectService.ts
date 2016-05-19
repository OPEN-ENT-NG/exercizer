interface ISubjectService {
    createSubject(subject:ISubject, callbackSuccess, callBackFail);
    updateSubject(subject:ISubject, callbackSuccess, callbackFail)
    getSubjectList(params, callbackSuccess, callbackFail);
    getSubjectById(subjectId):ISubject
    getCurrentSubject() : ISubject
    subjectList : ISubject[];
    isSetSubjectList : boolean;
    currentSubjectId : number;
}

class SubjectService implements ISubjectService {

    static $inject = [
        'serverUrl',
        '$http',
        'GrainService',
        'ToolsService'
    ];

    /**
     * INJECTIONS
     */
    private serverUrl:string;
    private $http:any;
    private grainService;
    private toolsService;

    /**
     * VARIABLES
     */
    private _subjectList:any;
    private _isSetSubjectList:boolean;
    private _currentSubjectId:number;

    constructor(serverUrl,
                $http,
                GrainService,
                ToolsService) {
        this.serverUrl = serverUrl;
        this.$http = $http;
        this.grainService = GrainService;
        this.toolsService = ToolsService;

        this._isSetSubjectList = false;
        // init _subjectList as an object
        this._subjectList = {};
        this._currentSubjectId = null;
    }

    /**
     * GETTER subjectList
     * @returns {ISubject[]}
     */
    public get subjectList():ISubject[] {
        return this._subjectList;
    }

    /**
     * GETTER isSetSubjectList
     * @returns {boolean}
     */
    public get isSetSubjectList():boolean {
        return this._isSetSubjectList;
    }

    /**
     * GETTER currentSubjectId
     * @returns {number}
     */
    public get currentSubjectId():number {
        return this._currentSubjectId;
    }

    /**
     * SETTER currentSubjectId
     * @param value
     */
    public set currentSubjectId(value:number) {
        // set un other current subject
        // get grain list link to this subject
        this.grainService.getGrainListBySubjectId(value, null, null);
        this._currentSubjectId = value;
    }

    /**
     * get subject List
     * @param params
     * @param callbackSuccess
     * @param callbackFail
     */
    public getSubjectList(params, callbackSuccess, callbackFail) {
        var self = this;
        if (this._isSetSubjectList) {
            callbackSuccess(this._subjectList)
        } else {
            this._getSubjectList(params,
                function (data) {
                    // data is subject list
                    self._subjectList = data;
                    self._isSetSubjectList = true;
                    if (callbackSuccess) {
                        callbackSuccess(data);
                    }
                },
                callbackFail
            );
        }
    }

    /**
     * Get Current Subject
     * @returns {ISubject}
     */
    public getCurrentSubject():ISubject {
        return this.getSubjectById(this._currentSubjectId);
    }

    /**
     * Get Subject By Id
     * @param subjectId
     * @returns {ISubject}
     */
    public getSubjectById(subjectId):ISubject {
        if (this._subjectList[subjectId]) {
            return this._subjectList[subjectId]
        } else {
            console.error('subject missing');
            // TODO : ONLY DEV
            console.error('ONLY DEV : creation subject if subject missing');
            this.createDevSubject(subjectId);
        }
    }

    /**
     * Create Object ISubject
     * @returns {{id: null, owner: null, created: null, modified: null, visibility: null, max_score: null, folder_id: null, original_subject_id: null, title: null, description: null, picture: null, is_library_subject: null, is_deleted: null}}
     */
    public createObjectSubject():ISubject {
        return {
            id: null,
            owner: null,
            created: null,
            modified: null,
            visibility: null,
            max_score: null,
            folder_id: null,
            original_subject_id: null,
            title: null,
            description: null,
            picture: null,
            is_library_subject: null,
            is_deleted: null,
        }
    }

    /**
     * Create an subject
     * - Save the subject
     * - Add the subject to the subjectList
     * @param subject
     * @param callbackSuccess
     * @param callBackFail
     */
    public createSubject(subject:ISubject, callbackSuccess, callBackFail) {
        var self = this;
        this._createSubject(
            subject,
            function (data) {
                // data is a subject
                self.addSubjectToSubjectList(data);
                callbackSuccess(data);
            },
            function (err) {
                console.error(err);
            }
        );
    }

    /**
     * Update a subject
     * @param subject
     * @param callbackSuccess
     * @param callbackFail
     */
    public updateSubject(subject:ISubject, callbackSuccess, callbackFail) {
        this._updateSubject(
            subject,
            function (data) {
                callbackSuccess(data);
            },
            function (err) {
                console.error(err);
            }
        )
    }

    /**
     * Add an subject to subject list
     * @param subject
     */
    private addSubjectToSubjectList(subject:ISubject) {
        if (this._subjectList[subject.id]) {
            console.error('try to overwrite an subject');
            throw "";
        }
        this._subjectList[subject.id] = subject;
    }


    /**
     * Compute Max Score For Current Subject
     */
    public computeMaxScoreForCurrentSubject() {
        var grain_list = this.grainService.grainListBySubjectId(this._currentSubjectId);
        var max_score = 0;
        angular.forEach(grain_list, function (grain, key) {
            if (grain.grain_data.max_score) {
                max_score += parseInt(grain.grain_data.max_score);
            }
        });
        var subject = this.getCurrentSubject();
        subject.max_score = max_score;
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
        callbackSuccess(subject);
        /* var req:any;
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
         });*/
    }

    private _createSubject(subject:ISubject, callbackSuccess, callbackFail) {
        /**
         * TEMP
         */
        if (!subject.id) {
            subject.id = this.toolsService.createId();
        }
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

    /**
     * TEMP
     */
    private createDevSubject(subjectId) {
        var self = this;
        var subject:ISubject = this.createObjectSubject();
        subject.id = subjectId;
        subject.title = "Subject Test";
        this.createSubject(
            subject,
            function (data) {
                console.error(data);
                self.grainService.getGrainListBySubjectId(
                    data.id,
                    function () {
                        // create grain dev
                        var grainDev = self.grainService.createObjectGrain();
                        grainDev.subject_id = data.id;
                        grainDev.grain_type_id = "3";
                        grainDev.grain_data.title = "Exercise Test";
                        grainDev.grain_data.max_score = "5";
                        grainDev.grain_data.statement = "<div class=\"ng-scope\">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean posuere rhoncus dui sit amet sagittis. Vestibulum felis quam, commodo euismod egestas pellentesque, porta nec urna.&nbsp;</div>";
                        grainDev.grain_data.hint = "La réponse est 3 ";
                        grainDev.grain_data.correction = "Correction de la réponse";
                        grainDev.grain_data.custom_data = {
                            correct_answer: "3"
                        };

                        self.grainService.createGrain(
                            grainDev,
                            function () {
                                var grainDev2 = self.grainService.createObjectGrain();
                                grainDev2.subject_id = data.id;
                                grainDev2.grain_type_id = "3";
                                grainDev2.grain_data.title = "Exercise Test Numero 2";
                                grainDev2.grain_data.max_score = "5";
                                grainDev2.grain_data.statement = "<div class=\"ng-scope\">Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean posuere rhoncus dui sit amet sagittis. Vestibulum felis quam, commodo euismod egestas pellentesque, porta nec urna.&nbsp;</div>";
                                grainDev2.grain_data.hint = "La réponse est 3 ";
                                grainDev2.grain_data.correction = "Correction de la réponse";
                                grainDev2.grain_data.custom_data = {
                                    correct_answer: "3"
                                };
                                self.grainService.createGrain(grainDev2, null, null);
                            },
                            null
                        );
                    },
                    null);


            },
            function (err) {

            }
        );
    }


}