<script context="module">
    export class BaseWidget {
        constructor() {
            this.name = 'BaseWidget';
        }

        getName() {
            return this.name;
        }

        setName(name) {
            this.name = name;
        }
    }
</script>
