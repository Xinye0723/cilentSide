<script setup>
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Swiper, SwiperSlide } from "swiper/vue";
import "swiper/css";
import "swiper/css/effect-cube";
import { EffectCube } from 'swiper/modules';

const events = ref([]);
const cubes = ref([]);
const loading = ref(true);
const router = useRouter();

onMounted(async () => {
  try {
    const res = await fetch("https://localhost:7181/api/CinemaEvent");
    const data = await res.json();
    // 只抓前6個活動，分組，每組2個
    const eventList = data.filter(ev => [1, 2, 4, 5, 6, 8].includes(ev.id));
    events.value = eventList;
    cubes.value = [];
    for (let i = 0; i < eventList.length; i += 2) {
      cubes.value.push(eventList.slice(i, i + 2));
    }
  } catch (err) {
    console.error("活動載入失敗", err);
  } finally {
    loading.value = false;
  }
});

const goToDetail = id => router.push(`/cinemaEvent/${id}`);
</script>

<template>
    <div class="hot-event-cube-section">
        <h2 class="hot-title-glow">熱門活動</h2>
        <div v-if="loading" class="hot-event-loading">載入中...</div>
        <div v-else>
            <div class="cube-swiper-list">
                <div class="cube-swiper-group" v-for="(cube, idx) in cubes" :key="idx">
                    <Swiper :modules="[EffectCube]" effect="cube" grabCursor="true" 
                            :cube-effect="{shadow: false, slideShadows: false,}" class="hot-event-cube-swiper">
                        <template v-for="(event, eventIdx) in cube" :key="event.id">
                            <!-- 活動圖＋標題 -->
                            <SwiperSlide>
                                <div class="cube-event-card cube-event-cover">
                                    <img :src="event.img" :alt="event.title" class="cube-event-img" />
                                    <div class="cube-event-title">{{ event.title }}</div>
                                </div>
                            </SwiperSlide>
                            <!-- 活動詳情 -->
                            <SwiperSlide>
                                <div class="cube-event-card cube-event-detail">
                                    <div class="cube-event-title">{{ event.title }}</div>
                                    <div class="cube-event-desc">{{ event.description }}</div>
                                    <div class="cube-event-info">
                                        <div>影廳：{{ event.theaterNumber }}</div>
                                        <div>票價：NT${{ event.price }}</div>
                                        <div>時間：{{ new Date(event.startTime).toLocaleString('zh-TW') }}</div>
                                        <div>狀態：{{ event.status }}</div>
                                    </div>
                                    <button class="cube-detail-btn" @click="goToDetail(event.id)">查看詳情</button>
                                </div>
                            </SwiperSlide>
                        </template>
                    </Swiper>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="css" scoped>
.hot-title-glow {
  font-size: 2rem;
  font-weight: bold;
  color: #ffec90;
  text-align: center;
  letter-spacing: 0.15em;
  margin-bottom: 28px;
  filter: drop-shadow(0 2px 12px #ffeb3b80);
  border-bottom: 3px solid #ffb33b;
  display: inline-block;
  padding-bottom: 6px;
}
.hot-event-cube-section {
  margin: 2em 0;
  padding: 1em 0;
  border-radius: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.cube-swiper-list {
  display: flex;
  gap: 32px;           /* 卡片間距 */
  justify-content: center;
  flex-wrap: wrap;
  width: 100%;
}
.cube-swiper-group {
  width: 310px;
  margin: 0 24px 24px 0;
  vertical-align: top;
}
.hot-event-cube-swiper {
  width: 300px;
  height: 330px;
  background: #222428;
  border-radius: 16px;
  box-shadow: 0 2px 12px 0 rgba(30, 30, 40, 0.17);
  padding: 0.8em 0.2em;
  margin-bottom: 12px;
}
.cube-event-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #fff;
}
.cube-event-cover {
  cursor: grab;
  background: #232f3e;
  border-radius: 10px;
}
.cube-event-img {
  width: 300px;
  height: 190px;
  border-radius: 8px;
  object-fit: cover;
  margin-bottom: 20px;
  background: #222;
}
.cube-event-title {
  font-size: 1.1rem;
  font-weight: bold;
  margin-bottom: 8px;
}
.cube-event-detail {
  padding: 1.2em;
  background: #191c24;
  border-radius: 10px;
  text-align: left;
}
.cube-event-desc {
  font-size: 1rem;
  margin-bottom: 10px;
  text-align: justify;
  line-height: 1.7;
}
.cube-event-info > div {
  font-size: 0.95rem;
  margin-bottom: 5px;
}
.cube-detail-btn {
  margin-top: 8px;
  background: linear-gradient(90deg, #ffcc40 30%, #fa7e1e 80%);
  color: #1b1b22;
  border: none;
  border-radius: 6px;
  padding: 6px 18px;
  cursor: pointer;
  font-weight: bold;
}
.hot-event-loading {
  color: #bbb;
  text-align: center;
  margin: 2em 0;
  font-size: 1.1em;
}
</style>