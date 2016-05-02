/**
 * Created by jun on 22/04/2016.
 */
interface ISubjectService {
    createSubject(subject : ISubject, callbackSuccess, callBackFail) : ISubject;
    subjectList : ISubject[];
    getSubjectList(params, callbackSuccess, callbackFail);
}

class SubjectService implements ISubjectService {

    static $inject = [
        'serverUrl'
    ];

    private _subjectList :ISubject[];
    private _isSetSubjectList : boolean;

    constructor(
        serverUrl
    ) {
        console.log('SubjectService');
        this._isSetSubjectList = false;
        this._subjectList = [];

        this.serverUrl = serverUrl;
        console.log(this.serverUrl);
    }


    public get subjectList():ISubject[] {
        return this._subjectList;
    }

    public createSubject(subject : ISubject, callbackSuccess, callBackFail) : ISubject{
        console.log('createSubject');
        subject.id = Math.floor((Math.random() * 1000) + 1);
        this.addSubjectToSubjectList(subject);
        callbackSuccess(subject);
    }

    private addSubjectToSubjectList(subject : ISubject){
        this._subjectList.push(subject);
    }

    public getSubjectList(params, callbackSuccess, callbackFail){
        var self = this;
        if(this._isSetSubjectList){
            callbackSuccess(this._subjectList)
        } else{
            this._getSubjectList(params,
                function(data){
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
            url: self.serverUrl+'/subjects',
            params: {
                "user_id": params.user_id.id,
            },
            paramSerializer: '$httpParamSerializerJQLike'
        });
        req
            .success(function (data, status, headers, config) {
                if (status == 200) {
                    callbackSuccess(data);
                } else{
                    callbackSuccess(data);
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