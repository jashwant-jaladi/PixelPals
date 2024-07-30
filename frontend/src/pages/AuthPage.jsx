import React from 'react'
import Register from '../components/Register'
import Login from '../components/Login'
import { useRecoilValue } from 'recoil'
import userAuthState from '../Atom/authAtom'

const AuthPage = () => {
  const userAuth = useRecoilValue(userAuthState)
  return (
    <div>
      { userAuth === 'login' ? <Login /> : <Register />}
    </div>
  )
}

export default AuthPage