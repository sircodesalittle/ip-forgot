<template>
    <div class="card">
        <header class="card-header">
            <p class="card-header-title">
                {{ profile['name'] }}
            </p>
        </header>
        <div class="card-content">
            <div class="content">
                IP Addresses:
                <ul>
                    <li v-for="ipAddress in profile['ipAddresses']" :key="ipAddress">
                        {{ ipAddress }}
                    </li>
                </ul>
            </div>
        </div>
        <footer class="card-footer">
            <a href="#" class="card-footer-item">Load</a>
            <a href="#" class="card-footer-item">Edit</a>
            <a href="#" class="card-footer-item">Delete</a>
        </footer>
    </div>
</template>

<script>
export default {
    name: 'ProfileCard',
    props: {
        profile: Object,
    }
}
</script>

