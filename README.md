# The Case File — interactive HCP experience

A static, dependency-free game built around the four supplied case videos. It includes the clickable patient chart at the end of video 1, Arthur Vance's formal profile, five decision gates, and the source citation at the end of the experience.

## Run locally

From this folder:

```powershell
py -3 -m http.server 8000
```

Open `http://localhost:8000` in a browser. Use a local server because browser handling of MP4 files and JavaScript can differ under `file://`.

## Deploy

This folder is the deployable project root. Push its contents to a GitHub repository, then import that repository in Vercel. Select **Other** as the framework preset, leave Build Command empty, and set Output Directory to `.` (or leave the Vercel default for a static site). No environment variables or server functions are needed.

The deployable assets are `index.html`, `styles.css`, `app.js`, `vercel.json`, and everything in `assets/`. Keep filenames and relative paths together. The four MP4 files total approximately 13 MB.

## Experience flow

1. Video 1 ends on the physical clipboard. Select the highlighted paper to open Arthur's profile.
2. Close the record and answer decision 1.
3. Video 2 pauses at approximately 6.5 seconds for decision 2, resumes, then asks decision 3.
4. Video 3 ends with decision 4.
5. Video 4 ends with decision 5 and a branded completion panel carrying the paper citation.

The video player provides play/pause, mute, replay, and optional captions. Questions and record text remain HTML so they can be edited without regenerating video.

## Clinical and release note

Arthur Vance is a **fictionalized simulated patient**. His name, age (45), portrait, and meropenem/cefepime/vancomycin exposure are supplied story details. The cited 2025 case report describes a different 59-year-old patient whose recorded prior antibiotics were ceftriaxone, cefepime, and amoxicillin. Its treatment was **aztreonam plus ceftazidime-avibactam**, not fixed-dose EMBLAVEO.

The profile and answer feedback are an internal educational prototype. Medical, legal, and regulatory review of claims, market-specific product text, and distribution requirements remains required before external release. The small reference at the end links directly to [Wong-So et al., 2025](https://doi.org/10.1128/aac.00172-25).

## File map

| File | Purpose |
| --- | --- |
| `index.html` | Semantic screens, profile dialog, and citation |
| `styles.css` | Responsive visual design and clipboard hotspot |
| `app.js` | Video sequence and decision logic |
| `assets/video1.mp4`–`assets/video4.mp4` | Four supplied scene videos |
| `assets/arthur-vance-profile.png` | Generated formal patient-profile portrait |
| `assets/emblaveo-logo.png` | Supplied brand artwork |

No analytics, user accounts, data collection, or external API calls are implemented. The optional font request to Google Fonts can fail without affecting the experience; local fallback fonts are defined.
