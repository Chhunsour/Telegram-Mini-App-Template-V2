<script setup lang="ts">
import { useShowcaseStore } from '@/stores/showcase'
const ui = useShowcaseStore().copy.ui
</script>
<template><section class="not-found container"><span>404</span><h1>{{ ui.notFound.title }}</h1><p>{{ ui.notFound.copy }}</p><div><RouterLink class="button" to="/">{{ ui.nav.home }}</RouterLink><RouterLink class="text-link" to="/categories">{{ ui.common.browse }}</RouterLink></div></section></template>
