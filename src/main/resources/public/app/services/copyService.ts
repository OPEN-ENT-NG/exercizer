interface ICopyService {
    getCopyList(params, callbackSuccess, callbackFail);
    createObjectSubjectCopy() : ISubjectCopy;
    createObjectSubjectCopyFromSubjectScheduled(subject_scheduled) : ISubjectCopy;
    copyList : ISubjectCopy[];
    isSetCopyList : boolean;
}

class CopyService implements ICopyService {

    static $inject = [
        'serverUrl',
        '$http'
    ];

    private serverUrl : string;
    private $http : any;

    private _copyList :ISubjectCopy[];
    private _isSetCopyList : boolean;


    constructor(
        serverUrl,
        $http
    ) {
        this.serverUrl = serverUrl;
        this.$http = $http;

        this._isSetCopyList = false;
        this._copyList = [];

    }


    public get copyList():ISubjectCopy[] {
        return this._copyList;
    }


    public get isSetCopyList():boolean {
        return this._isSetCopyList;
    }

    /**
     * Set isSetCopyList is used to force refresh copy list
     * @param value
     */
    public set isSetCopyList(value:boolean) {
        this._isSetCopyList = value;
    }


    private addCopyToCopyList(copy : ISubjectCopy){
        if(this._copyList[copy.id]){
            // overwrite
        }
        this._copyList[copy.id] = copy;
    }

    public createObjectSubjectCopy() : ISubjectCopy {
        return {
            id: null,
            subject_scheduled_id: null,
            owner: null,
            created: null,
            modified: null,
            final_score: null,
            calculated_score: null,
            teacher_comment: null,
            has_been_submitted: null,
            is_deleted: null,
        }
    }

    public createObjectSubjectCopyFromSubjectScheduled(subject_scheduled) : ISubjectCopy{
        var subject_copy = this.createObjectSubjectCopy();
        subject_copy.id = Math.floor((Math.random() * 1000) + 1);
        subject_copy.subject_scheduled_id = subject_scheduled.id;
        subject_copy.created = new Date().toISOString();
        subject_copy.modified = new Date().toISOString();
        return subject_copy;

    }

    public getCopyList(params, callbackSuccess, callbackFail){
        var self = this;
        if(this._isSetCopyList){
            callbackSuccess(this._copyList)
        } else{
            this._getCopyList(params,
                function(data){
                    self._copyList = data;
                    self._isSetCopyList = true;
                    callbackSuccess(data);
                },
                callbackFail()
            );
        }
    }

    private _getCopyList(params, callbackSuccess, callbackFail){
        var req: any;
        var self = this;
        req = this.$http({
            method: 'GET',
            url: self.serverUrl+'/copies/get',
            params: {
                "user_id": params.user.id,
            },
            paramSerializer: '$httpParamSerializerJQLike'
        });
        req
            .success(function (data, status, headers, config) {
                if (status == 200) {
                    // DATA  : list of copy
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
}