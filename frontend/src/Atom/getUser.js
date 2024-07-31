import { atom } from 'recoil';
const getUser=atom({
    key: "getUser",
    default: JSON.parse(localStorage.getItem('PixelPalsUser'))
})
    
export default getUser