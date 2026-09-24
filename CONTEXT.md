# Poetry & Pottery

A pottery studio's storefront and studio calendar: handmade pieces for sale, events, and wheel workshops booked by the hour.

## Catalogue

**Piece**:
One product in the catalogue, made by hand; most have a small, countable stock.
_Avoid_: Item, SKU

**Buyable**:
A piece a shopper can put in the cart right now: listed (active), and either in stock or made to order (customizable).
_Avoid_: Available, in stock

**Back in stock**:
The moment a piece becomes buyable again, which is when people waiting on it are told. It covers a restock, a cancelled order returning the last unit, and a piece being listed again.
_Avoid_: Restock (a restock is only one of the causes)

**Shelf**:
The module that owns every change to a piece's stock or listing, and announces back in stock when a change makes it buyable.

## Workshops

**Slot**:
One bookable hour of a workshop on a given day, with a capacity shared by every booking that holds it.

**Booking window**:
How far ahead a guest may book; the calendar never pages past it.

**Reschedule**:
Moving an existing booking to other slots. The guest's own slots count as free while they choose.

## Admin

**Reason**:
The note an admin writes to the customer when moving an order, registration or booking. Required for a cancellation or rejection; optional where it only adds detail, such as a tracking note on shipping.
_Avoid_: Note, comment
