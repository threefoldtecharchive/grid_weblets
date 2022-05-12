<template>
  <section class="editor">
    <aside class="editor__side menu" style="padding-bottom: 100px">
      <img class="logo" src="../../../src/assets/images/logoTF.png" />
      <template v-for="section in sections">
        <p class="menu-label" :key="section + 'label'">{{ section }}</p>
        <ul class="menu-list" :key="section + 'items'">
          <template v-for="(el, idx) in weblets">
            <li
              :key="el.name"
              @click="
                section === 'coming soon' || idx === active
                  ? null
                  : route(el.symbol)
              "
              v-if="el.section === section"
            >
              <a
                v-if="section !== 'coming soon'"
                v-bind:class="{ 'is-active': idx === active }"
              >
                {{ el.name }}
              </a>

              <p
                v-if="section === 'coming soon'"
                class="menu-label"
                style="
                  text-transform: inherit;
                  margin-left: 1rem;
                  margin-bottom: 0.5rem;
                  font-size: 0.8rem;
                "
              >
                {{ el.name }}
              </p>
            </li>
          </template>
        </ul>
      </template>
      <span
        style="
          position: fixed;
          bottom: 15px;
          left: 245px;
          z-index: 99;
          transform: translateX(-100%);
          font-size: 0.9rem;
        "
        class="tag is-info is-light"
      >
        <tf-version></tf-version>
      </span>
    </aside>

    <div class="editor__content" v-if="active >= 0">
      <tf-disclaimer></tf-disclaimer>
      <nav class="navbar" role="navigation" aria-label="main navigation">
        <div class="navbar-end mt-2 mb-2 mr-2" style="height: 112px">
          <tf-profiles></tf-profiles>
        </div>
      </nav>
      <div v-html="weblets[active].html" />
    </div>
    <!-- <div class="editor__area" v-if="active >= 0">
      <textarea spellcheck="false" v-model="weblets[active].md" />
    </div> -->
  </section>
</template>

<script lang="ts">
import { Component, Vue, Watch } from "vue-property-decorator";
import { parse } from "marked";

class Weblet {
  private _md: string;
  public html: string;
  public constructor(
    public name: string,
    public symbol: string,
    deployment = "",
    public section: "deployment" | "calculator" | "my account"
  ) {
    this._md = `<tf-${symbol}></tf-${symbol}>`;
    if (deployment) {
      this._md += `<tf-deployedlist tab="${deployment}"></tf-deployedlist>`;
    }
    this.html = parse(this._md, {
      sanitize: false,
    });
  }

  public get md(): string {
    return this._md;
  }

  public set md(_md: string) {
    this._md = _md;
    this.html = parse(_md, {
      sanitize: false,
    });
  }
}

@Component({
  name: "Editor",
})
export default class Editor extends Vue {
  public sections = ["deployment", "my account", "calculator"];
  public weblets: Weblet[] = [
    new Weblet("Virtual Machine", "vm", "vm", "deployment"),
    new Weblet("Kubernetes", `kubernetes`, "k8s", "deployment"),
    new Weblet("CapRover", "caprover", "caprover", "deployment"),

    new Weblet("Peertube", "peertube", "peertube", "deployment"),
    new Weblet("Funkwhale", "funkwhale", "funkwhale", "deployment"),

    new Weblet("Mattermost", "mattermost", "mattermost", "deployment"),
    new Weblet("Discourse", "discourse", "discourse", "deployment"),

    new Weblet("Taiga", "taiga", "taiga", "deployment"),
    new Weblet("Owncloud", "owncloud", "owncloud", "deployment"),
    new Weblet("Presearch", "presearch", "presearch", "deployment"),
    new Weblet("Casperlabs", "casperlabs", "casperlabs", "deployment"),

    new Weblet("Contracts", "contractslist", "", "my account"),
    new Weblet("Deployments", "deployedlist", "", "my account"),

    new Weblet("Farming Calculator", "farming-calculator", "", "calculator"),
  ];
  public active = 0;

  @Watch("$route.params", { deep: true, immediate: true })
  public onRouterChange(to: { component?: string }) {
    const idx = this.weblets.findIndex((w) => w.symbol === to.component);
    this.active = idx > -1 ? idx : 0;
  }

  route(symbol: string): void {
    this.$router.push("/" + symbol).catch();
  }
}
</script>

<style lang="scss" scoped>
@mixin nice-scroll {
  &::-webkit-scrollbar {
    width: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #d3d3d3;
  }
}

.editor {
  padding-left: 260px;
  position: relative;

  &__side {
    position: fixed;
    top: 0;
    left: 0;
    height: 100vh;
    width: 260px;
    padding: 15px;
    border-right: 1px solid #dbdbdb;
    overflow-x: hidden;
    overflow-y: auto;
    @include nice-scroll;
  }

  &__content {
    height: 100vh;
    overflow-x: hidden;
    overflow-y: auto;
    // will-change: transform; // This 100% a bug in CSS
    padding-bottom: 250px;
    @include nice-scroll;
  }

  &__area {
    position: fixed;
    bottom: 0;
    right: 0;
    width: calc(100% - 260px);
    height: 50px;

    textarea {
      height: 100%;
      width: 100%;
      resize: none;
      border: none;
      padding: 15px;
      background-color: #333;
      color: #ccc;
      font-size: 18px;
      outline: none;
      @include nice-scroll;
    }
  }
}

.logo {
  display: block;
  width: 185px;
  margin: 15px 15px 30px;
}

.menu {
  background-color: #064663;
}
.menu-list a,
.menu-label {
  color: #fff;
}
.is-active {
  color: #3e8ed0;
}
.menu-list a:hover {
  color: #000;
}
</style>
