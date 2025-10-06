// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { createUserWithEmailAndPassword, getAuth, sendPasswordResetEmail, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, setDoc, doc, collection, query, where, getDocs } from "firebase/firestore";
import { toast } from "react-toastify";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAOcFGhUvj1wUiTWCbE4J6hLYClmMq52GU",
  authDomain: "chat-app-9025e.firebaseapp.com",
  projectId: "chat-app-9025e",
  storageBucket: "chat-app-9025e.firebasestorage.app",
  messagingSenderId: "379327095915",
  appId: "1:379327095915:web:856280f249e0184914fd2e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username, email, password) => {
  try {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    const user = res.user;

    // Save user data
    await setDoc(doc(db, "users", user.uid), {
      id: user.uid,
      username: username.toLowerCase(),
      email,
      name: "",
      avatar: "",
      bio: "Hey, There I am using LinkUp",
      lastSeen: Date.now(),
    });

    // Create empty chat collection for user
    await setDoc(doc(db, "chats", user.uid), {
      chatsData: [],
    });
  } catch (error) {
    console.error(error);
    toast.error(error.code.split('/')[1].split('-').join(" "))
  }
};


const login = async (email,password)=>{
    try {
        await signInWithEmailAndPassword(auth,email,password)
    } catch (error) {
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(" "))
    }
}

const logout = async ()=>{
    try {
        await signOut(auth)        
    } catch (error) {
        console.error(error)
        toast.error(error.code.split('/')[1].split('-').join(" "))
    }
}

const resetPass = async (email) =>{
  if(!email){
    toast.error("Enter your Email")
    return null
  }
  try {
    const userRef =  collection(db,'users')
    const q = query(userRef,where("email","==",email))
    const querySnap = await getDocs(q)
    if(!querySnap.empty){
      await sendPasswordResetEmail(auth,email)
      toast.success("Reset Email Sent")
    }
    else{
      toast.error("Email dosen't exist")
    }

  } catch (error) {
    console.error(error)
    toast.error(error.message)
  }
}

export { signup , login , logout , auth , db , resetPass};
