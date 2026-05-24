# Security Testing Plan: Custom Auth & RBAC
**Project:** Engineering Service Portal
**Scope:** Manual JWT Implementation, Refresh Token Rotation, and NestJS RBAC Guards.

## 1. Authentication Vectors (JWT & Sessions)
| ID | Vector | Description | Goal |
|:---|:---|:---|:---|
| A1 | **None Alg Bypass** | Change header to `{"alg": "none"}` and remove signature. | Verify server rejects unsigned tokens. |
| A2 | **Signature Stripping** | Provide a valid JWT but remove the signature part of the string. | Ensure the parser doesn't default to "trusted". |
| A3 | **Refresh Rotation** | Use a Refresh Token, then attempt to use the *same* one again. | Verify the system revokes the entire session. |
| A4 | **Secret Brute Force** | Use `hashcat` or `jwt-cracker` against your HS256 secret. | Confirm the secret meets high entropy standards. |
| A5 | **Token Lifetime** | Attempt to use an expired Access Token. | Verify `exp` claim is strictly enforced. |

## 2. Authorization Vectors (RBAC & Logic)
| ID | Vector | Description | Goal |
|:---|:---|:---|:---|
| B1 | **Vertical Escalation** | Access `/admin/users` with a `Provider` role JWT. | Confirm Role Guards block unauthorized access. |
| B2 | **Horizontal (IDOR)** | Access `/profile/:id` using another user's ID. | Ensure ownership checks exist beyond just role checks. |
| B3 | **Claim Tampering** | Manually edit the `role` field in a decoded JWT. | Verify the signature check prevents payload changes. |
| B4 | **Weight Manipulation**| Inject high values into matching criteria API. | Ensure matching logic validates input ranges. |

## 3. Network & Infrastructure
| ID | Vector | Description | Goal |
|:---|:---|:---|:---|
| C1 | **Rate Limiting** | Send 100 login requests in 5 seconds. | Confirm the system triggers 429 Too Many Requests. |
| C2 | **Information Leak** | Trigger a 500 error on the `/auth` route. | Ensure stack traces or database info aren't exposed. |
| C3 | **CORS Bypass** | Attempt to call the API from an unauthorized domain. | Verify the backend restricts browser-based requests. |
| C4 | **Cookie Flags** | Inspect the `Set-Cookie` header for Refresh Tokens. | Confirm `HttpOnly`, `Secure`, and `SameSite=Strict`. |

## 4. Evaluation Criteria
* [cite_start]**Functional Testing:** Do the security guards correctly identify roles? [cite: 63]
* [cite_start]**Basic Security Analysis:** Are common web vulnerabilities (XSS, CSRF) mitigated? 
* [cite_start]**Performance Impact:** Does the custom JWT validation add significant latency? [cite: 24, 61]
