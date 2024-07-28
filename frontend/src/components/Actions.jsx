import React from 'react'
import { Button } from '@mui/material';
import { pink } from '@mui/material/colors';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import CommentIcon from '@mui/icons-material/Comment';
import RepeatIcon from '@mui/icons-material/Repeat';
import ShareIcon from '@mui/icons-material/Share';
import FavoriteIcon from '@mui/icons-material/Favorite';

const Actions = ({ liked, setLiked}) => {
  return (
    <>
      <div className='my-3 flex gap-3'>
          <Button sx={{ color: pink[500], border: '1px solid pink' }} onClick={() => setLiked(!liked)}>{liked ? <FavoriteIcon /> : <FavoriteBorderIcon />}</Button>
          <Button sx={{ color: pink[500], border: '1px solid pink' }}><CommentIcon /></Button>
          <Button sx={{ color: pink[500], border: '1px solid pink' }}><ShareIcon /></Button>
          <Button sx={{ color: pink[500], border: '1px solid pink' }}><RepeatIcon /></Button>
        </div></>
  )
}

export default Actions