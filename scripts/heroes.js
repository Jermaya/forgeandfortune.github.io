"use strict";

const $heroTab = $("#heroTab");

class Hero {
    constructor (props) {
        Object.assign(this, props);
        this.uniqueid = this.id;
        this.ap = 0;
        this.apAdd = 5;
        this.apmax = 100;
        this.armor = 0;
        this.crit = 5;
        this.hp = this.initialHP;
        this.pow = this.initialPow;
        this.critdmg = 2;
        this.dodgeChance = 0;
        this.target = "first";
        this.unitType = "hero";
        this.slot1 = null;
        this.slot2 = null;
        this.slot3 = null;
        this.slot4 = null;
        this.slot5 = null;
        this.slot6 = null;
        this.image = '<img src="images/heroes/'+this.id+'.gif">';
        this.head = '<img src="images/heroes/heads/'+this.id+'.png">';
        this.owned = false;
        this.inDungeon = false;
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.hp = this.hp;
        save.ap = this.ap;
        save.inDungeon = this.inDungeon;
        if (this.slot1 === null) save.slot1 = null;
        else save.slot1 = this.slot1.createSave();
        if (this.slot2 === null) save.slot2 = null;
        else save.slot2 = this.slot2.createSave();
        if (this.slot3 === null) save.slot3 = null;
        else save.slot3 = this.slot3.createSave();
        if (this.slot4 === null) save.slot4 = null;
        else save.slot4 = this.slot4.createSave();
        if (this.slot5 === null) save.slot5 = null;
        else save.slot5 = this.slot5.createSave();
        if (this.slot6 === null) save.slot6 = null;
        else save.slot6 = this.slot6.createSave();
        save.owned = this.owned;
        return save;
    }
    loadSave(save) {
        this.hp = save.hp;
        this.ap = save.ap;
        this.inDungeon = save.inDungeon;
        if (save.slot1 !== null) {
            this.slot1 = new itemContainer(save.slot1.id,save.slot1.rarity);
            this.slot1.loadSave(save.slot1);
        }
        if (save.slot2 !== null) {
            this.slot2 = new itemContainer(save.slot2.id,save.slot2.rarity);
            this.slot2.loadSave(save.slot2);
        }
        if (save.slot3 !== null) {
            this.slot3 = new itemContainer(save.slot3.id,save.slot3.rarity);
            this.slot3.loadSave(save.slot3);
        }
        if (save.slot4 !== null) {
            this.slot4 = new itemContainer(save.slot4.id,save.slot4.rarity);
            this.slot4.loadSave(save.slot4);
        }
        if (save.slot5 !== null) {
            this.slot5 = new itemContainer(save.slot5.id,save.slot5.rarity);
            this.slot5.loadSave(save.slot5);
        }
        if (save.slot6 !== null) {
            this.slot6 = new itemContainer(save.slot6.id,save.slot6.rarity);
            this.slot6.loadSave(save.slot6);
        }
        this.owned = save.owned;
    }
    getArmor() {
        if (this.ignoredArmor) return 0;
        if (this.armorBuff) return this.armor + Math.round(this.getAdjPow() * 0.2);
        return this.armor;
    }
    getPow() {
        let pow = this.initialPow;
        if (this.slot1 !== null) pow += this.slot1.pow();
        if (this.slot2 !== null) pow += this.slot2.pow();
        if (this.slot3 !== null) pow += this.slot3.pow();
        if (this.slot4 !== null) pow += this.slot4.pow();
        if (this.slot5 !== null) pow += this.slot5.pow();
        if (this.slot6 !== null) pow += this.slot6.pow();
        return pow;
    }
    getAdjPow() {
        return Math.floor(this.getPow());
    }
    getPowSlot(slot) {
        if (slot === 0 && this.slot1 !== null) return this.slot1.pow();
        if (slot === 1 && this.slot2 !== null) return this.slot2.pow();
        if (slot === 2 && this.slot3 !== null) return this.slot3.pow();
        if (slot === 3 && this.slot4 !== null) return this.slot4.pow();
        if (slot === 4 && this.slot5 !== null) return this.slot5.pow();
        if (slot === 5 && this.slot6 !== null) return this.slot6.pow();
        return 0;
    }
    getHPSlot(slot) {
        if (slot === 0 && this.slot1 !== null) return this.slot1.hp();
        if (slot === 1 && this.slot2 !== null) return this.slot2.hp();
        if (slot === 2 && this.slot3 !== null) return this.slot3.hp();
        if (slot === 3 && this.slot4 !== null) return this.slot4.hp();
        if (slot === 4 && this.slot5 !== null) return this.slot5.hp();
        if (slot === 5 && this.slot6 !== null) return this.slot6.hp();
        return 0;
    }
    getAPSlot(slot) {
        if (slot === 0 && this.slot1 !== null) return this.slot1.ap();
        if (slot === 1 && this.slot2 !== null) return this.slot2.ap();
        if (slot === 2 && this.slot3 !== null) return this.slot3.ap();
        if (slot === 3 && this.slot4 !== null) return this.slot4.ap();
        if (slot === 4 && this.slot5 !== null) return this.slot5.ap();
        if (slot === 5 && this.slot6 !== null) return this.slot6.ap();
        return 0;
    }
    addAP() {
        if (this.slot1 === null) {
            this.ap += 5;
            return;
        };
        this.ap += this.slot1.ap();
    }
    apAdded() {
        if (this.slot1 === null) return 5;
        return this.slot1.ap();
    }
    heal(hp) {
        if (this.hp ===0) return;
        this.hp = Math.min(this.hp+hp,this.maxHP());
        refreshHPBar(this);
    }
    healPercent(hpPercent) {
        if (this.hp === 0) return;
        this.hp += Math.floor(this.maxHP()*hpPercent/100);
        this.hp = Math.min(this.maxHP(),this.hp);
        refreshHPBar(this);
    }
    damageCurrentPercent(dmgPercent) {
        this.hp = Math.floor(this.hp*dmgPercent/100)
        this.hp = Math.max(1,this.hp)
        refreshHPBar(this);
    }
    dead() {
        return this.hp === 0;
    }
    alive() {
        return this.hp > 0;
    }
    getEquipSlots() {
        //return an object with 
        return [this.slot1,this.slot2,this.slot3,this.slot4,this.slot5,this.slot6];
    }
    equip(item,slot) {
        if (slot === 0) this.slot1 = item;
        if (slot === 1) this.slot2 = item;
        if (slot === 2) this.slot3 = item;
        if (slot === 3) this.slot4 = item;
        if (slot === 4) this.slot5 = item;
        if (slot === 5) this.slot6 = item;
    }
    removeSlot(slot) {
        if (slot === 0) this.slot1 = null;
        if (slot === 1) this.slot2 = null;
        if (slot === 2) this.slot3 = null;
        if (slot === 3) this.slot4 = null;
        if (slot === 4) this.slot5 = null;
        if (slot === 6) this.slot6 = null;
    }
    slotTypesByNum(num) {
        const slots = [this.slot1Type,this.slot2Type,this.slot3Type,this.slot4Type,this.slot5Type,this.slot6Type];
        return slots[num];
    }
    getSlotTypes() {
        return [this.slot1Type,this.slot2Type,this.slot3Type,this.slot4Type,this.slot5Type,this.slot6Type];
    }
    slotTypeIcons(num) {
        let s = ""
        this.slotTypesByNum(num).forEach(slot => {
            s += slot.toUpperCase() + "<br>";
        })
        return s;
    }
    slotEmpty(slot) {
        return this.getEquipSlots()[slot] === null;
    }
    getSlot(slot) {
        return this.getEquipSlots()[slot];
    }
    maxHP() {
        let hp = this.initialHP;
        if (this.slot1 !== null) hp += this.slot1.hp();
        if (this.slot2 !== null) hp += this.slot2.hp();
        if (this.slot3 !== null) hp += this.slot3.hp();
        if (this.slot4 !== null) hp += this.slot4.hp();
        if (this.slot5 !== null) hp += this.slot5.hp();
        if (this.slot6 !== null) hp += this.slot6.hp();
        return hp;
    }
    missingHP() {
        return this.maxHP()-this.hp;
    }
    unequip(slot) {
        if (Inventory.full()) {
            Notifications.inventoryFull();
            return;
        }
        const item = this.getSlot(slot);
        if (item === null) return;
        this.removeSlot(slot);
        Inventory.addItemContainerToInventory(item);
    }
    hasEquip(type) {
        if (this.slot1Type.includes(type)) return this.slot1 !== null;
        if (this.slot2Type.includes(type)) return this.slot2 !== null;
        if (this.slot3Type.includes(type)) return this.slot3 !== null;
        if (this.slot4Type.includes(type)) return this.slot4 !== null;
        if (this.slot5Type.includes(type)) return this.slot5 !== null;
        if (this.slot6Type.includes(type)) return this.slot6 !== null;
    }
    getEquip(type) {
        if (this.slot1Type.includes(type)) return this.slot1;
        if (this.slot2Type.includes(type)) return this.slot2;
        if (this.slot3Type.includes(type)) return this.slot3;
        if (this.slot4Type.includes(type)) return this.slot4;
        if (this.slot5Type.includes(type)) return this.slot5;
        if (this.slot6Type.includes(type)) return this.slot6;
    }
    healCost() {
        return Math.floor(Math.pow(1.05, (this.maxHP()-this.hp)/miscLoadedValues.hltFactor));
    }
    healPay() {
        const amt = this.healCost();
        if (ResourceManager.materialAvailable("M001") < amt) {
            Notifications.cantAffordHealHero();
            return;
        }
        ResourceManager.deductMoney(amt);
        this.healPercent(100);
        refreshHealPartyCost();
    }
    equipUpgradeAvailable(slot) {
        const types = this.slotTypesByNum(slot)
        const currentPow = this.getPowSlot(slot);
        const currentHP = this.getHPSlot(slot);
        const invMaxPow = Inventory.getMaxPowByTypes(types);
        const invMaxHP = Inventory.getMaxHPByTypes(types);
        return invMaxPow > currentPow || invMaxHP > currentHP;
    }
    canEquipType(type) {
        return this.slot1Type.includes(type) || this.slot2Type.includes(type) || this.slot3Type.includes(type) || this.slot4Type.includes(type) || this.slot5Type.includes(type) || this.slot6Type.includes(type);
    }
}

const HeroManager = {
    heroes : [],
    heroView : null,
    addHero(hero) {
        this.heroes.push(hero);
    },
    createSave() {
        const save = [];
        this.heroes.forEach(h=> {
            save.push(h.createSave());
        });
        return save;
    },
    loadSave(save) {
        save.forEach(h => {
            const hero = this.idToHero(h.id);
            hero.loadSave(h);
        })
    },
    heroOwned(ID) {
        return this.idToHero(ID).owned;
    },
    idToHero(ID) {
        return this.heroes.find(hero => hero.id === ID);
    },
    isHeroID(ID) {
        return this.heroes.some(hero => hero.id === ID);
    },
    equipItem(containerID,heroID,slot) {
        const item = Inventory.containerToItem(containerID);
        const hero = this.idToHero(heroID);
        Inventory.removeContainerFromInventory(containerID);
        hero.unequip(slot);
        hero.equip(item,slot);
    },
    getSlotTypes(slot,heroID) {
        const hero = this.idToHero(heroID);
        return hero.slotTypesByNum(slot);
    },
    slotEmpty(slot,heroID) {
        const hero = this.idToHero(heroID);
        return hero.slotEmpty(slot);
    },
    unequip(slot,heroID) {
        const hero = this.idToHero(heroID);
        hero.unequip(slot);
    },
    ownedHeroes() {
        return this.heroes.filter(hero => hero.owned);
    },
    relativePow(heroID,slot,pow) {
        const hero = this.idToHero(heroID);
        return pow - hero.getPowSlot(slot);
    },
    relativeHP(heroID,slot,hp) {
        const hero = this.idToHero(heroID);
        return hp - hero.getHPSlot(slot);
    },
    relativeAP(heroID,slot,ap) {
        const hero = this.idToHero(heroID);
        return ap - hero.getAPSlot(slot);
    },
    gainHero(heroID) {
        this.idToHero(heroID).owned = true;
        initializeHeroList();
        //refreshHeroSelect();
        updateHeroCounter();
    },
    heroPower(hero) {
        return `<div class="pow_img">${miscIcons.pow}</div><div class="pow_interger">${hero.getPow()}</div>`
    },
    slotsByItem(item) {
        //return a list of heroes and the appropriate slot
        const type = item.type;
        const results = [];
        this.heroes.filter(h=>h.owned && h.canEquipType(type)).forEach(hero=> {
            const hres = {}
            hres.id = hero.id;
            hres.canEquip = [];
            hero.getSlotTypes().forEach(slot => {
                hres.canEquip.push(slot.includes(type));
            });
            results.push(hres);
        });
        return results;
    },
}

const $heroList = $("#heroList");

function initializeHeroList() {
    $heroList.empty();
    HeroManager.heroes.forEach(hero => {
        const d = $("<div/>").addClass("heroOwnedCard").attr("data-value",hero.id);
        const d1 = $("<div/>").addClass("heroOwnedImage").html(hero.head);
        const d2 = $("<div/>").addClass("heroOwnedName").html(hero.name);
        const d3 = $("<div/>").addClass("heroPower").html(HeroManager.heroPower(hero));
        d.append(d1,d2,d3);
        if (!hero.owned) d.hide();
        $heroList.append(d);
    });
    if (HeroManager.heroes.filter(h=>!h.owned).length > 0) {
        const amt = miscLoadedValues.heroCost[HeroManager.heroes.filter(h=>h.owned).length];
        const bh1 = $("<div/>").addClass("buyNewHeroCard")
        const bh2 = $("<div/>").addClass("buyNewHeroTitle").html(`Looking for more Heroes?`);
        const bh3 = $("<div/>").addClass("buyNewHeroDesc").html(`Gain notoriety with the Action League to unlock more!`);
        bh1.append(bh2,bh3);
        $heroList.append(bh1);
    }
}

const $heroDetails = $("#heroDetails");
const $heroGearSlots = $("#heroGearSlots");

function examineHero(ID) {
    const hero = HeroManager.idToHero(ID);
    $heroDetails.empty();
    $heroGearSlots.empty();
    const heroExamineTop = $("<div/>").addClass("heroExamineTop heroExamineContainer");
    const d1 = $("<div/>").addClass("heroExamineName").html(hero.name);
    const d2 = $("<div/>").addClass("heroExamineImage").html(hero.image);
    const d3 = $("<div/>").addClass("heroExamineDescription").html(hero.description);
    const d4 = $("<div/>").addClass("heroExamineLvlClassContainer");
        $("<div/>").addClass("heroClassHeading").html("Hero Class").appendTo(d4);
        $("<div/>").addClass("heroClassText").html(hero.class).appendTo(d4);
    const d5 = $("<div/>").addClass("heroAbilityContainer");
        $("<div/>").addClass("heroAbilityHeading").html("Hero Ability").appendTo(d5);
        $("<div/>").addClass("heroAbilityText").html(hero.abilityDesc).appendTo(d5);
    heroExamineTop.append(d1,d2,d3,d4,d5);
    const heroExamineStats = $("<div/>").addClass("heroExamineStats heroExamineContainer");
    const htd = $("<div/>").addClass("heroExamineHeading");
    const htd1 = $("<div/>").addClass("heroExamineStatHeading").html("Hero Stats");
    heroExamineStats.append(htd.append(htd1));
    const stats = [hero.maxHP(),hero.getPow(), hero.apmax, hero.getArmor(), hero.crit+"%", hero.critdmg*100+"%", hero.dodgeChance+"%"];
    const statName = ["MAX HP","POW","AP","ARMOR","CRIT","CRDMG","DODGE"];
    for (let i=0;i<stats.length;i++) {
        heroExamineStats.append(statRow(statName[i],stats[i]));
    }

    const lowerDiv = $("<div/>").addClass("heroExamineEquip");
    const slots = hero.getEquipSlots();
    const slotName = ["Weapon","Head","Armament","Chest","Handheld","Accessory"]
    $.each(slots, (slotNum,equip) => {
        let equipText = "";
        let equipRarity = 0
        let equipLevel = null;
        let equipStats = null;
        if (equip !== null) {
            equipText = equip.picName();
            equipRarity = equip.rarity;
            equipLevel = `<div class="level_text">LVL</div><div class="level_integer">${equip.lvl}</div>`;
            const td1 = $('<div/>').addClass('gearStatContainer');
                const td1a = $('<div/>').addClass('gearStat gearStatHP').html(miscIcons.hp + equip.hp());
                const td2b = $('<div/>').addClass('gearStat gearStatAP').html(miscIcons.ap + equip.ap());
                td1.append(td1a,td2b);
            const td2 = $('<div/>').addClass('gearStatContainer');
                const td2a = $('<div/>').addClass('gearStat gearStatPow').html(miscIcons.pow + equip.pow());
                td2.append(td2a);
            equipStats = $('<div/>').addClass('equipStatContainer').append(td1,td2);
        }
        else {
            equipText = hero.slotTypeIcons(slotNum);
        }
        const d5 = $("<div/>").addClass("heroExamineEquipment").attr("data-value",slotNum).attr("id","hEE"+slotNum).attr("heroID",ID);
        if (hero.equipUpgradeAvailable(slotNum)) d5.addClass("equipUpgradeAvailable")
        const d5a = $("<div/>").addClass("heroExamineEquipmentSlot").html(slotName[slotNum]);
        const d5b = $("<div/>").addClass("heroExamineEquipmentEquip").addClass("R"+equipRarity).html(equipText);
        if (equipLevel !== null) {
            const d5b1 = $("<div/>").addClass("equipLevel").html(equipLevel);
            d5b.append(d5b1);
        }
        if (equipStats !== null) {
            const d5b2 = $("<div/>").addClass("equipStats").html(equipStats);
            d5b.append(d5b2);
        }
        let d5c = "";
        if (equip === null) {
            d5c = "";
        } else {
            d5c = $("<div/>").addClass("heroExamineEquipmentEquipTypes").html(hero.slotTypeIcons(slotNum));
        }
        if (equip === null) d5b.addClass("heroExamineEquipmentEquipEmpty");
        
        lowerDiv.append(d5.append(d5a,d5b,d5c));
    });
    
    $heroDetails.append(heroExamineTop,heroExamineStats);
    $heroGearSlots.append(lowerDiv);
}

function statRow(name,value) {
    const d1 = $("<div/>").addClass("heroExamineStatRow");
    const d2 = $("<div/>").addClass("heroExamineStatRowName").html(name);
    const d3 = $("<div/>").addClass("heroExamineStatRowValue").html(value);
    return d1.append(d2,d3);
}


const $heroEquipmentList = $("#heroEquipmentList");

let examineGearSlotCache = null;
let examineGearHeroIDCache = null;
let examineGearTypesCache = [];

function clearExaminePossibleEquip() {
    $heroEquipmentList.empty();
    examineGearHeroIDCache = null;
    examineGearSlotCache = null;
    examineGearTypesCache = [];
}
function examineHeroPossibleEquip(slot,heroID) {
    examineGearSlotCache = slot;
    examineGearHeroIDCache = heroID;
    const types = HeroManager.getSlotTypes(slot,heroID);
    examineGearTypesCache = types;
    $heroEquipmentList.empty();
    //cycle through everything in bp's and make the div for it
    const equipCardsContainer = $('<div/>').addClass('EquipmentCardsContainer');
    const equipCardsHeader = $('<div/>').addClass('EquipmentCardsHeader').html("Select Your Equipment");
    equipCardsContainer.append(equipCardsHeader);
    // Check if gear available to display in list
    if (Inventory.listbyType(types).length === 0) {
        const noGearMessage = $('<div/>').addClass('noGearMessage').html(`You have no gear available to equip in this slot.`);
        $heroEquipmentList.append(equipCardsContainer,noGearMessage);
        return;
    }
    
    let upgradeAvaialable = false;
    Inventory.listbyType(types).forEach((itemContainer) => {
        const td1 = $('<div/>').addClass('gearItemName').html(itemContainer.picName());
        const relPow = HeroManager.relativePow(heroID,slot,itemContainer.pow());
        const relHP = HeroManager.relativeHP(heroID,slot,itemContainer.hp());
        const relAP = HeroManager.relativeAP(heroID,slot,itemContainer.ap());
        const td2 = $('<div/>').addClass('gearItemLevel').html(itemContainer.itemLevel());
        // Sets container for HP and AP, keep POW seperate to emphasize POW 
        const td3 = $('<div/>').addClass('gearStatContainer');
            const td3a = $('<div/>').addClass('gearStat gearStatHP tooltip').attr("data-tooltip","HP");
            const td3b = $('<div/>').addClass('gearStat gearStatAP tooltip').attr("data-tooltip","AP");
            td3.append(td3a,td3b);
        const td4 = $('<div/>').addClass('gearStatContainer');
            const td4a = $('<div/>').addClass('gearStat gearStatPow tooltip').attr("data-tooltip","POW");
            td4.append(td4a);
        // Populate HP value and compare to currently equipped item, if applicable
        if (relHP > 0) td3a.addClass("gearStatPositive").html(miscIcons.hp + itemContainer.hp() + " (+" + relHP + ")");
        else if (relHP < 0) td3a.addClass("gearStatNegative").html(miscIcons.hp + itemContainer.hp() + " (" + relHP + ")");
        else td3a.html(miscIcons.hp + itemContainer.hp());
        // Populate AP value and compare to currently equipped item, if applicable
        if (relAP > 0) td3b.addClass("gearStatPositive").html(miscIcons.ap + itemContainer.ap() + " (+" + relAP + ")");
        else if (relAP < 0) td3b.addClass("gearStatNegative").html(miscIcons.ap + itemContainer.ap() + " (" + relAP + ")");
        else td3b.html(miscIcons.ap + itemContainer.ap());
        // Populate POW value and compare to currently equipped item, if applicable
        if (relPow > 0) td4a.addClass("gearStatPositive").html(miscIcons.pow + itemContainer.pow() + " (+" + relPow + ")");
        else if (relPow < 0) td4a.addClass("gearStatNegative").html(miscIcons.pow + itemContainer.pow() + " (" + relPow + ")");
        else td4a.html(miscIcons.pow + itemContainer.pow() + " (+" + relPow + ")");

        const row = $('<div/>').addClass('gearItem').addClass("R"+itemContainer.rarity).attr("id",itemContainer.containerID).attr("heroID",heroID).append(td1,td2,td3,td4);
        equipCardsContainer.append(row);
    });

    $heroEquipmentList.append(equipCardsContainer);
    //returns a value if this slot has an upgrade available
    return upgradeAvaialable;
};

function unequipSlot(slot,heroID) {
    HeroManager.unequip(slot,heroID);
    examineHero(heroID);
}

const $heroCount = $(".heroCount");
const $heroCountText = $(".heroCountText");
const $heroCounter = $(".heroCounter");

function updateHeroCounter() {
    const count = HeroManager.heroes.filter(h=>h.owned && !h.inDungeon).length;
    if (count === 0) {
        $heroCounter.addClass("heroesCountZero").removeClass("heroesCountActive");
        return;
    }
    $heroCounter.addClass("heroesCountActive").removeClass("heroesCountZero");
    $heroCount.html(count);
    if (count == 1) $heroCountText.html(" Hero Available");
    else $heroCountText.html(" Heroes Available");
}

$(document).on('click',".heroCounter", (e) => {
    e.preventDefault();
    tabClick(e, "dungeonsTab");
});

$(document).on('click', "div.heroOwnedCard", (e) => {
    //pop up the detailed character card
    e.preventDefault();
    equippingTo = null;
    const ID = $(e.currentTarget).attr("data-value");
    $(".heroOwnedCard").removeClass("highlight");
    $(e.currentTarget).addClass("highlight");
    HeroManager.heroView = ID;
    examineHero(ID);
    clearExaminePossibleEquip();
});

$(document).on('click', "div.heroExamineEquipment", (e) => {
    //select an item type to display what you can equip
    e.preventDefault();
    const slot = parseInt($(e.currentTarget).attr("data-value"));
    equippingTo = slot;
    const heroID = $(e.currentTarget).attr("heroID");
    $(".heroExamineEquipment").removeClass("hEEactive");
    $("#hEE"+slot).addClass("hEEactive");
    examineHeroPossibleEquip(slot,heroID)
});

$(document).on('click', "div.gearItem", (e) => {
    //equip the clicked item
    e.preventDefault();
    const heroID = $(e.currentTarget).attr("heroID");
    const containerID = parseInt($(e.currentTarget).attr("id"));
    HeroManager.equipItem(containerID,heroID,equippingTo);
    examineHero(heroID);
    clearExaminePossibleEquip();
    updateHeroPower();
});

function updateHeroPower() {
    HeroManager.heroes.forEach(hero => {
        const heroCard = $(`.heroOwnedCard[data-value=${hero.id}]`);
        $(heroCard).find(".heroPower").html(HeroManager.heroPower(hero));
    });
}

$(document).on('click', ".buyNewHeroButton", (e) => {
    e.preventDefault();
    HeroManager.purchaseHero();    
})

$(document).on('click', ".heroTab", (e) => {
    e.preventDefault();
    const heroTabs = document.querySelectorAll(".heroTab");
    const currentTab = e.currentTarget;
    heroTabs.forEach( tab => tab.classList.remove("selected"));
    currentTab.classList.add("selected");
})

$(document).on('click', ".heroTab1", (e) => {
    e.preventDefault();
    const heroDetails = document.querySelector("#heroDetails");
    const heroGear = document.querySelector("#heroGear");
    heroDetails.classList.remove("none");
    heroGear.classList.add("none");
})

$(document).on('click', ".heroTab2", (e) => {
    e.preventDefault();
    const heroDetails = document.querySelector("#heroDetails");
    const heroGear = document.querySelector("#heroGear");
    heroDetails.classList.add("none");
    heroGear.classList.remove("none");
})

//global variable to hold where we're looking to equip to for the equipping shit.
let equippingTo = null;