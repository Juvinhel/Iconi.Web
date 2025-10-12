namespace Data
{
    export function crawlDirectoryListing(root: string): AsyncIterable<string>
    {
        const urls: LinkedStack<string> = new LinkedStack<string>();
        const done: LinkedStack<string> = new LinkedStack<string>();
        urls.unshift(root);

        async function* scanForFiles(): AsyncIterable<string>
        {
            while (urls.length)
            {
                const current = urls.shift();
                done.unshift(current);

                try
                {
                    const { folders, files } = await scanFolder(current);
                    urls.unshift(...folders);

                    for (const file of files)
                        yield file;
                }
                catch { }
            }
        }

        async function scanFolder(url: string): Promise<{ folders: string[], files: string[]; }>
        {
            const folders: string[] = [];
            const files: string[] = [];

            try
            {
                const response = await fetch(url + "/"); // folders end with /
                const text = await response.text();

                const parser = new DOMParser();
                const html = parser.parseFromString(text, "text/html");

                const links = html.querySelectorAll("a");
                for (const link of links)
                {
                    const href = new URL(link.getAttribute("href"), url).toString(); // make rooted based on url
                    if (!href.startsWith(root)) continue;
                    if (done.includes(href)) continue;

                    if (link.href.endsWith("/")) // check untrimmed url
                    {   // IIS
                        folders.push(href);
                        continue;
                    }
                    if (link.classList.values().some(c => c.includes("directory")))
                    {   // Live Server
                        folders.push(href);
                        continue;
                    }

                    files.push(href);
                }
            } catch (exception) { console.log(exception); }

            return { folders, files };
        }

        return scanForFiles();
    }
}