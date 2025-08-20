<script>
    import {scale} from 'svelte/transition';
    import {ArrowArcLeft, Broom} from 'phosphor-svelte';
    import {onMount, createEventDispatcher} from 'svelte';
    import {cubicIn, quintIn} from 'svelte/easing';

    const dispatch = createEventDispatcher();

    export let signature = {
        there_is_signature: false,
        signature: '',
    };

    export let previewEnabled = false;
    export let stylusPenMode = true;

    let canvas, ctx;
    let isDrawing = false;
    let lastX = 0;
    let lastY = 0;
    let points = [];
    let canvasLoaded = false;
    let rafId; // RequestAnimationFrame ID for throttling
    let fullPoints = [];

    function startDrawing(e) {
        isDrawing = true;
        [lastX, lastY] = getXY(e);
        points.push({x: lastX, y: lastY});
        fullPoints.push([{x: lastX, y: lastY, pressure: e.pressure && e.pressure == 0.5 ? e.pressure * 10 : 5}]);
    }

    function draw(e) {
        if (!isDrawing) return;

        e.preventDefault();

        if (rafId) {
            cancelAnimationFrame(rafId);
        }

        rafId = requestAnimationFrame(() => {
            const [x, y] = getXY(e);

            // In stylusPenMode, add heuristics for stylus pen mode here

            // Update last positions for the next movement
            // lastX = x;
            // lastY = y;

            // Instead of directly adding to points, you could check if enough distance/time has passed since the last point
            // const dx = x - points[points.length - 1]?.x || 0;
            // const dy = y - points[points.length - 1]?.y || 0;
            // const distance = Math.sqrt(dx * dx + dy * dy);
            // if (distance > 5) {
            // Adjust the distance threshold as needed
            points.push({x, y});
            fullPoints[fullPoints.length - 1].push({
                x,
                y,
                pressure: e.pressure && e.pressure == 0.5 ? e.pressure * 10 : 5,
            });
            if (e.pressure && e.pressure == 0.5) {
                // Adjust the line width based on the pressure
                smoothDraw(10 * e.pressure);
            } else {
                smoothDraw();
            }
            points = [points[points.length - 1]]; // Keep the last point for the next segment
            // }
        });
    }

    // Utility function to map a value from one range to another
    function mapRange(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    }

    function clearSignature() {
        fullPoints = [];
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        signature.there_is_signature = false;
        signature.data = '';
        dispatch('update', signature);
    }

    function smoothDraw(pressure = 3.7) {
        if (points.length < 2) return; // Need at least two points to draw

        for (let i = 1; i < points.length; i++) {
            ctx.beginPath(); // Start a new path for each segment

            // Apply line width based on the current segment's pressure
            ctx.lineWidth = pressure;

            // Move to the start of this segment
            ctx.moveTo(points[i - 1].x, points[i - 1].y);

            // // Calculate mid-point for smoother quadratic curves
            // const midPoint = getMidPoint(points[i - 1], points[i]);
            // ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, midPoint.x, midPoint.y);
            ctx.stroke(); // Stroke this segment individually

            // // If it's the last point, draw directly to it to close the path
            if (i === points.length - 1) {
                ctx.lineTo(points[i].x, points[i].y);
                ctx.stroke();
            }
        }
    }

    function getMidPoint(point1, point2) {
        return {
            x: (point1.x + point2.x) / 2,
            y: (point1.y + point2.y) / 2,
        };
    }

    // this function apply a smooth through all points
    function smoothDrawAll() {
        if (fullPoints.length == 0) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            return;
        }

        // clear the canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let j = 0; j < fullPoints.length; j++) {
            let strokePoints = fullPoints[j];
            if (strokePoints.length < 3) continue;

            ctx.beginPath();
            ctx.moveTo(strokePoints[0].x, strokePoints[0].y);

            // Add a line to the first point to ensure the drawing starts correctly
            if (strokePoints.length < 3) {
                ctx.lineTo(strokePoints[1].x, strokePoints[1].y);
                ctx.lineWidth = strokePoints[0].pressure;
                ctx.stroke();
                return;
            }

            for (var i = 1; i < strokePoints.length - 2; i++) {
                var xc = (strokePoints[i].x + strokePoints[i + 1].x) / 2;
                var yc = (strokePoints[i].y + strokePoints[i + 1].y) / 2;
                ctx.lineWidth = strokePoints[i].pressure;
                // ctx.quadraticCurveTo(strokePoints[i].x, strokePoints[i].y, xc, yc);
                ctx.bezierCurveTo(strokePoints[i].x, strokePoints[i].y, xc, yc, xc, yc);
            }
            // Curve through the last two points
            // ctx.quadraticCurveTo(strokePoints[i].x, strokePoints[i].y, strokePoints[i + 1].x, strokePoints[i + 1].y);
            ctx.bezierCurveTo(
                strokePoints[i].x,
                strokePoints[i].y,
                strokePoints[i + 1].x,
                strokePoints[i + 1].y,
                strokePoints[i + 1].x,
                strokePoints[i + 1].y
            );

            ctx.stroke();
        }
    }

    function stopDrawing() {
        if (!isDrawing) return;
        isDrawing = false;
        points = [];
        smoothDrawAll();

        signature.there_is_signature = true;

        // Save the signature as a base64 encoded string in the signature variable
        signature.data = canvas.toDataURL();

        dispatch('update', signature);
    }

    function undo() {
        if (fullPoints.length == 0) return;
        fullPoints.pop();
        isDrawing = true;
        stopDrawing();
    }

    function getXY(e) {
        const rect = canvas?.getBoundingClientRect();
        return [(e.clientX || e.touches[0].clientX) - rect.left, (e.clientY || e.touches[0].clientY) - rect.top];
    }

    async function setupCanvas() {
        setTimeout(async () => {
            canvasLoaded = true;
            // await until the canvas is loaded
            if (!canvas) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
            // Adjust for high DPI displays
            const dpr = 2;
            // window.devicePixelRatio || 1;
            const rect = canvas?.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx = canvas?.getContext('2d');
            ctx.scale(dpr, dpr); // Scale all drawing to dpr

            // Now the canvas is at the correct internal resolution.
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.lineWidth = 3.7; // Adjust as needed
            ctx.imageSmoothingEnabled = true; // Ensure this is on for antialiasing
            // Add more styling as needed
        }, 300);
    }

    onMount(() => {
        // let initialWidth = window.innerWidth;
        setupCanvas();
        // after .5s from end of screen resize, reload the canvas
        let resizeTimer;
        window.addEventListener('resize', () => {
            // resize only if width is changed
            // if (initialWidth === window.innerWidth) return;
            clearTimeout(resizeTimer);
            canvasLoaded = false;
            resizeTimer = setTimeout(() => {
                setupCanvas();
                setTimeout(() => {
                    isDrawing = true;
                    stopDrawing();
                }, 1000);
            }, 500);
        });

        setTimeout(() => {
            if (signature.there_is_signature && signature.data) {
                // console.debug('Signature check loaded', signature.data);
                // draw the signature from the base64 encoded string to canvas
                // resizing the image to fit the canvas
                const img = new Image();
                img.onload = () => {
                    // Calculate the new size to maintain aspect ratio
                    const ratio = Math.min(canvas.width / img.width, canvas.height / img.height);
                    const newWidth = img.width * ratio;
                    const newHeight = img.height * ratio;
                    // Center the image on the canvas
                    const xOffset = (canvas.width - newWidth) / 2;
                    const yOffset = (canvas.height - newHeight) / 2;

                    let cnv = document.querySelector('.signature-box')?.getBoundingClientRect();

                    ctx.drawImage(img, xOffset, yOffset, parseInt(cnv?.width) || 0, parseInt(cnv?.height) || 0);
                };
                img.src = signature.data;
            }
        }, 600);
    });
</script>

{#if !canvasLoaded}
    <div class="signature-box bg-white">
        <div class="text-center d-flex align-items-center justify-content-center w-100 h-100">
            <div class="spinner spinner-primary spinner-lg" />
        </div>
    </div>
{:else}
    <div class="signature-box" style="z-index:999999999">
        <canvas
            bind:this={canvas}
            height="200"
            width={window.innerWidth > 800 ? '800' : 400}
            on:pointerdown={startDrawing}
            on:pointermove={draw}
            on:pointerup={stopDrawing}
            style="touch-action: none;"
            class="signature-canvas" />
        <div
            in:scale={{
                duration: 150,
                start: 0.98,
                easing: quintIn,
            }}
            class="signature-line" />
    </div>

    <div
        in:scale={{
            duration: 150,
            start: 0.98,
            easing: cubicIn,
        }}
        class="py-4 d-flex justify-content-between">
        <button class="btn btn-primary btn-sm font-weight-boldest" on:click|preventDefault={clearSignature}
            ><Broom size={18} weight={'duotone'} /> Cancella firma</button>

        <button class="btn btn-secondary btn-sm font-weight-boldest" on:click|preventDefault={undo}>
            <ArrowArcLeft size={18} weight={'duotone'} /> Indietro
        </button>
    </div>

    {#if signature.there_is_signature && previewEnabled}
        <div class="text-center" style={`width: ${window.innerWidth > 800 ? '800' : 400}px`}>
            {#if signature.data}
                <p class="text-muted">Anteprima</p>
            {/if}
            <img height="200" src={signature.data} alt="signature" />
        </div>
    {/if}
{/if}

<svelte:head>
    <style>
        .signature-box {
            border-radius: 0.55rem;
            /* width: 800px; */
            height: 200px;
            background: #f4f4f4;
            border: 0.2rem dashed #dedede;
        }

        .signature-canvas {
            width: 100%;
            height: 100%;
            z-index: 2;
            position: relative;
            cursor: crosshair;
        }
        .signature-line {
            position: relative;
            z-index: 1;
            top: -3rem;
            border: 0.1rem solid #cecece;
            margin: 0rem 2rem;
        }
    </style>
</svelte:head>
