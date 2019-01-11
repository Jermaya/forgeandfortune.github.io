"use strict";

const $heroTab = $("#heroTab");

const levelCurves = { 
    getLvlStats(lvl) {
        return {xp:this.xpCurve[lvl-1],hp:this.hpCurve[lvl-1],pow:this.powCurve[lvl-1]};
    },
    initialize() {
        this.xpCurve = miscLoadedValues.xpCurve.slice();
        this.hpCurve = miscLoadedValues.hpCurve.slice();
        this.powCurve = miscLoadedValues.powCurve.slice();
    },
}

class Hero {
    constructor (props) {
        Object.assign(this, props);
        this.uniqueid = this.id;
        this.lvl = 1;
        this.xp = 0;
        this.hp = levelCurves.getLvlStats(this.lvl).hp;
        this.maxHPseen = this.hp;
        this.ap = 0;
        this.apmax = 100;
        this.armor = 0;
        this.crit = 5;
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
        save.lvl = this.lvl;
        save.xp = this.xp;
        save.hp = this.hp;
        save.ap = this.ap;
        save.maxHPseen = this.maxHPseen;
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
        this.lvl = save.lvl;
        this.xp = save.xp;
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
        if (save.maxHPseen !== undefined) this.maxHPseen = save.maxHPseen;
        this.owned = save.owned;
    }
    getPow() {
        let pow = levelCurves.getLvlStats(this.lvl).pow;
        if (this.slot1 !== null) pow += this.slot1.pow();
        if (this.slot2 !== null) pow += this.slot2.pow();
        if (this.slot3 !== null) pow += this.slot3.pow();
        if (this.slot4 !== null) pow += this.slot4.pow();
        if (this.slot5 !== null) pow += this.slot5.pow();
        if (this.slot6 !== null) pow += this.slot6.pow();
        return pow;
    }
    getAdjPow() {
        return Math.floor(this.getPow() * this.actmax()/10);
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
    initialAct() {
        return this.actmax();
    }
    actmax() {
        if (this.slot1 !== null) return this.slot1.act();
        else return 10;
    }
    addAP() {
        if (this.slot1 === null) {
            this.ap += 30;
        }
        else {
            this.ap += this.slot1.apAdd;
        }
    }
    heal(hp) {
        this.hp = Math.min(this.hp+hp,this.maxHP());
        refreshHPBar(this);
    }
    healPercent(hpPercent) {
        let hp = Math.floor(this.maxHP()*hpPercent/100);
        hp = Math.max(1,hp);
        this.heal(hp);
    }
    dead() {
        return this.hp === 0;
    }
    alive() {
        return this.hp > 0;
    }
    addTime() {
        if (this.dead() || !this.inDungeon) {
            this.act = 0;
            this.ap = 0;
        }
        this.act = Math.max(0,this.act-1);
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
        this.checkHealth();
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
    maxXP() {
        return levelCurves.getLvlStats(this.lvl).xp;
    }
    maxHP() {
        let hp = levelCurves.getLvlStats(this.lvl).hp;
        if (this.slot1 !== null) hp += this.slot1.hp();
        if (this.slot2 !== null) hp += this.slot2.hp();
        if (this.slot3 !== null) hp += this.slot3.hp();
        if (this.slot4 !== null) hp += this.slot4.hp();
        if (this.slot5 !== null) hp += this.slot5.hp();
        if (this.slot6 !== null) hp += this.slot6.hp();
        return hp;
    }
    addXP(xp) {
        if (this.dead() || this.xp === this.maxXP()) return;
        this.xp = Math.min(this.xp + xp,this.maxXP());
        if (this.xp === this.maxXP()) initializeHeroList();
        if (HeroManager.heroView !== this.id) return;
        $(".heroExamineExp").html(`Exp: ${this.xp}/${this.maxXP()}`)
        if (this.xp === this.maxXP()) {        
            $(".heroExamineLvlButton").show();
            $(".heroExamineExp").hide();
        }
    }
    levelup() {
        this.lvl += 1;
        this.xp = 0;
        this.checkHealth();
        refreshProgress();
        initializeHeroList();
        examineHero(this.id);
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
        return Math.floor(Math.pow(1.07, (this.lvl-1))*(this.maxHP()-this.hp)/miscLoadedValues.hltFactor);
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
    checkHealth() {
        if (this.maxHP() <= this.maxHPseen) return;
        const hpDelta = this.maxHP() - this.maxHPseen;
        this.maxHPseen = this.maxHP();
        this.heal(hpDelta);
    }
}

const HeroManager = {
    heroes : [],
    heroOrder : [],
    healTime : 0,
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
    heroBuySeed() {
        //pre-populate the hero buy order so you can't savescum
        Math.seed = hbSeed;
        this.heroOrder = ["H203"];
        while (this.heroOrder.length < this.heroes.length) {
            const possibleHeroes = this.heroes.map(h=>h.id).filter(h=>!this.heroOrder.includes(h));
            const heroID = possibleHeroes[Math.floor(Math.seededRandom() * possibleHeroes.length)];
            this.heroOrder.push(heroID);            
        }
        const alreadyBought = this.heroes.filter(w=>w.owned).map(h=>h.id);
        this.heroOrder = this.heroOrder.filter(h=>!alreadyBought.includes(h));
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
    healTimer(ms) {
        //once it reaches 6 seconds, heals all non-active party members 1%
        this.healTime += ms;
        if (this.healTime >= 6000) {
            this.healTime -= 6000;
            this.restBeat();
            refreshHealPartyCost();
        }
    },
    restBeat() {
        //heal up all non-current partying members by 1% of their maxhp
        this.heroes.forEach(hero => {
            if (hero.inDungeon) return;
            hero.heal(2);
        });
    },
    relativePow(heroID,slot,pow) {
        const hero = this.idToHero(heroID);
        return pow - hero.getPowSlot(slot);
    },
    relativeHP(heroID,slot,hp) {
        const hero = this.idToHero(heroID);
        return hp - hero.getHPSlot(slot);
    },
    slotSpeed(heroID,slot) {
        const hero = this.idToHero(heroID);
        if (slot !== 0) return null;
        if (hero.slot1 === null) return "Fair";
        const speed = hero.slot1.act();
        if (speed > 5000) return "Slow";
        if (speed < 5000) return "Fast";
        return "Fair";
    },
    purchaseHero() {
        const amt = miscLoadedValues.heroCost[HeroManager.heroes.filter(h=>h.owned).length];
        if (ResourceManager.materialAvailable("M001") < amt) {
            Notifications.cantAffordHero();
            return;
        }
        ResourceManager.deductMoney(amt);
        const heroID = this.heroOrder.shift();
        this.idToHero(heroID).owned = true;
        initializeHeroList();
        refreshHeroSelect();
    },
    heroLevelCount() {
        return this.heroes.filter(w=>w.owned).map(w=>w.lvl).reduce((a,b) => a+b,0);
    },
    heroMaxLevelCount() {
        return this.heroes.length*50;
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
    levelup(heroID) {
        this.idToHero(heroID).levelup();
    }
}

const $heroList = $("#heroList");

function initializeHeroList() {
    $heroList.empty();
    HeroManager.heroes.forEach(hero => {
        const d = $("<div/>").addClass("heroOwnedCard").attr("data-value",hero.id);
        if (hero.xp === hero.maxXP()) d.addClass("hasEvent");
        const d1 = $("<div/>").addClass("heroOwnedImage").html(hero.head);
        const d2 = $("<div/>").addClass("heroOwnedName").html(hero.name);
        d.append(d1,d2);
        if (!hero.owned) d.hide();
        $heroList.append(d);
    });
    if (HeroManager.heroes.filter(h=>!h.owned).length > 0) {
        const amt = miscLoadedValues.heroCost[HeroManager.heroes.filter(h=>h.owned).length];
        const b1 = $("<div/>").addClass("buyNewHeroCard").html(`Purchase Hero - <div class="buyHeroCost">${miscIcons.gold}${amt}</div>`);
        $heroList.append(b1);
    }
    if (!HeroManager.heroes.some(h=>h.xp === h.maxXP())) $heroTab.removeClass("hasEvent");
    else $heroTab.addClass("hasEvent");
}

const $heroDetails = $("#heroDetails");
const $heroGearSlots = $("#heroGearSlots");

function examineHero(ID) {
    const hero = HeroManager.idToHero(ID);
    $heroDetails.empty();
    $heroGearSlots.empty();
    const upperLeftDiv = $("<div/>").addClass("heroExamineTop");
    const d1 = $("<div/>").addClass("heroExamineImage").html(hero.image);
    const d2 = $("<div/>").addClass("heroExamineName").html(hero.name);
    const d3 = $("<div/>").addClass("heroExamineLvlClass").html("Lv&nbsp;"+hero.lvl+"&nbsp;"+hero.class);
    const d4 = $("<div/>").addClass("heroExamineExp").html(`Exp: ${hero.xp}/${hero.maxXP()}`);
    const d4a = $("<div/>").addClass("heroExamineLvlButton").attr("heroID",hero.id).html("LEVEL UP");
    if (hero.lvl === 50) {
        d4.hide();
        d4a.hide();
    }
    if (hero.xp === hero.maxXP()) d4.hide();
    else d4a.hide();
    upperLeftDiv.append(d1,d2,d3,d4,d4a);
    const upperRightDiv = $("<div/>").addClass("heroExamineStats");
    const htd = $("<div/>").addClass("heroExamineHeading");
    const htd1 = $("<div/>").addClass("heroExamineStatHeading").html("Hero Stats");
    upperRightDiv.append(htd.append(htd1));
    const stats = [hero.maxHP(),hero.getPow(), msToSec(hero.actmax()), hero.apmax, hero.armor, hero.crit+"%", hero.critdmg*100+"%", hero.dodgeChance+"%"];
    const statName = ["MAX HP","POW","ACT","AP","ARMOR","CRIT","CRDMG","DODGE"];
    for (let i=0;i<stats.length;i++) {
        upperRightDiv.append(statRow(statName[i],stats[i]));
    }
    const lowerDiv = $("<div/>").addClass("heroExamineEquip");
    const slots = hero.getEquipSlots();
    const slotName = ["Weapon","Head","Armament","Chest","Handheld","Accessory"]
    $.each(slots, (slotNum,equip) => {
        let equipText = "";
        let equipRarity = 0
        let equipLevel = "";
        if (equip !== null) {
            equipText = equip.picName();
            equipRarity = equip.rarity;
            equipLevel = "LVL " + equip.lvl;
        }
        else {
            equipText = hero.slotTypeIcons(slotNum);
        }
        const d5 = $("<div/>").addClass("heroExamineEquipment").attr("data-value",slotNum).attr("id","hEE"+slotNum).attr("heroID",ID);
        if (hero.equipUpgradeAvailable(slotNum)) d5.addClass("equipUpgradeAvailable")
        const d5a = $("<div/>").addClass("heroExamineEquipmentSlot").html(slotName[slotNum]);
        const d5b = $("<div/>").addClass("heroExamineEquipmentEquip").addClass("R"+equipRarity).html(equipText);
        const d5b1 = $("<div/>").addClass("equipLevel").html(equipLevel);
        d5b.append(d5b1);
        let d5c = "";
        if (equip === null) {
            d5c = "";
        } else {
            d5c = $("<div/>").addClass("heroExamineEquipmentEquipTypes").html(hero.slotTypeIcons(slotNum));
        }
        if (equip === null) d5b.addClass("heroExamineEquipmentEquipEmpty");
        const d6 = $("<div/>").addClass("heroExamineEquipmentList");
        lowerDiv.append(d5.append(d5a,d5b,d5c),d6);
    });
    $heroDetails.append(upperLeftDiv,upperRightDiv);
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
    if (Inventory.listbyType(types).length === 0) {
        Notifications.noGearForSlot();
        return;
    }
    //cycle through everything in bp's and make the div for it
    const table = $('<div/>').addClass('EHPE');
    const htd1 = $('<div/>').addClass('EHPEHeaderName').html("NAME");
    const htd2 = $('<div/>').addClass('EHPEHeaderStat').html("LVL");
    const htd3 = $('<div/>').addClass('EHPEHeaderStat').html("ACT");
    const htd4 = $('<div/>').addClass('EHPEHeaderStat').html("POW");
    const htd5 = $('<div/>').addClass('EHPEHeaderStat').html("HP");
    const hrow = $('<div/>').addClass('EHPEHeader').append(htd1,htd2,htd3,htd4,htd5);
    table.append(hrow);

    let upgradeAvaialable = false;
    Inventory.listbyType(types).forEach((itemContainer) => {
        const td1 = $('<div/>').addClass('EHPEname').addClass("R"+itemContainer.rarity).html(itemContainer.picName());
        const relPow = HeroManager.relativePow(heroID,slot,itemContainer.pow());
        const relHP = HeroManager.relativeHP(heroID,slot,itemContainer.hp());
        let speed = "Fair";
        if (itemContainer.act() > 5000) speed = "Slow";
        if (itemContainer.act() < 5000) speed = "Fast";
        let level = itemContainer.lvl;
        const td1a = $('<div/>').addClass('EHPEstat');
        const td1b = $('<div/>').addClass('EHPEstat');
        const td2 = $('<div/>').addClass('EHPEstat');
        const td3 = $('<div/>').addClass('EHPEstat');
        td1a.html(speed);
        td1b.html(level);
        if (relPow > 0) td2.addClass("EHPEstatPositive").html(itemContainer.pow() + " (+" + relPow + ")");
        else if (relPow < 0) td2.addClass("EHPEstatNegative").html(itemContainer.pow() + " (" + relPow + ")");
        else td2.html(itemContainer.pow() + " (+" + relPow + ")");
        if (relHP > 0) td3.addClass("EHPEstatPositive").html(itemContainer.hp() + " (+" + relHP + ")");
        else if (relHP < 0) td3.addClass("EHPEstatNegative").html(itemContainer.hp() + " (" + relHP + ")");
        else td3.html(itemContainer.hp());
        const row = $('<div/>').addClass('EHPErow').attr("id",itemContainer.containerID).attr("heroID",heroID).append(td1,td1b,td1a,td2,td3);
        table.append(row);
    });
    $heroEquipmentList.append(table);
    //returns a value if this slot has an upgrade available
    return upgradeAvaialable;
};

function unequipSlot(slot,heroID) {
    HeroManager.unequip(slot,heroID);
    examineHero(heroID);
}

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

$(document).on('click', "div.EHPErow", (e) => {
    //equip the clicked item
    e.preventDefault();
    const heroID = $(e.currentTarget).attr("heroID");
    const containerID = parseInt($(e.currentTarget).attr("id"));
    HeroManager.equipItem(containerID,heroID,equippingTo);
    examineHero(heroID);
    clearExaminePossibleEquip();
});

$(document).on('click', ".buyNewHeroCard", (e) => {
    e.preventDefault();
    HeroManager.purchaseHero();    
})

$(document).on('click', ".heroExamineLvlButton", (e) => {
    e.preventDefault();
    const heroID = $(e.currentTarget).attr("heroID");
    HeroManager.levelup(heroID);
})

//global variable to hold where we're looking to equip to for the equipping shit.
let equippingTo = null;