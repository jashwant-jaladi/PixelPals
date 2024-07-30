import React from 'react'
import { useSetRecoilState } from 'recoil'
import userAuthState from '../Atom/authAtom'
const Register = () => {
  const setUserAuth = useSetRecoilState(userAuthState)

  return (
    <>
      <div className='bg-[url("/pink-7761356_960_720.webp")] h-[100vh] bg-cover flex justify-center'>
        <div className='flex w-[100%] justify-center'>

          <div className='relative flex flex-col justify-center items-center top-[10%] bg-[url("/ai-generated-8123097_640.webp")] h-[80vh] w-[30%] bg-contain bg-opacity-20 rounded-l-lg'>
            <div className='absolute inset-0 bg-black opacity-60 rounded-l-lg'></div>
            <div className='relative z-10'></div>
          </div>

          <div className='flex flex-col justify-center glasseffect w-[30%] h-[80vh] relative top-[10%] rounded-r-lg'>
            <div className='flex flex-col justify-center items-center font-bold text-xl'>
              <img src="/pixelpals-high-resolution-logo-black-transparent.png" alt="App-logo" width="300px" height="300px" className='pb-8' />
              <h1 className='text-2xl font-bold text-center text-pink-700 pb-5'>Create your account here!</h1>
              <form action="submit" className='flex flex-col text-pink-700 pt-3'>
                <label htmlFor="first-name">Full Name</label>
                <input type="text" name="first-name" id="first-name" className='gradient-border-1 mb-4' />
                <label htmlFor="last-name">Username</label>
                <input type="text" name="last-name" id="last-name" className='gradient-border-1 mb-4' />
                <label htmlFor="email">Email</label>
                <input type="email" name="email" id="email" className='gradient-border-1 mb-4' />
                <label htmlFor="password">Password</label>
                <input type="password" name="password" id="password" className='gradient-border-1 mb-4' />
                <label htmlFor="confirm-password">Confirm Password</label>
                <input type="password" name="confirm-password" id="confirm-password" className='gradient-border-1 mb-4' />
                <div className='flex justify-center'>
                  <button type="submit" className='mt-3 p-3 pl-7 pr-7 border-2 w-[50%] border-pink-700  rounded-md glasseffect gradient-border hover:bg-pink-700 hover:text-white transition duration-300'>Register</button>
                </div>
              </form>
              <p className='text-center text-pink-700 mt-5'>Already have an account? <a className='underline text-pink-500 hover:text-pink-900' onClick={()=> setUserAuth('login')}>login</a></p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register