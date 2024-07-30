import React from 'react'

const ResetPassword = () => {
  return (
    <>
      <div className='bg-[url("public/pink-7761356_960_720.webp")] h-[100vh] bg-cover flex items-center justify-center'>
        <div className='glasseffect w-[30%] p-8 rounded-lg flex flex-col items-center text-pink-700 bg-white bg-opacity-50 shadow-lg font-bold text-lg'>
          <h1 className='text-2xl mb-4'>Reset Password</h1>
          <p className='mb-6 text-center'>Enter the email address associated with your account.</p>
          <form action="submit" className='flex flex-col w-[80%]'>
            <label htmlFor="email" className='mb-2'>User Email</label>
            <input type="email" name="email" id="email" className='gradient-border-1 p-2 mb-4 rounded-md border border-gray-300' />
            <button type="submit" className='mt-3 p-3 border-2 border-pink-700 rounded-md glasseffect gradient-border hover:bg-pink-700 hover:text-white transition duration-300 w-[50%] place-self-center'>Submit</button>
          </form>
        </div>
      </div>
    </>
  )
}

export default ResetPassword
