# AI Notes

## AI Tool Used

**ChatGPT**

ChatGPT was used as a development support tool throughout the project. I mainly used it to understand the requirements, clarify implementation concepts, discuss possible approaches, and review parts of the frontend and backend logic.

I did not rely on AI to generate the complete application. I used the suggestions as guidance, then implemented, tested, reviewed, and modified the code based on the project requirements.

## How I Used AI

I used ChatGPT mainly for:

* Understanding the requirements and expected application behavior.
* Discussing the order lifecycle and valid state transitions.
* Understanding how webhook processing and idempotency should work.
* Understanding how out-of-order webhook events should be handled.
* Getting guidance when implementing backend logic.
* Understanding the structure and behavior of the React frontend.
* Getting help with UI implementation ideas and component structure.
* Understanding Redux Toolkit state management and API integration.
* Reviewing implementation approaches and checking for possible issues.
* Troubleshooting errors encountered during development.
* Clarifying TypeScript, SQLite, Express, React, and testing concepts when needed.

The final implementation was based on my own review and understanding of the requirements rather than blindly accepting AI-generated suggestions.

## Where AI Got It Wrong

One important issue occurred while working on out-of-order event handling.

An initial AI suggestion treated a backward state transition as an invalid event and rejected it. For example, if an order was already `shipped` and a previously generated `paid` event arrived later, the approach would reject the event instead of preserving it.

After reviewing the requirement that webhook events **may arrive out of order**, I identified that the event could still represent a valid historical event. It should therefore be preserved in the audit history even though it should not change the current order status.

I reviewed the logic and adjusted the implementation so that:

* Valid forward events update the current order status.
* Duplicate events are ignored without creating duplicate records.
* Older out-of-order events are preserved in `order_events`.
* An out-of-order event does not move the current order status backwards.
* The webhook receiver acknowledges successfully after recording the out-of-order event.

This showed that AI suggestions still needed to be checked against the actual requirements and tested before being used.

## My Implementation Work

I was involved in the implementation and verification of the main application features, including:

### Backend

* Set up the Express and TypeScript backend structure.
* Implemented the webhook receiver for `POST /webhooks/orders`.
* Implemented order creation from the first `created` event.
* Implemented order status transition validation.
* Implemented the `created -> paid -> shipped -> delivered` lifecycle.
* Implemented cancellation rules.
* Implemented duplicate event handling using event IDs.
* Implemented out-of-order event handling while preserving the audit history.
* Implemented the order listing API.
* Implemented the order detail API with event history.
* Implemented database access using SQLite and `node:sqlite`.
* Implemented transaction handling for state changes and event recording.
* Added validation and error handling for invalid webhook requests.
* Reviewed and tested different edge cases.

### Frontend

* Built the order tracking dashboard UI.
* Implemented the order listing and status display.
* Implemented status filtering.
* Implemented the order details page.
* Implemented the chronological event history/timeline.
* Connected the frontend to the backend REST APIs using Axios.
* Worked with Redux Toolkit for application state management.
* Implemented loading states.
* Implemented empty states when no orders match the selected filter.
* Implemented error states and retry behavior.
* Worked on responsive layouts and UI presentation.
* Added light and dark mode support.

### Testing

I worked through the main test scenarios and verified the expected behavior of the application, including:

* Creating a new order.
* Valid forward status transitions.
* Invalid status transitions.
* Cancellation rules.
* Duplicate webhook events.
* Out-of-order webhook events.
* Invalid payloads.
* Missing orders.
* Order listing and filtering.
* Order details and event history.

I also used an in-memory SQLite database for isolated backend testing.

## Technical Decisions I Reviewed

During development, I evaluated different implementation approaches with the help of AI but made the final decisions based on the project requirements and the behavior I needed to achieve.

These included:

* Using SQLite instead of requiring an external database server.
* Using Node's built-in `node:sqlite` API.
* Using a unique `eventId` constraint to support idempotency.
* Keeping a separate `order_events` table for the audit trail.
* Using transactions when updating order state and recording events.
* Separating the current order status from the historical event records.
* Preserving out-of-order events without incorrectly changing the current status.

## Summary

AI was used as a supporting development and learning tool rather than as a replacement for the development process.

I used AI to understand concepts, discuss solutions, help with UI and logic implementation, and troubleshoot problems. I reviewed the generated suggestions, identified cases where the suggested approach did not satisfy the requirements, and modified the implementation accordingly.

The final application was developed through a combination of AI-assisted guidance, my own implementation work, testing, debugging, and requirement-based decision making.
