<svelte:options tag="tf-freeflow"/>

<SelectProfile on:profile={({ detail }) => (profile = detail)}/>

<script lang="ts">
    import SelectProfile from "../../components/SelectProfile.svelte";
    import Input from "../../components/Input.svelte";
    import Tabs from "../../components/Tabs.svelte";
    import DeployBtn from "../../components/DeployBtn.svelte";
    import Alert from "../../components/Alert.svelte";
    import type {IFormField, ITab} from "../../types";
    import {IPackage, SelectCapacityUpdate} from "../../types";
    import type {IProfile} from "../../types/Profile";
    import type {GatewayNodes} from "../../utils/gatewayHelpers";
    import FreeFlow from "../../types/freeflow";
    import validateName, {isInvalid, validateFlistvalue, validateThreeBotName} from "../../utils/validateName";
    import {Env} from "../../types/vm";
    import SelectGatewayNode from "../../components/SelectGatewayNode.svelte";
    import SelectNodeId from "../../components/SelectNodeId.svelte";
    import {noActiveProfile} from "../../utils/message";
    import Modal from "../../components/DeploymentModal.svelte";
    import deployFreeFlow from "../../utils/deployFreeFlow";
    import hasEnoughBalance from "../../utils/hasEnoughBalance";
    import SelectCapacity from "../../components/SelectCapacity.svelte";

    const data = new FreeFlow();

    let profile: IProfile;

    let loading = false;
    let success = false;
    let failed = false;

    let invalidGateway = true;
    let status = "valid" | "invalid";

    let gateway: GatewayNodes;
    let modalData: Object;

    const validateFlist = {
        loading: false,
        error: null,
        validator: validateFlistvalue,
        invalid: false,
    };


    let selectCapacity = new SelectCapacityUpdate();

    let message: string;

    const deploymentStore = window.configs?.deploymentStore;
    const currentDeployment = window.configs?.currentDeploymentStore;

    const tabs: ITab[] = [
        {label: "Config", value: "config"},
    ];


    let active = "config";

    // define this solution packages
    const packages: IPackage[] = [
        {name: "Minimum", cpu: 1, memory: 1024 * 2, diskSize: 50},
        {name: "Standard", cpu: 2, memory: 1024 * 4, diskSize: 100},
        {name: "Recommended", cpu: 4, memory: 1024 * 4, diskSize: 150},
    ];

    const vmNameField: IFormField =
        {
            label: "Name",
            symbol: "name",
            placeholder: "Your 3bot name",
            type: "text",
            validator: validateName,
            invalid: false
        };


    // prettier-ignore
    const threebotNameField: IFormField =
        {
            label: "ThreeBot name",
            symbol: "name",
            placeholder: "Your 3bot name",
            type: "text",
            validator: validateThreeBotName,
            invalid: true
        };


    $: disabled = threebotNameField.invalid || invalidGateway || status != 'valid' || selectCapacity.invalid ||isInvalid([vmNameField])

    const deployFreeFlowHandler = () => {
        loading = true;

        const gatewayName = (data.threeBotUserId + '.' + gateway.nodeDomain);

        data.envs[1] = new Env(undefined, 'USER_ID', data.threeBotUserId)
        data.envs[2] = new Env(undefined, 'DIGITALTWIN_APPID', gatewayName)
        data.envs[3] = new Env(undefined, 'NODE_ENV', 'staging')

        if (!hasEnoughBalance()) {
            failed = true;
            loading = false;
            message =
                "No enough balance to execute transaction requires 2 TFT at least in your wallet.";
            return;
        }

        success = false;
        failed = false;
        message = undefined;

        deployFreeFlow(data, profile, gateway)
            .then((data) => {
                deploymentStore.set(0);
                success = true;
                modalData = data.deploymentInfo;
            })
            .catch((err: Error) => {
                failed = true;
                message = typeof err === "string" ? err : err.message;
            })
            .finally(() => {
                validateFlist.loading = false;
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


<div style="padding: 15px">
    <form class="box" on:submit|preventDefault={deployFreeFlowHandler}>
        <h4 class="is-size-4 mb-4">Deploy a FreeFlow Instance</h4>
        <p>
            Freeflow is a convenient ecosystem on top of a resilient internet grid. We bring you a new internet with a
            set of productivity tools so you can enhance collaboration within your country, your company, your community
            <!--            @TODO: fix URL-->
            <a
                    target="_blank"
                    href="https://library.threefold.me/info/manual/#/manual__weblets_freeflow"
            >
                Quick start documentation</a
            >
        </p>

        <hr/>

        {#if loading || (logs !== null && logs.type === "freeflow")}
            <Alert type="info" message={logs?.message ?? "Loading..."}/>

        {:else if !profile}
            <Alert type="info" message={noActiveProfile}/>

        {:else if success}
            <Alert
                    type="success"
                    message="Successfully Deployed FreeFlow."
                    deployed={true}
            />
        {:else if failed}
            <Alert type="danger" message={message || "Failed to Deploy FreeFlow."}/>
        {:else}
            <Tabs bind:active {tabs}/>

            <Input
                    bind:data={data.vmName}
                    bind:invalid={vmNameField.invalid}
                    field={vmNameField}
            />

            <Input
                    bind:data={data.threeBotUserId}
                    bind:invalid={threebotNameField.invalid}
                    field={threebotNameField}
            />

            <SelectCapacity
                    {packages}
                    selectedPackage={selectCapacity.selectedPackage}
                    cpu={data.cpu}
                    memory={data.memory}
                    diskSize={data.disks[0].size}
                    on:update={({ detail }) => {
            selectCapacity = detail;
            if (!detail.invalid) {
              const { cpu, memory, diskSize } = detail.package;
              data.cpu = cpu;
              data.memory = memory;
              data.disks[0].size = diskSize;
            }
          }}
            />
            <SelectGatewayNode
                    bind:gateway
                    bind:invalid={invalidGateway}

            />
            <SelectNodeId
                    publicIp={data.publicIp}
                    cpu={data.cpu}
                    memory={data.memory}
                    ssd={data.disks.reduce(
            (total, disk) => total + disk.size,
            data.rootFs
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

        <DeployBtn
                disabled={disabled}
                {loading}
                {success}
                {failed}
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
    <Modal data={modalData} on:closed={() => (modalData = null)}/>
{/if}

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>

