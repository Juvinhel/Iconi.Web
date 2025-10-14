namespace Views.Collection
{
    export class ListElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(...this.build());

            this.addEventListener("pagingchanged", (event: UI.Elements.PagingChangedEvent) => this.navigate(event.page));
        }

        private listElement: HTMLDivElement;
        private countElement: HTMLSpanElement;
        private pagingElement: HTMLSimplePaging;

        private build()
        {
            return [
                <div class="container">
                    { this.listElement = <div class="list" /> as HTMLDivElement }
                </div>,
                this.countElement = <span class="count">Items: 0</span> as HTMLSpanElement,
                this.pagingElement = <simple-paging class="paging" /> as HTMLSimplePaging
            ];
        }

        public files: Data.File[];
        public pageSize = 50;

        public showFiles(files: Data.File[])
        {
            this.files = files;

            const pageCount = Math.ceil(this.files.length / this.pageSize);
            this.pagingElement.max = pageCount;

            this.countElement.textContent = "Items: " + files.length.toFixed();

            this.navigate(1);
        }

        private navigate(page: number)
        {
            this.pagingElement.current = page;

            this.listElement.clearChildren();
            this.listElement.append(...this.files.skip((this.pagingElement.current - 1) * this.pageSize).take(this.pageSize).map(x => new FileTileElement(x)));
        }
    }

    customElements.define("my-list", ListElement);
};