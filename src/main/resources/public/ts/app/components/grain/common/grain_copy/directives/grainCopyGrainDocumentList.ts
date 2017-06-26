import { ng } from 'entcore';

export const grainCopyGrainDocumentList = ng.directive('grainCopyGrainDocumentList',
    [() => {
        return {
            restrict: 'E',
            scope: {
                grainCopy: '='
            },
            templateUrl: 'exercizer/public/ts/app/components/grain/common/grain_copy/templates/grain-copy-grain-document-list.html'
        };
    }]
);