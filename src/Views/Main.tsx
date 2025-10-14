namespace Views
{
    export function Main()
    {
        return <pane-container class="container" onfolderselected={ selectionChanged } ontagclicked={ tagClicked }>
            <div><Library.LibraryElement /></div>
            <div><Collection.CollectionElement /></div>
            <div><div class="icon-view"></div></div>
        </pane-container>;
    }

    function selectionChanged(event: Event)
    {
        const sender = event.currentTarget as HTMLElement;
        const folders = [...sender.querySelectorAll("my-folder.selected") as NodeListOf<Library.FolderElement>].map(x => x.folder);
        const files = Array.from(new Set(folders.mapMany(folder => [...Data.findFiles(folder)])));

        const collectionElement = sender.querySelector("my-collection") as Collection.CollectionElement;
        collectionElement.showFiles(files);
    }

    function tagClicked(event: UI.Elements.TagClickedEvent)
    {
        const main = event.currentTarget as HTMLElement;
        const searchElement = main.querySelector("my-search") as Collection.SearchElement;
        searchElement.toggleTag(event.tag);
    }
}