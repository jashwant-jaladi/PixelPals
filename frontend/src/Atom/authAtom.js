import {atom} from "recoil"

const userAuthState = atom({
    key: 'userAuthState',
    default: 'login'
})

export default userAuthState