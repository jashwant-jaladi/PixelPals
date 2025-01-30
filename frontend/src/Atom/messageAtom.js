import { atom } from "recoil";

export const messageAtom = atom({
    key: 'messageAtom',
    default: ''
});

export const conversationAtom = atom({
    key: 'conversationAtom',
    default: {
        _id: '',
        userId: '',
        username: '',
        userProfilePic: '',
    }
});

export const unreadMessagesAtom = atom({
    key: "unreadMessagesAtom",
    default: 0, // Default count is 0
  });