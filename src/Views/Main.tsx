namespace Views
{
    export function Main()
    {
        return <pane-container class="container" onfolderselected={ folderSelectionChanged } ontagclicked={ tagClicked } onfileselected={ fileSelectionChanged } onselectfolder={ selectFolder }>
            <div><Library.LibraryElement /></div>
            <div><Collection.CollectionElement /></div>
            <div><Info.InfoElement /></div>
        </pane-container>;
    }

    function folderSelectionChanged(event: Event)
    {
        const sender = event.currentTarget as HTMLElement;
        const folders = [...sender.querySelectorAll("my-folder.selected") as NodeListOf<Library.FolderElement>].map(x => x.folder);
        const files = Array.from(new Set(folders.mapMany(folder => [...Data.findFiles(folder)])));

        const collectionElement = sender.querySelector("my-collection") as Collection.CollectionElement;
        collectionElement.showFiles(files);
    }

    function fileSelectionChanged(event: Event)
    {
        const sender = event.currentTarget as HTMLElement;
        const files = [...sender.querySelectorAll("my-file-tile.selected") as NodeListOf<Collection.FileTileElement>].map(x => x.file);

        const infoElement = sender.querySelector("my-info") as Info.InfoElement;
        infoElement.showFiles(files);
    }

    function tagClicked(event: UI.Elements.TagClickedEvent)
    {
        const main = event.currentTarget as HTMLElement;
        const searchElement = main.querySelector("my-search") as Collection.SearchElement;
        searchElement.toggleTag(event.tag);
    }

    function selectFolder(this: HTMLElement, event: CustomEvent)
    {
        const folder = event.detail.folder as Data.Folder;

        if (!App.multiselect)
        {
            for (const folderElement of this.querySelectorAll("my-folder.selected") as NodeListOf<Library.FolderElement>)
                if (folderElement.folder != folder)
                    folderElement.selected = false;
        }

        for (const folderElement of this.querySelectorAll("my-folder") as NodeListOf<Library.FolderElement>)
            if (folderElement.folder == folder)
            {
                const parentFolderElement = folderElement.closest("my-folder") as Library.FolderElement;
                parentFolderElement.expanded = true;
                folderElement.selected = true;
                return;
            }
    }
}