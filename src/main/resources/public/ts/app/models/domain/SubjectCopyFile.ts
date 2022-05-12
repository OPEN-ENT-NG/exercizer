export interface ISubjectCopyFile {
    /** ID of a physical file in user's storage. */
    fileId: string;

    /** Type of file. */
    fileType?: 'homework'|'corrected';
    
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
