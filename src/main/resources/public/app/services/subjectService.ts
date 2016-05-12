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
        subject.title = "Subject Test";
        this.createSubject(
            subject,
            function(data){
                console.error(data);
                self.grainService.getGrainListBySubjectId(
                    data.id,
                    function(){
                        // create grain dev
                        var grainDev = self.grainService.createObjectGrain();
                        grainDev.subject_id = data.id;
                        grainDev.grain_type_id = "3";
                        grainDev.grain_data.title =  "Exercise Test";
                        grainDev.grain_data.max_score =  "5";
                        grainDev.grain_data.statement =  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean posuere rhoncus dui sit amet sagittis. Vestibulum felis quam, commodo euismod egestas pellentesque, porta nec urna. Proin rhoncus sollicitudin nibh, sed fringilla nibh porta quis. Phasellus dignissim arcu ligula, vel posuere tellus finibus at. Maecenas commodo euismod magna ut pretium. ";
                        grainDev.grain_data.hint =  "La réponse est 3 ";
                        grainDev.grain_data.correction =  "Correction de la réponse";
                        grainDev.grain_data.custom_data = {
                            correct_answer : "3"
                        };

                        self.grainService.createGrain(
                            grainDev,
                            function(){
                                var grainDev2 = self.grainService.createObjectGrain();
                                grainDev2.subject_id = data.id;
                                grainDev2.grain_type_id = "3";
                                grainDev2.grain_data.title =  "Exercise Test Numero 2";
                                grainDev2.grain_data.max_score =  "5";
                                grainDev2.grain_data.statement =  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean posuere rhoncus dui sit amet sagittis. Vestibulum felis quam, commodo euismod egestas pellentesque, porta nec urna. Proin rhoncus sollicitudin nibh, sed fringilla nibh porta quis. Phasellus dignissim arcu ligula, vel posuere tellus finibus at. Maecenas commodo euismod magna ut pretium. ";
                                grainDev2.grain_data.hint =  "La réponse est 3 ";
                                grainDev2.grain_data.correction =  "Correction de la réponse";
                                grainDev2.grain_data.custom_data = {
                                    correct_answer : "3"
                                };
                                self.grainService.createGrain(grainDev2, null, null);
                            },
                            null
                        );
                    },
                    null);


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
            max_score : null,
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

    public computeMaxScoreForCurrentSubject(){
        var grain_list = this.grainService.grainListBySubjectId(this._currentSubjectId);
        var max_score = 0;
        angular.forEach(grain_list, function(grain, key) {
            max_score += grain.grain_data.max_score
        });
        var currentSubject = this.subjectById(this._currentSubjectId);
        currentSubject.max_score = max_score;
        console.log('maxScore : ' + currentSubject.max_score);
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