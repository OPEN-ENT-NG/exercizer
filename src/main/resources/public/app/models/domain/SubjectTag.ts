interface ISubjectTag {
    id: number;
    label: string;
}

class SubjectTag implements ISubjectTag {

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
