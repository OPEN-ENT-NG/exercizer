/**
 * Created by jun on 22/04/2016.
 */
interface IGrainCopyService {
    getGrainCopyListBySubjectId(subject_id, callbackSuccess, callbackFail);
    grainCopyListBySubjectId(subject_id) : IGrainCopy[];
    isSetGrainCopyListBySubjectId(subject_id) : boolean;
    createObjectGrainCopy() : IGrainCopy;
    createObjectGrainCopyFromGrain(grain:IGrain) : IGrainCopy
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

    public createObjectGrainCopyData():IGrainCopyData {
        var grain_copy_data:IGrainCopyData = {
            title: null,
            max_score: null,
            statement: null,
            documentList: [],
            hint: null,
            custom_copy_data: null
        };
        return grain_copy_data;

    }

    public createObjectGrainCopy():IGrainCopy {
        var grain_copy:IGrainCopy = {
            id: null,
            subject_copy_id: null,
            grain_scheduled_id: null,
            grain_type_id: null,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            grain_copy_data: this.createObjectGrainCopyData(),
            final_score: null,
            score: null,
            teacher_comment: null,
            is_deleted: null
        };
        return grain_copy
    }


    public createObjectGrainCopyFromGrain(grain:IGrain):IGrainCopy {
        var grain_copy = this.createObjectGrainCopy();
        grain_copy.grain_copy_data.title = grain.grain_data.title;
        grain_copy.grain_copy_data.max_score = grain.grain_data.max_score;
        grain_copy.grain_copy_data.statement = grain.grain_data.statement;
        grain_copy.grain_copy_data.documentList = grain.grain_data.documentList;
        grain_copy.grain_copy_data.hint = grain.grain_data.hint;
        return grain_copy;
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