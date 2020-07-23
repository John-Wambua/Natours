import axios from 'axios'
import { showAlert } from './alerts';
export const login=async (email,password)=>{
  console.log(email,password);
  console.log('LOGIN');
  try {
    const response = await axios.post('http://localhost:3000/api/v1/users/login', {
      email,
      password
    })
    if (response.data.status==='success'){
      showAlert('success','Logged In successfully!')
      window.setTimeout(()=>{
        location.assign('/')
      },500)
    }

  }catch (e) {
    const message=e.response.data.message;
    console.log(message);
    showAlert('error',message)
  }
}

export const logout=async ()=>{
  try {
    const response = await axios.get('http://localhost:3000/api/v1/users/logout')
    if (response.data.status==='success') location.reload(true);

  }catch (e) {
    console.log(e);
    showAlert('error','Error logging out! Try again')
  }
}

