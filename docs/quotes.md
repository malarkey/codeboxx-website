# Staff quotes

The quote builder is at `/quotes/`. It runs in the browser and stores no customer records on the server. Save/load uses local JSON files.

Before deploying, set `QUOTES_USERNAME` and `QUOTES_PASSWORD` in Netlify environment variables with Functions scope, then deploy again. Use a strong shared password and an ASCII username/password. The edge function denies access with 503 if either variable is missing and challenges unauthenticated requests with HTTP Basic authentication. Use HTTPS. Browser credentials remain cached until the browser session is closed.

Plain Eleventy local serving does not run the protection layer. Use Netlify Dev to test authentication. Confirm unauthenticated `/quotes/`, `/quotes`, and `/quotes/index.html` requests are rejected on a deploy preview before sharing access.

Quote files contain customer details: store and share them appropriately. Currency selection formats amounts; it does not convert prices. VAT is calculated on subtotal plus delivery less discount. Confirm the applicable rate and terms before issuing a quote.
