namespace Data.Library
{
    export function* findFiles(folder: Folder): IterableIterator<File>
    {
        for (const file of folder.files)
        {
            file.parent = folder;
            yield file;
        }
        for (const subfolder of folder.folders)
            for (const file of findFiles(subfolder))
                yield file;
    }
}