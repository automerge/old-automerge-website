import type * as Automerge from '@automerge/automerge'
import type * as AutomergeRepo from '@automerge/automerge-repo'
import type {Repo} from '@automerge/automerge-repo'

declare global {
  interface Window {
    repo: Repo
    Automerge: typeof Automerge
    AutomergeRepo: typeof AutomergeRepo
  }
}
