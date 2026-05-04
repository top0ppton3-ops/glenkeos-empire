# Security Policy

## Supported Versions

We take security seriously at GlenKeos. Currently, we support the following versions with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We appreciate the security research community's efforts to responsibly disclose vulnerabilities. If you believe you've found a security vulnerability in GlenKeos, please follow these steps:

### Reporting Process

1. **Do Not** disclose the vulnerability publicly until it has been addressed
2. Email security details to: **security@glenkeos.com**
3. Include the following information:
   - Description of the vulnerability
   - Steps to reproduce the issue
   - Potential impact
   - Suggested fix (if available)
   - Your contact information

### What to Expect

- **Initial Response**: Within 48 hours of submission
- **Status Updates**: Every 7 days until resolution
- **Resolution Timeline**: Critical vulnerabilities addressed within 30 days
- **Disclosure**: Coordinated disclosure after patch deployment

### Severity Classification

We use the following severity levels:

- **Critical**: Remote code execution, authentication bypass, data breach
- **High**: Privilege escalation, SQL injection, XSS affecting sensitive data
- **Medium**: CSRF, information disclosure, DoS
- **Low**: Minor information leaks, configuration issues

## Security Measures

### Application Security

- **Authentication**: Supabase Auth with JWT tokens
- **Authorization**: Role-based access control (RBAC) with granular permissions
- **Data Encryption**: TLS 1.3 in transit, AES-256 at rest
- **Input Validation**: Server-side validation for all user inputs
- **SQL Injection Prevention**: Parameterized queries via Supabase client
- **XSS Prevention**: React's built-in XSS protection + Content Security Policy

### Infrastructure Security

- **Hosting**: Vercel (frontend) with automatic HTTPS
- **Database**: Supabase PostgreSQL with Row Level Security (RLS)
- **Edge Functions**: Supabase Edge Functions with isolated execution
- **Secrets Management**: Environment variables, never committed to repository
- **API Security**: CORS configuration, rate limiting, API key rotation

### Compliance

GlenKeos implements enterprise-grade security controls aligned with:

- **SOC 2 Type II** controls for service organization security
- **PCI DSS** requirements for payment processing (via PayPal)
- **GDPR** data protection and privacy requirements
- **CCPA** California consumer privacy protections

### Payment Security

- **Payment Processing**: PayPal integration (no credit card data stored)
- **PCI Compliance**: PCI DSS SAQ A compliant through PayPal
- **Transaction Security**: Server-side order validation and webhook verification

### Data Protection

- **Personal Data**: Encrypted at rest and in transit
- **Access Logs**: Comprehensive audit trails for all data access
- **Data Retention**: Configurable retention policies per data type
- **Right to Deletion**: Automated data deletion workflows

## Security Best Practices for Contributors

When contributing to GlenKeos, please follow these security guidelines:

1. **Never commit secrets**: Use `.env.example` templates only
2. **Validate all inputs**: Server-side validation is mandatory
3. **Use parameterized queries**: Never concatenate SQL strings
4. **Implement RBAC**: Check user permissions before sensitive operations
5. **Audit logging**: Log all security-relevant events
6. **Error handling**: Don't expose stack traces or internal details
7. **Dependencies**: Keep all dependencies up to date
8. **Code review**: All changes require security-focused code review

## Security Testing

We maintain the following security testing practices:

- **Static Analysis**: Automated Deno lint checks on all commits
- **Dependency Scanning**: Regular vulnerability scanning of npm packages
- **Penetration Testing**: Annual third-party security assessments
- **Code Review**: Mandatory security review for sensitive changes

## Security Updates

Security updates are released through:

- **Patch Releases**: Critical security fixes (immediate deployment)
- **Minor Releases**: High/medium severity fixes (within 7 days)
- **Security Advisories**: Published on GitHub Security Advisories

## Contact

- **Security Issues**: security@glenkeos.com
- **General Support**: support@glenkeos.com
- **Emergency Contact**: Available to verified security researchers

## Acknowledgments

We appreciate responsible disclosure and may recognize security researchers who help improve GlenKeos security (with permission).

---

**Last Updated**: April 24, 2026
**Version**: 1.0.0
