namespace Views
{
    export function Main()
    {
        return <pane-container class="container"
            onfolderselectionchanged={ folderSelectionChanged }
            onfileselectionchanged={ fileSelectionChanged }
            ontagclicked={ tagClicked }
            onselectfolder={ selectFolder }
            onquerychanged={ queryChanged }
            ontagschanged={ tagsChanged }>
            <div><Library.LibraryElement /></div>
            <div><Collection.CollectionElement /></div>
            <div><Info.InfoElement /></div>
        </pane-container>;
    }

    function folderSelectionChanged(this: HTMLElement, event: Event)
    {
        let folders = [...this.querySelectorAll("my-folder.selected") as NodeListOf<Library.FolderElement>].map(x => x.folder);
        if (folders.length == 0) folders = [...this.querySelectorAll("my-folder") as NodeListOf<Library.FolderElement>].map(x => x.folder);
        const files = Array.from(new Set(folders.mapMany(folder => [...Data.findFiles(folder)])));

        const collectionElement = this.querySelector("my-collection") as Collection.CollectionElement;
        collectionElement.showFiles(files);
    }

    function fileSelectionChanged(this: HTMLElement, event: Event)
    {
        const files = [...this.querySelectorAll("my-file-tile.selected") as NodeListOf<Collection.FileTileElement>].map(x => x.file);

        const infoElement = this.querySelector("my-info") as Info.InfoElement;
        infoElement.showFiles(files);
    }

    function tagClicked(this: HTMLElement, event: UI.Elements.TagClickedEvent)
    {
        const searchElement = this.querySelector("my-search") as Collection.SearchElement;
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

        const folderselectionchangedEvent = new CustomEvent("folderselectionchanged", { bubbles: true, detail: {} });
        this.dispatchEvent(folderselectionchangedEvent);
    }

    function queryChanged(this: HTMLElement, event: CustomEvent)
    {
        const query: string[] = event.detail.query;
        highlightTags.bind(this)(query);
    }

    function tagsChanged(this: HTMLElement, event: CustomEvent)
    {
        const searchElement = this.querySelector("my-search") as Collection.SearchElement;
        highlightTags.bind(this)(searchElement.query);
    }

    function highlightTags(query: string[])
    {
        for (const tagList of this.querySelectorAll("tag-list") as NodeListOf<HTMLTagList>)
        {
            for (const tagElement of tagList.shadowRoot.querySelectorAll("span") as NodeListOf<HTMLSpanElement>)
            {
                const tag = tagElement.title;
                const state = query.includes(tag) ? "checked" : query.includes("!" + tag) ? "negate" : null;
                tagElement.classList.remove("checked", "negate");
                if (state == "checked") tagElement.classList.toggle("checked", true);
                if (state == "negate") tagElement.classList.toggle("negate", true);
            }
        }
    }
}