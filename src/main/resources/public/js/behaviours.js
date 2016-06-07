console.log('Exercizer behaviours loaded');

Behaviours.register('exercizer', {
    rights: {
        workflow: {
            create: 'fr-openent-exercizer-controllers-SubjectController|createSubject',
            list: 'fr-openent-exercizer-controllers-SubjectController|listSubject',
            view: 'fr-openent-exercizer-controllers-SubjectController|view'

        },
        resource: {
            manager: {
                right: 'fr-openent-exercizer-controllers-SubjectController|remove'
            },
            contrib: {
                right: 'fr-openent-exercizer-controllers-SubjectController|update'
            },
            read: {
                right: 'com-thecodingmachine-inca-controllers-ThematicController|list'
            }
        }
    },
    dependencies: {},
    loadResources: function (callback) { }
});
