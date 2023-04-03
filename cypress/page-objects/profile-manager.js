class ProfileManager {
  get getProfileManagerBtn() {
    return cy.get("tf-profiles");
  }

  get getMnemonicsField() {
    return cy.get("tf-profiles").shadow().find("input[placeholder='Mnemonics']");
  }

  get getPublicSShKeyField() {
    return cy.get("tf-profiles").shadow().find("textarea");
  }

  get getProfileCloseButton() {
    return cy.get("tf-profiles").shadow().find("button").contains("Close");
  }

  get getBody() {
    return cy.get("body");
  }

  ActivateProfileManager(mnemonics, sshKey) {
    //Open the profile manager
    this.getProfileManagerBtn.click();

    //Add Mnemonics
    this.getMnemonicsField.clear().type(mnemonics, { force: true });

    //Add SSH Key
    this.getPublicSShKeyField.clear().type(sshKey, { force: true });

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
