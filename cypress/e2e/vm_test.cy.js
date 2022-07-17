import profileManager from "../page-objects/profile-manager"
import vmPage from "../page-objects/vm-page"
import utils from "../utils/utils"

describe('Weblets', function(){

    let profileSecret = utils.generateString(10)
    let profileName = "Cypress" + utils.generateString(5)
    let vmName = "VM" + utils.generateString(5)
    let envVarKey = "TestKey" + utils.generateString(5)
    let envVarValue = "Value" + utils.generateString(5)
    let diskName = "DISK" + utils.generateString(5)
    let mountPoint = "/mnt/" + utils.generateString(5)

    let cpu = utils.generateInt(1,5)
    let memory = utils.generateInt(256,2048)
    let rootFs = utils.generateInt(2,3)
    let diskSize = utils.generateInt(1,20)
    let farmName = "Freefarm"
    
    before(function(){
        //Load data from fixtures/credentials.json
        cy.fixture('credentials.json').then(function(credentials){
            this.credentials = credentials
        })

        //URL can be changed from basUrl in cypress.config.ts
        cy.visit("/")
    })

    after(function(){

        //Deactivate the Profile Manager
        profileManager.DeactivateProfile()

    })

    it('TC394 - Unlock Profile Manager', function(){

        /**********************************************
         Test Suite: Weblets
         Test Cases: TC394 - Unlock Profile Manager
         Scenario:
            - Navigate to the weblets
            - Create a new profile
            - Enter the Profile Name, Mnemonics, SSH Key 
            - Activate the profile
        **********************************************/
        
        profileManager.ActivateProfileManager(this.credentials.Mnemonics ,this.credentials.SSH_KEY,profileSecret,profileName)
    })


    it('TC377 - Deploy VM', function(){

        /**********************************************
         Test Suite: Weblets
         Test Cases: TC377 - Deploy VM
         Scenario:
            - Configure the name and resources of the vm
            - Configure the Env Vars for them vm
            - Add a disk and configure it 
            - Select Node (Capacity Filter)
            - Deploy the vm
        **********************************************/
        
        //Navigate to the Virtual Machine Tab
        vmPage.Navigate()

        //Deploy the vm
        vmPage.Deploy(vmName,rootFs,cpu,memory,
            envVarKey,envVarValue,diskName,diskSize,mountPoint,farmName)
    })

    it('TC375 - Delete Deployment', function(){

        /*************************************************
         Test Suite: Weblets
         Test Cases: TC375 - Delete Deployment
         Scenario:
            - Select a deployment from the deployment list
            - Delete the deployment
        *************************************************/      

        //Delete the deployment
        vmPage.Delete(vmName)
    })

})
