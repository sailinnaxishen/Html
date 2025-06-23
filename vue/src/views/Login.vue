<template>
  <div class="login-container">
    <div v-if="!showRegister" class="login-a">
      <div class="login-text">可爱的Lolita妹妹们</div>
      <img :src="IMAGE_PATHS.login.login_a" class="login_a_img">  
      <div class="login-text">可以，把你的，支付宝账号给我嘛？</div>
      <div class="login-form">     
        <form @submit.prevent="showRegister ? handleRegister() : handleLogin()">
        <div class="form-group">
          <label for="username">支付账号</label>
          <input id="username" v-model="username" type="text" required />
        </div>
        <div class="form-group">
          <label for="password">支付密码</label>
          <input id="password" v-model="password" type="password" required />
        </div>
        <div class="form-null pay-password">
          <label for="pay-password-0">交易密码</label>
          <div class="pay-inputs">
            <input
              v-for="(num, idx) in payPassword"
              :key="idx"
              :id="'pay-password-' + idx"
              type="text"
              inputmode="numeric"
              maxlength="1"
              class="pay-input"
              v-model="payPassword[idx]"
              @input="onPayInput(idx, $event)"
              @keydown="onPayKeydown(idx, $event)"
              autocomplete="off"
            />
          </div>
        </div>
        <button type="submit">{{ showRegister ? '注册' : '好的，给你！' }}</button>
        </form>
      </div>
    </div>
    <div v-else class="login-b">
      <div class="login-text">注册</div>
      <img :src="IMAGE_PATHS.login.login_a" class="login_a_img">
      <div class="login-form">
        <form @submit.prevent="handleRegister">
          <div class="form-group">
            <label for="reg-username">支付账号</label>
            <input id="reg-username" v-model="username" type="text" required />
          </div>
          <div class="form-group">
            <label for="reg-password">支付密码</label>
            <input id="reg-password" v-model="password" type="password" required />
          </div>
          <div class="form-group">
            <label for="confirm-password">确认密码</label>
            <input id="confirm-password" v-model="confirmPassword" type="password" required />
          </div>
          <button type="submit">注册</button>
        </form>
      </div>
    </div>
    <div style="margin-top: 1rem; text-align: center;">
      <a href="#" @click.prevent="toggleForm">
        {{ showRegister ? '快去登录吧' : '啊？没有支付账号？好吧，大哥哥/大姐姐真废物，帮你注册一个' }}
      </a>
    </div>
  </div>
</template>

<script setup>
import { ref, Text } from 'vue';
import { useRouter } from 'vue-router';
import { apiPaths, currentConfig } from '@/config/index.js';
import { IMAGE_PATHS } from '@/assets/images.js'
const username = ref('');
const password = ref('');
const showRegister = ref(false);
const router = useRouter();
const payPassword = ref(['', '', '', '', '', '']);
const confirmPassword = ref('');

console.log('Base URL:', currentConfig.baseURL);
console.log('API Path:', apiPaths.auth.login);
console.log('Full URL:', `${currentConfig.baseURL}${apiPaths.auth.login}`);

function toggleForm() {
  showRegister.value = !showRegister.value;
}
async function handleLogin() {
  if (username.value && password.value) {
    try {
      const res = await fetch(apiPaths.auth.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.value, password: password.value })
      });
      const data = await res.json();
      if (res.ok && data.token) {
        localStorage.setItem('token', data.token);
        router.push('/');
      } else {
        alert(data.message || '登录失败');
      }
    } catch (e) {
      alert('登录请求失败');
    }
  } else {
    alert('请输入用户名和密码');
  }
}

async function handleRegister() {
  if (password.value !== confirmPassword.value) {
    alert('两次输入的密码不一致');
    return;
  }
  
  if (username.value && password.value) {
    try {
      const res = await fetch(apiPaths.auth.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          username: username.value, 
          password: password.value 
        })
      });
      const data = await res.json();
      if (res.ok) {
        alert('注册成功，请登录');
        showRegister.value = false;
        username.value = '';
        password.value = '';
        confirmPassword.value = '';
      } else {
        alert(data.message || '注册失败');
      }
    } catch (e) {
      alert('注册请求失败');
    }
  } else {
    alert('请输入用户名和密码');
  }
}

function onPayInput(idx, e) {
  const val = e.target.value.replace(/\D/g, ''); // 只允许数字
  payPassword.value[idx] = val;
  if (val && idx < 5) {
    // 跳到下一个
    const next = document.getElementById('pay-password-' + (idx + 1));
    next && next.focus();
  }
}

function onPayKeydown(idx, e) {
  if (e.key === 'Backspace') {
    if (!payPassword.value[idx] && idx > 0) {
      // 跳到上一个
      const prev = document.getElementById('pay-password-' + (idx - 1));
      prev && prev.focus();
    }
  } else if (!/^\d$/.test(e.key) && e.key.length === 1) {
    // 阻止非数字输入
    e.preventDefault();
  }
}
</script>

<style scoped>
.login-container {
  width: 100%;
  min-height: 100vh;
  padding: 2rem;
  border-radius: 8px;
  background: #fdfeff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  text-align: center;
  overflow: auto;
}
.form-group {
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
}
.login-text{
  font-size: 1.5rem;
  text-align: center;
}
.login-form{
  width: 70%;
  max-width: 500px;
  margin: 0 auto;
}
.login_a_img{
  width: 70%;
  max-height: 40vh;
  object-fit: contain;
}
label {
  display: block;
  margin-bottom: 0;
  width: 110px;
  text-align: left;
  font-size: 1rem;
  color: #000000;
}
input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  margin-left: 0.5rem;
}
button {
  width: 100%;
  padding: 0.7rem;
  background: #007aff;
  color: #fff;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
}
button:hover {
  background: #005ecb;
}
.pay-password {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1rem;
}
.pay-password label {
  width: auto;
  margin-bottom: 0.5rem;
  text-align: center;
}
.pay-inputs {
  display: flex;
  gap: 0.3rem;
  justify-content: center;
}
.pay-input {
  width: 1.8rem;
  height: 1.8rem;
  font-size: 1.2rem;
}

/* 添加小屏适配 */
@media (max-width: 300px) {
  .login-container {
    padding: 1rem;
  }
  
  .login-form {
    width: 100%;
  }
  
  .form-group {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .form-group label {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .pay-password {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .pay-password label {
    width: 100%;
    margin-bottom: 0.5rem;
  }
  
  .pay-inputs {
    width: 100%;
    justify-content: space-between;
  }
  
  .pay-input {
    width: 1.8rem;
    height: 1.8rem;
    font-size: 1.2rem;
  }
  
  .login_a_img {
    width: 100%;
  }
}

/* 优化小屏适配 */
@media (max-width: 600px) {
  .login-form {
    width: 90%;
  }
  
  .pay-inputs {
    gap: 0.2rem;
  }
  
  .pay-input {
    width: 1.5rem;
    height: 1.5rem;
    font-size: 1rem;
  }
  
  /* 添加中屏适配 */
  @media (max-width: 900px) {
    .login-form {
      width: 95%;
    }
    
    .login_a_img {
      max-height: 30vh;
    }
  }
}
</style>



