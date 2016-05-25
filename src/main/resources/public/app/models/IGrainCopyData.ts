interface IGrainCopyData {

    title: string,
    max_score: number,
    statement: string,
    document_list: IGrainDocument[];
    hint: string,
    custom_copy_data: any;

}
