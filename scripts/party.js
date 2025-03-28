"use strict";

class Party {
    constructor (heroID) {
        this.heroID = heroID;
        this.heroes = heroID.map(h => HeroManager.idToHero(h));
    }
    createSave() {
        const save = {};
        save.heroID = this.heroID;
        return save;
    }
    hasMember(member) {
        return this.heroes.includes(member);
    }
    size() {
        return this.heroes.length;
    }
    alive() {
        return this.heroes.some(hero => !hero.dead());
    }
    isDead() {
        return this.heroes.every(hero => hero.dead());
    }
    addTime(t) {
        this.heroes.forEach(h=> {
            h.addTime(t, dungeonID);
        })
    }
}

const PartyCreator = {
    heroes : [],
    emptyPartySlots() {
        return DungeonManager.dungeonSlotCount() - this.heroes.length;
    },
    removeMember(slotNum) {
        this.heroes.splice(slotNum,1);
    },
    addMember(heroID) {
        if (this.emptyPartySlots() === 0) return false;
        this.heroes.push(heroID);
    },
    clearMembers() {
        this.heroes = [];
    },
    validTeam() {
        if (this.heroes.length === 0) return false;
        const heroesReal = this.heroes.map(hid => HeroManager.idToHero(hid));
        return heroesReal.some(h => h.alive());
    },
    lockParty() {
        this.heroes.map(hid => HeroManager.idToHero(hid)).forEach(h=>{
            h.inDungeon = true;
            h.hp = h.maxHP();
        });
        const party = new Party(this.heroes);
        this.heroes = [];
        return party;
    },
    healCost() {
        if (this.heroes.length === 0) return 0;
        return this.heroes.map(h=>HeroManager.idToHero(h).healCost()).reduce((total,h) => total + h);
    },
    noheal() {
        if (this.heroes.length === 0) return true;
        return this.heroes.map(h=>HeroManager.idToHero(h)).every(h=>h.hp === h.maxHP());
    },
    payHealPart() {
        const amt = this.healCost();
        if (ResourceManager.materialAvailable("M001") < amt) {
            Notifications.cantAffordHealParty();
            return;
        }
        ResourceManager.deductMoney(amt);
        this.heroes.map(h=>HeroManager.idToHero(h)).forEach(h=>h.healPercent(100));
    },
    startingTeam(team) {
        if (team === null) return;
        const statuses = team.map(h=>HeroManager.idToHero(h).inDungeon)
        console.log(statuses);
        if (statuses.some(h=>h)) return;
        team.forEach(h => this.addMember(h));
    }
}