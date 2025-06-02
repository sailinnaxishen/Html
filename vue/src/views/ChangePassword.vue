<template>
  <div class="change-password-container">
    <h2>修改密码</h2>
    <form @submit.prevent="handleChangePassword">
      <div class="form-group">
        <label for="oldPassword">旧密码</label>
        <input id="oldPassword" v-model="oldPassword" type="password" required />
      </div>
      <div class="form-group">
        <label for="newPassword">新密码</label>
        <input id="newPassword" v-model="newPassword" type="password" required />
      </div>
      <button type="submit">修改密码</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { apiPaths } from '@/config/index.js';

const oldPassword = ref('');
const newPassword = ref('');

async function handleChangePassword() {
  if (!oldPassword.value || !newPassword.value) {
    alert('请输入旧密码和新密码');
    return;
  }
  const token = localStorage.getItem('token');
  if (!token) {
    alert('请先登录');
    return;
  }
  try {
    const res = await fetch(apiPaths.auth.changePassword || '/api/auth/change-password', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify({
        oldPassword: oldPassword.value,
        newPassword: newPassword.value
      })
    });
    const data = await res.json();
    if (res.ok) {
      alert('密码修改成功，请重新登录');
      localStorage.removeItem('token');
      window.location.href = '/login';
    } else {
      alert(data.message || '密码修改失败');
    }
  } catch (e) {
    alert('请求失败');
  }
}
</script>

<style scoped>
.change-password-container {
  max-width: 350px;
  margin: 100px auto;
  padding: 2rem;
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.form-group {
  margin-bottom: 1rem;
}
label {
  display: block;
  margin-bottom: 0.5rem;
}
input {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
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
</style> 