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
            if (folderElement) folderElement.selected = true;
        }

        private folderSelected(event: CustomEvent)
        {
            const folder = event.detail.folder as Data.Folder;
            this.folderTagsElement.tags = folder ? folder.tags : [];
        }
    }

    customElements.define("my-library", LibraryElement);
}