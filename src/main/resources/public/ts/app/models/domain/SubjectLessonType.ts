export interface ISubjectLessonType {
    id: number;
    label: string;
}

export class SubjectLessonType implements ISubjectLessonType {

    id: number;
    label: string;

    constructor
    (
        id?: number,
        label?: string
    ) {
        this.id = id;
        this.label = label;
    }
}
