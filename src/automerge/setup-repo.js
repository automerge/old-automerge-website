import ExecutionEnvironment from "@docusaurus/ExecutionEnvironment"

export default async function() {
    // Only run this code in the browser, not in the server side rendering context.
    if (ExecutionEnvironment.canUseDOM) {
        // All of these imports have to be dynamic because in a server side
        // rendering context we don't want to do any of this.
        const { Repo, IndexedDBStorageAdapter, WebSocketClientAdapter } = await import('@automerge/vanillajs')
        const { default: Automerge } = await import('@automerge/automerge')
        const { default: AutomergeRepo } = await import('@automerge/automerge-repo')
        window.Automerge = Automerge
        window.AutomergeRepo = AutomergeRepo
        window.repo = new Repo({
          storage: new IndexedDBStorageAdapter(),
          network: [new WebSocketClientAdapter('wss://sync.automerge.org')],
        })
    }
}

