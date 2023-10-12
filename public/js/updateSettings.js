import axios from "axios";
import { showAlert } from "./alerts";

export const updateSettings = async function(data,field){
  try{

    //data obj could be either {name:'example', email:'example} or 
    // { currentPassword:'xxxxxxxx', password: 'xxxxxxxxxx', passwordConfirm: 'xxxxxxxxx'}
    const url = field === 'password'? 
    'http://127.0.0.1:3000/api/v1/users/update-password':
    'http://127.0.0.1:3000/api/v1/users/updateMe';
    
    const res = await axios({
    method: "PATCH",
    url,
    data
  })

  if(res.data.status === 'success'){
    showAlert('success',`${field === 'password' ? 'Password' : 'Data'} successfully updated`);
  }

}catch(err){
  console.log(err);
  showAlert('error',err.response.data.message)
}

};