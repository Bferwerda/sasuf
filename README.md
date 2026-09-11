# SASUF GitHub Pages survey

This is the complete frontend package. The SE and SA configuration files are already included in the correct folders.

## GitHub Pages structure

```
/SE/
  index.html
  config.js
/SA/
  index.html
  config.js
/shared/
  app.js
  styles.css
```

Use these entry points after GitHub Pages is enabled:

- `https://<github-user>.github.io/<repo>/SE/`
- `https://<github-user>.github.io/<repo>/SA/`

Both versions use the same shared questionnaire code. Country/site is fixed by `config.js`; participants do not choose it.

Both submit to:

`https://wabisabitech.hk/sasuf/api/submit.php`

The API routes `SE` to `responses_SE` and `SA` to `responses_SA`.

## Before recruitment

Edit the researcher, email, ethics reference and privacy statement in BOTH `SE/config.js` and `SA/config.js`. Do not put MySQL credentials anywhere in this repository.

On the PHP server, make sure `config.php` allows your exact GitHub Pages origin, for example:

```php
$SASUF_ALLOWED_ORIGINS = array(
    'https://YOURUSERNAME.github.io'
);
```

The path (`/repo/SE/` or `/repo/SA/`) is not part of the CORS origin.
