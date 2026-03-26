namespace Views.Collection
{
    export class FileTileElement extends HTMLElement
    {
        constructor (file: Data.Library.File)
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
                <img src={ this.file.url } loading="lazy" />,
                <color-icon class="check" src="img/icons/check.svg" />
            ];
        }

        public file: Data.Library.File;

        public get selected() { return this.classList.contains("selected"); }
        public set selected(value: boolean)
        {
            this.classList.toggle("selected", value);

            const selectedEvent = new CustomEvent("fileselected", { bubbles: true, detail: { file: this.file, selected: value } });
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

            const fileselectionchangedEvent = new CustomEvent("fileselectionchanged", { bubbles: true, detail: {} });
            this.dispatchEvent(fileselectionchangedEvent);
        }
    }

    customElements.define("my-file-tile", FileTileElement);
}