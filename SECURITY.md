# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.5.x   | :white_check_mark: |
| 0.4.x   | :x:                |
| < 0.4   | :x:                |

## Reporting a Vulnerability

We take security seriously. If you discover a security vulnerability, please follow these steps:

### 1. Do NOT create a public issue
Security vulnerabilities should be reported privately to prevent exploitation.

### 2. Email us directly
Send details to: security@laray.com.br

### 3. Include in your report:
- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

### 4. Response timeline:
- **Acknowledgment**: Within 48 hours
- **Initial Assessment**: Within 5 business days
- **Resolution**: Varies by severity
  - Critical: 1-7 days
  - High: 7-14 days
  - Medium: 14-30 days
  - Low: 30-60 days

## Security Best Practices

### For Users:
1. **Always use HTTPS** for webhook URLs
2. **Rotate credentials** regularly
3. **Use environment variables** for sensitive data
4. **Enable rate limiting** on endpoints
5. **Monitor logs** for suspicious activity

### For Contributors:
1. **Never commit secrets** (use .gitignore)
2. **Validate all inputs** to prevent injection
3. **Use parameterized queries**
4. **Escape output** appropriately
5. **Review dependencies** for vulnerabilities

## Security Checklist for PRs

- [ ] No hardcoded credentials
- [ ] Input validation implemented
- [ ] Error messages don't leak sensitive info
- [ ] Dependencies updated
- [ ] Security headers configured
- [ ] Rate limiting considered

## Known Security Considerations

### OAuth2 Tokens
- Tokens are stored encrypted by n8n
- Automatic refresh before expiry
- Secure transmission only

### Webhook Validation
- HOTTOK header validation required
- Request body integrity checks
- Replay attack prevention via timestamps

## Vulnerability Disclosure

After a fix is released:
1. Security advisory published
2. CVE requested if applicable
3. Users notified via changelog
4. 30-day grace period before public disclosure

## Security Tools

We recommend using these tools:

```bash
# Check for known vulnerabilities
npm audit

# Update dependencies safely
npm update --save

# Check for secrets in code
npx secretlint
```

## Contact

**Security Team**: security@laray.com.br  
**PGP Key**: [Coming soon]

---

Last Updated: 24/05/2025