interface GrainCopyData {
    title: string,
    max_score: number,
    statement: string,
    document_list: IDocument[];
    hint: string,
    custom_data: {
        available_answer_list:any[],
        answer_list:any[]
    };
}
