interface IGrainCopyService {
    getGrainCopyListBySubjectCopyId(subject_id, callbackSuccess, callbackFail);
    grainCopyListBySubjectCopyId(subject_id) : IGrainCopy[];
    isSetGrainCopyListBySubjectCopyId(subject_id) : boolean;
    createObjectGrainCopy() : IGrainCopy;
    createObjectGrainCopyFromGrain(grain:IGrain) : IGrainCopy;
    addGrainCopyToGrainCopyList(grain_copy:IGrainCopy);
    createGrainCopyList(subject_copy_id);
    getGrainCopyLabel(grainCopy : IGrainCopy);
}

class GrainCopyService implements IGrainCopyService {

    static $inject = [
        'serverUrl',
        '$http'
    ];

    private serverUrl:string;
    private $http:any;

    private _grainCopyList:any;
    private _isSetGrainCopyList:boolean[];

    constructor(serverUrl,
                $http) {
        this.serverUrl = serverUrl;
        this.$http = $http;

        this._grainCopyList = {};
        this._isSetGrainCopyList = [];
    }


    public grainCopyListBySubjectCopyId(subject_copy_id):IGrainCopy[] {
        return this._isSetGrainCopyList[subject_copy_id] ? this._grainCopyList[subject_copy_id] : [];
    }


    public isSetGrainCopyListBySubjectCopyId(subject_copy_id):boolean {
        return !!this._isSetGrainCopyList[subject_copy_id];
    }

    public getGrainCopyListBySubjectCopyId(subject_copy_id, callbackSuccess, callbackFail) {
        var self = this;
        if (this._isSetGrainCopyList[subject_copy_id]) {
            callbackSuccess(this._grainCopyList[subject_copy_id])
        } else {
            this._getGrainCopyListBySubjectCopyId(subject_copy_id,
                function (data) {
                    self._grainCopyList[subject_copy_id] = data;
                    self._isSetGrainCopyList[subject_copy_id] = true;
                    callbackSuccess(data);
                },
                callbackFail()
            );
        }
    }

    public createObjectGrainCopyData():IGrainCopyData {
        return {
            title: null,
            max_score: null,
            statement: null,
            documentList: null,
            hint: null,
            custom_copy_data: null
        };

    }

    public createObjectGrainCopy():IGrainCopy {
        return {
            id: null,
            subject_copy_id: null,
            grain_scheduled_id: null,
            grain_type_id: null,
            order : null,
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            grain_copy_data: this.createObjectGrainCopyData(),
            final_score: null,
            calculated_score: null,
            teacher_comment: null,
            is_deleted: null
        };
    }


    public createObjectGrainCopyFromGrain(grain:IGrain):IGrainCopy {
        var grain_copy = this.createObjectGrainCopy();
        grain_copy.id = Math.floor((Math.random() * 1000) + 1);
        grain_copy.grain_type_id = grain.grain_type_id;
        grain_copy.order = grain.order;
        grain_copy.grain_copy_data.title = grain.grain_data.title;
        grain_copy.grain_copy_data.max_score = grain.grain_data.max_score;
        grain_copy.grain_copy_data.statement = grain.grain_data.statement;
        grain_copy.grain_copy_data.documentList = grain.grain_data.documentList;
        grain_copy.grain_copy_data.hint = grain.grain_data.hint;
        grain_copy.grain_copy_data.custom_copy_data = grain.grain_data.custom_data;
        return grain_copy;
    }

    public addGrainCopyToGrainCopyList(grain_copy:IGrainCopy) {
        this._isSetGrainCopyList[grain_copy.subject_copy_id] = true;
        if(!this._grainCopyList[grain_copy.subject_copy_id]){
            console.error("Grain List missing");
        }
        this._grainCopyList[grain_copy.subject_copy_id][grain_copy.id] = grain_copy;
    }

    public createGrainCopyList(subject_copy_id){
        if(!this._grainCopyList[subject_copy_id]){
            this._grainCopyList[subject_copy_id] = {};
        }
    }

    public getGrainCopyLabel(grainCopy : IGrainCopy){
        if(grainCopy.grain_copy_data.title){
            return grainCopy.grain_copy_data.title
        } else{
            return 'Enoncé';
        }
    }

    /**
     *  PRIVATE HTTP
     */

    private _getGrainCopyListBySubjectCopyId(subject_id, callbackSuccess, callbackFail) {
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