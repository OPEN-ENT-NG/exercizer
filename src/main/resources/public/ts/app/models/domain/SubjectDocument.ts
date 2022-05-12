export interface ISubjectDocument {
    /** ID of a _workspace_ document, or a previously uploaded file from historical subjects. */
    docId: string;

    /** Where to find the file or document. */
    docType?: 'workspace'|'storage';

    /** A few metadata about the physical file, to avoid querying the workspace in most cases. */
    metadata?: {
        name: string;
        size: number;
        charset?: string;
        filename: string;
        "content-type": string;
        "content-transfer-encoding"?: string
    }
}
