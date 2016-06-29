# exercizer

* Licence : Non libéré pour le moment - Copyright Conseil Régional Nord Pas de Calais - Picardie

* Développeur(s) : OPEN DIGITAL EDUCATION

* Financeur(s) : Région Nord Pas de Calais-Picardie

* Description : Application d'édition, de conception, de partage  et d'administration d'exercices interactifs

## Add a grain named 'new_grain'

### Create folder new_grain

Create folder new_grain in \exercizer\src\main\resources\public\app\components\grain
Create four sub folders in folder new_grain

#### Sub folder directive

Create 3 directives :

* editNewGrain.ts : for the creation and the edition of the grain by the teacher
* performNewGrain.ts : for the perform by the student
* viewNewGrain.ts : for the view of the copy (correction and post-correction)

#### Sub folder models

Create 2 models :

* NewGrainCustomCopyDate.ts : custom data link to the grain copy
* NewGrainCustomDate.ts : custom data link to the grain

#### Sub folder services

Create 1 service :
* NewGrainService.ts : service link to the grain implements IAutomaticCorrection

#### Sub folder templates

Create 3 templates :

* edit-new-grain.html : for the creation and the edition of the grain by the teacher
* perform-new-grain.html : for the perform by the student
* view-new-grain.html : for the view of the copy (correction and post-correction)

### Database

In table exercizer.grain_type add a row for the new grain
By creating a patch SQL in  \exercizer\src\main\resources\sql

```
(42, 'new-grain', 'NewGrain', 'new-grain', true),
```

Columns : 

* id (auto-increment)
* name
* public name
* illustration
* is in list (should be true)

### Modification code

#### GrainTypeService.ts

Modification function 

* instantiateCustomData (switch)
* instantiateCustomCopyData (switch)

#### edit-subject.html

Modification html 

* After comment : ```<!-- SWITCH GRAIN --> ``` , add in the switch

```
<div data-ng-switch-when="42">
    <edit-new-grain data-grain="grain"></edit-new-grain>
</div>
```

#### grainCopyService.ts

Modification function 

* _createFromGrainScheduled (switch) : specific part between grain-data and grain-copy_data

#### subject-perform-copy-display-current-grain-copy.html

Modification html

* Add in the switch 

```
<div data-ng-switch-when="42">
    <perform-new-grain data-grain-copy="currentGrainCopy"></perform-new-grain>
</div>
```


#### subject-view-copy-grain-copy-list.html

Modification html

* Add in the switch 

```
<div data-ng-switch-when="42">
    <view-new-grain data-grain-scheduled="getGrainScheduled(grainCopy)"
                      data-grain-copy="grainCopy"
                      data-is-teacher="isTeacher">
    </view-new-grain>
</div>
```
















