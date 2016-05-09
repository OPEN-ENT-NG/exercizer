/**
 * Created by Erwan_LP on 29/04/2016.
 */
interface IGrainData {
    title: string;
    max_score: number;
    statement: string;
    documentList: IDocument[];
    hint: string;
    correction : string;
    custom_data: any;
}