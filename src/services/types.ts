export interface FileDetail {
    cid: string | null;
    file: {
        name: string;
        type: string;
        size: number;
        created_at?: number;
    };
    id: string;
    secret?: string;
}


export interface SafeAsync {
    error: boolean | Error;
    data: FileDetail;
}