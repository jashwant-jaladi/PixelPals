import { atom } from 'recoil';
import {recoilPersist} from 'recoil-persist';

const { persistAtom } = recoilPersist();

const getUser = atom({
    key: 'getUser',
    default: JSON.parse(localStorage.getItem('PixelPalsUser')), 
    effects_UNSTABLE: [persistAtom],
});

export default getUser;
