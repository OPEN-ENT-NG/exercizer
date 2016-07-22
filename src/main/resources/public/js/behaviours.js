console.log('Exercizer behaviours loaded');

Behaviours.register('exercizer', {
    rights: {
        workflow: {
            create: 'fr.openent.exercizer.controllers.SubjectController|persist',
            list: 'fr.openent.exercizer.controllers.SubjectController|listSubject',
            view: 'fr.openent.exercizer.controllers.SubjectController|view'

        },
        resource: {
            manager: {
                right: 'fr-openent-exercizer-controllers-SubjectController|remove'
            },
            contrib: {
                right: 'fr-openent-exercizer-controllers-SubjectController|canSchedule',
            },
            read: {
                right: 'com-thecodingmachine-inca-controllers-ThematicController|list'
            }
        }
    },
    dependencies: {},
    loadResources: function (callback) { }
});
