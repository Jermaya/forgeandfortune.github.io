"use strict";

const Resources = Object.freeze({ORE:"ore",WOOD:"wood",LEATHER:"leather",HERB:"herb",BONE:"bone",FABRIC:"fabric",STEEL:"steel",SILVER:"silver",PAPER:"paper",MANA:"mana"});

class Material{
    constructor (props) {
        Object.assign(this, props);
        this.amt = 0;
        this.img = `<img src='images/resources/${this.id}.png' alt='${this.name}'>`;
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.amt = this.amt;
        return save;
    }
    loadSave(save) {
        this.amt = save.amt;
    }
}

const ResourceManager = {
    materials : [],
    createSave() {
        const save = [];
        this.materials.forEach(m=> {
            save.push(m.createSave());
        });
        return save;
    },
    loadSave(save) {
        save.forEach(m=> {
            const mat = this.idToMaterial(m.id);
            mat.loadSave(m);
        });
    },
    addNewMaterial(material) {
        this.materials.push(material);
    },
    addMaterial(res,amt) {
        const mat = this.materials.find(mat => mat.id === res); 
        mat.amt += amt;
        if (mat.amt === 0) $("#"+mat.id).hide();
        else $("#"+mat.id).show();
        $("#amt"+mat.id).html(formatToUnits(mat.amt,3));
    },
    canAffordMaterial(item) {
        for (const [material, amt] of Object.entries(item.mcost)) {
            if (amt > this.materialAvailable(material)) return false;
        }
        return true;
    },
    deductMoney(amt) {
        this.addMaterial("M001",-amt);
    },
    deductMaterial(item) {
        for (const [resource, amt] of Object.entries(item.mcost)) {
            this.addMaterial(resource,-amt);
        }
    },
    refundMaterial(item) {
        for (const [resource,amt] of Object.entries(item.mcost)) {
            this.addMaterial(resource,amt);
        }
    },
    materialIcon(type) {
        if (type[0] === "R") return recipeList.idToItem(type).itemPic();
        return `<img src="images/resources/${type}.png" alt="${type}">`
    },
    formatCost(res,amt) {
        return this.materialIcon(res)+"&nbsp;"+amt;
    },
    sidebarMaterial(resID) {
        const res = this.materials.find(resource => resource.id == resID)
        return `${this.materialIcon(resID)}&nbsp;&nbsp${res.amt}`
    },
    available(res,amt) {
        const item = recipeList.idToItem(res);
        if (item === undefined) {
            return this.idToMaterial(res).amt >= amt;
        }
        return Inventory.itemCount(res,0) >= amt;
    },
    materialAvailable(matID) {
        return this.materials.find(mat => mat.id === matID).amt;
    },
    nameForWorkerSac(mat) {
        const item = recipeList.idToItem(mat);
        if (item === undefined) return this.idToMaterial(mat).name;
        return item.name;
    },
    idToMaterial(matID) {
        return this.materials.find(m=>m.id === matID);
    },
    isAMaterial(matID) {
        return this.materials.some(m=>m.id === matID);
    },
    addDungeonDrops(drops) {
        drops.forEach(d => {
            this.addMaterial(d.id,d.amt);
        })
    },
    reOrderMats() {
        this.materials.sort((a,b) => a.tier - b.tier);
    },
    fortuneResource(lvl) {
        const resources = this.materials.filter(r=>r.fortuneLvl===lvl);
        const week = currentWeek();
        const good = resources[week%resources.length].id;
        const great = resources[(week+1)%resources.length].id;
        const epic = resources[(week+2)%resources.length].id;
        return [good,great,epic];
    }
}

const $materials = $("#materials");

function initializeMats() {
    ResourceManager.reOrderMats();
    ResourceManager.materials.forEach(mat => {
        const d = $("<div/>").addClass("material tooltip").attr("data-tooltip", mat.name).attr("id",mat.id);
        const d1 = $("<div/>").addClass("materialName").html(mat.img);
        const d2 = $("<div/>").addClass("materialAmt").attr("id","amt"+mat.id).html(formatToUnits(mat.amt,2));
        d.append(d1,d2);
        d.hide();
        $materials.append(d);
    })
}

function hardMatRefresh() {
    //used when we first load in
    ResourceManager.materials.forEach(mat=> {
        if (mat.amt === 0) $("#"+mat.id).hide();
        else $("#"+mat.id).show();
        $("#amt"+mat.id).html(formatToUnits(mat.amt,2));
    })
}

$(document).on("click",".material",(e) => {
    e.preventDefault();
    openTab("recipesTab");
    const matID = $(e.currentTarget).attr("id");
    initializeRecipes(matID,"default");
});