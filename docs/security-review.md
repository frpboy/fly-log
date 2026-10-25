# Security review follow-up

This is a source-level review of the current Firebase/Netlify paths, not a claim
that production IAM, Firebase Console settings, or live cross-account rules were
tested.

## Verified in source

- Flight records are stored under `flights/{uid}/records/{docId}`.
- `firestore.rules` scopes reads, creates, updates, and deletes to the
  authenticated UID that owns the corresponding path and denies other paths by
  default. This is a code review of the rules; emulator-based cross-user tests
  are not configured in the current unit-test workflow.
- The AeroDataBox API key is read only by
  `netlify/functions/flight-status/flight-status.js`; it is not read by the
  browser bundle. Keep it in the Netlify function environment and never prefix
  it with `VITE_`.
- The flight-status endpoint verifies Firebase App Check before making the
  upstream API call. Missing configuration, a missing token, and an invalid
  token fail closed. Responses from this function should contain generic error
  messages; implementation details belong in server logs.

## Gaps that still need a separate implementation

- **Account deletion is not implemented in the current app UI or auth helper.**
  Deleting a Firebase Auth user alone would not remove Firestore documents in
  nested subcollections. A complete flow needs recent-login reauthentication,
  a server-authorized recursive deletion of `flights/{uid}`, clear progress
  and failure handling, and only then deleting the Auth account. Do not promise
  users that their data is deleted until every step is confirmed.
- **User-data isolation needs emulator-backed tests.** Add tests for an owner
  reading/writing/deleting their records, a different signed-in UID being
  denied, and signed-out requests being denied. The current rules look
  owner-scoped, but static inspection is not the same as exercising deployed
  rules.
- **Export is tracked separately.** The flight-data-export change adds user
  initiated CSV/JSON downloads without exporting derived enrichment or account
  identifiers. Test a downloaded file with both filtered and unfiltered data.
- Firebase App Check enforcement on Firestore/Auth depends on the Firebase
  Console configuration; the endpoint verifier does not, by itself, prove
  that those other Firebase services enforce App Check in production.

## Release checks

1. Verify the production Netlify environment contains the server-only
   `RAPIDAPI_AERODATABOX_KEY` and the Firebase App Check project identifiers.
2. Confirm App Check is enforced for the flight-status function and test that
   missing and invalid tokens do not reach the upstream provider.
3. Add the Firebase Emulator Suite and cross-user rules tests before making a
   claim of verified isolation.
4. Design account deletion as a separate, reviewed workflow with recent-login
   reauthentication and observable completion/failure states.
