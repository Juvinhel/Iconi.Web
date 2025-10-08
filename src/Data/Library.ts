namespace Data
{
    export class Library
    {
        constructor (url: string)
        {
            this.root = new URL(url, location.toString()).toString();
        }

        public root: string;
        public folders: Folder[] = [];
        public extensions: string[] = ["svg"];

        public load(): AsyncIterablePromise<Folder>
        {
            return new AsyncIterablePromise<Folder>(this.loadFromListing());
        }

        private async * loadFromListing(): AsyncIterable<Folder>
        {
            const progressDialog = await UI.Dialog.progress({ title: "Loading Library", displayType: "Absolute", max: 0, });
            const response = await fetch(this.root + "/listing.txt");
            let scanFolder: (path: string) => Promise<{ folderPaths: string[], filePaths: string[]; }>;
            if (response.ok)
            {
                const text = await response.text();
                let list = text.replaceAll(/(?:\r\n|\r|\n)/, "\n").split("\n").filter(p => p && p.includes("/"));
                list = list.sort(String.localeCompare);
                list = list.map(p => new URL(p, location.toString()).toString());
                const fileListing = new FileListing(list);
                progressDialog.max = fileListing.folders.length;
                scanFolder = fileListing.scanFolder;
            }
            else
                scanFolder = this.scanFolder;

            for await (const folder of this.loadFromTree(scanFolder))
            {
                yield folder;
                ++progressDialog.value;
            }

            progressDialog.close();
        }

        private async * loadFromTree(scanFolder: (path: string) => Promise<{ folderPaths: string[], filePaths: string[]; }>): AsyncIterable<Folder>
        {
            const folders: Folder[] = [];
            const loadedPaths: string[] = [this.root];

            const { folderPaths, filePaths } = await scanFolder(this.root);
            for (const folderPath of folderPaths)
            {
                if (loadedPaths.includes(folderPath)) continue;
                loadedPaths.push(folderPath);

                const folder = { parent: null, path: folderPath, name: folderPath.splitLast("/")[1], folders: [], files: [], tags: [] };
                folders.push(folder);
                this.folders.push(folder);
            }

            while (folders.length > 0)
            {
                const current = folders.shift();
                const { folderPaths, filePaths } = await scanFolder(current.path);

                if (current.parent) current.tags.push(...current.parent.tags);
                current.tags.push(...this.parseTags(current.name));

                for (const filePath of filePaths)
                {
                    let [name, extension] = filePath.splitLast(".");
                    extension = extension?.toLowerCase();
                    if (!this.extensions.includes(extension)) continue;

                    const file: File = { parent: current, path: filePath, name, extension, tags: [] };
                    file.tags.push(...current.tags);
                    file.tags.push(...this.parseTags(file.name));

                    current.files.push(file);
                }

                for (const folderPath of folderPaths)
                {
                    if (loadedPaths.includes(folderPath)) continue;
                    loadedPaths.push(folderPath);

                    const folder = { parent: current, path: folderPath, name: folderPath.splitLast("/")[1], folders: [], files: [], tags: [] };
                    current.folders.push(folder);
                    folders.push(folder);
                }

                yield current;
            }
        }

        private parseTags(name: string): string[]
        {
            return name.split("-").map(x => x.replace("_", " ").trim()).filter(x => x);
        }

        private scanFolder = async function (url: string): Promise<{ folderPaths: string[], filePaths: string[]; }>
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
                    if (!href.startsWith(this.root)) continue;

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

            return { folderPaths: folders, filePaths: files };
        }.bind(this);
    }

    export type Folder = {
        parent: Folder;
        path: string;
        name: string;
        folders: Folder[];
        files: File[];
        tags: string[];
    };

    export type File = {
        parent: Folder;
        path: string;
        name: string;
        extension: string;
        tags: string[];
    };

    class FileListing
    {
        constructor (list: string[])
        {
            this.files = list.filter(p => !p.endsWith("/"));
            this.folders = list.filter(p => p.endsWith("/")).map(p => p.trimRight("/"));
        }

        public files: string[];
        public folders: string[];

        public scanFolder = async function (path: string): Promise<{ folderPaths: string[], filePaths: string[]; }>
        {
            const folderPaths = this.folders.filter(p => p.startsWith(path)).filter(p => p.substring(path.length).trimChar("/").split("/").length == 1);
            const filePaths = this.files.filter(p => p.startsWith(path)).filter(p => p.substring(path.length).trimChar("/").split("/").length == 1);

            return { folderPaths, filePaths };
        }.bind(this);
    }
}