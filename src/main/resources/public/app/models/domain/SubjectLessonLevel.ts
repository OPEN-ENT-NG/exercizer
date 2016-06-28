interface ISubjectLessonLevel {
    id: number;
    label: string;
}

class SubjectLessonLevel implements ISubjectLessonLevel {

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
