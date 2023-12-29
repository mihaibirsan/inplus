<script>
    let showText = false;

    function handleStart() {
        showText = true;
    }

    function handleEnd() {
        showText = false;
    }
</script>

<div 
    on:mousedown={handleStart} 
    on:mouseup={handleEnd} 
    on:mouseleave={handleEnd}
    on:touchstart={handleStart}
    on:touchend={handleEnd}
    on:touchcancel={handleEnd}
>
    {#if showText}
        <slot />
    {:else}
        <p>Press and hold to show text</p>
    {/if}
</div>

<style>
    div {
        height: 200px;
        background-color: #eee;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 10px;
        color: #999;
    }
</style>