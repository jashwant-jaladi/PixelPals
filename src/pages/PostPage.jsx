import React from 'react'
import { useParams } from 'react-router-dom'

const PostPage = () => {
    const {id} = useParams()
  return (
    <div>Post no {id}</div>
  )
}

export default PostPage