# Test Cases — SauceDemo (Authentication, Cart & Checkout)

Covers the core shopping journey with both positive and negative scenarios.
Credentials are resolved via `credentials('app')` from `.env.<env>` — never hardcoded.

## Authentication

| ID | Type | Title | Tags | Steps | Expected |
|----|------|-------|------|-------|----------|
| TC-01 | Positive | Successful login | @Smoke @P0 | Navigate to app → enter `standard_user` + valid password → click Login | Redirected to `/inventory.html`; page title reads "Products" |
| TC-02 | Negative | Locked-out user is blocked | @Regression | Navigate to app → login as `locked_out_user` | Error banner: "Epic sadface: Sorry, this user has been locked out." |
| TC-03 | Negative | Invalid password rejected | @Regression | Login with `standard_user` + wrong password | Error banner: "Epic sadface: Username and password do not match any user in this service" |
| TC-04 | Negative | Missing username validation | @Regression | Leave username empty → enter any password → click Login | Error banner: "Epic sadface: Username is required" |
| TC-05 | Negative | Missing password validation | @Regression | Enter `standard_user` → leave password empty → click Login | Error banner: "Epic sadface: Password is required" |

## Cart

| ID | Type | Title | Tags | Steps | Expected |
|----|------|-------|------|-------|----------|
| TC-06 | Positive | Add a single product to cart | @Smoke @P0 | Login → add "Sauce Labs Backpack" → open cart | Cart badge shows `1`; cart lists "Sauce Labs Backpack" |
| TC-07 | Positive | Add multiple products to cart | @Regression | Login → add "Sauce Labs Backpack" and "Sauce Labs Bike Light" | Cart badge shows `2`; both items listed in the cart |
| TC-08 | Positive | Remove product from cart | @Regression | Login → add a product → open cart → click Remove | Cart badge disappears; item no longer listed |
| TC-09 | Positive | Continue shopping returns to inventory | @Regression | Login → open cart → click "Continue Shopping" | User is returned to `/inventory.html` |

## Checkout

| ID | Type | Title | Tags | Steps | Expected |
|----|------|-------|------|-------|----------|
| TC-10 | Positive | End-to-end checkout completes | @Smoke @P0 | Login → add product → cart → Checkout → enter first name, last name, postal code → Continue → Finish | Confirmation: "Thank you for your order!" |
| TC-11 | Negative | Checkout requires first name | @Regression | Login → add product → cart → Checkout → leave first name blank → Continue | Error: "Error: First Name is required" |
| TC-12 | Negative | Checkout requires postal code | @Regression | Login → add product → cart → Checkout → enter first + last name, blank postal code → Continue | Error: "Error: Postal Code is required" |
| TC-13 | Positive | Order summary shows correct item | @Regression | Login → add "Sauce Labs Backpack" → checkout → reach overview step | Overview lists "Sauce Labs Backpack" with its price and totals |

## Test data

- Products, buyer info, invalid-login combinations, and expected messages: `src/testdata/testData.json`.
- Credentials: `.env.<env>` via `credentials('app')` — never stored in test data or source.
