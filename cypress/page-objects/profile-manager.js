class ProfileManager {
  get getProfileManagerBtn() {
    return cy.get("tf-profiles");
  }

  get getMnemonicsField() {
    return cy.get("tf-profiles").shadow().find("input[placeholder='Mnemonics']");
  }

  get getPublicSShKeyField() {
    return cy.get("tf-profiles").shadow().find("#ssh");
  }

  get getProfileCloseButton() {
    return cy.get("tf-profiles").shadow().find("button").contains("Close");
  }

  get getBody() {
    return cy.get("body");
  }

  get alert() {
    return cy.get("tf-profiles").shadow().find(".help.is-danger");
  }

  ActivateProfileManager(mnemonics, sshKey) {
    //Open the profile manager
    this.getProfileManagerBtn.click();

    //Add Mnemonics
    this.getMnemonicsField.clear().type(mnemonics, { force: true, delay: 0, timeout: 10000 });

    //Add SSH Key
    this.getPublicSShKeyField.click();
    this.getPublicSShKeyField.invoke("val", sshKey);
    this.getPublicSShKeyField.type(" ", { force: true, delay: 0, timeout: 20000 });

    //Wait for SSH verification
    this.alert.should("not.exist");

    //Click outside the modal to close it
    this.getProfileCloseButton.click();
  }

  //Deactivate the Profile Manager
  DeactivateProfile() {
    //Open the profile manager
    this.getProfileManagerBtn.click();

    //Deactivate the profile manager
    this.getMnemonicsField.clear();

    //Click outside the modal to close it
    this.getProfileCloseButton.click();
  }
}

export default new ProfileManager();
