import axios from "axios";
import { showAlert } from "./alerts";


export const login = async function(email,password){
 try {
   const res = await  axios({
     method: 'POST',
     url:'http://127.0.0.1:3000/api/v1/users/login',
     data:{
       email,
       password
     }
   })
  console.log(res);
  if(res.data.status === 'success'){

    showAlert('success',"You have successfully logged in");
    window.setTimeout(function(){
      location.assign('/');
    },500)
  }

 } catch (error) {
  showAlert('error',error.response.data.message)
  console.log(error.response.data);
 }
};

export const logOut = async function(){
  try {
    const res =await axios({
      method:'GET',
      url:'http://127.0.0.1:3000/api/v1/users/logout'
    })

    if(res.data.status === 'success')location.reload(true);
  } catch (error) {
    showAlert('error', 'Error logging out! Try again.')

  }

}