import '@babel/polyfill';
import { logOut, login } from "./login";
import { displayMap } from './mapbox';
console.log('hello from parcel');

const mapDiv = document.getElementById('map');
const loginForm = document.querySelector('.form');
const logOutBtn = document.querySelector('.nav__el--logout');

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


