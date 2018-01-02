"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InputValueDataTypes = {
    /** Permission Value Spec. */
    PERMISSION: 'type.googleapis.com/google.actions.v2.PermissionValueSpec',
    /** Option Value Spec. */
    OPTION: 'type.googleapis.com/google.actions.v2.OptionValueSpec',
    /** Transaction Requirements Check Value Spec. */
    TRANSACTION_REQ_CHECK: 'type.googleapis.com/google.actions.v2.TransactionRequirementsCheckSpec',
    /** Delivery Address Value Spec. */
    DELIVERY_ADDRESS: 'type.googleapis.com/google.actions.v2.DeliveryAddressValueSpec',
    /** Transaction Decision Value Spec. */
    TRANSACTION_DECISION: 'type.googleapis.com/google.actions.v2.TransactionDecisionValueSpec',
    /** Confirmation Value Spec. */
    CONFIRMATION: 'type.googleapis.com/google.actions.v2.ConfirmationValueSpec',
    /** DateTime Value Spec. */
    DATETIME: 'type.googleapis.com/google.actions.v2.DateTimeValueSpec',
    /** New Surface Value Spec. */
    NEW_SURFACE: 'type.googleapis.com/google.actions.v2.NewSurfaceValueSpec',
    /** Register Update Value Spec. */
    REGISTER_UPDATE: 'type.googleapis.com/google.actions.v2.RegisterUpdateValueSpec'
};
exports.StandardIntents = {
    /** App fires MAIN intent for queries like [talk to $app]. */
    MAIN: 'actions.intent.MAIN',
    /** App fires TEXT intent when action issues ask intent. */
    TEXT: 'actions.intent.TEXT',
    /** App fires PERMISSION intent when action invokes askForPermission. */
    PERMISSION: 'actions.intent.PERMISSION',
    /** App fires OPTION intent when user chooses from options provided. */
    OPTION: 'actions.intent.OPTION',
    /** App fires TRANSACTION_REQUIREMENTS_CHECK intent when action sets up transaction. */
    TRANSACTION_REQUIREMENTS_CHECK: 'actions.intent.TRANSACTION_REQUIREMENTS_CHECK',
    /** App fires DELIVERY_ADDRESS intent when action asks for delivery address. */
    DELIVERY_ADDRESS: 'actions.intent.DELIVERY_ADDRESS',
    /** App fires TRANSACTION_DECISION intent when action asks for transaction decision. */
    TRANSACTION_DECISION: 'actions.intent.TRANSACTION_DECISION',
    /** App fires CONFIRMATION intent when requesting affirmation from user. */
    CONFIRMATION: 'actions.intent.CONFIRMATION',
    /** App fires DATETIME intent when requesting date/time from user. */
    DATETIME: 'actions.intent.DATETIME',
    /** App fires SIGN_IN intent when requesting sign-in from user. */
    SIGN_IN: 'actions.intent.SIGN_IN',
    /** App fires NO_INPUT intent when user doesn't provide input. */
    NO_INPUT: 'actions.intent.NO_INPUT',
    /** App fires CANCEL intent when user exits app mid-dialog. */
    CANCEL: 'actions.intent.CANCEL',
    /** App fires NEW_SURFACE intent when requesting handoff to a new surface from user. */
    NEW_SURFACE: 'actions.intent.NEW_SURFACE',
    /** App fires REGISTER_UPDATE intent when requesting the user to register for proactive updates. */
    REGISTER_UPDATE: 'actions.intent.REGISTER_UPDATE',
    /** App receives CONFIGURE_UPDATES intent to indicate a custom REGISTER_UPDATE intent should be sent. */
    CONFIGURE_UPDATES: 'actions.intent.CONFIGURE_UPDATES'
};
//# sourceMappingURL=interfaces.js.map