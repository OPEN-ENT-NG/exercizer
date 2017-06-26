import { ng } from 'entcore';

export const grainCopyStatement = ng.directive('grainCopyStatement',
    ['$sce', ($sce) => {
        return {
            restrict: 'E',
            scope : {
                grainCopy: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/common/grain_copy/templates/grain-copy-statement.html',
            link:(scope:any) => {
            }
        };
    }]
);
