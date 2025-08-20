<script>
    import {scale} from 'svelte/transition';

    export let title;
    export let value;
    export let isDecimal = false;
    export let valueSuffix;
    export let color = 'primary';
    export let size = 6;
</script>

<div class="col-12 col-md-{size} p-2 pr-md-4" in:scale={{duration: 250, start: 0.92}}>
    <div class="card card-widget p-0 m-0 h-100">
        <div class="card-body p-4">
            <div class="mb-0">
                <h6 class="font-weight-boldest text-center mb-0" style="font-size: 1rem;">
                    {title || ''}
                </h6>
            </div>
            <div class="text-center font-weight-bolder text-primary mt-2" style="font-size: 1.75rem;">
                <span class="text-{color}">
                    {Number(value).toLocaleString('it-IT', {
                        maximumFractionDigits: isDecimal ? 2 : 0,
                        minimumFractionDigits: isDecimal ? 2 : 0,
                    })}
                    {valueSuffix}
                </span>
            </div>
        </div>
    </div>
</div>
