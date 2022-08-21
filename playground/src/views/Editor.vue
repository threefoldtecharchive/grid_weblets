<template>
  <section class="editor">
    <aside class="editor__side menu" style="padding-bottom: 100px">
      <img class="logo" src="/images/logoTF.png" />
      <div class="network">{{ envs[network] }}</div>

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
              <a v-bind:class="{ 'is-active': idx === active }">
                <span class="icon-text">
                  <span class="icon" v-if="el.img">
                    <img :src="'/icons/' + el.img" alt="logo" />
                  </span>
                  <span class="ml-2">
                    {{ el.name }}
                  </span>
                </span>
              </a>
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
          background-color: #1982b1;
          color: white;
        "
        class="tag is-light"
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
    public section: "deployment" | "calculator" | "my account",
    public img: string | null = null
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
  data: function () {
    return {
      envs: { dev: "DEVNET", test: "TESTNET", qa: "QANET", main: "MAINNET" },
      network: process.env.NETWORK != "" ? process.env.NETWORK : "dev",
    };
  },
})
export default class Editor extends Vue {
  public sections = ["deployment", "my account"];
  public weblets: Weblet[] = [
    new Weblet(
      "Full Virtual Machine",
      "fullvm",
      "fullvm",
      "deployment",
      "vm.png"
    ),
    new Weblet("Micro Virtual Machine", "vm", "vm", "deployment", "vm.png"),
    new Weblet(
      "Kubernetes",
      `kubernetes`,
      "k8s",
      "deployment",
      "kubernetes.png"
    ),
    new Weblet(
      "CapRover",
      "caprover",
      "caprover",
      "deployment",
      "caprover.png"
    ),

    new Weblet(
      "Peertube",
      "peertube",
      "peertube",
      "deployment",
      "peertube.png"
    ),
    new Weblet(
      "Funkwhale",
      "funkwhale",
      "funkwhale",
      "deployment",
      "funkwhale.png"
    ),

    new Weblet(
      "Mattermost",
      "mattermost",
      "mattermost",
      "deployment",
      "mattermost.png"
    ),
    new Weblet(
      "Discourse",
      "discourse",
      "discourse",
      "deployment",
      "discourse.png"
    ),

    new Weblet("Taiga", "taiga", "taiga", "deployment", "taiga.png"),
    new Weblet(
      "Owncloud",
      "owncloud",
      "owncloud",
      "deployment",
      "owncloud.png"
    ),
    new Weblet(
      "Presearch",
      "presearch",
      "presearch",
      "deployment",
      "presearch.png"
    ),
    new Weblet(
      "Casperlabs",
      "casperlabs",
      "casperlabs",
      "deployment",
      "casperlabs.png"
    ),
    /*new Weblet(
      "TFhub Validator",
      "validator",
      "tfhubValidator",
      "deployment",
      "vm.png"
    ),*/
    new Weblet("Node Pilot", "nodepilot", "nodepilot", "deployment", "vm.png"),

    new Weblet("Contracts", "contractslist", "", "my account", ""),
    new Weblet("Deployments", "deployedlist", "", "my account", ""),

    // new Weblet("Farming Calculator", "farming-calculator", "", "calculator"),
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
.network {
  font-size: 18px;
  display: block;
  color: white;
  background-color: rgb(25, 130, 177);
  text-align: center;
  padding: 5px;
  border-radius: 5px;
  font-weight: 400;
}
.menu {
  background-color: #333;
}

.menu-list a,
.menu-label {
  color: #fff;
}

.menu-list a {
  margin: 5px 0;
  transition: all 0.35s ease-in-out;
}

.menu-list a:hover,
.menu-list a.is-active {
  background-color: #1982b1;
  color: #fff;
}
</style>
