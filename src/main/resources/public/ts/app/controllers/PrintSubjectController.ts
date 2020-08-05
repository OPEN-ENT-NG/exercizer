import { ng, notify, skin, _ } from 'entcore';
import { ISubjectScheduled, IGrain } from '../models/domain';
import { ISubjectService, ISubjectScheduledService, ISubjectCopyService, IGrainTypeService, IGrainService, IDragService } from '../services';
import { EditSubjectController } from './EditSubjectController';
import { transformX, transformY } from '../components/grain/zonetext/directives/zoneCommon';


declare var jQuery;

class PrintSubjectController extends EditSubjectController {

    private _subjectScheduled: ISubjectScheduled;
    private grainTypeService: IGrainTypeService;

    static $inject = [
        '$routeParams',
        '$sce',
        '$scope',
        '$location',
        'SubjectService',
        'SubjectScheduledService',
        'SubjectCopyService',
        'GrainService',
        'GrainTypeService',
        'DragService'
    ];

    private safeApply = function (fn?) {
        try {
            const phase = this._$scope.$root && this._$scope.$root.$$phase;
            if (phase == '$apply' || phase == '$digest') {
                if (fn && (typeof (fn) === 'function')) {
                    fn();
                }
            } else {
                this._$scope.$apply(fn);
            }
        } catch (e) { }
    };

    constructor(
        _$routeParams,
        _$sce,
        _$scope,
        _$location,
        _subjectService:ISubjectService,
        _subjectScheduledService:ISubjectScheduledService,
        _subjectCopyService:ISubjectCopyService,
        _grainService:IGrainService,
        _grainTypeService:IGrainTypeService,
        _dragService:IDragService) {

        super(_$routeParams,_$sce,_$scope,_$location,_subjectService,_subjectScheduledService,_subjectCopyService,_grainService,_grainTypeService,_dragService);
        this.grainTypeService = _grainTypeService;
        var self = this;
        this._subjectScheduledService.resolve(true).then(function() {
            self._subjectScheduled = self._subjectScheduledService.getBySubjectId(_$routeParams['subjectId']);
            setTimeout(()=>{
                const imgs = jQuery(document).find("img").toArray();
                for(let img of imgs){
                    img.onerror=(()=>{
                        (img as any).error = true;
                    })
                }
                const isComplete = (img)=>{
                    return img.complete || (img.context && img.context.complete)
                }
                self.printed = false;
                const it = setInterval(()=>{
                    const pending = imgs.filter(img=>!(img as any).error && !isComplete(img));
                    if(pending.length == 0){
                        clearInterval(it);
                        if(!self.printed){
                            self.safeApply();
                            self.printed = true;
                            window.print()
                        }
                    }
                },100)
            },1000)
        }, function(err) {
            notify.error(err);
        });
    }

    private printed: boolean;

    // Grain type

    public isStatement(grain: IGrain) {
        return grain.grain_type_id === 3;
    }

    public isSimpleAnswer(grain: IGrain) {
        return grain.grain_type_id === 4;
    }

    public isOpenAnswer(grain: IGrain) {
        return grain.grain_type_id === 5;
    }

    public isMultipleAnswer(grain: IGrain) {
        return grain.grain_type_id === 6;
    }

    public isQCM(grain: IGrain) {
        return grain.grain_type_id === 7;
    }

    public isAssociation(grain: IGrain) {
        return grain.grain_type_id === 8;
    }

    public isOrderBy(grain: IGrain) {
        return grain.grain_type_id === 9;
    }

    public isTextToFill(grain: IGrain) {
        return grain.grain_type_id === 10;
    }

    public isAreaSelect(grain: IGrain) {
        return grain.grain_type_id === 11;
    }

    public isAreaSelectImage(grain: IGrain) {
        return grain.grain_type_id === 12;
    }

    public isScheduled() {
        return this._subjectScheduled !== undefined;
    }

    // Getters

    public getSubjectTitle() {
        return this.subject.title;
    }

    public getGrainTitle(grain: IGrain) {
        return grain.grain_data.title;
    }

    public getGrainType(grain: IGrain) {
        var type = grain.grain_data.custom_data ? grain.grain_data.custom_data.answersType : "";
        return type === "text" ? "exercizer.grain.option1" : type === "list" ? "exercizer.grain.option2" : "exercizer.grain.option3";
    }

    public getGrainTypeOf(grain: IGrain) {
        return this.grainTypeService.getById(grain.grain_type_id);
    }

    public getGrainScore(grain: IGrain) {
        return grain.grain_data.max_score;
    }

    public getGrainStatement(grain: IGrain) {
        var statement = grain.grain_data.statement || (grain.grain_data.custom_data && grain.grain_data.custom_data.statement);
        return this._$sce.trustAsHtml(this.formatHtml(statement));
    }

    public getGrainExplanation(grain: IGrain) {
        return grain.grain_data.answer_explanation;
    }

    public getGrainHint(grain: IGrain) {
        return grain.grain_data.answer_hint;
    }

    public getGrainOrder(grain: IGrain) {
        var numberOfGrain = 1;
        for (var i = 0; i < this.grainList.length; i++) {
            if (!this.isStatement(this.grainList[i]) && this.grainList[i].order_by < grain.order_by) {
                numberOfGrain++;
            }
        }
        return numberOfGrain;
    }

    public getCorrectAnswer(grain: IGrain) {
        return grain.grain_data.custom_data && grain.grain_data.custom_data.correct_answer;
    }

    public getCorrectAnswers(grain: IGrain) {
        return grain.grain_data.custom_data && grain.grain_data.custom_data.correct_answer_list;
    }

    public getHtmlContent(grain: IGrain) {
        var html = grain.grain_data.custom_data ? grain.grain_data.custom_data.htmlContent : "";
        if (grain.grain_data.custom_data && grain.grain_data.custom_data.zones) {
            grain.grain_data.custom_data.zones.forEach(answer => {
                var list = " _______ [";
                var suffix;
                var first = true;
                if (answer.options.length === 0) {
                    list += "<b><u>" + answer.answer + "</u></b>";
                } else {
                    answer.options.forEach(prop => {
                        if (answer.answer !== prop) {
                            suffix = (first ? "" : ", ") + prop;
                        } else {
                            suffix = (first ? "" : ", ") + "<b><u>" + prop + "</u></b>";
                        }
                        list += suffix;
                        first = false;
                    });
                }
                list += "] ";
                html = html.replace(new RegExp('<fill-zone([^>]*?)zone-id=\\"'+answer.id+'\\".*?>.*?\\/fill-zone>','gm'), list);
            });
        }
        html = html.replace(new RegExp(' &nbsp;','gm')," ")
        return this._$sce.trustAsHtml(this.formatHtml(html));
    }

    public getZones(grain: IGrain) {
        return grain.grain_data.custom_data && grain.grain_data.custom_data.zones;
    }

    public getImage(grain: IGrain) {
        return (grain.grain_data.custom_data && grain.grain_data.custom_data._guideImage) || skin.basePath + 'img/illustrations/exercizer.svg';
    }

    public getScheduledDescription() {
        return this._$sce.trustAsHtml(this.formatHtml(this._subjectScheduled.description));
    }

    public getSubjectDescription() {
        return this._$sce.trustAsHtml(this.formatHtml(this.subject.description));
    }

    public getScheduledDueDate() {
        return this._subjectScheduled.due_date;
    }

    public getScheduledEstimationDuration() {
        return this._subjectScheduled.estimated_duration;
    }

    public transformX(grain: IGrain, x: number, reverseTransform: boolean) { return transformX(`#${grain.id}-bckgrnd`, x, reverseTransform); }

    public transformY(grain: IGrain, y: number, reverseTransform: boolean) { return transformY(`#${grain.id}-bckgrnd`, y, reverseTransform); }

    private formatHtml(template: string) {
        if (!template) {
            return template;
        }
        //template = this.replaceVideo(template);
        //template = this.replaceAudio(template);
        template = this.resizeImages(template);
        template = this.replaceHref(template);
        return template;
    }

    private iframeRegexp = new RegExp('<iframe.*?src=\\"(.+?)[\\?|\\"].*?\\/iframe>','gm');

    private replaceVideo(template: string) {
        return template.replace(this.iframeRegexp, "<img src='" + skin.basePath + "img/icons/video-large.png' width='135' height='135'><br><a href=\"$1\">$1</a>");
    }

    private audioRegexp = new RegExp('<div class=\\"audio-wrapper.*?\\/div>','gm');

    private replaceAudio(template: string) {
        return template.replace(this.audioRegexp, "<img src='" + skin.basePath + "img/illustrations/audio-file.png' width='300' height='72'>");
    }

    private imageRegexp1 = new RegExp('(<img[^>]*?class=\\"smiley.*?\\")(.*?>)','gm');
    private imageRegexp2 = new RegExp('(<span[^>]*?class=\\"image-container.*?>).*?(<img.*?)>.*?<\\/span>','gm');

    private resizeImages(template: string) {
        return template.replace(this.imageRegexp1, "$1" + " style=\"height: 40px; width: 40px;\" " + "$2")
        .replace(this.imageRegexp2, "$2 style=\"max-width:300px;\">");
    }

    private hrefRegexp = new RegExp('<a.*?href=[\\"|\'](.+?)[\\"|\'].*?>(.*?)<\\/a>','gm');

    private replaceHref(template: string) {
        return template.replace(this.hrefRegexp, "$2\[<a href=\"$1\">$1</a>\] ");
    }

}

export const printSubjectController = ng.controller('PrintSubjectController', PrintSubjectController);