# Security Specification - TAF Digital EB

## Data Invariants
1. A TAF Result must be associated with a valid Military ID.
2. Only a Gestor (Homologador) can move a TAF Result from 'draft' to 'final'.
3. Physical indices (run, pushUps, etc.) must be within biological/logical limits.
4. Timestamps must be valid and set by the server when possible.

## The "Dirty Dozen" Payloads (Threat Models)
1. **Identity Spoofing**: Attempt to create a military profile with a fake ID.
2. **Privilege Escalation**: Applicator attempts to set a TAF status to 'final' without authorization.
3. **Data Poisoning**: Setting run distance to 1,000,000 meters.
4. **Relational Orphan**: Creating a TAF Result for a non-existent Military.
5. **Update Gap**: Modifying a 'final' (homologated) TAF result.
6. **Shadow Field**: Adding `isVerified: true` to a military record to bypass logic.
7. **Negative Values**: Setting repetitions to -5.
8. **Owner Hijack**: Changing the militaryId of an existing TAF result.
9. **Massive Payload**: Sending a 1MB string as the military name.
10. **ID Poisoning**: Using a 2KB string as the document ID.
11. **Spoofed Evaluator**: Setting an evaluator name that doesn't match the launcher.
12. **Status Shortcut**: Creating a TAF directly in 'final' status.

## Test Runner (Logic Overview)
The `firestore.rules` will enforce:
- `status` immutability for non-gestors once finalized.
- Type and size checks for every field.
- `exists()` check for militaryId on TAF creation.
