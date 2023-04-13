import sidebar from "./sidebar";

class Virtualmachine {
  get getVmNameField() {
    return cy.get("tf-vm").shadow().find("input[placeholder='Virtual Machine Name']").clear({ force: true });
  }

  get getVmImageList() {
    return cy
      .get("tf-vm")
      .shadow()
      .find(
        "div:nth-child(2) > form:nth-child(1) > div:nth-child(8) > section:nth-child(2) > div:nth-child(4) > div:nth-child(2) > select:nth-child(1)",
      );
  }

  get getRootFsBtn() {
    return cy
      .get("tf-vm")
      .shadow()
      .find(
        "div:nth-child(2) > form:nth-child(1) > div:nth-child(8) > section:nth-child(2) > div:nth-child(5) > div:nth-child(2) > div:nth-child(2) > div:nth-child(1) > label:nth-child(1)",
      );
  }

  get getRootFsField() {
    return cy.get("tf-vm").shadow().find("input[placeholder='rootFs Size']").clear({ force: true });
  }

  get getCpuField() {
    return cy.get("tf-vm").shadow().find("input[placeholder='CPU vCores']").clear({ force: true });
  }

  get getMemoryField() {
    return cy.get("tf-vm").shadow().find("input[placeholder='Your Memory in MB']").clear({ force: true });
  }

  get getConfigTab() {
    return cy.get("tf-vm").shadow().find(".tabs.is-centered");
  }

  get getAddEnvBtn() {
    return cy
      .get("tf-vm")
      .shadow()
      .find(".is-flex.is-justify-content-flex-end.is-align-items-center")
      .contains("+ Add");
  }

  get getEnvVarKeyField() {
    return cy
      .get("tf-vm")
      .shadow()
      .find(
        "div:nth-child(2) > form:nth-child(1) > div:nth-child(8) > section:nth-child(3) > div:nth-child(2) > div:nth-child(2)",
      )
      .find("input[placeholder= 'Environment Key']");
  }

  get getEnvVarValueField() {
    return cy
      .get("tf-vm")
      .shadow()
      .find(
        "div:nth-child(2) > form:nth-child(1) > div:nth-child(8) > section:nth-child(3) > div:nth-child(2) > div:nth-child(2)",
      )
      .find("input[placeholder= 'Environment Value']");
  }

  get getAddDiskBtn() {
    return cy
      .get("tf-vm")
      .shadow()
      .find(
        "div:nth-child(2) > form:nth-child(1) > div:nth-child(8) > section:nth-child(4) > div:nth-child(1) > button:nth-child(1)",
      )
      .contains("+ Add");
  }

  get getDiskNameField() {
    return cy.get("tf-vm").shadow().find("input[placeholder= 'Disk Name']").clear({ force: true });
  }

  get getDiskSizeField() {
    return cy.get("tf-vm").shadow().find("input[placeholder='Disk size in GB']").clear({ force: true });
  }

  get getMountPointField() {
    return cy.get("tf-vm").shadow().find("input[placeholder='Disk Mount Point']").clear({ force: true });
  }

  get getNodeSelectionList() {
    return cy
      .get("tf-vm")
      .shadow()
      .find(
        "div:nth-child(2) > form:nth-child(1) > div:nth-child(8) > section:nth-child(2) > div:nth-child(19) > div:nth-child(2) > select:nth-child(1)",
      );
  }

  get getFarmsList() {
    return cy
      .get("tf-vm")
      .shadow()
      .find(
        "div:nth-child(2) > form:nth-child(1) > div:nth-child(8) > section:nth-child(2) > div:nth-child(22) > div:nth-child(2) > select:nth-child(1)",
      );
  }

  get getApplySelectionBtn() {
    return cy.get("tf-vm").shadow().find(".button.mt-2.mb-2");
  }

  get getDeployBtn() {
    return cy.get("tf-vm").shadow().find(".button[type='submit']");
  }

  get getDeploymentModalBox() {
    return cy
      .get("tf-vm")
      .shadow()
      .find("div:nth-child(4) > div:nth-child(2) > div:nth-child(1) > div:nth-child(1)", { timeout: 300000 });
  }

  get getDeploymentName() {
    return cy
      .get("tf-vm")
      .shadow()
      .find(
        "div:nth-child(4) > div:nth-child(2) > div:nth-child(1) > section:nth-child(2) > div:nth-child(5) > div:nth-child(1)",
      )
      .find("div")
      .find("input");
  }

  get getDeploymentCpu() {
    return cy
      .get("tf-vm")
      .shadow()
      .find(
        "div:nth-child(4) > div:nth-child(2) > div:nth-child(1) > section:nth-child(2) > div:nth-child(13) > div:nth-child(1)",
      )
      .find("div")
      .find("input");
  }

  get getDeploymentMemory() {
    return cy
      .get("tf-vm")
      .shadow()
      .find(
        "div:nth-child(4) > div:nth-child(2) > div:nth-child(1) > section:nth-child(2) > div:nth-child(15) > div:nth-child(1)",
      )
      .find("div")
      .find("input");
  }

  get getDeploymentDiskName() {
    return cy
      .get("tf-vm")
      .shadow()
      .find(
        "div:nth-child(4) > div:nth-child(2) > div:nth-child(1) > section:nth-child(2) > div:nth-child(17) > div:nth-child(1)",
      )
      .find("p");
  }

  get getDeploymentDiskSize() {
    return cy
      .get("tf-vm")
      .shadow()
      .find(
        "div:nth-child(4) > div:nth-child(2) > div:nth-child(1) > section:nth-child(2) > div:nth-child(17) > div:nth-child(1)",
      )
      .find("div")
      .find("input");
  }

  get getBody() {
    return cy.get("body");
  }

  get getDeploymentList() {
    return cy
      .get("tf-deployedlist")
      .shadow()
      .find("div:nth-child(2) > section:nth-child(1) > div:nth-child(6)", { timeout: 60000 });
  }

  get getDeploymentListCheckBox() {
    return cy
      .get("tf-deployedlist")
      .shadow()
      .find(
        "div:nth-child(2) > section:nth-child(1) > div:nth-child(6) > table:nth-child(1) > tbody:nth-child(2) > tr:nth-child(1) > td:nth-child(1) > input:nth-child(1)",
      );
  }

  get getDeleteBtn() {
    return cy
      .get("tf-deployedlist")
      .shadow()
      .find(".is-flex.is-justify-content-space-between.is-align-items-center.mt-2.mb-2")
      .contains("Delete");
  }

  get getDeleteConfirmationBtn() {
    return cy.get("tf-deployedlist").shadow().find("button[class='button is-danger']");
  }

  get getDeploymentNotFoundText() {
    return cy
      .get("tf-deployedlist")
      .shadow()
      .contains("No Micro Virtual Machines found on this profile.", { timeout: 300000 });
  }

  Navigate() {
    sidebar.SelectFromSidebar("Micro Virtual Machine");
  }

  Deploy(vmName, rootFs, cpu, memory, envVarKey, envVarValue, diskName, diskSize, mountPoint, farmName) {
    /***********************
        Configure VM Resources
        ************************/

    //Change the VM Name
    this.getVmNameField.type(vmName, { force: true });

    //Change the VM Image
    this.getVmImageList.select("Alpine-3", { force: true }).should("have.value", "1");

    //Enable RootFS
    this.getRootFsBtn.click();

    //Change the RootFS
    this.getRootFsField.type(rootFs, { force: true });

    //Change the CPU
    this.getCpuField.type(cpu, { force: true });

    //Change the Memory
    this.getMemoryField.type(memory, { force: true });

    /***********************
        Configure Env Vars
        ************************/

    //Switch to the ENV Vars tab
    this.getConfigTab.contains("Environment Variables").click();

    //Add New ENV Var
    this.getAddEnvBtn.click();

    //Add Env Var Key
    this.getEnvVarKeyField.type(envVarKey, { force: true });

    //Add Env Var Value
    this.getEnvVarValueField.type(envVarValue, { force: true });

    /***********************
        Configure Disks
        ************************/

    //Switch to the Disks tab
    this.getConfigTab.contains("Disks").click();

    //Add New Disk
    this.getAddDiskBtn.click();

    //Change Disk Name
    this.getDiskNameField.type(diskName, { force: true });

    //Change Disk Size
    this.getDiskSizeField.type(diskSize, { force: true });

    //Change Mount Point
    this.getMountPointField.type(mountPoint, { force: true });

    //Return to the config tab
    this.getConfigTab.contains("Config").click();

    /***********************
        Node Selection
        ************************/

    //Select Capacity Filter
    this.getNodeSelectionList.select("Capacity Filter", { force: true }).should("have.value", "automatic");

    //Select FreeFarm
    this.getFarmsList.select(farmName, { force: true }).should("have.value", farmName);

    //Apply Selection
    this.getApplySelectionBtn.click();

    /***********************
        Deployment
        ************************/

    //Deploy VM
    this.getDeployBtn.wait(20000).click();

    //Verify that the vm is deployed from the Details Modal box
    this.getDeploymentModalBox.should("be.visible");

    //Verify Deployment Details
    this.getDeploymentName.should("have.value", vmName);
    this.getDeploymentCpu.should("have.value", cpu);
    this.getDeploymentMemory.should("have.value", memory);
    this.getDeploymentDiskSize.should("have.value", diskSize);
    this.getDeploymentDiskName.contains(mountPoint);

    //Click outside the modal to close it
    this.getBody.click(0, 0);
  }

  Delete(vmName) {
    // Get deployment name from the deployment list
    this.getDeploymentList.contains(vmName);

    //Click on the VM Checkbox
    this.getDeploymentListCheckBox.click({ force: true });

    //Click on the Delete Button
    this.getDeleteBtn.click({ force: true });

    //Click on the Confiramtion Delete Button
    this.getDeleteConfirmationBtn.click({ force: true });

    //Verify that the vm was deleted
    this.getDeploymentNotFoundText.should("be.visible");
  }
}

export default new Virtualmachine();
