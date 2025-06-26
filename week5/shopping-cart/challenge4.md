# Challenge 4: Securing HTML Rendering in Recruiter Component

## Overview
This challenge addressed potential XSS and unsafe HTML rendering in the Recruiter component by replacing `dangerouslySetInnerHTML` with a secure JSX alternative.

---

## Before

```jsx
<p
  dangerouslySetInnerHTML={{
    __html:
      "Hi! I'm Jeremy Akeze from Doghouse IT Recruitment and I'm looking for skilled Software Engineers like you. If you wish to move abroad, <a href=\"https://www.linkedin.com/in/jeremy-akeze-9542b396/\"><b>follow me on Linkedin.</b></a>"
  }}
/>
```

**Risks:**
- Using `dangerouslySetInnerHTML` can expose the app to XSS vulnerabilities if the HTML ever comes from user input or an untrusted source.
- React's built-in XSS protections are bypassed.
- No navigation security on the link.

---

## After

```jsx
<p>
  Hi! I'm Jeremy Akeze from Doghouse IT Recruitment and I'm looking for
  skilled Software Engineers like you. If you wish to move abroad,{' '}
  <a
    href="https://www.linkedin.com/in/jeremy-akeze-9542b396/"
    target="_blank"
    rel="noopener noreferrer"
  >
    <b>follow me on Linkedin.</b>
  </a>
</p>
```

**Improvements:**
- No use of `dangerouslySetInnerHTML`—all content is rendered as safe JSX.
- The link uses `target="_blank"` and `rel="noopener noreferrer"` to prevent tabnabbing and improve navigation security.
- The code is readable, maintainable, and safe from XSS as long as all content is static or properly escaped.

---

## Summary Table

| Issue                | Before (Risk)                        | After (Secure)                        |
|----------------------|--------------------------------------|---------------------------------------|
| XSS                  | Possible with raw HTML                | JSX, no raw HTML                      |
| Unsafe HTML rendering| Used                                  | Not used                              |
| Input validation     | Not possible                          | Not needed for static JSX             |
| URL security         | Not enforced                          | `rel="noopener noreferrer"` added     |
| Image validation     | Not applicable here                   | Not applicable                        |

---

**Conclusion:**
The Recruiter component is now secure against XSS and unsafe HTML rendering. Always use JSX for static or trusted content, and sanitize any dynamic HTML if raw rendering is ever required. 