/**
 * Created by jun on 22/04/2016.
 */
interface IGrainCopyService {
    getGrainCopyListBySubjectId(subject_id, callbackSuccess, callbackFail);
    reorderGrainCopy(grainCopy, array_grainCopy);
    grainCopyListBySubjectId(subject_id) : IGrainCopy[];
    isSetGrainCopyListBySubjectId(subject_id) : boolean;
}

class GrainCopyService implements IGrainCopyService {

    static $inject = [
        'serverUrl',
        '$http'
    ];

    private serverUrl:string;
    private $http:any;

    private _grainCopyList:IGrainCopy[][];
    private _isSetGrainCopyList:boolean[];

    constructor(serverUrl,
                $http) {
        this.serverUrl = serverUrl;
        this.$http = $http;

        this._grainCopyList = [];
        this._isSetGrainCopyList = [];
    }


    public grainCopyListBySubjectId(subject_id):IGrainCopy[] {
        return this._isSetGrainCopyList[subject_id] ? this._grainCopyList[subject_id] : [];
    }


    public isSetGrainCopyListBySubjectId(subject_id):boolean {
        return !!this._isSetGrainCopyList[subject_id];
    }

    public getGrainCopyListBySubjectId(subject_id, callbackSuccess, callbackFail) {
        var self = this;
        if (this._isSetGrainCopyList[subject_id]) {
            callbackSuccess(this._grainCopyList[subject_id])
        } else {
            this._getGrainCopyListBySubjectId(subject_id,
                function (data) {
                    self._grainCopyList[subject_id] = data;
                    self._isSetGrainCopyList[subject_id] = true;
                    callbackSuccess(data);
                },
                callbackFail()
            );
        }
    }

    /**
     *  PRIVATE HTTP
     */

    private _getGrainCopyListBySubjectId(subject_id, callbackSuccess, callbackFail) {
        var req:any;
        var self = this;
        req = this.$http({
            method: 'GET',
            url: self.serverUrl + '/grainCopies/get',
            params: {
                "subject_id": subject_id,
            },
            paramSerializer: '$httpParamSerializerJQLike'
        });
        req
            .success(function (data, status, headers, config) {
                if (status == 200) {
                    // DATA  : list of grainCopy
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

}