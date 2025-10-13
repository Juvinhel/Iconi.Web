namespace Views.ListView
{
    export class ListViewElement extends HTMLElement
    {
        constructor ()
        {
            super();

            this.append(...this.build());

            this.addEventListener("pagingchanged", (event: UI.Elements.PagingChangedEvent) => this.navigate(event.page));
        }

        private build()
        {
            return [
                <div class="search" />,
                <div class="container"><div class="list" /></div>,
                <div class="footer">
                    <simple-paging class="paging" />
                </div>
            ];
        }

        public files: Data.File[];
        public pageSize = 50;

        public showFiles(files: Data.File[])
        {
            const paging = document.querySelector(".paging") as HTMLSimplePaging;
            this.files = files;

            const pageCount = Math.ceil(files.length / this.pageSize);
            paging.max = pageCount;

            this.navigate(1);
        }

        private navigate(page: number)
        {
            const pagingElement = this.querySelector(".paging") as HTMLSimplePaging;
            pagingElement.current = page;

            const list = document.querySelector(".list") as HTMLDivElement;
            list.clearChildren();
            list.append(...this.files.skip((pagingElement.current - 1) * this.pageSize).take(this.pageSize).map(x => new IconTileElement(x)));
        }

        private async * filter(files: Data.File[]): AsyncIterableIterator<Data.File>
        {
            for (let i = 0; i < files.length; ++i)
            {
                if (i % 10 == 0) await delay(0);
                yield files[i];
            }
        }
    }

    customElements.define("my-list-view", ListViewElement);
}