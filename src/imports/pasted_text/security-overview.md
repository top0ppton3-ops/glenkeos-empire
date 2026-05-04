1. Security goals and threat model

1.1 Security goals

Primary goals:

• No raw card data exposure to your app servers, logs, or databases.
• End‑to‑end encryption for all sensitive data in transit and at rest.
• Strong identity and access control for every internal and external actor.
• Tamper‑proof auditability of all financial events.
• Defense‑in‑depth: multiple layers of controls, not a single point of failure.


Secondary goals:

• Multi‑rail support (cards, wallets, crypto, alt‑rails).
• Regulatory‑ready (PCI DSS, SOC 2, future banking/EMI licensing).


1.2 Threat model

You must assume:

• Attackers can:• Intercept traffic (MITM if TLS misconfigured).
• Compromise a single server or container.
• Steal a database snapshot.
• Gain access to logs.
• Phish or compromise an internal employee.

• You must protect against:• Card data theft.
• Account takeover.
• Payment fraud.
• Replay attacks.
• Tampering with transaction records.
• Insider abuse.



---

2. High‑level architecture

2.1 Components

1. Frontend clients• Web, mobile, internal consoles.
• Never handle raw card data directly—only via secure payment fields.

2. Payment Edge / Tokenization Layer• Isolated service (separate infra, separate VPC, separate secrets).
• Only component allowed to see raw card data.
• Talks directly to card networks or a low‑level gateway.
• Returns tokens to your core system.

3. Core Payments API• Your main backend payment service.
• Works only with tokens, not raw PANs.
• Handles:• Payment intents.
• Captures.
• Refunds.
• Disputes.
• Ledger entries.
• Multi‑rail routing (card, crypto, alt).


4. Ledger & Accounting Engine• Double‑entry ledger.
• Immutable transaction history.
• Reconciliation with external accounts (banks, processors, wallets).

5. Key Management & Crypto• HSM or cloud KMS (AWS KMS, GCP KMS, Azure Key Vault).
• All encryption keys managed centrally.
• No keys hard‑coded or stored in app configs.

6. Data Stores• PCI zone DB (for tokenization service only).
• Core DB (for tokens, payments, ledger, users).
• Strict network segmentation between them.

7. Monitoring, Logging, SIEM• Centralized logging (no sensitive data).
• Security event monitoring.
• Alerting on anomalies.



---

3. Network and trust boundaries

3.1 Segmentation

• Zone 1: Public Edge• Load balancers, API gateways.
• TLS termination with strict config (TLS 1.2+, modern ciphers).

• Zone 2: Core App• Core Payments API.
• Business logic services.
• No raw card data.

• Zone 3: PCI Zone• Tokenization service.
• PCI DB.
• HSM/KMS.
• Access extremely restricted (network ACLs, separate IAM, separate secrets).



3.2 Zero trust principles

• Every service authenticates to every other service (mTLS or signed tokens).
• No “flat” internal network where everything can talk to everything.
• Principle of least privilege for:• Services.
• Databases.
• Admin tools.



---

4. Data model and flows

4.1 Core entities

Customer

• id
• external_id (if mapped to GlenKeos user)
• risk_profile
• kyc_status (future)


Payment Method

• id
• customer_id
• type (card, wallet, crypto, alt)
• token (opaque, from PCI zone)
• brand, last4, exp_month, exp_year
• status (active, inactive, revoked)


Payment

• id
• order_id
• customer_id
• payment_method_id
• amount, currency
• status (pending, authorized, captured, failed, refunded, chargeback)
• external_reference (gateway/processor ID)
• created_at, updated_at


Ledger Entry

• id
• payment_id
• debit_account
• credit_account
• amount, currency
• created_at
• immutable (no updates, only append)


4.2 Card payment flow (high‑security path)

1. Frontend:• Loads secure payment fields (from your Tokenization service or gateway JS).
• User enters card details.
• Card data goes directly to Tokenization service (PCI zone), not your core API.

2. Tokenization service:• Validates card.
• Talks to gateway/network to tokenize.
• Returns:• payment_method_token (opaque).
• Card metadata (brand, last4, exp).


3. Core Payments API:• Receives payment_method_token + amount + order_id.
• Creates payment record with status pending.
• Calls gateway to create authorization / payment intent.
• Updates status to authorized or failed.
• On capture:• Calls gateway capture.
• Writes ledger entries.


4. Webhooks:• Gateway sends events (success, failure, disputes).
• Webhook handler:• Verifies signature.
• Updates payments and ledger.
• Triggers notifications.




---

5. Cryptography and key management

5.1 Key management

• Use HSM or cloud KMS for:• Tokenization keys.
• DB encryption keys.
• Signing keys for internal tokens.

• Keys:• Rotated regularly.
• Access controlled via IAM.
• Never exposed to app code directly—only via KMS APIs.



5.2 Encryption

• In transit:• TLS 1.2+ everywhere.
• HSTS, secure ciphers, no legacy protocols.

• At rest:• Full‑disk encryption for all volumes.
• Column‑level encryption for:• Any sensitive metadata.
• Crypto wallet keys (if you host them).

• PCI DB fully encrypted with KMS‑managed keys.



5.3 Tokenization

• Raw PAN → Tokenization service → returns:• token (random, non‑derivable).
• Card metadata (brand, last4, exp).

• Tokens:• Only meaningful inside your system.
• Mapped to PAN in PCI DB only.
• Never leave your infra.



---

6. Access control and IAM

6.1 Service‑to‑service auth

• Use:• mTLS between services, or
• Signed JWTs with short TTL, issued by a central auth service.

• Each service has:• Its own identity.
• Its own permissions.



6.2 Human access

• No direct DB access in production except:• Break‑glass procedures.
• Audited, time‑limited sessions.

• Admin consoles:• SSO (OIDC/SAML).
• MFA mandatory.
• Role‑based access (RBAC).
• Fine‑grained permissions (view vs modify vs approve).



---

7. Logging, monitoring, and audit

7.1 Logging

• Never log:• PAN.
• CVV.
• Full cardholder data.

• Log:• Payment IDs.
• Status transitions.
• Actor IDs (user, service).
• IPs, device fingerprints (for fraud).



7.2 Audit trails

• Every sensitive action:• Policy changes.
• Refunds.
• Manual overrides.
• Access to PCI zone.

• Must be:• Logged.
• Immutable (append‑only).
• Searchable.



7.3 Monitoring

• Metrics:• Auth vs capture rates.
• Decline reasons.
• Chargeback rates.
• Latency, error rates.

• Security:• Anomalous login patterns.
• Unusual payment patterns.
• Suspicious admin activity.



---

8. Compliance posture

8.1 PCI DSS

To be “Stripe/Chase‑level secure,” you architect for PCI DSS Level 1:

• Scope minimization:• Only Tokenization service and PCI DB in PCI scope.
• Everything else works with tokens.

• Controls:• Network segmentation.
• Strong access control.
• Vulnerability management.
• Regular penetration testing.
• Change management.



8.2 SOC 2 / ISO 27001 (future)

• Document:• Policies.
• Procedures.
• Incident response.
• Vendor management.



---

9. Multi‑rail support (cards, wallets, crypto, alt)

9.1 Payment type abstraction

In payments and payment_methods, include:

• payment_type: card, wallet, crypto, alt.


Each type has its own handler:

• Card: via Tokenization + gateway.
• Wallet: Apple Pay / Google Pay / PayPal tokens.
• Crypto: on‑chain or via crypto processor.
• Alt: Cash App, Wise, etc.


9.2 Crypto specifics (if you go there)

• Use:• A crypto processor (Fireblocks, Coinbase Commerce, etc.), or
• Your own wallet infra with HSM‑protected keys.

• Flow:• Generate invoice / address.
• Wait for confirmations.
• Mark payment as confirmed.
• Reconcile with ledger.



---

10. Concrete deliverables for your team

Here’s what you tell your team to build, in real terms:

10.1 Services

1. Tokenization Service (PCI Zone)• API:• POST /tokenize-card
• POST /create-payment-method

• Talks to gateway/network.
• Stores PAN only in PCI DB (encrypted).

2. Core Payments Service• API:• POST /payments/intent
• POST /payments/capture
• POST /payments/refund
• POST /payments/methods

• Works only with tokens.
• Writes to payments + ledger.

3. Webhook Handler• POST /webhooks/gateway
• Verifies signatures.
• Updates payments + ledger.

4. Ledger Service• Double‑entry accounting.
• Immutable entries.
• Reconciliation tools.



10.2 Data stores

• PCI DB:• cards (PAN, encrypted).
• card_tokens (token ↔ card mapping).

• Core DB:• customers
• payment_methods
• payments
• refunds
• ledger_entries
• audit_logs



10.3 Frontend

• PaymentForm:• Uses Tokenization service or gateway JS.
• Never touches raw PAN.

• PaymentSummary:• Shows totals, fees, taxes.
• Uses resolve_pricing from your menu/pricing engine.

• Admin Consoles:• Payment search.
• Refund initiation.
• Dispute view.
• All actions audited.
