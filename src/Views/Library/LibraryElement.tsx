namespace Views.Library
{
    export class LibraryElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(...this.build());
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

        async connectedCallback()
        {
            this.library = await Data.Library.loadLibrary(App.config.library);
            console.log("lib", this.library);

            loadFolders(this.foldersElement, this.library.folders);

            const folderElement = this.foldersElement.querySelector("my-folder") as FolderElement;
            if (folderElement)
            {
                folderElement.selected = true;

                const folderselectionchangedEvent = new CustomEvent("folderselectionchanged", { bubbles: true, detail: {} });
                this.dispatchEvent(folderselectionchangedEvent);
            }
        }
    }

    customElements.define("my-library", LibraryElement);
}