import {
	Repo,
	IndexedDBStorageAdapter,
	WebSocketClientAdapter,
} from '@automerge/vanillajs'
import * as Automerge from '@automerge/automerge/slim'
import * as AutomergeRepo from '@automerge/automerge-repo/slim'

window.Automerge = Automerge
window.AutomergeRepo = AutomergeRepo
window.repo = new Repo({
	storage: new IndexedDBStorageAdapter(),
	network: [new WebSocketClientAdapter('wss://sync.automerge.org')],
})
