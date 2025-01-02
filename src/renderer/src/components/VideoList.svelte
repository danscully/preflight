<script>
  import {
    Collapsible,
    CollapsibleTrigger,
    CollapsibleContent,
  } from "../lib/components/ui/collapsible";

  import { Card } from "../lib/components/ui/card";
  import { Separator } from "$lib/components/ui/separator";

  // Example icons from lucide-svelte. Replace or customize as needed.
  import {
    AlertCircle,
    AlertTriangle,
    Info,
    ChevronRight,
  } from "lucide-svelte";

  // Expect videos to be passed in as an array of objects:
  // [
  //   {
  //     name: string,
  //     mediainfo: object,
  //     userdata: object,
  //     errors?: {
  //       severity: "Error" | "Warning" | "Info",
  //       message: string
  //     }[]
  //   }, ...
  // ]
  export let videos = [];


  /**
   * Returns errors matching the given severity.
   * @param {Array} errors
   * @param {string} severity
   * @returns {Array}
   */
  function getErrorsBySeverity(errors, severity) {
    return errors ? errors.filter((err) => err.severity === severity) : [];
  }

  /**
   * Checks if a video has any errors (of any severity).
   * @param {Array} errors
   * @returns {boolean}
   */
  function hasAnyError(errors) {
    return errors && errors.length > 0;
  }
</script>

<div>
  {#each videos as video}
    <div class="p-4">
      <!-- Header (always visible) -->
      <div class="flex items-center space-x-2">
        <span class="font-semibold">{video.filename}</span>
      </div>

      <div>
        <!-- Errors collapsible -->
            {#if hasAnyError(video.errorList)}
              <div>
                {#each getErrorsBySeverity(video.errorList, "Error") as error}
                  <div class="flex items-center text-red-600">
                    <AlertCircle class="w-4 h-4 mt-1 mr-2" />
                    <span class="text-sm">{error.message}</span>
                  </div>
                {/each}
                {#each getErrorsBySeverity(video.errorList, "Warning") as warning}
                  <div class="flex items-center text-yellow-600">
                    <AlertTriangle class="w-4 h-4 mt-1 mr-2" />
                    <span class="text-sm">{warning.message}</span>
                  </div>
                {/each}
                {#each getErrorsBySeverity(video.errorList, "Info") as infoError}
                  <div class="flex items-center text-blue-600">
                    <Info class="w-4 h-4 mt-1 mr-2" />
                    <span class="text-sm">{infoError.message}</span>
                  </div>
                {/each}
              </div>
            {:else}
              <div class="text-sm text-white">No errors.</div>
            {/if}

        <!-- Mediainfo collapsible -->
        {#if video.mediaInfo}
          <Collapsible class="mt-1 space-y-0">
            <CollapsibleTrigger class="flex w-full justify-start text-grey-300 items-center cursor-pointer">
              <span class="text-xs">Mediainfo </span><ChevronRight class="w-4 h-4"></ChevronRight>
            </CollapsibleTrigger>
            <CollapsibleContent class="p-4">
              <pre class="border rounded text-sm mt-2 mb-2 overflow-auto">
                {JSON.stringify(video.mediaInfo, null, 2)}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        {/if}

        {#if video.userData}
          <Collapsible class="mt-0 space-y-0">
            <CollapsibleTrigger class="flex w-full justify-start text-grey-300 items-center cursor-pointer">
              <span class="text-xs">User Data</span><ChevronRight class="w-4 h-4"></ChevronRight>
            </CollapsibleTrigger>
            <CollapsibleContent class="p-4">
              <pre class="border rounded text-sm mt-2 overflow-auto">
                {JSON.stringify(video.userData, null, 2)}
              </pre>
            </CollapsibleContent>
          </Collapsible>
        {/if}
      </div>
    </div>
    <Separator class="space-y-2"/>
  {/each}
</div>
