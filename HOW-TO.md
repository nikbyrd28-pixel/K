# Hubs & Babydoll — Simple Owner Guide 💛

Everything you need to run the site, in plain English. No coding required for
day-to-day changes.

---

## 1. Change a price (30 seconds)

All your products, prices, and descriptions live in **one file**:

```
lib/catalog.ts
```

Open it. Find the product. Change the number after `price:`. Save. That's it —
the shop, the cart, and the checkout total all update automatically.

```
{ size: '2 oz', price: 15 }      ->  change to  ->  { size: '2 oz', price: 18 }
```

You can also, in that same file:
- **Change wording** — edit the text between the quotes on the `description:` line.
- **Mark sold out** — add `, soldOut: true` after a price.
- **Add a tag** — add `, badge: 'Most Popular'` after a price.

> Prices with a `// GUESS` note next to them are estimates I filled in. Change
> them to your real prices whenever you like.

---

## 2. Where your orders show up

Every order placed on the site is saved into **TB Command** (your dashboard),
in the `client_leads` list. Each order includes:

- Customer name, phone, and email
- What they ordered and the total
- How they want it (ship, local pickup, delivery, or event)
- Their shipping address and any notes

Nothing is lost — even if a customer picks "pay another way," the order is
recorded so you can follow up.

---

## 3. Turn on card payments

The checkout already has **"Pay with Square"** and **"Pay by card (Stripe)"**
buttons. They start working the moment your payment keys are added. You only
need **one** of these — whichever you already use. If you're not sure, Square
is the simplest to set up.

### Option A — Square (recommended)

You need two things from your Square account:

1. **Access Token** — a long code that starts with `EAAA...`
2. **Location ID** — a shorter code that starts with `L...`

**Where to find them:**
1. Go to **developer.squareup.com** and sign in with your normal Square login.
2. Click **Applications** → **+** to create an app (name it anything, like
   "Website"). If you already have one, open it.
3. On the left, open the **Credentials** page → copy the **Production Access
   Token** (`EAAA...`).
4. On the left, open **Locations** → copy your **Location ID** (`L...`).

Send both codes to your helper. They get pasted into the site's secure settings
(never into a public file), and card payments go live.

### Option B — Stripe

1. Go to **dashboard.stripe.com** and sign in.
2. Click **Developers** → **API keys**.
3. Copy the **Secret key** (starts with `sk_live_...`).

Send that one code to your helper.

> 🔒 **Keep these secret.** Your payment keys are like the key to your cash
> drawer. Only ever share them privately with your helper — never post them in a
> text, email thread, or anywhere public. If one ever leaks, you can reset it
> from the same page you got it.

---

## 4. Get a text/email the second an order comes in

The site can email you the moment someone checks out — name, items, and total —
so you never miss an order. It's already wired; it just needs one free key.

**Set it up (about 3 minutes):**
1. Go to **resend.com** and create a free account with your business email.
2. On the left, click **API Keys** → **Create API Key** → give it any name → **Add**.
3. Copy the key (it starts with `re_...`).
4. Send that key to your helper. They add it to the site's secure settings and
   alerts turn on. By default they go to **hubsbabydoll@gmail.com** — tell your
   helper if you'd like them sent somewhere else.

> Prefer a **text message** instead of email? Tell your helper — the same alert
> can be sent by text with a different free service. Email is the simplest to start.

Even before this is turned on, **no order is ever lost** — every order is saved
in your TB Command dashboard the instant it's placed.

---

## 5. Who does what

| You want to…                         | Where                                   |
|--------------------------------------|-----------------------------------------|
| Change a price or description        | `lib/catalog.ts` (see section 1)        |
| See new orders                       | TB Command dashboard                    |
| Turn on / change card payments       | Send keys to your helper (section 3)    |
| Add a brand-new product photo        | Ask your helper (needs the image file)  |

That's the whole thing. When in doubt, change what you need in `lib/catalog.ts`,
save, and check the site — you can't break anything that a quick undo won't fix.
