<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-black text-white">
    <div v-if="loading">Line 登入中，請稍候...</div>
    <div v-else-if="error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const loading = ref(true);
const error = ref('');
const router = useRouter();

onMounted(async () => {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  if (!code) {
    error.value = 'Line 授權失敗，缺少 code';
    loading.value = false;
    return;
  }
  try {
    const res = await fetch(`https://localhost:7181/api/Members/ExternalLoginCallback?provider=line&code=${code}`);
    const data = await res.json();
    if (!res.ok) {
      error.value = data.message || 'Line 登入失敗';
      loading.value = false;
      return;
    }
    
    // 儲存會員資訊和 JWT Token
    localStorage.setItem('memberId', data.id);
    localStorage.setItem('token', data.token);
    localStorage.setItem('memberName', data.name);
    
    loading.value = false;
    router.push('/memberIn');
  } catch (e) {
    console.error('Line 登入錯誤:', e);
    error.value = 'Line 登入失敗，請稍後再試';
    loading.value = false;
  }
});
</script> 