import { idiom as lang, moment, Behaviours, _ } from 'entcore';
import http from 'axios';

console.log('Exercizer behaviours loaded');

Behaviours.register('exercizer', {
    rights: {
        workflow: {
            create: 'fr.openent.exercizer.controllers.SubjectController|persist',
            import: 'fr.openent.exercizer.controllers.SubjectController|importSubjectGrains',
            publish: 'fr.openent.exercizer.controllers.SubjectController|publish',
            list: 'fr.openent.exercizer.controllers.SubjectController|listSubject',
            view: 'fr.openent.exercizer.controllers.SubjectController|view',
            generate: 'fr.openent.exercizer.controllers.SubjectController|generate'

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
    loadResources: async function (): Promise<any> {
        const response = await http.get('/exercizer/subjects-scheduled');
        const data = response.data;
        this.resources = _.map(data, subjectScheduled => {
            if(subjectScheduled.picture){
                subjectScheduled.icon = subjectScheduled.picture + '?thumbnail=48x48';
            } else{
                subjectScheduled.icon = '/img/illustrations/exercizer.svg';
            }
            let scheduled_at = JSON.parse(subjectScheduled.scheduled_at);
            if (scheduled_at.groupList.length > 0) {
                subjectScheduled.recipient = scheduled_at.groupList[0].name;
            } else if (scheduled_at.userList.length > 0) {
                subjectScheduled.recipient = scheduled_at.userList[0].name;
            } else {
                subjectScheduled.recipient = '';
            }
            if ((scheduled_at.groupList.length + scheduled_at.userList.length) > 1) {
                subjectScheduled.recipient += '...';
            }
            let title = `${subjectScheduled.title} - ${lang.translate("exercizer.behaviours.distributed.on")} ${moment(subjectScheduled.due_date).format('DD/MM/YYYY')}`
            return {
                title: title,
                owner: subjectScheduled.owner,
                ownerName: subjectScheduled.recipient,
                icon: subjectScheduled.icon,
                path: '/exercizer#/linker/' + subjectScheduled.id,
                _id: subjectScheduled.id
            };
        });
    }
});
