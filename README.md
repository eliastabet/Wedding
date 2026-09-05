# Elias & Maria — wedding website

Plain HTML, CSS and JavaScript. No build step. Open `index.html` in a browser.

```
index.html          Invitation, Our Day timeline, church, venue, save the date
registry.html       Account cards with copy-to-clipboard buttons
rsvp.html           RSVP form with countdown and tappable choices
css/style.css       All styling. Palette is at the top of the file.
js/main.js          Wedding date, menu, calendar, countdown, copy, RSVP
images/ornaments/   The flourish divider and the corner filigree
apps-script/Code.gs Google Sheets code for RSVPs
```

## Palette

```css
--paper:      #F7F2E8;   /* ivory card stock */
--paper-deep: #EFE7D8;   /* alternating sections */
--ink:        #1E3A61;   /* invitation navy */
--royal:      #2B4FA0;   /* royal blue accent */
--card:       #FFFDF7;   /* lifted card surface */
--sky:        #A9C0E8;   /* pale blue on navy */
```

Fonts: Cormorant Garamond for headings and Lato for body text, both readable.
Pinyon Script is loaded for one thing only — the couple's names on the welcome
page.

## Ornaments

The flourish is used three times across the site on purpose: under the names,
under Our Day, and on the registry thank-you. Add another with
`<div class="ornament"></div>`, or `ornament-sm` for a short one.

Two coloured copies exist — `divider-royal.svg` for light sections and
`divider-light.svg` for the navy ones. The CSS picks the right one; you only
touch this if you change the palette. `divider.svg` is the uncoloured master.

Everywhere else the emphasis comes from a lifted panel instead: a `--card`
surface, a hairline border and a soft navy shadow.

## Our Day illustrations

`images/icons/` holds the five drawings — `rings`, `flutes`, `plate`, `cake`,
`disco`. They are vector traces of the reference artwork, so they stay sharp
at any size.

They are placed with plain `<img>` tags, and the navy is baked into each file
as `fill="#1E3A61"`. If you change `--ink` in the CSS, update that fill in the
five SVGs to match. Each image carries two inline custom properties:

```html
<img class="od-icon" src="images/icons/rings.svg" alt="" style="--iw:0.729; --ih:0.459">
```

`--iw` and `--ih` are the drawn width and height as a fraction of the
medallion. They are set so each drawing's diagonal fits inside the circle with
clear air at every corner — fitting by the longest side instead lets wide
drawings clip against the curve. If you swap an illustration, measure its
bounding box and set the two fractions to `w / diagonal * 0.86` and
`h / diagonal * 0.86`.

Medallion size is one value, `--med` on `.ourday`. The layout is horizontal on
desktop and becomes a vertical rail under 820px.

## Photos you can swap

Each of these is set with an inline `style="background-image:url(...)"` on the
element, so you change the filename in the HTML and nothing else.

| File | Where |
|---|---|
| `images/hero.jpg` | Welcome and RSVP page headers |
| `images/church.jpg` | Ceremony box, and the ceremony panel further down |
| `images/venue.jpg` | Reception box, and the venue panel |
| `images/registry.jpg` | Registry page header |
| `images/dubai.jpg` | Wio Bank card header — **not added yet** |
| `images/beirut.jpg` | Whish Money card header — **not added yet** |

The two bank cards fall back to solid navy until you add those photos. A navy
gradient sits over every one of them, so any picture stays readable underneath
the text. Keep each file under about 300 KB.

## Still to do

1. **Connect the RSVP form.** In `js/main.js`, replace
   `PASTE_YOUR_APPS_SCRIPT_URL_HERE` with your Apps Script web app URL.
   sheets.new → Extensions → Apps Script → paste `apps-script/Code.gs` →
   Deploy → New deployment → Web app → execute as **Me**, access **Anyone**.
   After any later edit, redeploy as a **new version**.
2. **Set the domain** in `CNAME`, one line, no `https://`. It says `[DOMAIN]`.
3. Optional: add `images/rsvp.jpg` if you want a different photo behind the
   RSVP header. It reuses `hero.jpg` today.

Note: clipboard copying needs `https://`, which GitHub Pages gives you. On a
local `file://` preview it falls back to an older copy method that still works
in most browsers.

## Publishing

1. Create a **public** repository on github.com.
2. Upload everything here, including `css`, `js` and `images`.
3. Settings → Pages → Deploy from a branch → `main` → `/ (root)`.

For a custom domain, add at your registrar:

| Type | Host | Value |
|---|---|---|
| A | @ | 185.199.108.153 |
| A | @ | 185.199.109.153 |
| A | @ | 185.199.110.153 |
| A | @ | 185.199.111.153 |
| CNAME | www | yourusername.github.io |

Then set the domain in Settings → Pages and tick **Enforce HTTPS**.
