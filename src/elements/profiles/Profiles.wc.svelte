<svelte:options tag="tf-profiles" />

<script lang="ts">
  let showPassword = false;
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
            <div class="control is-flex-grow-1 mr-3">
              <input id="mnemonics" class="input" type={showPassword ? "text" : "password"} placeholder="Mnemonics" />
              <i
                class="fas"
                class:fa-eye={showPassword}
                class:fa-eye-slash={!showPassword}
                style:position="absolute"
                style:top="50%"
                style:transform="translateY(-50%)"
                style:right="10px"
                style:cursor="pointer"
                on:click|stopPropagation={() => (showPassword = !showPassword)}
              />
            </div>
            <button class="button is-small is-primary">Create Account</button>
          </div>
          <!-- is-success -->
        </div>
        <!-- <p class="help is-success">This username is available</p> -->
      </div>

      <div class="field mt-2">
        <label class="label mb-0" for="ssh">Public SSH Key</label>
        <p class="mb-2 is-size-6 has-text-grey">
          SSH Keys are used to authenticate you to the Mastodon instance for management purposes. If you don't have an
          SSH Key or are not familiar, we can generate one for you.
        </p>
        <div class="is-flex is-justify-content-space-between">
          <div class="control is-flex-grow-1 mr-3">
            <textarea id="ssh" class="textarea" placeholder="Textarea" style:resize="none" />
          </div>
          <button class="button is-small is-primary">Generate SSH Keys</button>
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
