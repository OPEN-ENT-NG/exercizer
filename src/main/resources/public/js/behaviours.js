console.log('Exercizer behaviours loaded')

Behaviours.register('exercizer', {
    rights: {
        /*workflow: {
            create: 'com.thecodingmachine.inca.controllers.ThematicController|createThematic',
            list: 'com.thecodingmachine.inca.controllers.ThematicController|listThematics',
            view: 'com.thecodingmachine.inca.controllers.ThematicController|space'
        },*/
        resource: {
            /*manager: {
                right: 'com-thecodingmachine-inca-controllers-ThematicController|deleteThematic'
            },*/
            contrib: {
                right: 'fr-openent-exercizer-controllers-SubjectController|update'
            }
            /*read: {
                right: 'com-thecodingmachine-inca-controllers-ThematicController|listRights'
            }*/
        }
    },
    dependencies: {},
    loadResources: function (callback) { }
});
