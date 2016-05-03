/**
 * Created by jun on 22/04/2016.
 */
interface IGrainCopyService {
    getGrainCopyListBySubjectCopyId(subject_copy_id, callbackSuccess, callbackFail);
    grainCopyList : ISubjectGrainCopy[];
    isSetGrainCopyList : boolean;
}

class GrainCopyService implements IGrainCopyService {

    static $inject = [
        'serverUrl',
        '$http'
    ];

    private serverUrl : string;
    private $http : any;

    private _grainCopyList :ISubjectGrainCopy[];
    private _isSetGrainCopyList : boolean;


    constructor(
        serverUrl,
        $http
    ) {
        this.serverUrl = serverUrl;
        this.$http = $http;

        this._isSetGrainCopyList = false;
        this._grainCopyList = [];

    }


    public get grainCopyList():ISubjectGrainCopy[] {
        return this._grainCopyList;
    }


    public get isSetGrainCopyList():boolean {
        return this._isSetGrainCopyList;
    }

    /**
     * Set isSetGrainCopyList is used to force refresh grainCopy list
     * @param value
     */
    public set isSetGrainCopyList(value:boolean) {
        this._isSetGrainCopyList = value;
    }


    private addGrainCopyToGrainCopyList(grainCopy : ISubjectGrainCopy){
        if(this._grainCopyList[grainCopy.id]){
            // overwrite
        }
        this._grainCopyList[grainCopy.id] = grainCopy;
    }

    public getGrainCopyList(params, callbackSuccess, callbackFail){
        var self = this;
        if(this._isSetGrainCopyList){
            callbackSuccess(this._grainCopyList)
        } else{
            this._getGrainCopyList(params,
                function(data){
                    self._grainCopyList = data;
                    self._isSetGrainCopyList = true;
                    callbackSuccess(data);
                },
                callbackFail()
            );
        }
    }

    private _getGrainCopyList(params, callbackSuccess, callbackFail){
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
                    // DATA  : list of grainCopy
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