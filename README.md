# exercizer

* Licence : AGPL V3 - Copyright Région Hauts-de-France (ex Picardie)

* Développeur(s) : OPEN DIGITAL EDUCATION

* Financeur(s) :  Région Hauts-de-France (ex Picardie),Département Seine et Marne
	

* Description : "Exercices et évaluation " est une application d'édition, de conception, de partage  et d'administration d'exercices interactifs

# Technical documentation

## Build

<pre>
		gulp build
		gradle install
</pre>


## Construction

<pre>
		gradle copyMod
</pre>

## Deploy to ent-core


## Configuration

In the file `/exercizer/deployment/exercizer/conf.json.template` :


Declare the application :
<pre>
    {
	"name": "fr.openent~exercizer~0.4-SNAPSHOT",
      "config": {
        "main" : "fr.openent.exercizer.Exercizer",
        "port" : 8105,
        "app-name" : "Exercices et évaluations",
    	"app-address" : "/exercizer",
    	"app-icon" : "exercizer-large",
        "sql" : true,
        "mongodb" : false,
        "host": "${host}",
        "ssl" : $ssl,
        "auto-redeploy": false,
        "userbook-host": "${host}",
        "integration-mode" : "HTTP",
        "app-registry.port" : 8012,
        "mode" : "${mode}",
		"scheduledNotificationCron" : "0 0 4 * * ?",
        "entcore.port" : 8009
      }
    }
</pre>


Associate an input route with the configuration of the integrated proxy module (`"name": "fr.openent~exercizer~0.4-SNAPSHOT"`) :
<pre>
	{
		"location": "/exercizer",
		"proxy_pass": "http://localhost:8105"
	}
</pre>

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

## Rights

#### Enseignant

* exercizer.view
* exercizer.folder.list
* exercizer.folder.persist
* exercizer.grain.copy.list
* exercizer.grain.scheduled.list
* exercizer.grain.type.list
* exercizer.subject.simple.download.library
* exercizer.subject.duplicate.library
* exercizer.subject.import
* exercizer.subject.list
* exercizer.subject.list.all
* exercizer.subject.persist
* exercizer.subject.copy.list
* exercizer.subject.copy.list.by.subject.scheduled.list
* exercizer.subject.scheduled.list
* exercizer.subject.scheduled.list.by.subject.copy.list
* exercizer.subject.count.for.library
* exercizer.subject.list.for.library
* exercizer.subject.lesson.level.list
* exercizer.subject.lesson.level.list.by.subject.id.list
* exercizer.subject.library.grain.list
* exercizer.subject.lesson.type.list
* exercizer.subject.lesson.type.list.by.subject.id.list
* exercizer.subject.tag.list
* exercizer.subject.tag.list.by.subject.id
* exercizer.subject.tag.persist
* exercizer.subject.list.all

#### Eleve

* exercizer.view
* exercizer.grain.copy.list
* exercizer.grain.scheduled.list
* exercizer.grain.type.list
* exercizer.subject.copy.list
* exercizer.subject.scheduled.list
* exercizer.subject.scheduled.list.by.subject.copy.list
* exercizer.subject.list.all
