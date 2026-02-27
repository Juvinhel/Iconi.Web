namespace Views.Collection
{
    export class FileTileElement extends HTMLElement
    {
        constructor (file: Data.File)
        {
            super();

            this.title = file.name;
            this.file = file;

            this.append(...this.build());

            this.addEventListener("click", this.clicked.bind(this));
            this.addEventListener("rightclick", showContextMenu.bind(this));
        }

        private build()
        {
            return [
                <img src={ this.file.url } />,
                <color-icon class="check" src="img/icons/check.svg" />
            ];
        }

        public file: Data.File;

        public get selected() { return this.classList.contains("selected"); }
        public set selected(value: boolean)
        {
            this.classList.toggle("selected", value);

            const selectedEvent = new CustomEvent("fileselected", { bubbles: true, detail: { file: value ? this.file : null } });
            this.dispatchEvent(selectedEvent);
        }

        private clicked()
        {
            if (!App.multiselect)
            {
                const list = this.closest(".list") as HTMLDivElement;
                for (const iconTile of list.querySelectorAll("my-file-tile.selected") as NodeListOf<FileTileElement>)
                    if (iconTile != this)
                        iconTile.classList.toggle("selected", false);
            }

            this.selected = !this.selected;
        }
    }

    customElements.define("my-file-tile", FileTileElement);
}