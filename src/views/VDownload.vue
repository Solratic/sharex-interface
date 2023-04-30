<template>
    <section id="content">
        <div>
            <PanelDownload />
        </div>
    </section>
</template>

<script lang="ts">
import PanelDownload from "@src/components/VDownload/PanelDownload.vue";

export default {
    name: "VDownload",
    components: {
        PanelDownload,
    },
}
</script>

<style lang="scss" scoped>
section#content {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    height: 100%;
}
</style>