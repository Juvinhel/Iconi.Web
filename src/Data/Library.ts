namespace Data
{
    export class Library
    {
        constructor (url: string)
        {
            this.root = url;
        }

        public root: string;
        public folders: Folder[] = [];
        public extensions: string[] = ["svg"];

        public load(): AsyncIterablePromise<Folder>
        {
            return new AsyncIterablePromise<Folder>(this.internalload());
        }

        private async * internalload(): AsyncIterable<Folder>
        {
            const folders: Folder[] = [];
            const loadedPaths: string[] = [this.root];

            const { folderPaths, filePaths } = await this.scanFolder(this.root);
            for (const folderPath of folderPaths)
            {
                loadedPaths.push(folderPath);

                const folder = { parent: null, path: folderPath, name: folderPath.splitLast("/")[1], folders: [], files: [], tags: [] };
                folders.push(folder);
                this.folders.push(folder);
            }

            while (folders.length > 0)
            {
                const current = folders.shift();
                const { folderPaths, filePaths } = await this.scanFolder(current.path);

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

        private async scanFolder(url: string): Promise<{ folderPaths: string[], filePaths: string[]; }>
        {
            const folders: string[] = [];
            const files: string[] = [];

            const response = await fetch(url);
            const text = await response.text();

            const parser = new DOMParser();
            const html = parser.parseFromString(text, 'text/html');

            const links = html.querySelectorAll("a");
            for (const link of links)
            {
                const href = link.getAttribute("href");
                if (href == "/") continue;
                if (href.endsWith("/")) 
                {   // IIS
                    folders.push(href);
                    continue;
                }
                if (link.classList.entries().some(x => x[1].includes("directory")))
                {   // Live Server
                    folders.push(href);
                    continue;
                }

                files.push(href);
            }

            return { folderPaths: folders, filePaths: files };
        }
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
}