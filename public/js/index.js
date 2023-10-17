import '@babel/polyfill';
import { logOut, login, submitNewPass } from "./login";
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';
import { checkout } from './bookings';

console.log('hello from parcel');

const mapDiv = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const updateDataForm = document.querySelector('.form-user-data');
const updatePasswordForm = document.querySelector('.form-user-settings');
const submitNewPassForm = document.querySelector('.form--submit-pass');
const checkoutBtn = document.getElementById('book-tour');

if(mapDiv){
  const locations = JSON.parse(mapDiv.dataset.locations)
  displayMap(locations);
}
if(loginForm){
  loginForm.addEventListener('submit',async function(e){
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    await login(email,password);
  })
  
}

if(logOutBtn)logOutBtn.addEventListener('click',logOut);

if(updateDataForm){
  updateDataForm.addEventListener('submit',async function(e){
    e.preventDefault();
    const form = new FormData;
    console.log(document.getElementById('upload-photo').files);
    form.append('name',document.getElementById('name').value);
    form.append('email',document.getElementById('email').value);
    form.append('photo',document.getElementById('upload-photo').files[0]);
    // const name = document.getElementById('name').value;
    // const email = document.getElementById('email').value;

    await updateSettings(form);
    location.reload();

  })
}

if(updatePasswordForm){
  updatePasswordForm.addEventListener('submit',async function(e){
    e.preventDefault();
    document.querySelector('.btn--save-pass').textContent = 'Updating...'
    const currentPassword = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('password-confirm').value;
    
    const data = {
      password: currentPassword,
      newPassword: password,
      newPasswordConfirm: confirmPassword
    }

    await updateSettings(data,'password');
    document.querySelector('.btn--save-pass').textContent = 'Save Password';
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  })
}

if(submitNewPassForm){
  submitNewPassForm.addEventListener('submit',async function(e){
    e.preventDefault();
    const password = document.getElementById('password').value;
    const token = document.getElementById('password').dataset.token;
    const confirmPassword = document.getElementById('password-confirm').value;
    await submitNewPass(token,password,confirmPassword)
  })
}

if(checkoutBtn){
  checkoutBtn.addEventListener('click',async function(e){
  checkoutBtn.textContent = 'Processing...'
  const { tourid } = e.target.dataset;
  console.log(tourid);
  await checkout(tourid);
  
  })
}