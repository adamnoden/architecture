import { editBase, sameEditBase, type EditBase, type EditorState } from './edit.js'
import type { DesignSnapshot } from './snapshot.js'

export interface AnalysisTicket {
  readonly base: EditBase
  readonly requestId: string
  readonly methodId: string
}

type AnalysisResult<T> = AnalysisTicket & (
  | { readonly status: 'complete'; readonly output: T }
  | { readonly status: 'cancelled' }
  | { readonly status: 'failed'; readonly message: string }
)

export function analysisTicket(state: EditorState, requestId: string, methodId: string): AnalysisTicket {
  return { base: editBase(state), requestId, methodId }
}

/** Cancellation releases the caller promptly. A specialist runner also receives the signal. */
export async function runRevisionAnalysis<T>(
  state: EditorState, ticket: AnalysisTicket, signal: AbortSignal,
  run: (design: DesignSnapshot, signal: AbortSignal) => T | Promise<T>,
): Promise<AnalysisResult<T>> {
  if (!sameEditBase(state, ticket.base)) return { ...ticket, status: 'failed', message: 'Ticket targets a different edit revision' }
  const cancelled = { ...ticket, status: 'cancelled' } as const
  if (signal.aborted) return cancelled
  let cancel!: () => void
  const cancellation = new Promise<typeof cancelled>(resolve => { cancel = () => resolve(cancelled) })
  signal.addEventListener('abort', cancel, { once: true })
  try {
    const computation = Promise.resolve().then(() => {
      signal.throwIfAborted()
      return run(state.design, signal)
    }).then<AnalysisResult<T>, AnalysisResult<T>>(
      output => ({ ...ticket, status: 'complete', output }),
      error => ({ ...ticket, status: 'failed', message: error instanceof Error ? error.message : 'Analysis failed' }),
    )
    const result = await Promise.race([cancellation, computation])
    return signal.aborted ? cancelled : result
  } finally {
    signal.removeEventListener('abort', cancel)
  }
}

/** Only the live, completed request for the current revision can supply an output. */
export function currentAnalysisOutput<T>(state: EditorState, active: AnalysisTicket | null, result: AnalysisResult<T>): T | undefined {
  return result.status === 'complete' && active !== null && sameEditBase(state, active.base) && sameEditBase(active.base, result.base)
    && active.requestId === result.requestId && active.methodId === result.methodId ? result.output : undefined
}
