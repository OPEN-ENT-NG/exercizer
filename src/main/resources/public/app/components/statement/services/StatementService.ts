/**
 * Created by Erwan_LP on 06/05/2016.
 */
/**
 * Created by jun on 22/04/2016.
 */
interface IStatementService {
    createObjectCustomData() : IStatementCustomData;
    createObjectCustomCopyData() : IStatementCustomCopyData;
}

class StatementService implements IStatementService {

    static $inject = [

    ];

    constructor(
    ) {

    }

    public createObjectCustomData() : IStatementCustomData{
        var custom_data : IStatementCustomData = {
            statement : null
        };
        return custom_data;
    }
    public createObjectCustomCopyData() : IStatementCustomCopyData{
        var custom_copy_data : IStatementCustomCopyData = {
            statement : null
        };
        return custom_copy_data;
    }

}