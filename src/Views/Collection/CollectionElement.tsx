namespace Views.Collection
{
    export class CollectionElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(...this.build());

            this.addEventListener("fileselected", this.fileSelected.bind(this));
            this.addEventListener("tagclicked", this.tagClicked.bind(this));
            this.addEventListener("search", this.search.bind(this));
            this.tabIndex = -1; // allow focus for keydown
            this.addEventListener("keydown", this.keydown.bind(this), { capture: false, passive: false });
            this.addEventListener("keyup", this.keyup.bind(this), { capture: false, passive: false });
        }

        private searchElement: SearchElement;
        private listElement: ListElement;
        private fileTagsElement: HTMLTagList;

        private build()
        {
            return [
                <h2 class="title">Collection</h2>,
                this.searchElement = <SearchElement /> as SearchElement,
                this.listElement = <ListElement /> as ListElement,
                <div class="footer">
                    { this.fileTagsElement = <tag-list class="file-tags" /> as HTMLTagList }
                </div>
            ];
        }

        public files: Data.File[];
        public filteredFiles: Data.File[];
        public queryTags: string[] = [];
        public pageSize = 50;

        public showFiles(files: Data.File[])
        {
            this.files = files;

            this.search();
        }

        private search()
        {
            this.queryTags = this.searchElement.query;
            this.filter();

            this.listElement.showFiles(this.filteredFiles);
        }

        private filter()
        {
            if (this.queryTags.length == 0)
                this.filteredFiles = this.files.slice(0); // fast copy
            else
            {
                this.filteredFiles = [];
                for (const file of this.files)
                    if (this.queryTags.every(t => file.tags.includes(t)))
                        this.filteredFiles.push(file);
            }
        }

        private fileSelected(event: CustomEvent)
        {
            const file = event.detail.file as Data.File;

            this.fileTagsElement.tags = file ? file.tags : [];
        }

        private tagClicked(event: UI.Elements.TagClickedEvent)
        {
            this.searchElement.toggleTag(event.tag);

            event.stopPropagation(); // stop handling in main
            event.preventDefault();
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
                const info = document.querySelector("my-info") as Info.InfoElement;
                info.copyToClipboard();
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