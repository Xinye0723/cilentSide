<script setup>
import Status1View from "@/movies/Status1View.vue";
import { ref, markRaw } from "vue";

const apiUrl = "https://localhost:7181/api/Movies";
const movies = ref([]);
const nowShowing = ref([]);
const comingSoon = ref([]);

fetch(apiUrl)
  .then((response) => response.json())
  .then((datas) => {
    movies.value = datas;
    // ✅ 依照 DisplayOrder 排序
    const sorted = datas
      .filter((m) => m.isActive) // 只要啟用中的
      .sort((a, b) => a.displayOrder - b.displayOrder);
    nowShowing.value = sorted
      .filter((movie) => movie.movieStatusId === 2)
      .slice(14, 21);
    comingSoon.value = sorted
      .filter((movie) => movie.movieStatusId === 1)
      .slice(0, 7);
  });

// 使用 markRaw 避免組件被設為響應式物件
const tabs = ref([{ name: "現正熱映", component: markRaw(Status1View) }]);
const activedIndex = ref(0);
const setActive = (index) => {
  activedIndex.value = index;
};
// const nowShowing = [
//   {
//     MovieId: 1,
//     MovieNameCh: '全知讀者視角',
//     MovieNameEn: 'Omniscient Reader’s Viewpoint',
//     Poster: '/posterPicture/全知讀者視角.jpg',
//     Slug: 'omniscientreadersviewpoint'
//   },
//   {
//     MovieId: 2,
//     MovieNameCh: '驚奇4超人：第一步',
//     MovieNameEn: 'The Fantastic Four: First Steps',
//     Poster: '/posterPicture/驚奇4超人：第一步.jpg',
//     Slug: 'thefantasticfourfirststeps'
//   },
//   {
//     MovieId: 3,
//     MovieNameCh: '壞蛋聯盟2',
//     MovieNameEn: 'The Bad Guys 2',
//     Poster: '/posterPicture/壞蛋聯盟2.jpg',
//     Slug: 'thebadguys2'
//   },
//   {
//     MovieId: 4,
//     MovieNameCh: '劇場版「鬼滅之刃」無限城篇 第一章',
//     MovieNameEn: 'Demon Slayer: Kimetsu no Yaiba – Infinity Castle',
//     Poster: '/posterPicture/劇場版「鬼滅之刃」無限城篇.jpg',
//     Slug: 'demonslayerkimetsunoyaibainfinitycastle'
//   },
//   {
//     MovieId: 5,
//     MovieNameCh: '凶器',
//     MovieNameEn: 'Weapons',
//     Poster: '/posterPicture/凶器.jpg',
//     Slug: 'weapons'
//   },
//   {
//     MovieId: 6,
//     MovieNameCh: '辣媽辣妹2',
//     MovieNameEn: 'Freakier Friday',
//     Poster: '/posterPicture/辣媽辣妹2.jpg',
//     Slug: 'freakierfriday'
//   },
//   {
//     MovieId: 7,
//     MovieNameCh: '無名弒2',
//     MovieNameEn: 'Nobody 2',
//     Poster: '/posterPicture/無名弒2.jpg',
//     Slug: 'nobody2'
//   },
// ]

// const comingSoon = [
//   {
//     MovieId: 8,
//     MovieNameCh: '角頭－鬥陣欸',
//     MovieNameEn: 'GATAO: Big Brothers',
//     Poster: '/posterPicture/角頭－鬥陣欸.jpg',
//     Slug: 'gataobigbrothers'
//   },
//   {
//     MovieId: 9,
//     MovieNameCh: '脫線神探',
//     MovieNameEn: 'The Naked Gun',
//     Poster: '/posterPicture/脫線神探.jpg',
//     Slug: 'thenakedgun'
//   },
//   {
//     MovieId: 10,
//     MovieNameCh: '進行曲',
//     MovieNameEn: 'Marching Boys',
//     Poster: '/posterPicture/進行曲.jpg',
//     Slug: 'marchingboys'
//   },
//   {
//     MovieId: 11,
//     MovieNameCh: '天作之合',
//     MovieNameEn: 'Materialists',
//     Poster: '/posterPicture/天作之合.jpg',
//     Slug: 'Materialists'
//   },
//   {
//     MovieId: 12,
//     MovieNameCh: '厲陰宅：最終聖事',
//     MovieNameEn: 'The Conjuring: Last Rites',
//     Poster: '/posterPicture/厲陰宅：最終聖事.jpg',
//     Slug: 'theconjuringlastrites'
//   },
//   {
//     MovieId: 13,
//     MovieNameCh: '96分鐘',
//     MovieNameEn: '96 Minutes',
//     Poster: '/posterPicture/96分鐘.jpg',
//     Slug: '96minutes'
//   },
//   {
//     MovieId: 14,
//     MovieNameCh: '我家的事',
//     MovieNameEn: 'Family Matters',
//     Poster: '/posterPicture/我家的事.jpg',
//     Slug: 'familymatters'
//   },
// ]
</script>

<template>
  <div class="movie-row">
    <ul class="nav nav-tabs mb-3">
      <li class="nav-item" v-for="(tab, idx) in tabs" :key="tab.name">
        <a
          class="nav-link"
          :class="{ active: activedIndex === idx }"
          href="#"
          @mouseover="setActive(idx)"
          >{{ tab.name }}</a
        >
      </li>
    </ul>
    <div class="mt-3">
      <component
        :is="tabs[activedIndex].component"
        :movies="activedIndex === 0 ? nowShowing : comingSoon"
      />
    </div>
  </div>
  <br />
  <br />
  <br />
  <br />
  <h1>熱門活動</h1>
</template>

<style lang="css" scoped>
.nav-tabs .nav-link.active {
  border-bottom: 3px solid white;
  color: white;
  font-weight: bold;
  background: transparent;
}
.movie-row {
  max-width: 1450px; /* 跟下方卡片容器寬度一致 */
  margin: 0 auto;
  padding-left: 10px;
  padding-right: 10px;
}
h1 {
  color: white;
}
</style>
