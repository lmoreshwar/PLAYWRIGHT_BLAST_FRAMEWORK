# Requirement — Product Sorting on the Inventory Page

**Application under test:** SauceDemo — https://www.saucedemo.com
**Feature area:** Inventory (Products) page — sort control
**Requirement ID:** REQ-INV-SORT-01

## Summary

A signed-in shopper on the Products (inventory) page must be able to reorder the product
catalog using the sort dropdown in the top-right of the page. Changing the selected sort
option must immediately re-render the product grid in the chosen order without a full page
reload.

## Functional details

The sort control (`.product_sort_container`) exposes four options. Each option defines the
order in which product cards are displayed:

| Sort option            | Ordering rule                                   |
|------------------------|-------------------------------------------------|
| Name (A to Z)          | Product names ascending, alphabetical (default) |
| Name (Z to A)          | Product names descending, alphabetical          |
| Price (low to high)    | Product prices ascending, numeric               |
| Price (high to low)    | Product prices descending, numeric              |

## Acceptance criteria

1. On landing at `/inventory.html`, the catalog defaults to **Name (A to Z)**.
2. Selecting any option re-sorts every visible product card according to that option's rule.
3. The first and last product cards reflect the boundaries of the chosen order
   (e.g., **Price (low to high)** shows the cheapest item first, the most expensive last).
4. Product names shown in the card titles are used for name sorts; the numeric value of the
   price label (currency symbol stripped) is used for price sorts.
5. The selected option persists visually in the dropdown after selection.

## Credentials

- Credentials are read at runtime via `credentials('app')` from the gitignored `.env.<env>`
  file — never committed to source.
- Reference user for this flow: `standard_user`.

## Out of scope

- Persistence of the chosen sort across logout/login or page refresh.
- Sorting behavior on the cart or checkout pages.
