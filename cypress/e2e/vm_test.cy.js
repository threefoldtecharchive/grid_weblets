
describe('Weblets', function(){

    //Load data from fixtures/credentials.json
    before(function(){
        cy.fixture('credentials.json').then(function(credentials){
            this.credentials = credentials
        })
    })

    it('Create a profile through the profile manager and activate it', function(){

        
        //Navigate to play.dev
        //URL can be changed from basUrl in cypress.config.ts
        cy.visit("/")

        //Open the profile manager
        cy.get('tf-profiles')
        .shadow()
        .find('.profile-menu')
        .click()

        //Create a profile manager
        cy.get('tf-profiles')
        .shadow()
        .find('.tabs')
        .contains('Create Profile Manager')
        .click()

        //Create a secret for the profile
        cy.get('tf-profiles')
        .shadow()
        .find('.input')
        .type('123456789',{force: true})

        //Confirm the secret
        cy.get('tf-profiles')
        .shadow()
        .find('.button')
        .click()

        //Change the profile name
        cy.get('tf-profiles')
        .shadow()
        .find(".input[placeholder='Profile Name']")
        .clear({force: true})
        .type('CypressTest',{force: true})

        //Add Mnemonics
        cy.get('tf-profiles')
        .shadow()
        .find("input[placeholder='Enter Your Mnemonics']")
        .type(this.credentials.Mnemonics,{force: true})
        
        //Add SSH Key
        cy.get('tf-profiles')
        .shadow()
        .find("input[placeholder='Your public SSH key will be added as default to all deployments.']")
        .type(this.credentials.SSH_KEY,{force: true})

        //Activate The Profile
        cy.get('tf-profiles')
        .shadow()
        .find("button[class='button']")
        .click()

        //Click outside the modal to close it
        cy.get('body')
        .click(0,0)

    })






    it('Configure and Deploy a VM', function(){

        /******************************
         * VM Config
        ********************************/

        //Change the VM Name
        cy.get('tf-vm')
        .shadow()
        .find("input[placeholder='Virtual Machine Name']")
        .clear({force: true})
        .type('CypressVM',{force: true})

        //Change the VM Image
        cy.get('tf-vm')
        .shadow()
        .find("div:nth-child(2) > form:nth-child(1) > div:nth-child(8) > div:nth-child(2)")
        .find('select')
        .select('Alpine-3',{force: true}).should('have.value','1')

        //Enable RootFS
        cy.get('tf-vm')
        .shadow()
        .find("div:nth-child(2) > form:nth-child(1) > div:nth-child(9) > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > label:nth-child(1) > span:nth-child(2)")
        .click()

        //Change the RootFS
        cy.get('tf-vm')
        .shadow()
        .find("input[placeholder='rootFs Size']")
        .clear({force: true})
        .type('2',{force: true})

        //Change the CPU
        cy.get('tf-vm')
        .shadow()
        .find("input[placeholder='CPU Cores']")
        .clear({force: true})
        .type('1',{force: true})

        //Change the Memory
        cy.get('tf-vm')
        .shadow()
        .find("input[placeholder='Your Memory in MB']")
        .clear({force: true})
        .type('256',{force: true})

        /******************************
         * Env Vars Config
        ********************************/

        //Switch to the ENV Vars tab
        cy.get('tf-vm')
        .shadow()
        .find('.tabs.is-centered')
        .contains('Environment Variables')
        .click()

        //Add New ENV Var
        cy.get('tf-vm')
        .shadow()
        .find('.is-flex.is-justify-content-flex-end.is-align-items-center')
        .contains('+ Add')
        .click()

        //Add Env Var Key
        cy.get('tf-vm')
        .shadow()
        .find("div:nth-child(2) > form:nth-child(1) > div:nth-child(6) > div:nth-child(2) > div:nth-child(3) > div:nth-child(1)")
        .find("input[placeholder= 'Environment Key']")
        .type('Test_Key', {force:true})

        //Add Env Var Value
        cy.get('tf-vm')
        .shadow()
        .find("div:nth-child(2) > form:nth-child(1) > div:nth-child(6) > div:nth-child(2) > div:nth-child(5) > div:nth-child(1)")
        .find("input[placeholder= 'Environment Value']")
        .type('Test 12345', {force:true})

        /******************************
         * Disk Config
        ********************************/

        //Switch to the Disks tab
        cy.get('tf-vm')
        .shadow()
        .find('.tabs.is-centered')
        .contains('Disks')
        .click()

        //Add New Disk
        cy.get('tf-vm')
        .shadow()
        .find('.is-flex.is-justify-content-flex-end.is-align-items-center')
        .contains('+ Add')
        .click()

        //Change Disk Name
        cy.get('tf-vm')
        .shadow()
        .find("input[placeholder= 'Disk Name']")
        .clear({force:true})
        .type('TestDisk123', {force:true})

        //Change Disk Size
        cy.get('tf-vm')
        .shadow()
        .find("input[placeholder='Disk size in GB']")
        .clear({force:true})
        .type('10', {force:true})

        //Return to the config tab
        cy.get('tf-vm')
        .shadow()
        .find('.tabs.is-centered')
        .contains('Config')
        .click()

        /******************************
         * Select Node (Capacity Filter)
        ********************************/

         //Select Capacity Filter
         cy.get('tf-vm')
         .shadow()
         .find("div:nth-child(2) > form:nth-child(1) > div:nth-child(21)")
         .find('select')
         .select('Capacity Filter',{force: true}).should('have.value','automatic')
 
         //Select FreeFarm
         cy.get('tf-vm')
         .shadow()
         .find("div:nth-child(2) > form:nth-child(1) > div:nth-child(24)")
         .find('select')
         .select('Freefarm',{force: true}).should('have.value','Freefarm')

         
         //Apply Selection
         cy.get('tf-vm')
         .shadow()
         .find('.button.mt-2.mb-2')
         .click()

 
         /******************************
         * Deploy VM
        ********************************/
       
        //Deploy VM
        cy.get('tf-vm')
        .shadow()
        .find(".button[type='submit']")
        .click()


        //Verify that the vm is deployed from the Details Modal box
        cy.get('tf-vm')
        .shadow()
        .find("div:nth-child(4) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1)", {timeout:300000})
        .should('be.visible')

        
        //Click outside the modal to close it
        cy.get('body')
        .click(0,0)

        /****************************************
         * Verify Deployment From Deployment List
        ****************************************/
        
        // Get Deployment Name from deployment List 
        cy.get("tf-deployedlist[tab='vm']")
        .shadow()
        .find("div:nth-child(2) > section:nth-child(1) > div:nth-child(5)",{timeout:60000})
        .contains("CypressVM")
         

        /****************************************
         * Delete Deployment From Deployment List
        ****************************************/

        //Click on the VM Checkbox
        cy.get("tf-deployedlist[tab='vm']")
        .shadow()
        .find("div:nth-child(2) > section:nth-child(1) > div:nth-child(5) > table:nth-child(1) > thead:nth-child(1) > tr:nth-child(1) > th:nth-child(1) > input:nth-child(1)")
        .click({force:true})

        //Click on the Delete Button
        cy.get("tf-deployedlist[tab='vm']")
        .shadow()
        .find('.is-flex.is-justify-content-space-between.is-align-items-center.mt-2.mb-2')
        .contains('Delete')
        .click({force:true})

        //Verify that the vm was deleted
        cy.get("tf-deployedlist[tab='vm']")
        .shadow()
        .contains("No VMs found on this profile.", {timeout:300000})
        .should('be.visible')

    })



    it('Deactivate the profile after the flow is done', function(){

        //Open the profile manager
        cy.get('tf-profiles')
        .shadow()
        .find('.profile-menu')
        .click()

        //Deactivate the profile manager
        cy.get('tf-profiles')
        .shadow()
        .find("div:nth-child(3) > section:nth-child(1) > div:nth-child(1) > div:nth-child(1)")
        .contains('Deactivate')
        .click()

        //Click outside the modal to close it
        cy.get('body')
        .click(0,0)

    })

})
