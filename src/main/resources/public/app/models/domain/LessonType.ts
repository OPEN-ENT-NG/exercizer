interface ILessonType {
    id: number;
    label: string;
}

class LessonType implements ILessonType {

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
