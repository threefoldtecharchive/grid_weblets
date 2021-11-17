<template>
  <section class="editor">
    <aside class="editor__side menu">
      <p class="menu-label">Threefold Weblets</p>
      <ul class="menu-list">
        <li v-for="(el, idx) in weblets" :key="el.name" @click="active = idx">
          <a v-bind:class="{ 'is-active': idx === active }">
            {{ el.name }}
          </a>
        </li>
      </ul>
    </aside>

    <div class="editor__content" v-if="active >= 0">
      <div v-html="weblets[active].html" />
    </div>
    <div class="editor__area" v-if="active >= 0">
      <textarea spellcheck="false" v-model="weblets[active].md" />
    </div>
  </section>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import { parse } from "marked";

class Weblet {
  private _md: string;
  public html: string;
  public constructor(public name: string, symbol: string) {
    this._md = `<tf-${symbol}></tf-${symbol}>`;
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
  public weblets: Weblet[] = [
    new Weblet("Kubernetes", `kubernetes`),
    new Weblet("Virtual Machine", "vm"),
    new Weblet("Deployed List", "deployedlist"),
    new Weblet("CapRover", "caprover"),
    new Weblet("Farming Calculator", "farming-calculator"),
  ];
  public active = -1;
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
    will-change: transform;
    padding-bottom: 250px;
    @include nice-scroll;
  }

  &__area {
    position: fixed;
    bottom: 0;
    right: 0;
    width: calc(100% - 260px);
    height: 200px;

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
</style>
