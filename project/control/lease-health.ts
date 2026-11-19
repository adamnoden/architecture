import { leaseTemporalState, type ClaimRecord } from './claims.js'

/** Observation, never a failure detector or permission to take over. */
export function leaseHealth(record: ClaimRecord, now: Date) {
  const age = (now.getTime() - Date.parse(record.heartbeatAt)) / 60000
  return {
    temporal: leaseTemporalState(record, now),
    heartbeatAgeMinutes: Math.floor(age),
    clockAhead: age < 0,
    renewalDue: record.state === 'claimed' && age >= 15,
    expiresInMinutes: Math.floor((Date.parse(record.expiresAt) - now.getTime()) / 60000),
    responsiveness: 'unknown' as const
  }
}

/** Fresh pre-publication check, not an atomic fence across GitHub refs. */
export function assertPublicationLease(record: ClaimRecord, now: Date, expected: {
  leaseId: string; generation: number; branch: string
}) {
  if (record.leaseId !== expected.leaseId || record.generation !== expected.generation) throw new Error('Superseded lease: publication refused')
  if (!Number.isInteger(expected.generation) || expected.generation < 1) throw new Error('Invalid generation')
  if (record.branch !== expected.branch) throw new Error('Lease does not own publication branch')
  if (leaseTemporalState(record, now) !== 'live') throw new Error('Publication requires a live lease; expiry grace is recovery time only')
  if (Date.parse(record.heartbeatAt) > now.getTime() + 120000) throw new Error('Clock uncertainty: heartbeat is in the future')
  if (Date.parse(record.expiresAt) - now.getTime() < 5 * 60000) throw new Error('Renew before publication: fewer than five minutes remain')
}
