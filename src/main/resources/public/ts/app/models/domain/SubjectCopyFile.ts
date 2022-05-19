export type ISubjectCopyFileType = 'homework'|'corrected';

export interface ISubjectCopyFile {
    /** ID of a physical file in user's storage. */
    file_id: string;

    /** Type of file. */
    file_type?: ISubjectCopyFileType;
    
    /** Metadata about the physical file. */
    metadata: {
        name: string;
        size: number;
        charset?: string;
        filename: string;
        "content-type": string;
        "content-transfer-encoding"?: string
    }
}
