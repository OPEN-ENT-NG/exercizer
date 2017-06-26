import { ng } from 'entcore';

export const editOpenAnswer = ng.directive('editOpenAnswer',
    [() => {
        return {
            restrict: 'E',
            scope: {
                grain: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/open_answer/templates/edit-open-answer.html'
        };
    }]
);






