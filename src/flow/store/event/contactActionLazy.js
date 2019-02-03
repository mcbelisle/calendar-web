import {
  SET_CONTACTS,
  INVITES_SENT_OK,
  INVITES_SENT_FAIL,
  UNSET_CURRENT_INVITES
} from "../ActionTypes";

import {
  fetchContactData,
  publishContacts,
  sendInvitesToGuests,
  loadGuestProfiles
} from "../../io/event";

function asAction_setContacts(contacts) {
  return { type: SET_CONTACTS, payload: { contacts } };
}

// ################
// When initializing app
// ################

export function initializeContactData() {
  return async (dispatch, getState) => {
    fetchContactData().then(contacts => {
      dispatch(asAction_setContacts(contacts));
    });
  };
}

// ################
// In Settings
// ################
export function addContact(contact) {
  return async (dispatch, getState) => {
    fetchContactData().then(contacts => {
      // TODO check for duplicates
      contacts.push(contact);
      publishContacts(contacts);
      dispatch(asAction_setContacts(contacts));
    });
  };
}

export function deleteContacts(deleteList) {
  return async (dispatch, getState) => {
    fetchContactData().then(contacts => {
      const uids = deleteList.map(d => d.uid);

      contacts = contacts.filter(d => {
        return !uids.includes(d.uid);
      });
      publishContacts(contacts);
      dispatch(asAction_setContacts(contacts));
    });
  };
}

// #########################
// INVITES
// #########################

function asAction_invitesSentOk() {
  return {
    type: INVITES_SENT_OK
  };
}

function asAction_invitesSentFail(error, eventType, eventInfo) {
  return {
    type: INVITES_SENT_FAIL,
    payload: { error, eventType, eventInfo }
  };
}
export function unsetCurrentInvites() {
  return { type: UNSET_CURRENT_INVITES };
}

export function sendInvites(eventInfo, guests) {
  return async (dispatch, getState) => {
    const state = getState();
    sendInvitesToGuests(
      state.events.contacts,
      state.auth.user,
      eventInfo,
      guests,
      state.events.userSessionChat
    ).then(
      () => {
        dispatch(asAction_invitesSentOk());
        return Promise.resolve();
      },
      error => {
        dispatch(asAction_invitesSentFail(error));
        return Promise.reject(error);
      }
    );
  };
}

// #########################
// GUESTS
// #########################

export function loadGuestList(guests, contacts, asyncReturn) {
  console.log("loadGuestList", guests, contacts);
  loadGuestProfiles(guests, contacts).then(
    ({ profiles, contacts }) => {
      asyncReturn({ profiles, contacts });
    },
    error => {
      console.log("load guest list failed", error);
    }
  );
}
