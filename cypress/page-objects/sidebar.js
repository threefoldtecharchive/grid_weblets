class SideBar {
  SelectFromSidebar(solutionName) {
    return cy.get(".editor__side.menu").contains(solutionName).click();
  }
}

export default new SideBar();
