class ProfileManager{

    get getProfileManagerBtn(){
       return cy.get('tf-profiles')
       .shadow()
       .find('.profile-menu')
    }

    get getCreateProfileBtn(){
        return cy.get('tf-profiles')
        .shadow()
        .find('.tabs')
        .contains('Create Profile Manager')
    }

    get getProfilePasswordField(){
        return cy.get('tf-profiles')
        .shadow()
        .find('.input')
    }

    get getCreateNewProfileManagerBtn(){
        return cy.get('tf-profiles')
        .shadow()
        .find('.button')
    }

    get getProfileNameField(){
        return cy.get('tf-profiles')
        .shadow()
        .find(".input[placeholder='Profile Name']")
        .clear({force: true})
    }

    get getMnemonicsField(){
        return cy.get('tf-profiles')
        .shadow()
        .find("input[placeholder='Enter Your Mnemonics']")
    }

    get getPublicSShKeyField(){
        return cy.get('tf-profiles')
        .shadow()
        .find("input[placeholder='Your public SSH key will be added as default to all deployments.']")
    }
    
    get getActivateProfileButton(){
        return cy.get('tf-profiles')
        .shadow()
        .find("button[class='button']")
    }

    get getDeactivateProfileBtn(){
        return cy.get('tf-profiles')
        .shadow()
        .find("div:nth-child(3) > section:nth-child(1) > div:nth-child(1) > div:nth-child(1)")
        .contains('Deactivate')
    }

    get getBody(){
        return cy.get('body')
    }


    ActivateProfileManager(mnemonics, sshKey, profileSecret, vmName){
        
        //Open the profile manager
        this.getProfileManagerBtn.click()

        //Create a new profile manager
        this.getCreateProfileBtn.click()

        //Create a secret for the profile
        this.getProfilePasswordField.type(profileSecret,{force: true})

        //Confirm the secret
        this.getCreateNewProfileManagerBtn.click()

        //Change the profile name
        this.getProfileNameField.type(vmName,{force: true})

        //Add Mnemonics
        this.getMnemonicsField.type(mnemonics,{force: true})

        //Add SSH Key
        this.getPublicSShKeyField.type(sshKey,{force: true})
        
        //Activate The Profile
        this.getActivateProfileButton.click()

        //Click outside the modal to close it
        this.getBody.click(0,0)
    }


    //Deactivate the Profile Manager
    DeactivateProfile(){

        //Open the profile manager
        this.getProfileManagerBtn.click()

        //Deactivate the profile manager
        this.getDeactivateProfileBtn.click()

        //Click outside the modal to close it
        this.getBody.click(0,0)
    }

}

export default new ProfileManager();