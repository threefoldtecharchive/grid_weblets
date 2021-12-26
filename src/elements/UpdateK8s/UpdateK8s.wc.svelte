<svelte:options tag="tf-update-k8s" />

<script lang="ts">
  // libs
  import type { IProfile } from "../../types/Profile";
  import { noActiveProfile } from "../../utils/message";

  // components
  import SelectProfile from "../../components/SelectProfile.svelte";
  import Alert from "../../components/Alert.svelte";
  import type { IFormField } from "../../types";
  import Input from "../../components/Input.svelte";
  import { validateCpu, validateDisk, validateMemory } from "../../utils/validateName"; // prettier-ignore
  import DeployedList from "../../types/deployedList";

  let profile: IProfile;
  let loading: boolean = false;
  let message: string;
  let selecting: boolean = true;

  let selectedIdx: string = null;
  let k8s: any;

  // prettier-ignore
  const workerFields: IFormField[] = [
    { label: "Name", symbol: "name", placeholder: "Cluster instance name", type: "text" },
    { label: "CPU", symbol: "cpu", placeholder: "CPU cores", type: 'number', validator: validateCpu, invalid: false },
    { label: "Memory (MB)", symbol: "memory", placeholder: "Memory in MB", type: 'number', validator: validateMemory, invalid: false },
    { label: "Disk Size (GB)", symbol: "diskSize", placeholder: "Disk size in GB", type: 'number', validator: validateDisk, invalid: false },
    { label: "Public IP", symbol: "publicIp", type: 'checkbox' },
    { label: "Planetary Network", symbol: "planetary", placeholder: "Enable planetary network", type: 'checkbox' },
    { label: "Root FS Size (GB)", symbol: "rootFsSize", placeholder: "Root File System Size in GB", type: 'number' },
  ];
</script>

<SelectProfile on:profile={({ detail }) => (profile = detail)} />

<div style="padding: 15px;">
  <div class="box">
    <h4 class="is-size-4">Update a Kubernetes</h4>
    <hr />

    {#if !profile}
      <Alert type="info" message={noActiveProfile} />
    {:else if message}
      <Alert type="danger" {message} />
    {:else if selecting}
      {#await DeployedList.init(profile)}
        <Alert type="info" message="Loading..." />
      {:then list}
        {#await list.loadK8s()}
          <Alert type="info" message="Loading..." />
        {:then k8sList}
          {#if k8sList.length === 0}
            <Alert type="info" message="No k8s were found." />
          {:else}
            <Input
              bind:data={selectedIdx}
              field={{
                label: "Select K8S",
                type: "select",
                symbol: "k8s",
                options: [
                  {
                    label: "Select K8S",
                    value: null,
                    disabled: true,
                    selected: true,
                  },
                  ...k8sList.map((k8s, i) => {
                    console.log({ k8s });
                    // prettier-ignore
                    return { label: k8s.name, value: i.toString() };
                  }),
                ],
              }}
            />
            <div class="is-flex is-justify-content-center mt-2">
              <button
                class="button is-info"
                disabled={selectedIdx === null}
                on:click={() => {
                  selecting = false;
                  k8s = k8sList[selectedIdx];
                }}
              >
                Select K8S - {selectedIdx}
              </button>
            </div>
          {/if}
        {/await}
      {/await}
    {:else}
      here
      {JSON.stringify(k8s)}
    {/if}
  </div>
</div>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
