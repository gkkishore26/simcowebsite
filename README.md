# Simco Nighty House — Complete Website

## Quick Start
Open `index.html` in any browser. No internet server needed.

---

## Full Folder Structure

```
simco/
│
├── index.html              ← Open this to run the website
│
├── css/
│   ├── main.css            ← CSS variables, reset, fonts, buttons, utilities
│   ├── animations.css      ← Loader, scroll reveals, marquee, hover effects
│   └── components.css      ← All UI: nav, hero, products, modals, footer, detail
│
├── js/
│   ├── database.js         ← ★ ALL STORE DATA (products, config, categories)
│   ├── app.js              ← Core app: routing, navigation, rendering, scroll
│   └── editor.js           ← Owner login, editor mode, add/edit/delete products
│
├── assets/                 ← Drop your own product photos here
│   └── (add your images here)
│
└── README.md               ← This file
```

---

## Owner / Editor Login

Scroll to the very bottom of the page and click **"Owner Access"** (small text, bottom-right of footer).

| Field    | Value                          |
|----------|-------------------------------|
| Email    | simconightyhouse@gmail.com     |
| Password | Simco@2025                     |

Once logged in:
- Green editor bar appears at the top of the page
- Hover any product card → "Edit" button appears over the image
- Click "Edit" to update name, price, category, description, features, badge, image
- Use "Add Product" card (dashed border) to add new products
- "Delete Product" button inside edit modal
- Click "Save Changes" to save to browser memory

### To change login credentials:
Open `js/database.js` and find:
```js
owner: {
  email: "simconightyhouse@gmail.com",
  password: "Simco@2025"
}
```

---

## Update Products

Edit **`js/database.js`** — this is the single source of truth for everything.

Fields per product:
- `id` — unique number
- `name` — product name
- `cat` — category id: `nighty`, `designer`, `innerwear`, `footwear`, `home`, `bags`
- `price` — number only (e.g. `199`)
- `badge` — short text for the badge pill (e.g. "Bestseller") or `""` for none
- `avail` — stock text (e.g. "In Stock — All Sizes")
- `desc` — description paragraph
- `features` — array of bullet points
- `img` — image URL or `"assets/your-photo.jpg"` or `""` for placeholder

---

## Add Your Own Product Photos

1. Copy your photo into the `assets/` folder
2. In `js/database.js`, set `img: "assets/your-photo.jpg"` for that product
3. Reload the page — your photo appears

---

## Fonts Used

| Font              | Used For                             |
|-------------------|--------------------------------------|
| Playfair Display  | All main headings — bold and elegant |
| Nunito            | Body text, descriptions — clean      |
| Oswald            | Prices, numbers — strong and clear   |

## Color Palette

| Name      | Value     | Used For                  |
|-----------|-----------|---------------------------|
| Rose      | `#e8405c` | Brand accent, buttons     |
| Dark Rose | `#c42e4a` | Hover states              |
| Gold      | `#f0b429` | Star ratings              |
| Ink       | `#0d0a08` | Background, dark surfaces |
| Green     | `#34d399` | "In Stock" labels         |

---

## Make It Live (Optional)

Upload the entire `simco/` folder to any web host:
- **Free:** Netlify Drop (drag & drop), Vercel, GitHub Pages
- **Paid:** Hostinger, GoDaddy, Bluehost

The website works 100% without a backend.

---

*Simco Nighty House — Coimbatore · Est. 2018*
