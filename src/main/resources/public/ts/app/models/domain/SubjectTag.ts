export interface ISubjectTag {
    id: number;
    label: string;
}

export class SubjectTag implements ISubjectTag {

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
