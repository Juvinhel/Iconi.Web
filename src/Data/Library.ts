namespace Data
{
    export async function loadLibrary(config?: LibraryConfig): Promise<Library>
    {
        let url = config?.url ?? "library";
        if (!(url.startsWith("http://") || url.startsWith("https://")))
            url = new URL(url, location.toString()).toString();
        const folderExclusions = config?.["folder-exclusions"] ?? [];
        const tagExclusions = config?.["tag-exclusions"] ?? [];

        const library: Library = { url, folderExclusions, tagExclusions, folders: [] };
        const progressDialog = await UI.Dialog.progress({ title: "Building Library", displayType: "Absolute", max: 0, value: 0 });

        try
        {
            let list: string[];
            const response = await fetch(library.url + "/listing.txt");
            if (response.ok)
            {
                const text = await response.text();
                list = text.replaceAll(/(?:\r\n|\r|\n)/, "\n").split("\n").filter(p => p && p.trimChar("/").includes("/"));
                progressDialog.max = list.length;
            }
            else
            {
                list = [];
                for await (const file of crawlDirectoryListing(url))
                {
                    list.push(file);
                    progressDialog.max = list.length;
                }
            }

            list = list.map(p => new URL(p, library.url).toString());
            let i = 0;
            const updateInterval = calculateUpdateInterval(list.length);
            for (const file of list)
            {
                insertFile(library, file);
                ++i;
                if (i % updateInterval == 0)
                {
                    progressDialog.value = i;
                    await delay(0); // allow ui upates
                }
            }
            progressDialog.value = i;
        }
        catch (error)
        {
            console.error(error);
        }

        progressDialog.close();
        return library;
    }

    function insertFile(library: Library, url: string)
    {
        const filePath = decodeURI(url.substring(library.url.length).trimChar("/"));
        if (!filePath.includes("/")) return; // Files in root folder are ignored.

        let [remainingPath, fileName] = filePath.splitLast("/");
        const [name, extension] = fileName.splitLast(".");
        const file: File = { name, extension, url, tags: parseTags(remainingPath + "/" + name, library.tagExclusions), };

        let current: Folder | null = null;
        do
        {
            let folderName;
            [folderName, remainingPath] = remainingPath.splitFirst("/");

            if (checkExlusions(folderName, library.folderExclusions)) continue;
            current = getOrCreateFolder(library, current, folderName);
            current.files.push(file);
        } while (remainingPath);
    }

    function getOrCreateFolder(library: Library, parent: Folder | null, folderName: string): Folder 
    {
        const folders = parent?.folders ?? library.folders;
        let folder: Folder = folders.find(f => String.localeCompare(f.name, folderName) == 0); // localCompare needed because String and string are not equal
        if (!folder)
        {
            folder = { name: folderName, folders: [], files: [], tags: parseTags(folderName, library.tagExclusions) };
            if (parent) folder.tags.unshift(...parent.tags);
            folders.push(folder);
        }
        return folder;
    }

    function parseTags(_text: string, exclusions: (string | RegExp)[]): string[]
    {
        if (!_text) return [];

        return Array.from(new Set( // new Set => distinct items
            _text.split(/[-\/]/)
                .map(x => refineTag(x))
                .filter(x => !checkExlusions(x, exclusions))));
    }

    function refineTag(_tag: string): string
    {
        _tag = _tag.toLowerCase();
        _tag = _tag.trim();
        _tag = _tag.replace(/_/g, " ");
        while (_tag.includes("  ")) _tag = _tag.replace(/  /g, " ");
        return _tag;
    }

    function checkExlusions(text: string, exclusions: (string | RegExp)[]): boolean
    {
        for (const exclusion of exclusions)
            switch (typeof exclusion)
            {
                case "string":
                    if (exclusion == text)
                        return true;
                    break;
                case "object":
                    if (exclusion.test(text))
                        return true;
                    break;
            }
        return false;
    }

    export function* findFiles(folder: Folder): IterableIterator<File>
    {
        for (const file of folder.files)
            yield file;

        for (const subfolder of folder.folders)
            for (const file of findFiles(subfolder))
                yield file;
    }

    export type Library = {
        url: string;
        folderExclusions: (string | RegExp)[];
        tagExclusions: (string | RegExp)[];
        folders: Folder[];
    };

    export type Folder = {
        name: string;
        folders: Folder[];
        files: File[];
        tags: string[];
    };

    export type File = {
        url: string;
        name: string;
        extension: string;
        tags: string[];
    };
}