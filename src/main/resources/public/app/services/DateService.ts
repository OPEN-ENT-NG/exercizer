interface IDateService {
    addDays(date, days);
    compare_after(date_a, date_b);
    timestampToDate(timestamp);
    isoToDate(iso);
}

class DateService implements IDateService {

    static $inject = [];

    constructor() {

    }

    public addDays(date, days) {
        var result = new Date(date);
        result.setDate(date.getDate() + days);
        return result;
    }

    public compare_after(date_a, date_b) {
        console.log(date_a,date_b);
        if (date_a > date_b) {
            return true;
        } else {
            return false;
        }
    }

    public timestampToDate(timestamp) {
        return new Date(parseInt(timestamp) * 1000);
    }

    public isoToDate(iso) {
        return new Date(iso);
    }
}