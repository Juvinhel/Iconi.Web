namespace Views.Library
{
    export class LibraryElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(...this.build());

            this.addEventListener("folderselectionchanged", this.folderSelectionChanged.bind(this));
        }

        private foldersElement: HTMLDivElement;
        private folderTagsElement: HTMLTagList;

        private build()
        {
            return [
                <h2 class="title">Library</h2>,
                <div class="container">
                    { this.foldersElement = <div class="folders" /> as HTMLDivElement }
                </div>,
                <div class="footer">
                    { this.folderTagsElement = <tag-list class="folder-tags" /> as HTMLTagList }
                </div>
            ];
        }

        public library: Data.Library;

        async connectedCallback()
        {
            this.library = await Data.loadLibrary(App.config.library);

            loadFolders(this.foldersElement, this.library.folders);

            const folderElement = this.foldersElement.querySelector("my-folder") as FolderElement;
            if (folderElement)
            {
                folderElement.selected = true;

                const folderselectionchangedEvent = new CustomEvent("folderselectionchanged", { bubbles: true, detail: {} });
                this.dispatchEvent(folderselectionchangedEvent);
            }
        }

        private folderSelectionChanged(event: CustomEvent)
        {
            const folders = [...this.querySelectorAll("my-folder.selected") as NodeListOf<FolderElement>].map(x => x.folder);

            this.folderTagsElement.tags = folders.mapMany(x => x.tags).distinct();

            const tagschangedEvent = new CustomEvent("tagschanged", { bubbles: true, detail: { tags: this.folderTagsElement.tags } });
            this.dispatchEvent(tagschangedEvent);
        }
    }

    customElements.define("my-library", LibraryElement);
}