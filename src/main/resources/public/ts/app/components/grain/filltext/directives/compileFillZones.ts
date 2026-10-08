import { ng } from 'entcore';
import { $ } from 'entcore';

/**
 * bind-html n'exécute plus $compile sur le contenu (ENABLING-1190, faille XSS) :
 * les <fill-zone> du texte à trous restent inertes. Cette directive, posée à côté de bind-html,
 * recompile uniquement ces zones, reconstruites à partir d'un identifiant numérique validé,
 * sans jamais compiler le reste du contenu saisi (texte, interpolations, attributs).
 */
export const compileFillZones = ng.directive('compileFillZones',
    ['$compile', '$timeout', ($compile, $timeout) => {
        return {
            restrict: 'A',
            link: (scope: any, element, attributes) => {
                let zonesScope;

                scope.$watch(attributes.compileFillZones, () => {
                    // bind-html remplit l'élément dans le même digest : on passe après lui
                    $timeout(() => {
                        if (zonesScope) {
                            zonesScope.$destroy();
                        }
                        zonesScope = scope.$new();

                        element.find('fill-zone').each((i, zoneEl) => {
                            const zoneId = $(zoneEl).attr('zone-id');
                            if (!/^\d+$/.test(zoneId || '')) {
                                $(zoneEl).remove();
                                return;
                            }
                            $(zoneEl).replaceWith($compile('<fill-zone zone-id="' + zoneId + '"></fill-zone>')(zonesScope));
                        });
                    });
                });

                scope.$on('$destroy', () => zonesScope && zonesScope.$destroy());
            }
        };
    }]
);
