namespace Data.Library
{
    export async function loadLibrary(config?: Config): Promise<Library>
    {
        const builder = new Builder(config);
        return await builder.run();
    }

    export class Builder
    {
        constructor (config?: Config)
        {
            this.url = config?.url ?? "library";
            if (!(this.url.startsWith("http://") || this.url.startsWith("https://")))
                this.url = new URL(this.url, location.toString()).toString();
            this.folderExclusions = config["folder-exclusions"] ?? [];
            this.tagExclusions = config["tag-exclusions"] ?? [];
            this.maxDepth = config?.["max-depth"] ?? 0;
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
            this.progressDialog = await UI.Dialog.progress({ title: "Loading Library", displayType: "Absolute", max: 0, value: 0 });

            try
            {
                const response = await fetch(this.url + "/library.json");
                if (response.ok)
                {
                    const text = await this.loadFileWithProgress(response);
                    await this.loadFromJSON(text);
                }
                else
                {
                    const response = await fetch(this.url + "/listing.txt");
                    let list: string[];
                    if (response.ok)
                    {
                        const text = await this.loadFileWithProgress(response);
                        list = text.replaceAll(/(?:\r\n|\r|\n)/, "\n").split("\n").filter(p => p && p.trimChar("/").includes("/"));
                    }
                    else
                        list = await this.getFileList();

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

        private async loadFileWithProgress(response: Response): Promise<string>
        {
            this.progressDialog.title = "Downloading Library File";
            this.progressDialog.value = 0;
            this.progressDialog.max = parseInt(response.headers.get("content-length"), 10) || 0;
            let received = 0;

            const reader = response.body.getReader();
            const chunks: Uint8Array<ArrayBufferLike>[] = [];
            while (true)
            {
                const { done, value } = await reader.read();
                if (done) break;
                chunks.push(value);
                received += value.length;
                this.progressDialog.value = received;
            }

            // combine chunks
            let chunksAll = new Uint8Array(received);
            let position = 0;
            for (let chunk of chunks)
            {
                chunksAll.set(chunk, position);
                position += chunk.length;
            }

            await delay(0); //allow ui update

            let text = new TextDecoder("utf-8").decode(chunksAll);
            return text;
        }

        private async loadFromJSON(text: string)
        {
            this.progressDialog.title = "Parsing Library File";
            this.progressDialog.value = 0;
            this.progressDialog.max = 0;

            const start = Date.now();
            const folders: Folder[] = JSON.parse(text);
            const end = Date.now();
            const elapsed = end - start;
            console.log("parsed: ", elapsed / 1000);

            for (const folder of folders)
                this.setParents(folder);
            const end2 = Date.now();
            const elapsed2 = end2 - end;
            console.log("setParents: ", elapsed2 / 1000);

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
            let list: string[] = [];
            for await (const file of crawlDirectoryListing(this.url))
            {
                list.push(file);
                this.progressDialog.max = list.length;
            }
            return list;
        }

        private async loadFromFileList(list: string[])
        {
            this.progressDialog.title = "Building Library";
            this.progressDialog.max = list.length;

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
            if (extension?.toLowerCase() != "svg") return;
            const file: File = { parent: null, name, extension, url, tags: this.parseTags(path + "/" + name + "-" + extension), };

            const folder: Folder = this.getOrCreateFolder(this.library, this.removePathExclusions(path), 1);
            folder.files.push(file);
        }

        private removePathExclusions(path: string): string
        {
            let ret = "";
            for (const part of path.split("/"))
                if (!checkExlusions(part, this.folderExclusions))
                    ret += (ret.length > 0 ? "/" : "") + part;
            return ret;
        }

        private getOrCreateFolder(parent: Folder | Library, path: string, depth: number): Folder
        {
            let current: string;
            let remaining: string;

            if (this.maxDepth != 0 && depth >= this.maxDepth)
            {
                current = path;
                remaining = null;
            }
            else
                [current, remaining] = path.splitFirst("/");

            let folder: Folder = parent.folders.first(x => String.localeCompare(x.name, current) == 0);
            if (!folder)
            {
                folder = { name: current, folders: [], files: [], parent: "name" in parent ? parent : null };
                parent.folders.push(folder);
            }

            if (remaining)
                return this.getOrCreateFolder(folder, remaining, depth + 1);
            return folder;
        }

        private parseTags(text: string): string[]
        {
            if (!text) return [];

            return Array.from(new Set( // new Set => distinct items
                text.split(/[-\/]/)
                    .map(x => refineTag(x))
                    .filter(x => !checkExlusions(x, this.tagExclusions))));
        }
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
}