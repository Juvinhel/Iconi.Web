namespace Data
{
    export async function loadLibrary(config?: LibraryConfig): Promise<Library>
    {
        const builder = new LibraryBuilder(config);
        return await builder.run();
    }

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

    export class LibraryBuilder
    {
        constructor (config?: LibraryConfig)
        {
            this.url = config?.url ?? "library";
            if (!(this.url.startsWith("http://") || this.url.startsWith("https://")))
                this.url = new URL(this.url, location.toString()).toString();
            this.folderExclusions = config?.["folder-exclusions"] ?? [];
            this.tagExclusions = config?.["tag-exclusions"] ?? [];
            this.maxDepth = config?.["max-depth"] ?? 2;
        }

        public url: string;
        public folderExclusions: (string | RegExp)[];
        public tagExclusions: (string | RegExp)[];
        public maxDepth: number;

        private library: Library;
        private progressDialog: UI.Elements.ProgressDialog;

        public async run(): Promise<Library>
        {
            this.library = { url: this.url, folders: [] };
            this.progressDialog = await UI.Dialog.progress({ title: "Building Library", displayType: "Absolute", max: 0, value: 0 });

            try
            {
                //const response = await fetch(this.url + "/library.json");
                //if (response.ok)
                //{
                //    await this.loadFromJSON(await response.text());
                //}
                //else
                {
                    const list = await this.getFileList();
                    await this.loadFromFileList(list);
                }
            }
            catch (error)
            {
                console.error(error);
            }

            this.progressDialog.close();
            return this.library;
        }

        private async loadFromJSON(text: string)
        {
            const folders: Folder[] = JSON.parse(text);

            for (const folder of folders)
                this.setParents(folder);

            this.library.folders.push(...folders);
        }

        private setParents(folder: Folder)
        {
            folder.files ??= [];
            for (const file of folder.files)
                file.parent = folder;

            folder.folders ??= [];
            for (const subFolder of folder.folders)
            {
                subFolder.parent = folder;
                this.setParents(subFolder);
            }
        }

        private async getFileList(): Promise<string[]>
        {
            let list: string[];
            const response = await fetch(this.url + "/listing.txt");
            if (response.ok)
            {
                const text = await response.text();
                list = text.replaceAll(/(?:\r\n|\r|\n)/, "\n").split("\n").filter(p => p && p.trimChar("/").includes("/"));
                this.progressDialog.max = list.length;
            }
            else
            {
                list = [];
                for await (const file of crawlDirectoryListing(this.url))
                {
                    list.push(file);
                    this.progressDialog.max = list.length;
                }
            }
            return list;
        }

        private async loadFromFileList(list: string[])
        {
            list = list.map(p => new URL(p, this.url).toString());
            let i = 0;
            const updateInterval = calculateUpdateInterval(list.length);
            for (const file of list)
            {
                this.insertFile(file);
                ++i;
                if (i % updateInterval == 0)
                {
                    this.progressDialog.value = i;
                    await delay(0); // allow ui upates
                }
            }
            this.progressDialog.value = i;
        }

        private insertFile(url: string)
        {
            const filePath = decodeURI(url.substring(this.url.length).trimChar("/"));
            if (!filePath.includes("/")) return; // Files in root folder are ignored.

            let [path, fileName] = filePath.splitLast("/");
            const [name, extension] = fileName.splitLast(".");
            if (extension.toLowerCase() != "svg") return;
            const file: File = { parent: null, name, extension, url, tags: parseTags(path + "/" + name, this.tagExclusions), };

            const folder: Folder = this.getOrCreateFolder(this.library, path, 1);
            folder.files.push(file);
        }

        private getOrCreateFolder(parent: Folder | Library, path: string, depth: number): Folder
        {
            let [current, remaining] = path.splitFirst("/");
            while (current && checkExlusions(current, this.folderExclusions)) [current, remaining] = remaining?.splitFirst("/") ?? [null, null];
            if (!current) return parent as Folder;

            let folder: Folder = parent.folders.first(x => x.name == current);
            if (!folder)
            {
                folder = { name: current, folders: [], files: [], parent: "name" in parent ? parent : null };
                parent.folders.push(folder);
            }

            if (remaining?.contains("/") && (this.maxDepth == 0 || depth < this.maxDepth))
                return this.getOrCreateFolder(folder, remaining, depth + 1);
            return folder;
        }
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
        {
            file.parent = folder;
            yield file;
        }
        for (const subfolder of folder.folders)
            for (const file of findFiles(subfolder))
                yield file;
    }
}