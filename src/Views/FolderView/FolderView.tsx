namespace Views.FolderView
{
    export function FolderView()
    {
        return <div class="folder-view" oninserted={ initFolderView }>
            <h2 class="title">Library</h2>
            <div class="folders" />
            <div class="info">
                <span class="folder-tags" />
            </div>
        </div>;
    }

    async function initFolderView(e: Event)
    {
        const folderView = e.currentTarget as HTMLElement;
        folderView.addEventListener("selectfolder", selectFolder);

        const library = await Data.loadLibrary(App.config.library);

        folderView["library"] = library;

        loadFolders(folderView.querySelector(".folders"), library.folders);
    }

    function selectFolder(e: CustomEvent)
    {
        const folderView = e.currentTarget as HTMLElement;
        const folder = e.detail.folder as Data.Folder;

        const folderTagsElement = folderView.querySelector(".folder-tags");
        folderTagsElement.clearChildren();
        if (folder) for (const tag of folder.tags)
            folderTagsElement.append(<span title={ tag }>{ tag }</span>);
    }
}