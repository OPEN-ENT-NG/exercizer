class CorrectOrderHelper {
    static getCorrectOrder(grain:any, grainList:any[]) {
        var correctOrder = 1;

        for (var i = 0; i < grainList.length; ++i) {
            if (grainList[i].order_by < grain.order_by && grainList[i].grain_type_id > 3) {
                correctOrder++;
            }
        }

        return correctOrder;
    }
}
