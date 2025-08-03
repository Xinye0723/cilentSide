<template>
  <div class="flex flex-col items-center justify-center min-h-screen bg-black text-white">
    <div v-if="loading" class="text-center">
      <div class="mb-4">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
      </div>
      <div>Google 登入中，請稍候...</div>
    </div>
    <div v-else-if="error" class="text-center">
      <div class="text-red-500 mb-4">{{ error }}</div>
      <button 
        @click="retryLogin" 
        class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        重新嘗試
      </button>
      <button 
        @click="goToLogin" 
        class="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded ml-2"
      >
        返回登入頁面
      </button>
    </div>
    <div v-else class="text-center">
      <div class="text-green-500 mb-4">登入成功！正在跳轉...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const loading = ref(true);
const error = ref('');
const router = useRouter();

const processGoogleLogin = async () => {
  const url = new URL(window.location.href);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  
  if (!code) {
    error.value = 'Google 授權失敗，缺少授權碼';
    loading.value = false;
    return;
  }

  try {
    console.log('開始 Google 登入處理...');
    const res = await fetch('http://localhost:5276/api/Members/GoogleLogin', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        code: code
      })
    });

    console.log('API 回應狀態:', res.status);

    if (!res.ok) {
      let errorMessage = 'Google 登入失敗';
      try {
        const errorData = await res.json();
        errorMessage = errorData.message || errorMessage;
        console.error('API 錯誤回應:', errorData);
      } catch (e) {
        console.error('解析錯誤回應失敗:', e);
      }
      error.value = errorMessage;
      loading.value = false;
      return;
    }

    const data = await res.json();
    console.log('Google 登入成功，接收到的資料:', data);
    
    // 儲存登入資訊
    localStorage.setItem('memberId', data.id);
    localStorage.setItem('token', data.token);
    localStorage.setItem('memberName', data.name);
    
    loading.value = false;
    
    // 延遲一下再跳轉，讓用戶看到成功訊息
    setTimeout(() => {
      router.push('/memberIn');
    }, 1000);
    
  } catch (e) {
    console.error('Google 登入錯誤:', e);
    error.value = 'Google 登入失敗，請稍後再試';
    loading.value = false;
  }
};

const retryLogin = () => {
  loading.value = true;
  error.value = '';
  processGoogleLogin();
};

const goToLogin = () => {
  router.push('/login');
};

onMounted(() => {
  processGoogleLogin();
});
</script>

<style scoped>
.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>