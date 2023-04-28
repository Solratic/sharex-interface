<template>
    <footer>
        <div class="container">
            <span>&copy; {{ currentYear }} Solratic | ShaRex</span>
            <a class="github" href="https://github.com/solratic/sharex-interface" target="_blank" rel="noreferrer noopener">
                <i-mdi-github />
            </a>
        </div>
    </footer>
</template>

<script lang="ts">
export default {
    data() {
        return {
            currentYear: new Date().getFullYear()
        }
    },
    methods: {
        goToGitHub() {
            window.location.href = "https://github.com/your-github-username";
        }
    }
};
</script>

<style lang="scss">
.container {
    margin: 0.5rem auto;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 1rem;

    span {
        color: var(--text-color);
    }
}

.github {
    color: var(--text-color);
    display: flex;
    align-items: center;
    justify-content: center;
    transition: color 0.2s ease-in-out;
}
</style>
