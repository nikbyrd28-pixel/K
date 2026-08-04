# Hubs & Babydoll — Simple Owner Guide 💛

Everything you need to run the shop yourself — no coding, no helper needed.

---

## 1. Your Dashboard — where you do everything

Go to **yoursite.com/admin** and sign in with your dashboard password
(your helper gives you this — you can change it later).

Your password to start: **HubsBabydoll2025** *(please change this once you're set up)*

Inside you have two tabs:

### 🧾 Orders
Every order shows up here the second someone checks out — name, phone, email,
what they ordered, the total, and how they want it (ship / pickup / delivery).
Click **Refresh** to check for new ones. Nothing is ever lost.

### 🛍️ Products
Manage your whole shop here. For any product you can:
- **Change the price** — type a new number in the price box.
- **Change a photo** — click **Photo**, pick a picture from your phone or
  computer. It uploads and updates the site by itself.
- **Change the name or description** — just type over it.
- **Mark a size sold out** — check the **Sold out** box.
- **Hide / Show** — click **Hide** to take something off the shop (it stays
  saved), **Show** to put it back.
- **Add a new product** — click **➕ Add product**, fill in the name, price, and
  photo, then **Save**.
- **Delete** — remove a product for good.

Click **Save** after edits and the live site updates within a few seconds. That's
the whole thing — you never have to touch any code.

> 💡 The site also has a built-in backup copy of your products (in the file
> `lib/catalog.ts`), so even if something goes wrong, the shop is never empty.
> Day to day, just use the Dashboard.

### 🎁 Rewards
Create discount codes for sales, loyal customers, or thank-you gifts:
- **Create a code** — pick a name (like `THANKYOU`), choose **% off** or **$ off**,
  set the amount, and optionally a max number of uses or a minimum spend.
- **Turn off / delete** any code anytime.
- Customers type the code at checkout and the total updates.

You already have a starter code live: **`WELCOME10`** (10% off).

**Referrals** happen automatically — after checkout, customers can get a personal
code to share (their friend gets 10% off). Those show up here under "customer
referral codes" so you can see who's spreading the word and thank them.

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
