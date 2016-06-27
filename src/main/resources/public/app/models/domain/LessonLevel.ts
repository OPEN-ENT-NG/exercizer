interface ILessonLevel {
    id: number;
    label: string;
}

class LessonLevel implements ILessonLevel {

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
