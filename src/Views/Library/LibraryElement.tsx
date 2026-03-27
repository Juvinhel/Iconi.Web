namespace Views.Library
{
    export class LibraryElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(...this.build());

            this.addEventListener("folderselected", this.folderSelected.bind(this));
        }

        private foldersElement: HTMLDivElement;

        private build()
        {
            return [
                <h2 class="title">Library</h2>,
                <div class="container">
                    { this.foldersElement = <div class="folders" /> as HTMLDivElement }
                </div>
            ];
        }

        public library: Data.Library.Library;
        public selectedFolders: Data.Library.Folder[] = [];

        async connectedCallback()
        {
            this.library = await Data.Library.loadLibrary(App.config.library);

            loadFolders(this.foldersElement, this.library.folders);

            const folderselectionchangedEvent = new CustomEvent("folderselectionchanged", { bubbles: true, detail: {} });
            this.dispatchEvent(folderselectionchangedEvent);
        }

        private folderSelected(event: CustomEvent)
        {
            const folder: Data.Library.Folder = event.detail.folder;
            const selected: boolean = event.detail.selected;

            if (selected) { if (!this.selectedFolders.includes(folder)) this.selectedFolders.push(folder); }
            else this.selectedFolders.remove(folder);
        }

        public selectFolder(folder: Data.Library.Folder)
        {
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
                    folderElement.scrollIntoView({ block: "center", behavior: "smooth" });
                    break;
                }

            const folderselectionchangedEvent = new CustomEvent("folderselectionchanged", { bubbles: true, detail: {} });
            this.dispatchEvent(folderselectionchangedEvent);
        }
    }

    customElements.define("my-library", LibraryElement);
}