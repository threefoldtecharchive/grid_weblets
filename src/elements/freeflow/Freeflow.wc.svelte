<svelte:options tag="tf-freeflow"/>

<SelectProfile on:profile={({ detail }) => (profile = detail)}/>

<script lang="ts">
    import SelectProfile from "../../components/SelectProfile.svelte";
    import Input from "../../components/Input.svelte";
    import Tabs from "../../components/Tabs.svelte";
    import DeployBtn from "../../components/DeployBtn.svelte";
    import Alert from "../../components/Alert.svelte";
    import {noActiveProfile} from "../../utils/message";
    import type {IFormField, ITab} from "../../types";
    import type {IProfile} from "../../types/Profile";
    import type {GatewayNodes} from "../../utils/gatewayHelpers";
    import SelectGatewayNode from "../../components/SelectGatewayNode.svelte";
    import FreeFlow from "../../types/freeflow";
    import {validateKey, validateKeyValue} from "../../utils/validateName";
    import {Env} from "../../types/vm";
    import DeleteBtn from "../../components/DeleteBtn.svelte";
    import AddBtn from "../../components/AddBtn.svelte";


    const data = new FreeFlow();

    let profile: IProfile;

    let loading = false;
    let success = false;
    let failed = false;
    let invalid = true;
    let gateway: GatewayNodes;

    let message: string;

    const deploymentStore = window.configs?.deploymentStore;
    const currentDeployment = window.configs?.currentDeploymentStore;

    const tabs: ITab[] = [
        {label: "Config", value: "config"},
        {label: "Environment Variables", value: "env"},
    ];

    const envFields: IFormField[] = [
        { label: 'Key', symbol: 'key', placeholder: "Environment Key", type: "text", validator: validateKey, invalid:false},
        { label: 'Value', symbol: 'value', placeholder: "Environment Value", validator: validateKeyValue,type: "text" },
    ];

    let active = "config";


    const validateName = (name: string) => {
        if (name.length > 3) return 'Must be more than 3 characters'
    }

    // prettier-ignore
    const fields: IFormField[] = [
        {
            label: "Name",
            symbol: "name",
            placeholder: "Your 3bot name",
            type: "text",
            validator: validateName,
            invalid: false
        },
    ];


    const deployFreeFlowHandler = () => {

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
            <a
                    target="_blank"
                    href="https://library.threefold.me/info/manual/#/manual__weblets_freeflow"
            >
                Quick start documentation</a
            >
        </p>

        <hr/>

        {#if loading || (logs !== null && logs.type === "FreeFlow")}
            <Alert type="info" message={logs?.message ?? "Loading..."}/>
        <!--{:else if !profile}-->
        <!--    <Alert type="info" message={noActiveProfile}/>-->
        {:else if success}
            <Alert
                    type="success"
                    message="Successfully Deployed Discourse."
                    deployed={true}
            />
        {:else if failed}
            <Alert type="danger" message={message || "Failed to Deploy FreeFlow."}/>
        {:else}
            <Tabs bind:active {tabs}/>

            {#if active === "config"}
                {#each fields as field (field.symbol)}
                    {#if field.invalid !== undefined}
                        <Input
                                bind:data={data[field.symbol]}
                                bind:invalid={field.invalid}
                                {field}
                        />
                    {:else}
                        <Input bind:data={data[field.symbol]} {field}/>
                    {/if}
                {/each}


                <SelectGatewayNode
                        bind:gateway
                        bind:invalid={invalid}

                />

            {:else if active === "env"}
                <AddBtn on:click={() => (data.envs = [...data.envs, new Env()])} />
                <div class="nodes-container">
                    {#each data.envs as env, index (env.id)}
                        <div class="box">
                            <DeleteBtn
                                    name={env.key}
                                    on:click={() =>
                  (data.envs = data.envs.filter((_, i) => index !== i))}
                            />
                            {#each envFields as field (field.symbol)}
                                <Input bind:data={env[field.symbol]} {field} />
                            {/each}
                        </div>
                    {/each}
                </div>
            {/if}
        {/if}

        <DeployBtn
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

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
</style>

