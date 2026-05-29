# Security Specification for Temporal Sync

## Data Invariants
1. A learning record, publishing plan, or link MUST belong to a specific user (`userId`).
2. Users can ONLY access (read, create, update, delete) their own documents.
3. Timestamps (`createdAt`) must be server-generated or verified.
4. Platforms and statuses must come from a predefined set of values.

## The "Dirty Dozen" Payloads (Red Team Test Cases)
1. **Identity Theft**: Attempt to create a link with `userId` of another user.
2. **Ghost Update**: Attempt to update a publishing plan's `title` while sneaking in a `role: "admin"` field.
3. **Orphaned Write**: Attempt to create a record without a `userId`.
4. **ID Poisoning**: Attempt to create a document with a 2KB junk string as the ID.
5. **Time Travel**: Attempt to set `createdAt` to a date in the future.
6. **Status Escalation**: Attempt to set a publishing plan to "Published" through a client write if only "Draft" is allowed (not applicable here as users own their data, but good to consider).
7. **Mass Scraping**: Attempt to list all documents in `links` without a `where("userId", "==", uid)` clause.
8. **Resource Exhaustion**: Attempt to write a 1MB string into the `title` field.
9. **Cross-User Leak**: Attempt to `get()` a document by ID that belongs to user B while logged in as user A.
10. **Immutable Violation**: Attempt to change the `userId` or `createdAt` of an existing document.
11. **Type Poisoning**: Sending an integer where a string is expected for `platform`.
12. **Enum Bypass**: Setting `status` to "Extreme" when it only accepts "Ready", "Review", "Draft".

## Success Criteria
- All 12 payloads MUST return `PERMISSION_DENIED`.
- Rules must be strictly typed and size-constrained.
