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

