namespace Views.FolderView
{
    export function FolderView()
    {
        return <div class="folder-view" oninserted={ initFolderView }>
            <h2 class="title">Library</h2>
            <div class="folders" />
            <div class="info">
                <span class="folder-tags" />
                <span class="loading">Loading!</span>
            </div>
        </div>;
    }

    async function initFolderView(e: Event)
    {
        const folderView = e.currentTarget as HTMLElement;
        folderView.addEventListener("selectfolder", selectFolder);

        const library = await Data.loadLibrary("library");

        folderView["library"] = library;

        console.log(library.folders);
        loadFolders(folderView.querySelector(".folders"), library.folders);

        const loading = folderView.querySelector(".loading");
        loading.remove();
    }

    function selectFolder(e: CustomEvent)
    {
        const folderView = e.currentTarget as HTMLElement;
        const folder = e.detail.folder as Data.Folder;

        const folderTagsElement = folderView.querySelector(".folder-tags");
        folderTagsElement.clearChildren();
        // if (folder) for (const tag of folder.tags)
        //     folderTagsElement.append(<span title={ tag }>{ tag }</span>);
    }
}