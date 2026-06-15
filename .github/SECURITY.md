# Security policy

If you find a security issue in this project, please report it privately.
Do **not** open a public GitHub issue.

Email: security@blockshark.com

We acknowledge reports within 48 hours and aim to ship a fix within 14 days
for high-severity issues.

## Scope

In scope:
- Authentication bypass on customer or admin routes
- Server-side request forgery
- SQL injection
- XSS that survives our CSP
- CSRF token bypass
- Mass-assignment vulnerabilities
- Sensitive information disclosure
- Privilege escalation between customer / admin guards

Out of scope:
- Issues that require a compromised host or local access
- Self-XSS
- Missing security headers without a demonstrable impact
- Findings against the demo at cross-swap.blockshark.com that are environmental
