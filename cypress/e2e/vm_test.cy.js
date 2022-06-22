import profileManager from "../page-objects/profile-manager"
import sidebar from "../page-objects/sidebar"
import vmPage from "../page-objects/vm-page"
import utils from "../utils/utils"

describe('Weblets', function(){

    let profileSecret = utils.generateString(10)
    let profileName = "Cypress" + utils.generateString(5)
    let vmName = "VM" + utils.generateString(5)
    let envVarKey = "TestKey" + utils.generateString(5)
    let envVarValue = "Value" + utils.generateString(5)
    let diskName = "DISK" + utils.generateString(5)


    let cpu = 1
    let memory = 256
    let rootFs = 2
    let diskSize = 10
    let farmName = "Freefarm"
    let solutionName = "Virtual Machine"

    
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


        //Choose Virtual Machine from the sidebar
        sidebar.SelectFromSidebar(solutionName)

        //Configure the name and resources of the vm
        vmPage.ConfigureResources(vmName,rootFs,cpu,memory)

        //Configure the Env Vars for them vm
        vmPage.ConfigureEnvVars(envVarKey,envVarValue)

        //Add a disk and configure it 
        vmPage.ConfigureDisk(diskName,diskSize)

        //Select Node (Capacity Filter)
        vmPage.SelectNode(farmName)

        //Deploy the vm
        vmPage.DeployVM()
    })

    it('TC375 - Delete Deployment', function(){

        /*************************************************
         Test Suite: Weblets
         Test Cases: TC375 - Delete Deployment
         Scenario:
            - Select a deployment from the deployment list
            - Delete the deployment
        *************************************************/
        

        // Select a deployment from the deployment list
        vmPage.SelectDeployment(vmName)

        //Delete the deployment
        vmPage.DeleteVM()
    })

})
