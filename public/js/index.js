import { login, logout } from './login';
import '@babel/polyfill'
import { displayMap } from './mapbox';
import { updateSettings } from './updateSettings';

//DOM ELEMENTS
const mapbox=document.querySelector('#map');
const loginForm=document.querySelector('.form');
const logoutBtn=document.querySelector('.nav__el--logout');
const userDataForm=document.querySelector('.form-user-data');
const passwordUpdateForm=document.querySelector('.form-user-settings');


//DELEGATION
if (mapbox) {
  const locations = JSON.parse(mapbox.dataset.locations);
  displayMap(locations)
}

if (loginForm) {
  loginForm.addEventListener('submit', e => {
    e.preventDefault();
    const email=document.querySelector('#email').value;
    const password=document.querySelector('#password').value;
    login(email, password)

  })
}
if (logoutBtn) logoutBtn.addEventListener('click',logout)

if (userDataForm){
  userDataForm.addEventListener('submit',e=>{
    e.preventDefault();
    const name=document.querySelector('#name_acc').value;
    const email=document.querySelector('#email_acc').value;

    updateSettings({ name, email },'data')

  })
}
if (passwordUpdateForm){
  passwordUpdateForm.addEventListener('submit',async e=>{
    e.preventDefault();

    document.querySelector('.btn--save--password').textContent='Updating...';

    const password=document.querySelector('#password-current').value;
    const newPassword=document.querySelector('#password-new').value;
    const newPasswordConfirm=document.querySelector('#password-new-confirm').value;

    await updateSettings({password,newPassword,newPasswordConfirm},'password');
    document.querySelector('.btn--save--password').textContent='Save Password';
    document.querySelector('#password-current').value='';
    document.querySelector('#password-new').value='';
    document.querySelector('#password-new-confirm').value='';
  })
}
