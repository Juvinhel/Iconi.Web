namespace Views.ListView
{
    export class IconTileElement extends HTMLElement
    {
        constructor (file: Data.File)
        {
            super();

            this.title = file.name;
            this.file = file;

            this.append(...this.build());

            this.addEventListener("click", this.clicked.bind(this));
        }

        private build()
        {
            return [
                <img src={ this.file.url } />
            ];
        }

        public file: Data.File;

        public get selected() { return this.classList.contains("selected"); }
        public set selected(value: boolean)
        {
            this.classList.toggle("selected", value);

            if (value)
            {
                const selectedEvent = new CustomEvent("fileselected", { bubbles: true, detail: { file: this.file } });
                this.dispatchEvent(selectedEvent);
            }
        }

        private clickables = ["INPUT", "A", "BUTTON"];
        private clicked(event: MouseEvent)
        {
            if (event.composedPath().some(x => this.clickables.includes((x as HTMLElement).tagName))) return;

            const selected = this.selected;

            if (!App.multiselect)
            {
                const list = this.closest(".list") as HTMLDivElement;
                for (const iconTile of list.querySelectorAll("my-icon-tile.selected") as NodeListOf<IconTileElement>)
                    iconTile.selected = false;
            }

            this.selected = !selected;
        }
    }

    customElements.define("my-icon-tile", IconTileElement);
}