export interface folderEntry {
    handle: FileSystemHandle;
}
export declare class InvalidNameError extends Error {
    constructor(message: string, cause: string);
}
export declare function getFolderFromFolder<TCreate extends false>(this: Folder, create: TCreate, target: Record<string, Promise<Folder | null>>, prop: string): Promise<Folder | null>;
export declare function getFolderFromFolder<TCreate extends true>(this: Folder, create: TCreate, target: Record<string, Promise<Folder>>, prop: string): Promise<Folder>;
export declare function getFileFromFolder(this: Folder, create: false, target: Record<string, Promise<FileSystemFileHandle | null>>, prop: string): Promise<FileSystemFileHandle | null>;
export declare function getFileFromFolder(this: Folder, create: true, target: Record<string, Promise<FileSystemFileHandle>>, prop: string): Promise<FileSystemFileHandle>;
export declare class Folder {
    readonly handle: FileSystemDirectoryHandle;
    readonly childDirs: Record<string, Promise<Folder | null>>;
    readonly childDirsC: Record<string, Promise<Folder>>;
    readonly childFiles: Record<string, Promise<FileSystemFileHandle | null>>;
    readonly childFilesC: Record<string, Promise<FileSystemFileHandle>>;
    getFile(name: string): Promise<FileSystemFileHandle | null | InvalidNameError>;
    getFile(name: string, create: true): Promise<FileSystemFileHandle | InvalidNameError>;
    constructor(handle: FileSystemDirectoryHandle);
}
export declare function readFileAsDataURI(file_: FileSystemFileHandle | File): Promise<string>;
export declare class writeableFolder extends Folder {
    constructor(handle: FileSystemDirectoryHandle, SUPER_IMPORTANT__IS_THIS_FOLDER_WRITEABLE: true);
}
export declare function getUserPickedFolder(write: boolean): Promise<Folder>;
export declare function getUserPickedFolder(write: true): Promise<writeableFolder>;
//# sourceMappingURL=filesystem-interface.d.ts.map