namespace Views.Library
{
    export function loadFolders(container: HTMLElement, folders: Data.Folder[])
    {
        for (const folder of folders)
            container.append(new FolderElement(folder));
    }

    export class FolderElement extends HTMLElement
    {
        constructor (folder: Data.Folder)
        {
            super();

            this.title = folder.name;
            this.folder = folder;

            this.append(...this.build());

            if (folder.folders.length > 0) this.classList.add("has-subfolders");
        }

        private subfoldersElement: HTMLDivElement;

        private build()
        {
            return [
                <div class="header">
                    <a class="expander" onclick={ this.expanderClick } />
                    <span class="title" title={ this.folder.name } onclick={ this.titleXORClick }>{ this.folder.name }</span>
                    <span class="file-count" title={ this.folder.files.length + " files" }>{ this.folder.files.length }</span>
                </div>,
                this.subfoldersElement = <div class="subfolders">
                    { this.folder.folders.map(f => new FolderElement(f)) }
                </div> as HTMLDivElement
            ];
        }

        public folder: Data.Folder;

        public get selected() { return this.classList.contains("selected"); }
        public set selected(value: boolean)
        {
            this.classList.toggle("selected", value);

            const selectedEvent = new CustomEvent("folderselected", { bubbles: true, detail: { folder: value ? this.folder : null } });
            this.dispatchEvent(selectedEvent);
        }

        public get expanded() { return this.classList.contains("expanded"); }
        public set expanded(value: boolean)
        {
            this.classList.toggle("expanded", value);

            if (value)
            {
                let parent = this.parentElement;
                do
                {
                    if (parent instanceof FolderElement)
                        parent.classList.toggle("expanded", true);
                } while (parent = parent.parentElement);
            }
            else
            {
                for (const child of this.subfoldersElement.querySelectorAll("my-folder.expanded"))
                    child.classList.toggle("expanded", false);
            }
        }

        private titleXORClick = function (this: FolderElement, event: Event)
        {
            //@ts-ignore
            switch (event.detail)
            {
                case 1:
                    this.titleClick();
                    break;
                case 2:
                    this.titleDblClick();
                    break;
            }
        }.bind(this);

        private titleClick()
        {
            if (!App.multiselect)
            {
                const folders = this.closest(".folders") as HTMLDivElement;
                for (const folderElement of folders.querySelectorAll("my-folder.selected") as NodeListOf<FolderElement>)
                    if (folderElement != this)
                        folderElement.selected = false;
            }

            this.selected = !this.selected;
        }

        private titleDblClick()
        {
            this.expanded = !this.expanded;
        }

        private expanderClick = function (this: FolderElement)
        {
            this.expanded = !this.expanded;
        }.bind(this);
    }

    customElements.define("my-folder", FolderElement);
}