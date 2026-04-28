# Security Specification - TOPdigitalPLAY

## Data Invariants
1. A customer must belong to a valid tenant (revendedor).
2. A customer check for payment must always result in a future due date based on the package period.
3. A revendedor can only access their own data (servidores, pacotes, clientes, pagamentos, mensagens).
4. Sensitive fields like `tenant_id` (handled via path) must be immutable.

## The "Dirty Dozen" Payloads (Denial Tests)
1. Update `revendedores/{uid}` from another user account.
2. Create a `cliente` under `revendedores/{targetUid}` while being logged in as `{attackerUid}`.
3. Read `clientes` from another revendedor's subcollection.
4. Update a `cliente`'s `whatsapp` to a 1MB string (Denial of Wallet).
5. Update `cliente` set `status` to `Inadimplente` when the due date is in the future.
6. Create a `pagamento` for a client that doesn't exist.
7. Update `servidor` costs to negative values.
8. Inject a script into a `mensagemLog` text field.
9. Delete a `servidor` that has active clients (business logic, but rules can help parity).
10. Update a `pacote` period to 0 days.
11. Reading the entire `revendedores` collection (blanket read).
12. Creating a `cliente` without a `servidor_id`.

## Security Rules Strategy
- **Master Gate**: Access to all subcollections is guarded by the parent `revendedores/{uid}` where `uid == request.auth.uid`.
- **Validation Helpers**: `isValidServidor`, `isValidPacote`, `isValidCliente`, etc.
- **Action-Based Updates**: Specific actions for status changes or data edits.
- **Immutability**: `createdAt` and `uid` paths are immutable.
