import { ng } from 'entcore';

export const EXERCIZER_TEACHER_SUBJECT_DISPLAY_LIST_PREF = 'exercizer.teacher.subject.displayList';
export const EXERCIZER_TEACHER_CORRECTION_DISPLAY_LIST_PREF = 'exercizer.teacher.correction.displayList';

export class LocalStorageService {

    public getTeacherSubjectDisplayList(): string {
        return localStorage.getItem(EXERCIZER_TEACHER_SUBJECT_DISPLAY_LIST_PREF);
    }

    public setTeacherSubjectDisplayList(pref: string) {
        localStorage.setItem(EXERCIZER_TEACHER_SUBJECT_DISPLAY_LIST_PREF, pref);
    }

    public getTeacherCorrectionDisplayList(): string {
        return localStorage.getItem(EXERCIZER_TEACHER_CORRECTION_DISPLAY_LIST_PREF);
    }

    public setTeacherCorrectionDisplayList(pref: string) {
        localStorage.setItem(EXERCIZER_TEACHER_CORRECTION_DISPLAY_LIST_PREF, pref);
    }
}

export const localStorageService = ng.service('LocalStorageService', LocalStorageService);