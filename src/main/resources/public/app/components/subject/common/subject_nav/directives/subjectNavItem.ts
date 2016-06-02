directives.push(
    {
        name: 'subjectNavItem',
        injections: ['FolderService', 'DragService', (FolderService, DragService) => {
            return {
                restrict: 'E',
                replace: true,
                scope: {
                    item: "=",
                },
                templateUrl: 'exercizer/public/app/components/subject/common/subject_nav/directives/subject-nav-item.html',
                link: (scope:any, element, attrs) => {


                }
            };
        }]
    }
);
