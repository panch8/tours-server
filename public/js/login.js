import axios from "axios";
import { showAlert } from "./alerts";


export const login = async function(email,password){
 try {
   const res = await  axios({
     method: 'POST',
     url:'/api/v1/users/login',
     data:{
       email,
       password
     }
   })

  if(res.data.status === 'success'){

    showAlert('success',"You have successfully logged in");
    window.setTimeout(function(){
      location.assign('/');
    },500)
  }

 } catch (error) {
  showAlert('error',error.response.data.message)
  // console.log(error.response.data);
 }
};

export const logOut = async function(){
  try {
    const res =await axios({
      method:'GET',
      url:'/api/v1/users/logout'
    })

    if(res.data.status === 'success')location.assign('/');
  } catch (error) {
    showAlert('error', 'Error logging out! Try again.')

  }

}

export const submitNewPass = async function(token,password,passwordConfirm){
  try {

    const res =await axios({
      method:'PATCH',
      url:`/api/v1/users/reset-password/${token}`,
      data:{
        password,
        passwordConfirm
      }
    })

    if(res.data.status === 'success'){
      showAlert('success','Password Reset Success');
      location.assign('/me');}
  } catch (error) {
    showAlert('error', 'Error reseting password. Try again.')

  }
}