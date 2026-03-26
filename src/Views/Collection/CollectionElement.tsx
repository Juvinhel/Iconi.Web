namespace Views.Collection
{
    export class CollectionElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(...this.build());

            this.addEventListener("search", this.search.bind(this));
            this.tabIndex = -1; // allow focus for keydown
            this.addEventListener("keydown", this.keydown.bind(this), { capture: false, passive: false });
            this.addEventListener("keyup", this.keyup.bind(this), { capture: false, passive: false });
        }

        private searchElement: SearchElement;
        private listElement: ListElement;

        private build()
        {
            return [
                <h2 class="title">Collection</h2>,
                this.searchElement = <SearchElement /> as SearchElement,
                this.listElement = <ListElement /> as ListElement
            ];
        }

        public files: Data.Library.File[];
        public filteredFiles: Data.Library.File[];
        public queryTags: string[] = [];
        public pageSize = 50;

        public showFiles(files: Data.Library.File[])
        {
            this.files = files;

            this.search();
        }

        private search()
        {
            this.queryTags = this.searchElement.query;
            this.filter();
            console.log("query", this.queryTags);
            console.log("files", this.filteredFiles);

            this.listElement.showFiles(this.filteredFiles);

            const showfilesEvent = new CustomEvent("showfiles", { bubbles: true, detail: {} });
            this.dispatchEvent(showfilesEvent);
        }

        private filter()
        {
            if (this.queryTags.length == 0)
                this.filteredFiles = this.files.slice(0); // fast copy
            else
            {
                this.filteredFiles = [];
                for (const file of this.files)
                    if (this.queryTags.every(t => t.startsWith("!") ? !file.tags.includes(t.substring(1)) : file.tags.includes(t)))
                        this.filteredFiles.push(file);
            }
        }

        private keyup(event: KeyboardEvent)
        {
            if (event.ctrlKey && event.key == "a")
            {
                const selection = !([...document.querySelectorAll("my-file-tile")] as Views.Collection.FileTileElement[]).some(x => x.selected);
                for (const fileTile of document.querySelectorAll("my-file-tile") as NodeListOf<Views.Collection.FileTileElement>)
                    fileTile.selected = selection;
                event.preventDefault();
            }
            if (event.ctrlKey && event.key == "c")
            {
                if (copySVGsToClipboard)
                {
                    const selectedFileTileElements = [...this.querySelectorAll("my-file-tile.selected") as NodeListOf<FileTileElement>];
                    copySVGsToClipboard(selectedFileTileElements.map(x => x.file));
                }
            }
        }

        private keydown(event: KeyboardEvent)
        {
            if (event.ctrlKey && event.key == "a")
                event.preventDefault();
            if (event.ctrlKey && event.key == "c")
                event.preventDefault();
        }
    }

    customElements.define("my-collection", CollectionElement);
};