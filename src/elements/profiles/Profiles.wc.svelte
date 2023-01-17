<svelte:options tag="tf-profiles" />

<script lang="ts" context="module">
  import { form } from "tf-svelte-rx-forms";
  import { mnemonics, noBalanceMessage, sshKey } from "../../types/profileManager";
</script>

<script lang="ts">
  let showPassword = false;

  // Mnemonics
  let mnemonicsLoading = false;
  let mnemonicsError = "";
  $: mnemonics$ = $mnemonics;
  $: mnemonicsIsDisabled = mnemonics$.pending || mnemonicsLoading;
  $: mnemonicsInvalid = (mnemonics$.touched || mnemonics$.dirty) && !mnemonics$.valid && !mnemonicsIsDisabled;
  $: mnemonicsHasError = (mnemonicsInvalid && mnemonics$.error) || mnemonicsError;

  async function createAccount() {
    mnemonicsLoading = true;
    mnemonicsError = "";
    const grid = new window.configs.grid3_client.GridClient(
      process.env.NETWORK as any,
      "",
      "test",
      new window.configs.client.HTTPMessageBusClient(0, "", "", ""),
    );
    grid._connect();

    try {
      const account = await grid.tfchain.createAccount("::1");
      mnemonics.setValue(account.mnemonic);
      mnemonics["__input"].value = account.mnemonic; // temp solution [svelte wc things :"(]
      mnemonics.markAsDirty();
      mnemonics.markAsTouched();
    } catch (e) {
      mnemonicsError = e.message;
    }
    mnemonicsLoading = false;
  }

  // SSH
  let sshLoading = false;
  let sshError = "";
  $: sshKey$ = $sshKey;
  $: sshIsDisabled = !mnemonics$.valid;
  $: sshInvalid = (sshKey$.touched || sshKey$.dirty) && !sshKey$.valid && !sshIsDisabled;
  $: sshHasError = (sshInvalid && sshKey$.error) || sshError;
</script>

<div class="modal is-active">
  <div class="modal-background" />
  <div class="modal-card" style:width="80%" style:max-width="80%">
    <header class="modal-card-head">
      <div class="modal-card-title">
        <h4 class="has-text-weight-bold mb-1">Profile Manager</h4>
        <span class="is-size-6">
          Please visit
          <a href="https://library.threefold.me/info/manual/#/manual__weblets_profile_manager" target="_blank">
            the manual
          </a>
          <span class="has-text-weight-medium">get started.</span>
        </span>
      </div>
      <button class="delete" aria-label="close" />
    </header>
    <section class="modal-card-body">
      <div class="field">
        <label class="label mb-0" for="mnemonics">Mnemonics</label>
        <p class="mb-2 is-size-6 has-text-grey">
          Mnemonics are your private key. They are used to represent you on the ThreeFold Grid. You can paste existing
          mnemonics or click the 'Create Account' button to create an account and generate mnemonics.
        </p>
        <div class="control has-icons-right">
          <div class="is-flex is-justify-content-space-between">
            <div class="control is-flex-grow-1 mr-3" class:is-loading={mnemonicsIsDisabled}>
              <input
                id="mnemonics"
                use:form={mnemonics}
                class="input"
                type={showPassword ? "text" : "password"}
                placeholder="Mnemonics"
                class:is-danger={mnemonicsInvalid}
                class:is-success={mnemonics$.valid}
                disabled={mnemonicsIsDisabled}
              />
              {#if !mnemonicsIsDisabled}
                <i
                  class="fas"
                  class:fa-eye={showPassword}
                  class:fa-eye-slash={!showPassword}
                  style:position="absolute"
                  style:top="12px"
                  style:right="10px"
                  style:cursor="pointer"
                  on:click|stopPropagation={() => (showPassword = !showPassword)}
                />
              {/if}
              {#if mnemonicsHasError}
                <p class="help is-danger">
                  {mnemonicsError || mnemonics$.error}
                </p>
              {/if}
            </div>
            <button
              class="button is-small is-primary mt-1"
              class:is-loading={mnemonicsIsDisabled}
              disabled={mnemonicsIsDisabled || mnemonics$.error === noBalanceMessage}
              on:click={createAccount}>Create Account</button
            >
          </div>
        </div>
      </div>

      <div class="field mt-2">
        <label class="label mb-0" for="ssh">Public SSH Key</label>
        <p class="mb-2 is-size-6 has-text-grey">
          SSH Keys are used to authenticate you to the Mastodon instance for management purposes. If you don't have an
          SSH Key or are not familiar, we can generate one for you.
        </p>
        <div class="is-flex is-justify-content-space-between">
          <div class="control is-flex-grow-1 mr-3">
            <textarea
              id="ssh"
              use:form={sshKey}
              class="textarea"
              placeholder="Textarea"
              style:resize="none"
              disabled={sshIsDisabled}
              class:is-danger={sshInvalid}
              class:is-success={sshKey$.valid}
            />
            {#if sshHasError}
              <p class="help is-danger">
                {sshHasError || sshKey$.error}
              </p>
            {/if}
          </div>
          <button class="button is-small is-primary" disabled={sshIsDisabled || sshKey$.valid}>Generate SSH Keys</button
          >
        </div>
      </div>
    </section>
    <footer class="modal-card-foot" />
  </div>
</div>

<style lang="scss" scoped>
  @import url("https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css");
  @import url("https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css");
</style>
