interface GrainCopyData {
    title: string,
    max_score: number,
    statement: string,
    document_list: [];
    hint: string,
    custom_data: {
        available_answer_list:[],
        answer_list:[]
    };
}
