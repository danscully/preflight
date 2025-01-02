<script>
  import { onMount } from "svelte";
  import { Button } from "../lib/components/ui/button";
  import { Input } from "../lib/components/ui/input";
  import { Label } from "../lib/components/ui/label";
  import * as Select from "../lib/components/ui/select";
  import { Card } from "../lib/components/ui/card";

  // Initial list of rules
  export let rules = [];

  onMount(() => {
    // Load initial rules
    console.log('Rule Component mounted')
  });

  const addRule = () => {
    rules.push(
      {
        name: "",
        severity: "Info",
        condition: "",
        test: "",
        message: "",
        error: "",
      },
    );

    rules = rules
  };

  const deleteRule = (index) => {
    rules.splice(index,1)
    rules = rules
  };

</script>

<div>
  {#each rules as rule, index}
    <Card class="m-4 p-4">
      <div class="flex flex-row justify-start mt-2">
        <div class="mr-2">
          <Label class="mb-1 text-xs inline-block" for="name">Rule Name:</Label>
          <Input
            disabled
            id="name"
            class="text-xs"
            type="text"
            bind:value={rule.name}
          />
        </div>
        <div class="grow">
          <Label class="mb-1 text-xs inline-block">Condition:</Label>
          <Input
            disabled
            type="text"
            class="text-xs"
            bind:value={rule.condition}
          />
        </div>
      </div>
      <div class="mt-2">
      <Label class="mb-1 text-xs inline-block">Test:</Label>
      <Input
        disabled
        type="text"
        class="text-xs"
        bind:value={rule.test}
      />
    </div>
      <div class="flex flex-row justify-start mt-2">
        <div class="mr-2">
          <Label class="mb-1 text-xs inline-block" for="severity">Severity:</Label>
          <Select.Root
            disabled
            id="severity"
            class="text-xs"
            bind:selected={rule.severity}
          >
            <Select.Trigger class="w-[180px]">
              <Select.Value placeholder="Severity" />
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="Error" label="Error" />
              <Select.Item value="Warning" label="Warning" />
              <Select.Item value="Info" label="Info" />
            </Select.Content>
          </Select.Root>
        </div>
        <div class="grow">
          <Label class="mb-1 text-xs inline-block">Message:</Label>
          <Input
            disabled
            type="text"
            class="text-xs"
            bind:value={rule.message}
          />
        </div>
      </div>

      {#if rule.error}
        <div class="text-red-500 text-sm">{rule.error}</div>
      {/if}

      <div class="mt-4 hidden">
      <Button variant="destructive" class="text-xs" on:click={() => deleteRule(index)}
        >Delete</Button
      >
      <Button variant="outline" class="text-xs" on:click={addRule}>Add Rule</Button>
    </div>
    </Card>
  {/each}
</div>
