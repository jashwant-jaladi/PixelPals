import React from 'react'
import { useTheme } from '../ThemeContext'
import { useRecoilValue } from 'recoil'
import getUser from '../Atom/getUser'


const Header = () => {
    const user=useRecoilValue(getUser)
    const {mode,toggleTheme} = useTheme()
  return (
    <div className='flex justify-center my-10'>
    
    <img src={mode === 'dark' ? '/pixelpals-high-resolution-logo-white-transparent.png' : '/pixelpals-high-resolution-logo-black-transparent.png'} alt="Pixelpals-logo" onClick={toggleTheme} width={300} height={300} />
    
    </div>
  )
}

export default Header