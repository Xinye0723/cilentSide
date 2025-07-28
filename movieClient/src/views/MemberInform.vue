<script setup lang="ts">
import { ref, onMounted } from 'vue';

// 會員基本資訊
const memberInfo = ref({
  name: '張小明',
  email: 'zhangxiaoming@example.com',
  phone: '0912-345-678',
  memberId: 'M001234567',
  joinDate: '2023-01-15',
  level: '金卡會員',
  points: 2580
});

// 觀影紀錄
const viewingHistory = ref([
  {
    id: 1,
    movieName: '捍衛戰士：獨行俠',
    date: '2024-01-15',
    time: '14:30',
    theater: 'A廳',
    seat: 'F12',
    ticketType: '一般票',
    price: 320
  },
  {
    id: 2,
    movieName: '阿凡達：水之道',
    date: '2024-01-08',
    time: '19:00',
    theater: 'B廳',
    seat: 'H8',
    ticketType: '3D票',
    price: 380
  },
  {
    id: 3,
    movieName: '黑豹2：瓦干達萬歲',
    date: '2023-12-25',
    time: '16:15',
    theater: 'C廳',
    seat: 'E15',
    ticketType: '一般票',
    price: 320
  },
  {
    id: 4,
    movieName: '奇異博士2：失控多重宇宙',
    date: '2023-12-10',
    time: '20:30',
    theater: 'A廳',
    seat: 'G6',
    ticketType: 'IMAX票',
    price: 450
  }
]);

// 統計資料
const statistics = ref({
  totalMovies: 4,
  totalSpent: 1470,
  favoriteGenre: '動作片',
  averageRating: 4.2
});

onMounted(() => {
  // 這裡可以從API獲取真實的會員資料
  console.log('會員資料頁面已載入');
});
</script>

<template>
  <div class="member-inform-container">
    <!-- 頁面標題 -->
    <div class="page-header">
      <h1 class="page-title">會員資料</h1>
      <p class="page-subtitle">查看您的個人資訊及觀影紀錄</p>
    </div>

    <div class="content-wrapper">
      <!-- 會員基本資訊區塊 -->
      <div class="info-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="icon">👤</span>
            基本資訊
          </h2>
        </div>
        
        <div class="member-card">
          <div class="member-avatar">
            <div class="avatar-placeholder">
              {{ memberInfo.name.charAt(0) }}
            </div>
          </div>
          
          <div class="member-details">
            <div class="detail-row">
              <span class="label">姓名：</span>
              <span class="value">{{ memberInfo.name }}</span>
            </div>
            <div class="detail-row">
              <span class="label">會員編號：</span>
              <span class="value">{{ memberInfo.memberId }}</span>
            </div>
            <div class="detail-row">
              <span class="label">電子郵件：</span>
              <span class="value">{{ memberInfo.email }}</span>
            </div>
            <div class="detail-row">
              <span class="label">聯絡電話：</span>
              <span class="value">{{ memberInfo.phone }}</span>
            </div>
            <div class="detail-row">
              <span class="label">加入日期：</span>
              <span class="value">{{ memberInfo.joinDate }}</span>
            </div>
            <div class="detail-row">
              <span class="label">會員等級：</span>
              <span class="value member-level">{{ memberInfo.level }}</span>
            </div>
            <div class="detail-row">
              <span class="label">累積點數：</span>
              <span class="value points">{{ memberInfo.points }} 點</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 觀影統計區塊 -->
      <div class="stats-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="icon">📊</span>
            觀影統計
          </h2>
        </div>
        
        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">🎬</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.totalMovies }}</div>
              <div class="stat-label">觀影次數</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-content">
              <div class="stat-number">${{ statistics.totalSpent }}</div>
              <div class="stat-label">總消費</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">🎭</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.favoriteGenre }}</div>
              <div class="stat-label">最愛類型</div>
            </div>
          </div>
          
          <div class="stat-card">
            <div class="stat-icon">⭐</div>
            <div class="stat-content">
              <div class="stat-number">{{ statistics.averageRating }}</div>
              <div class="stat-label">平均評分</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 觀影紀錄區塊 -->
      <div class="history-section">
        <div class="section-header">
          <h2 class="section-title">
            <span class="icon">🎫</span>
            觀影紀錄
          </h2>
        </div>
        
        <div class="history-list">
          <div 
            v-for="record in viewingHistory" 
            :key="record.id" 
            class="history-item"
          >
            <div class="movie-info">
              <h3 class="movie-name">{{ record.movieName }}</h3>
              <div class="movie-details">
                <span class="detail-item">
                  <span class="detail-icon">📅</span>
                  {{ record.date }}
                </span>
                <span class="detail-item">
                  <span class="detail-icon">🕒</span>
                  {{ record.time }}
                </span>
                <span class="detail-item">
                  <span class="detail-icon">🎭</span>
                  {{ record.theater }}
                </span>
                <span class="detail-item">
                  <span class="detail-icon">💺</span>
                  {{ record.seat }}
                </span>
              </div>
            </div>
            
            <div class="ticket-info">
              <div class="ticket-type">{{ record.ticketType }}</div>
              <div class="ticket-price">${{ record.price }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="css" scoped>
.member-inform-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
  padding: 120px 5% 80px;
  color: white;
}

.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-title {
  font-size: 3rem;
  font-weight: 700;
  background: linear-gradient(45deg, #ff3366, #ff6b6b, #4834d4, #686de0);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  margin-bottom: 1rem;
  animation: gradient 8s linear infinite;
  background-size: 300%;
}

.page-subtitle {
  font-size: 1.2rem;
  color: #cccccc;
  opacity: 0.8;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 2rem;
}

.section-header {
  margin-bottom: 1.5rem;
}

.section-title {
  font-size: 1.8rem;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.icon {
  font-size: 1.5rem;
}

/* 會員基本資訊樣式 */
.info-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.member-card {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
}

.member-avatar {
  flex-shrink: 0;
}

.avatar-placeholder {
  width: 80px;
  height: 80px;
  background: linear-gradient(45deg, #ff3366, #ff6b6b);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 700;
  color: white;
}

.member-details {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
}

.detail-row {
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
}

.label {
  font-weight: 500;
  color: #cccccc;
  min-width: 100px;
}

.value {
  color: white;
  font-weight: 400;
}

.member-level {
  color: #ffd700;
  font-weight: 600;
}

.points {
  color: #00ff88;
  font-weight: 600;
}

/* 統計區塊樣式 */
.stats-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.stat-card {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.stat-icon {
  font-size: 2rem;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 50%;
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
}

.stat-label {
  font-size: 0.9rem;
  color: #cccccc;
}

/* 觀影紀錄樣式 */
.history-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  padding: 2rem;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.history-item {
  background: rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.history-item:hover {
  transform: translateX(5px);
  box-shadow: 0 5px 20px rgba(0, 0, 0, 0.2);
}

.movie-info {
  flex: 1;
}

.movie-name {
  font-size: 1.2rem;
  font-weight: 600;
  color: white;
  margin-bottom: 0.5rem;
}

.movie-details {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.9rem;
  color: #cccccc;
}

.detail-icon {
  font-size: 0.8rem;
}

.ticket-info {
  text-align: right;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.ticket-type {
  font-size: 0.9rem;
  color: #00ff88;
  font-weight: 500;
}

.ticket-price {
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffd700;
}

/* 漸層動畫 */
@keyframes gradient {
  0% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
  100% {
    background-position: 0% 50%;
  }
}

/* 響應式設計 */
@media (max-width: 768px) {
  .member-inform-container {
    padding: 100px 3% 60px;
  }
  
  .page-title {
    font-size: 2rem;
  }
  
  .member-card {
    flex-direction: column;
    text-align: center;
  }
  
  .member-details {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .history-item {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .ticket-info {
    text-align: center;
  }
  
  .movie-details {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .movie-details {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>