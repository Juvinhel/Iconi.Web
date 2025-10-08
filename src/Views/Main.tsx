namespace Views
{
    export function Main()
    {
        return <pane-container class="container">
            <div>{ Views.FolderView.FolderView() }</div>
            <div><div class="search-view"></div></div>
            <div><div class="icon-view"></div></div>
        </pane-container>;
    }
}