/**
 * Created by jun on 22/04/2016.
 */
interface ISubjectService {
    createSubject(subject : ISubject, callbackSuccess, callBackFail);
    updateSubject(subject : ISubject, callbackSuccess, callbackFail)
    getSubjectList(params, callbackSuccess, callbackFail);
    subjectList : ISubject[];
    isSetSubjectList : boolean;
    currentSubjectId : number;
}

class SubjectService implements ISubjectService {

    static $inject = [
        'serverUrl',
        '$http'
    ];

    private serverUrl : string;
    private $http : any;

    private _subjectList :ISubject[];
    private _isSetSubjectList : boolean;
    private _currentSubjectId : number;

    constructor(
        serverUrl,
        $http
    ) {
        this.serverUrl = serverUrl;
        this.$http = $http;

        this._isSetSubjectList = false;
        this._subjectList = [];
        this._currentSubjectId = null;

    }


    public get subjectList():ISubject[] {
        return this._subjectList;
    }

    public get isSetSubjectList():boolean {
        return this._isSetSubjectList;
    }


    public get currentSubjectId():number {
        //TODO : delete that after dev !
        if(!this._currentSubjectId){
            console.error('dev : _currentSubjectId not defined');
            console.info('dev : set to 1 ONLY DEV !');
            this._currentSubjectId = 1;
        }
        return this._currentSubjectId;
    }

    public set currentSubjectId(value:number) {
        this._currentSubjectId = value;
    }

    /**
     * Set isSetSubjectList is used to force refresh subject list
      * @param value
     */
    public set isSetSubjectList(value:boolean) {
        this._isSetSubjectList = value;
    }

    public createSubject(subject : ISubject, callbackSuccess, callBackFail){
        var self = this;
        this._createSubject(
            subject,
            function(data){
                self.addSubjectToSubjectList(data);
                self._currentSubjectId = data.id;
                callbackSuccess(data);
            },
            function(err){
                console.error(err);
            }
        );
    }

    public updateSubject(subject : ISubject, callbackSuccess, callbackFail){
        this._updateSubject(
            subject,
            function(data){
                this.addSubjectToSubjectList(data);
                callbackSuccess(data);
            },
            function(err){
                console.error(err);
            }
        )
    }

    private addSubjectToSubjectList(subject : ISubject){
        if(this._subjectList[subject.id]){
            // overwrite
        }
        this._subjectList[subject.id] = subject;
    }

    public getSubjectList(params, callbackSuccess, callbackFail){
        var self = this;
        if(this._isSetSubjectList){
            callbackSuccess(this._subjectList)
        } else{
            this._getSubjectList(params,
                function(data){
                    self._subjectList = data;
                    self._isSetSubjectList = true;
                    callbackSuccess(data);
                },
                callbackFail()
            );
        }
    }

    private _getSubjectList(params, callbackSuccess, callbackFail){
        var req: any;
        var self = this;
        req = this.$http({
            method: 'GET',
            url: self.serverUrl+'/subjects/get',
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
    }

    private _updateSubject(subject : ISubject, callbackSuccess, callbackFail){
        var req: any;
        var self = this;
        req = this.$http({
            method: 'POST',
            url: self.serverUrl+'/subjects/update/' + subject.id,
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
    }

    private _createSubject(subject : ISubject, callbackSuccess, callbackFail){
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