"use strict";

class fuse {
    constructor(id,rarity) {
        this.id = id;
        this.recipe = recipeList.idToItem(id);
        this.name = this.recipe.name;
        this.rarity = rarity;
        this.fuseTime = 0;
    }
    createSave() {
        const save = {};
        save.id = this.id;
        save.rarity = this.rarity;
        save.fuseTime = this.fuseTime;
        return save;
    }
    addTime(ms) {
        this.fuseTime = Math.min(this.fuseTime+ms,this.getMaxFuse());
    }
    getMaxFuse() {
        return this.recipe.craftTime*this.rarity;
    }
    fuseDone() {
        return this.fuseTime === this.getMaxFuse();
    }
    timeRemaining() {
        return this.getMaxFuse() - this.fuseTime;
    }
    fuseComplete() {
        return this.fuseTime === this.getMaxFuse();
    }
}

const FusionManager = {
    slots : [],
    maxSlots : 3,
    fuseNum : 0,
    createSave() {
        const save = {};
        save.maxSlots = this.maxSlots;
        save.slots = [];
        this.slots.forEach(slot => {
            save.slots.push(slot.createSave());
        });
        return save;
    },
    loadSave(save) {
        save.slots.forEach(s => {
            const slot = new fuse(s.id,s.rarity);
            slot.fuseTime = s.fuseTime;
            slot.fuseID = this.fuseNum;
            this.fuseNum += 1;
            this.slots.push(slot);
        });
        this.maxSlots = save.maxSlots;
    },
    addFuse(id,rarity) {
        if (this.slots.length === this.maxSlots) {
            Notifications.noFuseSlots();
            return;
        }
        if (!Inventory.hasThree(id,rarity-1)) return;
        const fuseDummy = {id:id,rarity:rarity};
        if (ResourceManager.materialAvailable("M001") < this.getFuseCost(fuseDummy)) {
            Notifications.cantAffordFuse();
            return;
        }
        ResourceManager.deductMoney(this.getFuseCost(fuseDummy));
        Inventory.removeFromInventory(id,rarity-1);
        Inventory.removeFromInventory(id,rarity-1);
        Inventory.removeFromInventory(id,rarity-1);
        const newFuse = new fuse(id,rarity);
        newFuse.fuseID = this.fuseNum;
        this.fuseNum += 1;
        this.slots.push(newFuse);
        refreshFuseSlots();
    },
    addTime(ms) {
        this.slots.forEach(fuse => {
            fuse.addTime(ms);
        });
        refreshFuseBars();
    },
    getFuseCost(fuse) {
        const item = recipeList.idToItem(fuse.id);
        return 4*item.value*fuse.rarity;
    },
    aFuseIsDone() {
        return this.slots.some(f=>f.fuseComplete());
    },
    collectFuse(fuseID) {
        const slot = this.slots.find(f=>f.fuseID === fuseID);
        if (slot === undefined || !slot.fuseComplete()) return;
        if (Inventory.full()) {
            Notifications.fuseInvFull();
            return;
        }
        Inventory.addToInventory(slot.id,slot.rarity,-1);
        this.slots = this.slots.filter(f=>f.fuseID !== fuseID);
        refreshFuseSlots();
    }
}

function initiateFuseBldg() {
    $fuseBuilding.show();
    refreshFuseSlots();
    refreshPossibleFuse();
}

function createFuseBar(fuse) {
    const fusePercent = fuse.fuseTime/fuse.getMaxFuse();
    const fuseAmt = msToTime(fuse.getMaxFuse()-fuse.fuseTime);
    const fuseWidth = (fusePercent*100).toFixed(1)+"%";
    const d1 = $("<div/>").addClass("fuseBarDiv").attr("id","fuseBarDiv"+fuse.fuseID);
    const d1a = $("<div/>").addClass("fuseBar").attr("data-label",fuseAmt).attr("id","fuseBar"+fuse.fuseID);
    const s1 = $("<span/>").addClass("fuseBarFill").attr("id","fuseFill"+fuse.fuseID).css('width', fuseWidth);
    return d1.append(d1a,s1);
}

function refreshFuseBars() {
    FusionManager.slots.forEach(fuse => {
        if (fuse.fuseComplete()) {
            $("#fuseBarDiv"+fuse.fuseID).hide();
            $("#fuseSlotCollect"+fuse.fuseID).show();
        }
        const fusePercent = fuse.fuseTime/fuse.getMaxFuse();
        const fuseAmt = msToTime(fuse.getMaxFuse()-fuse.fuseTime);
        const fuseWidth = (fusePercent*100).toFixed(1)+"%";
        $("#fuseBar"+fuse.fuseID).attr("data-label",fuseAmt);
        $("#fuseFill"+fuse.fuseID).css('width', fuseWidth);
    });
}

const $fuseSlots = $("#fuseSlots");
const $fuseList = $("#fuseList");

function refreshFuseSlots() {
    $fuseSlots.empty();
    FusionManager.slots.forEach(slot => {
        const d1 = $("<div/>").addClass("fuseSlot").addClass("R"+slot.rarity);
        const d2 = $("<div/>").addClass("fuseSlotName").html(slot.recipe.itemPicName());
        const d3 = createFuseBar(slot);
        const d4 = $("<div/>").addClass("fuseSlotCollect").attr("id","fuseSlotCollect"+slot.fuseID).attr("fuseid",slot.fuseID).html("Collect").hide();
        if (slot.fuseComplete()) {
            d3.hide();
            d4.show();
        }
        d1.append(d2,d3,d4);
        $fuseSlots.append(d1);
    });
    for (let i=0;i<FusionManager.maxSlots-FusionManager.slots.length;i++) {
        const d4 = $("<div/>").addClass("fuseSlot");
        const d5 = $("<div/>").addClass("fuseSlotName").html("Empty");
        d4.append(d5);
        $fuseSlots.append(d4);
    }
}

function refreshPossibleFuse() {
    $fuseList.empty();
    const d1 = $("<div/>").addClass("possibleFuseHead").html("Possible Fuses");
    const d2 = $("<div/>").addClass('possibleFuseHolder');
    const rarities = ["Common","Good","Great","Epic"];
    if(Inventory.getFusePossibilities().length === 0) d2.addClass("fuseInvBlank").html("No Items Available to Fuse");
    if(Inventory.getFusePossibilities().length > 0) {
        Inventory.getFusePossibilities().forEach(f => {
            const item = recipeList.idToItem(f.id);
            const d3 = $("<div/>").addClass("possibleFusegroup");
            const d4 = $("<div/>").addClass("possibleFusegroupHeader").addClass("possibleFuseRarity"+f.rarity).html(`${rarities[f.rarity]} Fuse`)
            const d5 = $("<div/>").addClass("possibleFuse").html(`${item.itemPicName()}`);
            const d6 = $("<div/>").addClass("fuseTime tooltip").attr("data-tooltip","Fuse Time").html(`<i class="fas fa-clock"></i> ${msToTime(item.craftTime*f.rarity)}`);
            const d7 = $("<div/>").addClass("fuseStart").attr("fuseID",f.id).attr("fuseRarity",f.rarity);
                $("<div/>").addClass("fuseStartText").html("Fuse").appendTo(d7);
                $("<div/>").addClass("fuseStartCost").html(`${ResourceManager.materialIcon("M001")}${formatToUnits(FusionManager.getFuseCost(f),2)}`).appendTo(d7);
            d3.append(d4,d5,d6,d7);
            d2.append(d3);
        });
    }
    $fuseList.append(d1,d2);
}
    
$(document).on('click', '.fuseStart', (e) => {
    e.preventDefault();
    const id = $(e.currentTarget).attr("fuseID");
    const rarity = parseInt($(e.currentTarget).attr("fuseRarity"));
    FusionManager.addFuse(id,rarity);
});

$(document).on('click', '.fuseSlotCollect', (e) => {
    e.preventDefault();
    const id = parseInt($(e.currentTarget).attr("fuseid"));
    FusionManager.collectFuse(id);
});