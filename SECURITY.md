# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

If you discover a security vulnerability within the Colmi Ring Dashboard, please send an email to the maintainers. All security vulnerabilities will be promptly addressed.

**Please do not publicly disclose the issue until it has been addressed by the team.**

### What to Include

- Type of issue (e.g., buffer overflow, SQL injection, cross-site scripting, etc.)
- Full paths of source file(s) related to the manifestation of the issue
- The location of the affected source code (tag/branch/commit or direct URL)
- Any special configuration required to reproduce the issue
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### Response Timeline

- We will acknowledge receipt of your vulnerability report within 48 hours
- We will provide a detailed response within 7 days
- We will notify you when the vulnerability has been fixed

## Security Best Practices

### For Users

1. **HTTPS Only**: Always use the dashboard over HTTPS in production
2. **Browser Security**: Keep your browser updated to the latest version
3. **Bluetooth Pairing**: Ensure you're connecting to your own ring device
4. **Private Browsing**: Consider using private/incognito mode for sensitive data

### For Developers

1. **Dependencies**: Regularly update dependencies using `npm audit`
2. **Code Review**: All PRs require review before merging
3. **No Secrets**: Never commit API keys, passwords, or sensitive data
4. **Input Validation**: Validate all user inputs and Bluetooth data
5. **CSP Headers**: Implement Content Security Policy headers
6. **CORS**: Configure proper CORS policies for production

## Known Security Considerations

### Web Bluetooth API

- The Web Bluetooth API requires user interaction to pair devices
- Bluetooth communication is encrypted at the protocol level
- Users must explicitly grant permission for each device connection
- No persistent storage of sensitive health data (all data is ephemeral)

### Data Privacy

- All data processing happens in the browser (no server-side storage)
- No personal data is transmitted to external servers
- Health metrics are not persisted beyond the current session
- Users have full control over their data

## Updates and Patches

Security patches will be released as soon as possible after a vulnerability is confirmed. Users are encouraged to:

1. Watch this repository for security announcements
2. Update to the latest version promptly
3. Review the CHANGELOG for security-related updates

## Additional Resources

- [Web Bluetooth Security](https://webbluetoothcg.github.io/web-bluetooth/#security-and-privacy)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Next.js Security Headers](https://nextjs.org/docs/advanced-features/security-headers)
