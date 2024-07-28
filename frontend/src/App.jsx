import React from 'react'
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import ResetPassword from './pages/ResetPassword'
import UserPage from './pages/UserPage'
import PostPage from './pages/PostPage'
import { Container } from '@mui/material'
import Header from './components/Header'


const App = () => {
  return (
    <>
    <Routes>
      <Route path='/' element={<Login/>} />
      <Route path='/register' element={<Register/>} />
      <Route path='/reset-password' element={<ResetPassword/>}/>
    </Routes>
    <Container maxWidth="md">
    <Header/>
    <Routes>
      <Route path='/:username' element={<UserPage/>}/>
      <Route path='/:username/:id' element={<PostPage/>}/>
    </Routes>
    </Container>
    </>
  )
}

export default App