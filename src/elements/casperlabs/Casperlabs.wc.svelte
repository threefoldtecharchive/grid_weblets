<svelte:options tag="tf-casperlabs" />

<script lang="ts">
    // Types
    import type { IFormField, ITab } from "../../types";
    import type { IProfile } from "../../types/Profile";
    import { Disk, Env } from "../../types/vm";
    import Casperlabs from "../../types/casperlabs";
    // Modules
    import deployCasperlabs from "../../utils/deployCasperlabs";
    // Components
    import SelectProfile from "../../components/SelectProfile.svelte";
    import Input from "../../components/Input.svelte";
    import Tabs from "../../components/Tabs.svelte";
    import SelectNodeId from "../../components/SelectNodeId.svelte";
    import DeployBtn from "../../components/DeployBtn.svelte";
    import Alert from "../../components/Alert.svelte";
    import Modal from "../../components/DeploymentModal.svelte";
    import AlertDetailed from "../../components/AlertDetailed.svelte";
    import hasEnoughBalance from "../../utils/hasEnoughBalance";
    import validateName from "../../utils/validateName";
    import validateDomainName from "../../utils/validateDomainName";

    import { noActiveProfile } from "../../utils/message";

    let data = new Casperlabs();
    let domain: string, planetaryIP: string;

    data.disks = [new Disk()];
    let profile: IProfile;
    let active: string = "base";
    let loading = false;
    let success = false;
    let failed = false;

    const tabs: ITab[] = [{ label: "Base", value: "base" }];

    const nameField: IFormField = { label: "Name", placeholder: "Casperlabs Instance Name", symbol: "name", type: "text", validator: validateName, invalid: false }; // prettier-ignore

    let message: string;
    let modalData: Object;
    let status: "valid" | "invalid";

    const deploymentStore = window.configs?.deploymentStore;

    $: disabled = ((loading || !data.valid) && !(success || failed)) || !profile || status !== "valid" || nameField.invalid; // prettier-ignore
    const currentDeployment = window.configs?.currentDeploymentStore;

    async function onDeployVM() {
        loading = true;
        success = false;
        failed = false;
        message = undefined;

        if (!hasEnoughBalance()) {
            failed = true;
            loading = false;
            message =
                "No enough balance to execute! Transaction requires 2 TFT at least in your wallet.";
            return;
        }
        deployCasperlabs(data, profile)
            .then((data) => {
                deploymentStore.set(0);
                success = true;
                console.log("hereeeee");
                console.log(data);
                modalData = data.deployment;
                domain = data.domain;
                planetaryIP = data.planetaryIP;
            })
            .catch((err: Error) => {
                failed = true;
                message = typeof err === "string" ? err : err.message;
            })
            .finally(() => {
                loading = false;
            });
    }

    $: logs = $currentDeployment;
</script>

<SelectProfile
    on:profile={({ detail }) => {
        profile = detail;
        if (detail) {
            data.envs[0] = new Env(undefined, "SSH_KEY", detail?.sshKey);
        }
    }}
/>

<div style="padding: 15px;">
    <form on:submit|preventDefault={onDeployVM} class="box">
        <h4 class="is-size-4">Deploy an casperlabs Instance</h4>
        <hr />

        {#if loading || (logs !== null && logs.type === "VM")}
            <Alert type="info" message={logs?.message ?? "Loading..."} />
        {:else if !profile}
            <Alert type="info" message={noActiveProfile} />
        {:else if success}
            <AlertDetailed
                type="success"
                message="Successfully deployed casperlabs."
                {planetaryIP}
                {domain}
                deployed={true}
            />
        {:else if failed}
            <Alert
                type="danger"
                message={message || "Failed to deploy casperlabs."}
            />
        {:else}
            <Tabs bind:active {tabs} />

            {#if active === "base"}
                <Input
                    bind:data={data.name}
                    bind:invalid={nameField.invalid}
                    field={nameField}
                />

                <SelectNodeId
                    publicIp={data.publicIp}
                    cpu={data.cpu}
                    memory={data.memory}
                    ssd={data.disks.reduce(
                        (total, disk) => total + disk.size,
                        0
                    )}
                    bind:nodeSelection={data.selection.type}
                    bind:data={data.nodeId}
                    filters={data.selection.filters}
                    bind:status
                    {profile}
                    on:fetch={({ detail }) => (data.selection.nodes = detail)}
                    nodes={data.selection.nodes}
                />
            {/if}
        {/if}

        <DeployBtn
            {disabled}
            {loading}
            {failed}
            {success}
            on:click={(e) => {
                if (success || failed) {
                    e.preventDefault();
                    success = false;
                    failed = false;
                    loading = false;
                }
            }}
        />
    </form>
</div>
{#if modalData}
    <Modal data={modalData} on:closed={() => (modalData = null)} />
{/if}

<style lang="scss" scoped>
    @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>
