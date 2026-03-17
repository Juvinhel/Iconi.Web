namespace Data.Library
{
    export type Library = {
        url: string;
        folders: Folder[];
    };

    export type Folder = {
        parent: Folder;
        name: string;
        folders: Folder[];
        files: File[];
    };

    export type File = {
        parent: Folder;
        url: string;
        name: string;
        extension: string;
        tags: string[];
    };
}