namespace Data
{
    export async function loadLibrary(url: string): Promise<Library>
    {
        if (!(url.startsWith("http://") || url.startsWith("https://")))
            url = new URL(url, location.toString()).toString();

        const library: Library = { url, folders: [] };
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
                for await (const file of scanForFiles(url))
                {
                    list.push(file);
                    progressDialog.max = list.length;
                }
            }

            list = list.map(p => new URL(p, library.url).toString());
            for (const file of list)
            {
                insertFile(library, file);
                ++progressDialog.value;
            }
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
        const filePath = url.substring(library.url.length).trimChar("/").toString();
        if (!filePath.includes('/')) return; // Files in root folder are ignored.

        let [remainingPath, fileName] = filePath.splitLast("/");
        const [name, extension] = fileName.splitLast(".");
        const file: File = { name, extension, url, tags: parseTags(remainingPath + "/" + name), };

        let current: Folder | null = null;
        do
        {
            let folderName;
            [folderName, remainingPath] = remainingPath.splitFirst("/");

            if (folderName.toLowerCase() == "svg") continue;
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
            folder = { name: folderName, folders: [], files: [], };
            folders.push(folder);
        }
        return folder;
    }

    function parseTags(_text: string): string[]
    {
        if (!_text) return [];

        return Array.from(new Set(
            _text
                .split(/[-\/]/)
                .map(x => refineTag(x))
                .filter(x => !(x.length >= 5 && /^[0-9]+$/.test(x)))
        ));
    }

    function refineTag(_tag: string): string
    {
        _tag = _tag.toLowerCase();
        _tag = _tag.trim();
        _tag = _tag.replace(/_/g, " ");
        while (_tag.includes("  ")) _tag = _tag.replace(/  /g, " ");
        return _tag;
    }

    async function* scanForFiles(url: string): AsyncIterable<string>
    {
        const urls: string[] = [url];
        const done: string[] = [];

        while (urls.length)
        {
            const current = urls.shift();
            done.push(current);
            try
            {
                const { folders, files } = await scanFolder(url, current);
                urls.push(...folders.filter(f => !done.includes(f)));

                for (const file of files)
                    yield file;
            }
            catch { }
        }
    }

    async function scanFolder(root: string, url: string): Promise<{ folders: string[], files: string[]; }>
    {
        const folders: string[] = [];
        const files: string[] = [];

        try
        {
            const response = await fetch(url);
            const text = await response.text();

            const parser = new DOMParser();
            const html = parser.parseFromString(text, 'text/html');

            const links = html.querySelectorAll("a");
            for (const link of links)
            {
                const href = link.href;
                if (!href.startsWith(root)) continue;

                if (href.endsWith("/")) 
                {   // IIS
                    folders.push(href.trimRight("/"));
                    continue;
                }
                if (link.classList.values().some(c => c.includes("directory")))
                {   // Live Server
                    folders.push(href.trimRight("/"));
                    continue;
                }

                files.push(href);
            }
        } catch (exception) { console.log(exception); }

        return { folders, files };
    }

    export type Library = {
        url: string;
        folders: Folder[];
    };

    export type Folder = {
        name: string;
        folders: Folder[];
        files: File[];
    };

    export type File = {
        url: string;
        name: string;
        extension: string;
        tags: string[];
    };
}