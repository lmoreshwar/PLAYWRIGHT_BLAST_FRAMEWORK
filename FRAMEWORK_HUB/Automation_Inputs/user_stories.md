# User Stories — SauceDemo (Session & Navigation Menu)

JIRA-style stories covering the burger-menu features and session controls.

---

## SAUCE-101 — Log out from the burger menu

**Type:** Story
**Epic:** Session Management
**Priority:** High

**As a** signed-in shopper
**I want** to log out from the navigation (burger) menu
**So that** my session ends and my account is protected on a shared device.

**Acceptance criteria**
- Opening the burger menu reveals a "Logout" option.
- Clicking "Logout" returns the user to the login page (`/`).
- After logout, navigating directly to `/inventory.html` redirects back to the login page
  with the error: "Epic sadface: You can only access '/inventory.html' when you are logged in."

---

## SAUCE-102 — Reset the application state

**Type:** Story
**Epic:** Session Management
**Priority:** Medium

**As a** signed-in shopper
**I want** to reset the app state from the burger menu
**So that** I can clear my cart and start a fresh shopping session.

**Acceptance criteria**
- The burger menu exposes a "Reset App State" option.
- Selecting it empties the cart and clears the cart badge.
- Any previously toggled "Remove" buttons revert to "Add to cart".

---

## SAUCE-103 — Navigate to product detail

**Type:** Story
**Epic:** Product Browsing
**Priority:** Medium

**As a** signed-in shopper
**I want** to open a product's detail page from its name or image
**So that** I can review the full description and price before adding it to my cart.

**Acceptance criteria**
- Clicking a product name opens `/inventory-item.html?id=<n>`.
- The detail page shows the product name, description, price, and an "Add to cart" button.
- A "Back to products" control returns the user to the inventory page.

---

## SAUCE-104 — Access the About page

**Type:** Story
**Epic:** Navigation Menu
**Priority:** Low

**As a** shopper
**I want** an "About" link in the burger menu
**So that** I can learn more about the product from the marketing site.

**Acceptance criteria**
- The burger menu contains an "About" link.
- The link points to the Sauce Labs marketing site (`https://saucelabs.com/`).
