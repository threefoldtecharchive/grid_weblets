<svelte:options tag={null} />

<script lang="ts">
  import type { ISidenavRoute } from "../../types";

  export let routes: ISidenavRoute[];
  export let root: boolean = true;

  function onRoute(route: ISidenavRoute) {
    console.log({ route });
  }

  const isLabel = ({ path, to }: ISidenavRoute) => !path && !to;
  const hasChildren = ({ children: c }: ISidenavRoute) => c && c.length;
</script>

{#if root}
  <section class="sidenav">
    <aside class="menu">
      {#each routes as route (route.label)}
        {#if isLabel(route)}
          <p class="menu-label">
            {route.label}
          </p>

          {#if hasChildren(route)}
            <svelte:self routes={route.children} root={false} />
          {/if}
        {/if}
      {/each}
    </aside>
  </section>
{:else}
  <ul class="menu-list">
    {#each routes as route (route.label)}
      <li>
        <a
          class={Math.random() > 0.5 ? "is-active" : ""}
          href={route.to}
          on:click|preventDefault={onRoute.bind(undefined, route)}
        >
          {route.label}
        </a>

        {#if hasChildren(route)}
          <svelte:self routes={route.children} root={false} />
        {/if}
      </li>
    {/each}
  </ul>
{/if}

<style scoped lang="scss">
  // @import "bulma/sass/utilities/_all.sass";
  // @import "bulma/sass/base/generic.sass";
  // @import "bulma/sass/components/menu.sass";
  @import url("/assets/bulma.min.css");

  .sidenav {
    position: fixed;
    top: 0;
    left: 0;
    width: 300px;
    height: 100vh;
    padding: 15px;
    overflow-x: hidden;
    overflow-y: auto;
    padding-bottom: 50px;
    border-right: 1px solid #e8e8e8;

    &::-webkit-scrollbar {
      width: 10px;
    }

    &::-webkit-scrollbar-thumb {
      background-color: #d3d3d3;
    }

    &::after {
      content: "";
      position: fixed;
      bottom: 0;
      height: 50px;
      width: 100%;
      left: 0;
      background-image: linear-gradient(
        rgba(245, 247, 249, 0),
        rgb(245, 247, 249)
      );
    }
  }
</style>
