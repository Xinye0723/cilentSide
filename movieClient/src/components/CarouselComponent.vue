<script setup>
  
</script>

<template>
  <div id="carouselExampleControls" class="carousel slide" data-bs-ride="carousel">
  <div class="carousel-inner">
    <div class="carousel-item active">
      <img src="/carousel/InfinityCinema.jpg" class="d-block carousel-img" alt="...">
    </div>
    <div class="carousel-item">
      <img src="/carousel/F1.jpg" class="d-block carousel-img" alt="...">
    </div>
    <div class="carousel-item">
      <img src="/carousel/JurassicWorldRebirth.jpg" class="d-block carousel-img" alt="...">
    </div>
    <div class="carousel-item">
      <img src="/carousel/Superman.jpg" class="d-block carousel-img" alt="...">
    </div>
    <div class="carousel-item">
      <img src="/carousel/TheFantasticFour.jpg" class="d-block carousel-img" alt="...">
    </div>
    <div class="carousel-item">
      <img src="/carousel/KimetsuNoYaiba.jpg" class="d-block carousel-img" alt="...">
    </div>
  </div>
  <button class="carousel-control-prev" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="prev">
    <span class="carousel-control-prev-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Previous</span>
  </button>
  <button class="carousel-control-next" type="button" data-bs-target="#carouselExampleControls" data-bs-slide="next">
    <span class="carousel-control-next-icon" aria-hidden="true"></span>
    <span class="visually-hidden">Next</span>
  </button>
</div>
</template>

<style lang="css" scoped>
  .carousel-img {
    max-width: 75%;   /* 圖片寬度最多佔螢幕80%，可依需求調整 */
    margin: 0 auto;   /* 讓圖片左右自動置中 */
    display: block;   /* 保證置中有效 */
    box-shadow: 0 4px 24px #0003; /* 可選：加陰影有質感 */
  }
</style>