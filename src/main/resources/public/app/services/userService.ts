/**
 * Created by jun on 22/04/2016.
 */
interface IUserService {
    getUserById(params, callbackSuccess, callbackFail);
    userById(user_id);
    isSetUserById(user_id):boolean;
}

class UserService implements IUserService {

    static $inject = [
        'serverUrl',
        '$http'
    ];

    private serverUrl : string;
    private $http : any;

    private _userList :IUser[];
    private _isSetUserList : boolean[];


    constructor(
        serverUrl,
        $http
    ) {
        this.serverUrl = serverUrl;
        this.$http = $http;

        this._isSetUserList = [];
        this._userList = [];

    }


    public userById(user_id):IUser {
        return this.isSetUserById(user_id)? this.userList[user_id] : {};
    }


    public isSetUserById(user_id):boolean {
        return !!this._isSetUserList[user_id];
    }


    public getUserById(user_id, callbackSuccess, callbackFail){
        var self = this;
        if(this.isSetUserById(user_id)){
            callbackSuccess(this._userList[user_id])
        } else{
            this._getUserById(user_id,
                function(data){
                    self._userList[user_id] = data;
                    self._isSetUserList[user_id] = true;
                    callbackSuccess(data);
                },
                callbackFail()
            );
        }
    }

    private _getUserById(user_id, callbackSuccess, callbackFail){
        var req: any;
        var self = this;
        req = this.$http({
            method: 'GET',
            url: self.serverUrl+'/users/get',
            params: {
                "user_id": user_id,
            },
            paramSerializer: '$httpParamSerializerJQLike'
        });
        req
            .success(function (data, status, headers, config) {
                if (status == 200) {
                    // DATA  : one user
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