namespace Views
{
    export function Main()
    {
        return <pane-container class="container" onselectfolder={ selectionChanged }>
            <div>{ FolderView.FolderView() }</div>
            <div><ListView.ListViewElement /></div>
            <div><div class="icon-view"></div></div>
        </pane-container>;
    }

    function selectionChanged(event: Event)
    {
        const sender = event.currentTarget as HTMLElement;
        const folders = [...sender.querySelectorAll(".folder.selected")].map(x => x["folder"] as Data.Folder);
        const files = Array.from(new Set(folders.mapMany(folder => [...Data.findFiles(folder)])));

        const listView = sender.querySelector("my-list-view") as ListView.ListViewElement;
        listView.showFiles(files);
    }
}