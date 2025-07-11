<script setup>
    import { ref } from 'vue'

const MemberID = ref('')
const password = ref('')
const loading = ref(false)
const errorMessage = ref('')
const loggedIn = ref(false)
const MemberName = ref('')

async function login() {
  loading.value = true
  errorMessage.value = ''

  try {
    // 這裡改成你自己的後端 API
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        username: username.value,
        password: password.value
      })
    })

    const data = await response.json()
    if (data.success) {
      loggedIn.value = true
      memberName.value = data.memberName
    } else {
      errorMessage.value = data.message || '登入失敗'
    }
  } catch (err) {
    errorMessage.value = '發生錯誤，請稍後再試'
    console.error(err)
  } finally {
    loading.value = false
  }
}
</script>

<template>
    <div class="loginPage">
        <h1 v-if="!loggedIn">會員登入</h1>
        <h1 v-else>歡迎~{{ MemberName }}!</h1>
        <form v-if="!loggedIn" @submit.prevent="login">
            <div class="form-group">
                <label for="MemberID">帳號:</label>
                <input id="password" type="password" v-model="password" required/>
            </div>
             <div class="form-group">
            <label for="password">密碼：</label>
            <input id="password" type="password" v-model="password" required />
            </div>
            <button type="submit" :disabled="loading">登入</button>
        </form>
        <p v-if="loading">登入中...</p>
        <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    </div>
</template>

<style lang="css" scoped>

</style>