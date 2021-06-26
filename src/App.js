import './App.css';
import React, { useState } from 'react';
import moment from 'moment';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

import { useAuthState } from 'react-firebase-hooks/auth';
import { useCollectionData } from 'react-firebase-hooks/firestore';

if(!firebase.apps.length){
  firebase.initializeApp({
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  })
}else{
  firebase.app()
}

const auth = firebase.auth();
const firestore = firebase.firestore();

function App() {

  const [user] = useAuthState(auth)

  return (
    <div>
      {
        user ? <Posts /> : <SignIn />
      }
    </div>
  );
}

const SignIn = () => {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider)

  }

  return (
    <div className="signin">
      <button 
    onClick={signInWithGoogle}
    className="btn btn-primary btn-lg">
      Sign in with Google
    </button>
    </div>
  )
}

const SignOut = () => {
  return auth.currentUser && (

    <button 
    onClick={() => auth.signOut()}
    className="btn btn-secondary">Sign Out</button>
  )
}

const Posts = () => {

  const postRef = firestore.collection('posts')
  const query = postRef.orderBy('createdAt', 'desc')

  const [posts] = useCollectionData(query, { idField: 'id' })

  const [formValue, setFormValue] = useState('')

  const makePost = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await postRef.add({
      text:formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    })

    setFormValue('')

  }

  return (
    <>
    <div className="container m-3">
      <SignOut />
    </div>
     <div className="container mt-4">
    <form onSubmit={makePost}>
      <input
      type='textarea'
      value={formValue} 
      onChange={(e) => setFormValue(e.target.value)} 
      className="form-control"
      />
      <button className="btn btn-primary btn-sm mt-3">
        Post
      </button>
    </form>
</div>
    <div className="container m-4">
      <h4 className='text-center'>Posts</h4>
    </div>
    <div className="container m-4">
      {
        posts && posts.map(post => <Post key={post.id} post={post} />)
      }
    </div>
    </>
  )
}

const Post = ({ post }) => {

  const { text, uid, photoURL, createdAt } = post;
  console.log(createdAt)

  const postTime = createdAt && createdAt.toDate()

  const postClass = uid === auth.currentUser.uid ? 'info' : 'warning';

  return (
    <div className={`alert alert-${postClass}`}>
      
        <img className='rounded' src={photoURL} alt={uid} />
      {text}
      <p className="text-muted">
      {
        moment(postTime).format('MMMM Do YYYY, h:mm:ss a')
      }
      </p>
    </div>
  )

}

export default App;
