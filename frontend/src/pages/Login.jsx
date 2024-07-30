import React from 'react'

const Login = () => {
  return (
    <>
      <div className='bg-[url("public/pink-7761356_960_720.webp")] h-[100vh] bg-cover flex justify-center'>
        <div className='flex w-[100%] justify-center'>

          <div className='flex flex-col justify-center glasseffect w-[30%] h-[80vh] relative top-[10%] rounded-l-lg'>
            <div className='flex flex-col justify-center items-center font-bold text-xl'>
              <img src="public/pixelpals-high-resolution-logo-black-transparent.png" alt="App-logo" width="350px" height="350px" className='relative bottom-[10%]' />
              <h1 className='text-3xl font-bold text-center text-pink-700 pb-10'>Good to See You!</h1>
              <form action="submit" className='flex flex-col text-pink-700'>
                <label htmlFor="email" className='pb-2'>Email</label>
                <input type="email" name="email" id="email" className='mb-5 gradient-border-1' />
                <label htmlFor="password className='pb-2">Password</label>
                <input type="password" name="password" id="password" className='mb-5 gradient-border-1' />
                <div className='flex justify-center w-[100%] h-[100%]'>
                  <button type="submit" className='mt-3 p-3 pl-7 pr-7 border-2 border-pink-700  rounded-md glasseffect gradient-border hover:bg-pink-700 hover:text-white transition duration-300'>Login</button>
                  <button type="reset" className='mt-3 p-3 border-2 mx-6 border-pink-700  rounded-md glasseffect gradient-border hover:bg-pink-700 hover:text-white transition duration-300'>Guest User</button>
                </div>
              </form>
              <p className='text-center text-pink-700 mt-14'>Don't have an account? <a className='underline text-pink-500 hover:text-pink-900' href="/register">register</a></p>
              <p className='text-center text-pink-700 mt-2 '>Forgot password? <a className='underline text-pink-500 hover:text-pink-900' href="/reset-password">reset password</a></p>
            </div>
          </div>

          <div className='relative flex flex-col justify-center items-center top-[10%] bg-[url("public/ai-generated-8123097_640.webp")] h-[80vh] w-[30%] bg-contain bg-opacity-20 rounded-r-lg'>
            <div className='absolute inset-0 bg-black opacity-60 rounded-r-lg'></div>
            <div className='relative z-10 text-white text-center font-bold'>
              <h3 className='text-4xl relative bottom-[30%]'>The new way to connect</h3>
              <div className='text-left text-2xl leading-10 relative bottom-[20%] pl-12'>
                Discover new people
                <br />
                Bond over new experiences
                <br />
                Share memories
                <br />
                Rediscover yourself
              </div>
              <p></p>
              <div className='text-pink-700 pr-20 '>
                <button className=' font-bold px-2 py-2 m-2 rounded-md glasseffect gradient-border text-pink-700 hover:bg-pink-700 hover:text-white transition duration-300 '>Learn more</button>
                <button className='text-pink-700 font-bold px-2 py-2 m-2 rounded-md glasseffect gradient-border hover:bg-pink-700 hover:text-white transition duration-300'>Invite others</button>
              </div>
            </div>
          </div>


        </div>
      </div>


    </>
  )
}

export default Login