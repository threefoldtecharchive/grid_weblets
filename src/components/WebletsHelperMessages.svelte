<svelte:options tag="tf-weblets-helper-messages" />

<script lang="ts">
  import type { getShowData } from "../utils/getShowData";
  import { noActiveProfile } from "../utils/message";
  import Alert from "./Alert.svelte";

  const currentDeployment = window.configs?.currentDeploymentStore;

  export let showData: ReturnType<typeof getShowData>;
  export let message: string;

  $: logs = $currentDeployment;
</script>

<div style:display={showData.logs ? "block" : "none"}>
  <Alert type="info" message={logs?.message ?? "Loading..."} />
</div>

<div style:display={showData.noProfile ? "block" : "none"}>
  <Alert type="info" message={noActiveProfile} />
</div>

<div style:display={showData.success ? "block" : "none"}>
  <Alert type="success" message="Successfully Deployed Subsquid." deployed={true} />
</div>

<div style:display={showData.failed ? "block" : "none"}>
  <Alert type="danger" {message} />
</div>
