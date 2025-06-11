/**
 * Dispatches a custom event
 *
 * @param {String} eventName - name of the event
 * @param {HTMLElement} eventOrigin - origin of the event
 * @param {Boolean} eventBubbles - whether the event bubbles
 * @param {Boolean} eventComposed - whether the event is composed
 * @param {Boolean} eventCancelable - whether the event is cancelable
 * @param {Object} eventDetails - details of the event
 */
export function dispatchCustomEvent({
  eventName,
  eventOrigin,
  eventBubbles,
  eventComposed,
  eventCancelable,
  eventDetails,
}) {
  eventOrigin.dispatchEvent(
    new CustomEvent(eventName, {
      bubbles: eventBubbles || false,
      composed: eventComposed || false,
      cancelable: eventCancelable || true,
      detail: {
        ...eventDetails,
      },
    }),
  );
}
