# Model and Schema Review

This document closes the remaining migration checklist items around:

- Prisma model and enum review
- shared contract schema audit

The goal is to make the final engine shape explicit, not keep those decisions implicit in code archaeology.

## Prisma Review

Reviewed enums:

- `UserRole`
- `CartStatus`
- `OrderStatus`
- `PaymentMethod`
- `PaymentStatus`
- `DiscountType`
- `PromotionScopeType`
- `ReservationStatus`
- `AuditActorType`
- `AuditEntityType`
- `AuditContextType`
- `StockMovementType`

Reviewed models:

- `User`
- `Address`
- `Category`
- `Product`
- `ProductOptionDefinition`
- `ProductOptionValue`
- `ProductVariant`
- `VariantOptionCombination`
- `Cart`
- `CartItem`
- `Promotion`
- `PromotionScope`
- `PromotionUsage`
- `Order`
- `OrderItem`
- `Payment`
- `PaymentProof`
- `StockReservation`
- `AuditLog`
- `StockMovement`
- `StoreConfig`

Review outcome:

- No legacy Nest-only model needs to be carried over outside the current Prisma schema.
- `PromotionUsage` is correct as the usage ledger between `Promotion`, `Order`, and optional `User`.
- `PaymentProof` is currently sufficient with `filePath` plus metadata fields for the mock/manual transfer phase.
- `AuditLog` remains a generic typed log. The engine now relies on typed `entityType`, optional typed `contextType`, persisted labels, and request tracing instead of per-entity audit tables.
- `DiscountType.FREE_PRODUCT` is now formally defined as: discount the cheapest eligible units already present in the cart, using `value` as the number of free units.
- No enum is currently redundant in the active Next.js engine.

## Shared Contract Review

Reviewed DTO families:

- `address.dto`
- `audit.dto`
- `auth.dto`
- `cart.dto`
- `category.dto`
- `inventory.dto`
- `order.dto`
- `payment.dto`
- `product.dto`
- `promotion.dto`
- `store-config.dto`

Review outcome:

- The shared contract layer is still the source of truth for request and response shapes in the active Next.js app.
- DTO families map cleanly to live engine domains and App Router handlers.
- Contracts that are not imported directly by a page are still retained when they are consumed by route handlers, server modules, or request helpers.
- Dynamic route parameter validation is centralized separately in `src/shared/contracts/route-params.ts`, so path params do not need to be duplicated inside each DTO family.
- No leftover `packages/contracts` dependency remains in the active root app.

## Final Decision

The migration backlog items for model/enum review and schema audit can be considered closed.

Remaining non-schema backlog is now focused on:

- consistency/design pass
- optional real upload provider flow for payment proof
- final legacy cutover of `ecommercestarter/`
