<script lang="ts">
  import Base from "./elements/base/Base.wc.svelte";
  import ProfileManager from "./elements/profiles/Profiles.wc.svelte";

  import Fullvm from "./elements/fullvm/Fullvm.wc.svelte";
  import Vm from "./elements/vm/Vm.wc.svelte";
  import Kubernetes from "./elements/kubernetes/Kubernetes.wc.svelte";
  import Caprover from "./elements/caprover/Caprover.wc.svelte";
  import Peertube from "./elements/peertube/Peertube.wc.svelte";
  import Funkwhale from "./elements/funkwhale/Funkwhale.wc.svelte";
  import Mattermost from "./elements/Mattermost/Mattermost.wc.svelte";
  // import Mastodon from "./elements/Mastodon/Mastodon.wc.svelte";
  import Discourse from "./elements/discourse/Discourse.wc.svelte";
  import Taiga from "./elements/taiga/Taiga.wc.svelte";
  import Owncloud from "./elements/owncloud/Owncloud.wc.svelte";
  import Presearch from "./elements/presearch/Presearch.wc.svelte";
  import Subsquid from "./elements/subsquid/Subsquid.wc.svelte";
  import Casperlabs from "./elements/casperlabs/Casperlabs.wc.svelte";
  import NodePilot from "./elements/nodePilot/NodePilot.wc.svelte";
  import DeployedList from "./elements/DeployedList/DeployedList.wc.svelte";
  import ContractsList from "./elements/ContractsList/ContractsList.wc.svelte";
  import Algorand from "./elements/algorand/Algorand.wc.svelte";
  import QVM from "./elements/qvm/Qvm.wc.svelte";
  import Umbrel from "./elements/umbrel/umbrel.wc.svelte";
  import Wordpress from "./elements/wordpress/wordpress.wc.svelte";
  const weblets = [
    { name: "Full VM", cmp: Fullvm },
    { name: "Micro VM", cmp: Vm },
    { name: "Kubernetes", cmp: Kubernetes },
    { name: "Caprover", cmp: Caprover },
    { name: "Peertube", cmp: Peertube },
    { name: "Funkwhale", cmp: Funkwhale },
    { name: "Mattermost", cmp: Mattermost },
    // { name: "Mastodon", cmp: Mastodon },
    { name: "Discourse", cmp: Discourse },
    { name: "Taiga", cmp: Taiga },
    { name: "Owncloud", cmp: Owncloud },
    { name: "Presearch", cmp: Presearch },
    { name: "Subsquid", cmp: Subsquid },
    { name: "Casperlabs", cmp: Casperlabs },
    { name: "NodePilot", cmp: NodePilot },
    { name: "QVM", cmp: QVM },
    { name: "Algorand", cmp: Algorand },
    { name: "Umbrel", cmp: Umbrel },
    { name: "Wordpress", cmp: Wordpress },
    { name: "Deployed List", cmp: DeployedList },
    { name: "Contracts List", cmp: ContractsList },
  ];
  let selectedWebletIndex = weblets.findIndex(({ cmp }) => cmp === Fullvm);
  let self: HTMLDivElement;

  $: if (self && selectedWebletIndex > -1) {
    for (const child of self.children) child.remove();
    const Component = weblets[selectedWebletIndex].cmp;
    new Component({
      target: self,
    });
  }
</script>

<Base />
<ProfileManager />

<div style="display: flex; justify-content: center; flex-wrap: wrap;">
  {#each weblets as weblet, i (weblet.name)}
    <p
      style={"cursor: pointer; margin: 0 5px;" + (selectedWebletIndex === i ? `color: steelblue` : undefined)}
      on:click={() => (selectedWebletIndex = i)}
    >
      {weblet.name}
    </p>
    {#if i !== weblets.length - 1}
      |
    {/if}
  {/each}
</div>

<div bind:this={self} />
