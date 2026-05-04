<script setup lang="ts">
import { computed } from 'vue'
import { useAppI18n } from '@/shared/i18n'

const { t } = useAppI18n()

const streams = computed(() => [
  { name: t('streams.northGate'), status: t('streams.playing') },
  { name: t('streams.warehouseDock'), status: t('streams.buffering') },
  { name: t('streams.portEast'), status: t('streams.fallback') },
])
</script>

<template>
  <section class="page-section">
    <div class="section-header">
      <div>
        <h2>{{ t('routes.streams') }}</h2>
        <p>{{ t('streams.subtitle') }}</p>
      </div>
      <button class="button primary" type="button">{{ t('streams.addTile') }}</button>
    </div>

    <div class="stream-grid">
      <article v-for="stream in streams" :key="stream.name" class="stream-tile">
        <div class="video-surface">
          <span>{{ stream.name }}</span>
        </div>
        <div class="tile-footer">
          <strong>{{ stream.name }}</strong>
          <span class="pill">{{ stream.status }}</span>
        </div>
      </article>
    </div>
  </section>
</template>
