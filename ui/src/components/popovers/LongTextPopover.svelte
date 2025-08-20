<script>
    import { convert } from 'html-to-text';
    import {onMount} from "svelte";

    export let text = '';
    export let lenSubstring = 50;

    let convertedText;
    let truncatedText;
    let showEllipsis;

    $: convertedText = convert(text.replace(/&lt;/g, '<').replace(/&gt;/g, '>'));
    $: truncatedText = convertedText.substring(0, lenSubstring);
    $: showEllipsis = text.length > lenSubstring;

    onMount(() => {
        jQuery('body').tooltip({selector: '[data-toggle=tooltip]', trigger: 'hover'});
    });
</script>


<span
    style="word-break: keep-all; { showEllipsis ? 'cursor: pointer;' : ''}"
    data-toggle="tooltip"
    data-container="body"
    data-placement="left"
    title={convertedText}
>
    {truncatedText}{showEllipsis ? '...' : ''}
</span>