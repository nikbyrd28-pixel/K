# Shopify Variant Setup Guide

## Problem
Different product sizes (2oz, 4oz, etc.) were being merged into a single cart item in Shopify checkout because the products didn't have proper variants set up in Shopify.

## Solution
Create individual product variants for each size in Shopify. This ensures that different sizes are treated as separate items with their own prices.

## Quick Setup (Automated)

### 1. Get Your Shopify Admin API Token

1. Go to [Shopify Admin](https://admin.shopify.com/settings/apps-and-integrations/develop-apps)
2. Click "Create an app"
3. Choose "Custom app"
4. Name it (e.g., "v0 Variant Setup")
5. Under "Admin API scopes", enable:
   - `write_products`
   - `read_products`
6. Click "Save"
7. Go to "Configuration" and copy the **Admin API access token**

### 2. Run the Script

```bash
cd /path/to/your/project

SHOPIFY_STORE_DOMAIN="your-store.myshopify.com" \
SHOPIFY_ADMIN_API_TOKEN="your-copied-token" \
node create-variants.js
```

**Example:**
```bash
SHOPIFY_STORE_DOMAIN="vercel-store-38d70088.myshopify.com" \
SHOPIFY_ADMIN_API_TOKEN="shpat_1234567890abcdef" \
node create-variants.js
```

The script will automatically create variants for:
- **Harmony Bay Rum Body Oil**: 2 oz ($15) and 4 oz ($25)
- **Moment Body Butter**: 2 oz ($10) and 4 oz ($20)
- **Harmony Jasmine Gardenia Body Oil**: 2 oz ($15) and 4 oz ($25)
- **SEEN Jasmine & Gardenia Box**: 2 oz ($40) and 4 oz ($55)

## Manual Setup (If Script Doesn't Work)

If you prefer to set up variants manually in Shopify Admin:

1. Go to [Shopify Admin](https://admin.shopify.com)
2. Navigate to **Products**
3. For each product, click to edit it
4. In the "Variants" section, add variants for each size:
   - **Harmony Bay Rum Body Oil**:
     - Variant 1: Title "2 oz bottle", Price "$15.00", SKU "BAY-RUM-2OZ"
     - Variant 2: Title "4 oz bottle", Price "$25.00", SKU "BAY-RUM-4OZ"
   - **Moment Body Butter**:
     - Variant 1: Title "2 oz", Price "$10.00", SKU "MOMENT-2OZ"
     - Variant 2: Title "4 oz", Price "$20.00", SKU "MOMENT-4OZ"
   - **Harmony Jasmine Gardenia Body Oil**:
     - Variant 1: Title "2 oz bottle", Price "$15.00", SKU "JASMINE-2OZ"
     - Variant 2: Title "4 oz bottle", Price "$25.00", SKU "JASMINE-4OZ"
   - **SEEN Jasmine & Gardenia Box**:
     - Variant 1: Title "2 oz box", Price "$40.00", SKU "JASMINE-BOX-2OZ"
     - Variant 2: Title "4 oz box", Price "$55.00", SKU "JASMINE-BOX-4OZ"
5. Remove the old "Default Title" variant (if it exists)
6. Save changes

## Verification

After running the script or manual setup, verify that:

1. ✅ Different sizes appear as separate items in the cart
2. ✅ Each size has the correct price ($15 for 2oz, $25 for 4oz, etc.)
3. ✅ Shopify checkout shows the items separately with correct subtotal
4. ✅ The app's local cart matches the Shopify checkout prices

## Troubleshooting

### "Invalid API token"
- Make sure you're using the **Admin API access token** (not Storefront token)
- Check that the token hasn't expired
- Verify you're using the correct store domain

### "Insufficient permissions"
- Make sure your custom app has these scopes enabled:
  - `write_products`
  - `read_products`

### "Product not found"
- Verify the product GIDs in `create-variants.js` match your store's products
- Check that the products exist in your Shopify store

### Variants not showing after script runs
- Wait a few seconds for Shopify to process
- Refresh your browser
- Check the Shopify Admin → Products to verify variants were created

## Result

Once variants are created:
- ✅ Local cart shows different sizes with correct prices
- ✅ Shopify checkout displays items as separate line items
- ✅ Total price calculation is accurate
- ✅ Different sizes don't merge in checkout

---

For more information on Shopify variants, see the [Shopify documentation](https://help.shopify.com/en/manual/products/variants).
