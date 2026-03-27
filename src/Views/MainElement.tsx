namespace Views
{
    export class MainElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(this.build());

            this.addEventListener("folderselectionchanged", this.folderSelectionChanged.bind(this));
            this.addEventListener("fileselectionchanged", this.fileSelectionChanged.bind(this));
            this.addEventListener("fileselected", this.fileSelected.bind(this));
            this.addEventListener("tagclicked", this.tagClicked.bind(this));
            this.addEventListener("selectfolder", this.selectFolder.bind(this));
            this.addEventListener("querychanged", this.queryChanged.bind(this));
            this.addEventListener("tagschanged", this.tagsChanged.bind(this));
        }

        private libraryElement: Library.LibraryElement;
        private collectionElement: Collection.CollectionElement;
        private infoElement: Info.InfoElement;

        private build()
        {
            return <pane-container class="container">
                <div>{ this.libraryElement = <Library.LibraryElement /> as Library.LibraryElement } </div>
                <div>{ this.collectionElement = <Collection.CollectionElement /> as Collection.CollectionElement }</div>
                <div>{ this.infoElement = <Info.InfoElement /> as Info.InfoElement }</div>
            </pane-container>;
        }

        private folderSelectionChanged(event: Event)
        {
            const folders = this.libraryElement.selectedFolders.length != 0 ? this.libraryElement.selectedFolders : this.libraryElement.library.folders;
            const files = Array.from(new Set(folders.mapMany(folder => [...Data.Library.findFiles(folder)])));

            this.collectionElement.showFiles(files);
        }

        private fileSelectionChanged(event: Event)
        {
        }

        private fileSelected(event: CustomEvent)
        {
            const file: Data.Library.File = event.detail.file;
            const selected: boolean = event.detail.selected;

            if (selected) this.infoElement.showFile(file);
            else if (this.infoElement.file == file)
                this.infoElement.showFile(null);
        }

        private tagClicked(event: UI.Elements.TagClickedEvent)
        {
            this.collectionElement.toggleTag(event.tag);
        }

        private selectFolder(event: CustomEvent)
        {
            const folder = event.detail.folder as Data.Library.Folder;
            this.libraryElement.selectFolder(folder);
        }

        private queryChanged(event: CustomEvent)
        {
            const query: string[] = event.detail.query;
            this.infoElement.highlightTags(query);
        }

        private tagsChanged(event: CustomEvent)
        {
            const searchElement = this.collectionElement.querySelector("my-search") as Collection.SearchElement;
            this.infoElement.highlightTags(searchElement.query);
        }
    }

    customElements.define("my-main", MainElement);
}